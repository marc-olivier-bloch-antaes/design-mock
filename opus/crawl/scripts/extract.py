#!/usr/bin/env python3
"""
Extract structured content JSON from the rendered raw HTML pages of the SiL
crawl. Reads raw/<slug>.html for every page listed in pages.config.json,
writes content/<slug>.json, and accumulates the images/icons referenced so a
later pass (download_assets.py) can fetch them into assets/.

Templates observed on lausanne.ch/.../services-industriels:
  - "accueil"          : homepage, custom hand-rolled sections
  - "contenu-structure": main.contenu-structure - h1/lead/hero/cta header +
                          tabbed content (.contenu-structure__comp__tab*)
  - "sommaire-rubrique": main.sommaire-rubrique - header + a JS
                          `sommaireDataModel` JSON teaser list + contact footer
  - "article"           : main#content with no extra class - one or more
                          <article class="container"> blocks (header / body /
                          contact footer)
"""
import json
import re
import html
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path("/home/mob/sil/opus/crawl")
RAW = ROOT / "raw"
CONTENT = ROOT / "content"
BASE = "https://www.lausanne.ch"
SCOPE = "/vie-pratique/energies-et-eau/services-industriels"

CONFIG = json.loads((ROOT / "scripts/pages.config.json").read_text())

# ---------------------------------------------------------------------------
# URL <-> slug resolution
# ---------------------------------------------------------------------------
URL_TO_SLUG = {}
for p in CONFIG:
    URL_TO_SLUG[BASE + p["path"]] = p["slug"]
# known alias: the "Règlements" menu entry under Partenaires resolves (client
# side redirect to canonical URL) to the same page as a-propos-reglements.
URL_TO_SLUG[BASE + "/vie-pratique/energies-et-eau/services-industriels/partenaires/reglements.html"] = "a-propos-reglements"


def normalize_url(u):
    if not u:
        return u
    u = u.split("#")[0]
    if u.endswith(".html/"):
        u = u[:-1]
    return u


def slug_for_url(u):
    u = normalize_url(u)
    return URL_TO_SLUG.get(u)


def is_internal(u):
    try:
        p = urlparse(u)
    except Exception:
        return False
    return p.netloc in ("", "www.lausanne.ch", "lausanne.ch")


# ---------------------------------------------------------------------------
# Asset registries (filled while extracting, consumed by download_assets.py)
# ---------------------------------------------------------------------------
IMAGE_MAP = {}   # absolute source url -> local path "assets/images/xxx.ext"
ICON_MAP = {}    # absolute source url -> local path "assets/icons/xxx.svg"


def _clean_name(u):
    p = urlparse(u)
    name = p.path.rsplit("/", 1)[-1]
    name = name.split(";")[0]
    name = re.sub(r"[^A-Za-z0-9._-]", "-", name)
    if not name or "." not in name:
        name = (name or "image") + ".jpg"
    return name


def register_image(u, kind="images"):
    if not u:
        return None
    u = urljoin(BASE, u.strip())
    u = normalize_url(u)
    reg = IMAGE_MAP if kind == "images" else ICON_MAP
    if u in reg:
        return reg[u]
    name = _clean_name(u)
    base, ext = (name.rsplit(".", 1) + [""])[:2]
    local = f"assets/{kind}/{name}"
    i = 2
    existing = set(reg.values())
    while local in existing:
        local = f"assets/{kind}/{base}-{i}.{ext}"
        i += 1
    reg[u] = local
    return local


BG_IMAGE_RE = re.compile(r"background-image\s*:\s*url\(['\"]?([^'\")]+)['\"]?\)")


def bg_image_from_style(style):
    if not style:
        return None
    m = BG_IMAGE_RE.search(style)
    return m.group(1) if m else None


# ---------------------------------------------------------------------------
# Inline HTML cleaning (paragraph / list-item html) - keep only a/strong/em/br/sup/sub
# ---------------------------------------------------------------------------
ALLOWED_INLINE = {"a": "a", "strong": "strong", "b": "strong", "em": "em", "i": "em",
                  "br": "br", "sup": "sup", "sub": "sub"}
DROP_ENTIRELY = {"script", "style", "svg", "button", "input"}


def render_inline(node):
    if isinstance(node, NavigableString):
        return html.escape(str(node), quote=False)
    if not isinstance(node, Tag):
        return ""
    name = node.name.lower()
    if name in DROP_ENTIRELY:
        return ""
    inner = "".join(render_inline(c) for c in node.children)
    if name in ALLOWED_INLINE:
        tag = ALLOWED_INLINE[name]
        if tag == "a":
            href = node.get("href")
            if href:
                href = urljoin(BASE, href)
                return f'<a href="{html.escape(href, quote=True)}">{inner}</a>'
            return inner
        if tag == "br":
            return "<br>"
        return f"<{tag}>{inner}</{tag}>"
    # unwrap unknown tags but keep their text/children
    return inner


def inline_html(node):
    return re.sub(r"\s+", " ", render_inline(node)).strip()


def plain_text(node):
    return re.sub(r"\s+", " ", node.get_text(" ", strip=True)).strip()


# ---------------------------------------------------------------------------
# Noise filtering
# ---------------------------------------------------------------------------
NOISE_CLASSES = {
    "sommaire-controls-container", "sommaire-filters-container", "mouse-position",
    "meteo-widget", "share-buttons", "cookie-banner", "pre-loading-icon",
    "page-navigation", "container-spacer",
}


def has_class(node, *names):
    classes = node.get("class") or []
    return any(n in classes for n in names)


def any_noise_class(node):
    classes = set(node.get("class") or [])
    return bool(classes & NOISE_CLASSES)


# ---------------------------------------------------------------------------
# Component parsers
# ---------------------------------------------------------------------------

def parse_keyfigures(node):
    title_el = node.select_one(".chiffres-titre")
    items = []
    for cle in node.select(".chiffre-cle"):
        titre = cle.select_one(".titre")
        contenu = cle.select_one(".contenu")
        if titre or contenu:
            items.append({
                "value": plain_text(titre) if titre else "",
                "label": plain_text(contenu) if contenu else "",
            })
    if not items:
        return None
    return {
        "type": "keyfigures",
        "title": plain_text(title_el) if title_el else None,
        "items": items,
    }


DOMAIN_LABELS = {
    "t-l.ch": "Site des TL (transports publics)",
    "facebook.com": "Facebook",
    "instagram.com": "Instagram",
    "linkedin.com": "LinkedIn",
    "youtube.com": "YouTube",
    "twitter.com": "Twitter / X",
    "x.com": "Twitter / X",
}
PATH_LABELS = {
    "/silcontact": "Nous contacter",
}


def friendly_link_label(a, href_abs, extra_selector=None):
    if extra_selector:
        el = a.select_one(extra_selector)
        if el and plain_text(el):
            return plain_text(el)
    label = a.get("alt") or plain_text(a) or a.get("title")
    if label:
        return label.strip()
    p = urlparse(href_abs)
    if p.path in PATH_LABELS:
        return PATH_LABELS[p.path]
    host = p.netloc.replace("www.", "")
    return DOMAIN_LABELS.get(host, host)


def parse_contact(node):
    coords = node.select_one(".coordinates")
    if not coords:
        return None
    title_el = coords.select_one(".coordinates-text-content b, .address-bloc b")
    lines = []
    for row in coords.select(".address-row, .address-row-parent"):
        txt = plain_text(row)
        if txt:
            lines.append(txt)
    logo = coords.select_one("img")
    logo_local = register_image(logo.get("src")) if logo else None
    links = []
    for a in coords.select(".address-row-margin-top a, .coordinates a"):
        href = a.get("href")
        if href and href.strip() and href != "#":
            href_abs = urljoin(BASE, href.strip())
            label = friendly_link_label(a, href_abs)
            links.append({"label": label, "url": href_abs, "external": is_internal(href_abs) is False})
    if not lines and not logo_local and not links:
        return None
    return {
        "type": "contact",
        "title": plain_text(title_el) if title_el else "Contact",
        "lines": lines,
        "logo": logo_local,
        "links": links,
    }


def parse_coordonnees_box(node):
    content = node.select_one(".white-box-content")
    if not content:
        return None
    title_el = node.select_one(".white-box-title")
    logo = content.select_one("img")
    logo_local = register_image(logo.get("src")) if logo else None
    lines = []
    for p in content.find_all("p", recursive=False):
        t = plain_text(p)
        if t:
            lines.append(t)
    links = []
    for a in content.select(".coordonnees-link a, a.map-link"):
        href = a.get("href")
        if not href or href == "#":
            continue
        href_abs = urljoin(BASE, href)
        label = friendly_link_label(a, href_abs, extra_selector=".icon-label")
        links.append({"label": label, "url": href_abs, "external": not is_internal(href_abs)})
    if not lines and not logo_local and not links:
        return None
    return {
        "type": "contact",
        "title": plain_text(title_el) if title_el else "Coordonnées",
        "lines": lines,
        "logo": logo_local,
        "links": links,
    }


def parse_table(node):
    headers = []
    thead = node.find("thead")
    rows_src = []
    if thead:
        headers = [inline_html(th) for th in thead.find_all(["th", "td"])]
        tbody = node.find("tbody") or node
        rows_src = tbody.find_all("tr", recursive=True)
    else:
        trs = node.find_all("tr")
        rows_src = trs
    rows = []
    for tr in rows_src:
        cells = tr.find_all(["td", "th"], recursive=False)
        if not cells:
            continue
        rows.append([inline_html(c) for c in cells])
    if not rows and not headers:
        return None
    return {"type": "table", "headers": headers, "rows": rows}


DOC_TITLE_RE = re.compile(r"^\s*([A-Za-z]+)\s*,\s*(.+?)\s*$")


def parse_lien_group(lien_divs):
    """lien_divs: list of <div class="lien"> elements (a documents/links group)."""
    items = []
    any_doc = False
    for lien in lien_divs:
        a = lien.select_one("a")
        if not a:
            continue
        href = urljoin(BASE, a.get("href", ""))
        label = plain_text(a.select_one("span")) or plain_text(a)
        desc_el = lien.select_one(".link-description")
        desc = plain_text(desc_el) if desc_el else None
        tooltip = a.get("data-original-title", "")
        m = DOC_TITLE_RE.match(tooltip) if tooltip else None
        is_pdf = bool(m) or href.lower().endswith(".pdf")
        if is_pdf:
            any_doc = True
            fmt = m.group(1).upper() if m else href.rsplit(".", 1)[-1].upper()
            size = m.group(2) if m else None
            items.append({
                "kind": "document", "label": label, "url": href,
                "format": fmt, "size": size, "date": desc,
            })
        else:
            slug = slug_for_url(href) if is_internal(href) else None
            items.append({
                "kind": "link", "label": label, "url": href,
                "external": not is_internal(href),
                **({"slug": slug} if slug else {}),
            })
    if not items:
        return None
    if any_doc:
        return {
            "type": "documents",
            "title": None,
            "items": [
                {"label": it["label"], "url": it["url"], "format": it.get("format", "LINK"),
                 "size": it.get("size"), "date": it.get("date")}
                for it in items
            ],
        }
    return {
        "type": "links",
        "title": None,
        "items": [
            {"label": it["label"], "url": it["url"], "external": it["external"],
             **({"slug": it["slug"]} if it.get("slug") else {})}
            for it in items
        ],
    }


def parse_accordion(node):
    items = []
    for acc_item in node.select(".accordion-item"):
        header = acc_item.select_one(".accordion-button")
        body = acc_item.select_one(".accordion-body")
        title = plain_text(header) if header else ""
        blocks = walk_container(body) if body else []
        if title or blocks:
            items.append({"title": title, "blocks": blocks})
    if not items:
        return None
    heading = node.find_previous_sibling(lambda t: False)  # placeholder, title handled by caller
    return {"type": "accordion", "items": items}


def parse_acces_direct(node):
    items = []
    for a in node.select("a"):
        href = urljoin(BASE, a.get("href", ""))
        label_el = a.select_one(".acces-direct-item-text")
        label = plain_text(label_el) if label_el else plain_text(a)
        if not label:
            continue
        items.append({
            "label": label, "url": href,
            **({"slug": slug_for_url(href)} if slug_for_url(href) else {}),
        })
    if not items:
        return None
    return {"type": "links", "title": None, "variant": "icon-nav", "items": items}


def parse_accordeon_accroches_item(item):
    a = item.select_one("a.item-inner") or item.select_one("a")
    if not a:
        return None
    href = urljoin(BASE, a.get("href", ""))
    title_el = a.select_one("h2, h3")
    # description lives in a direct <p> of the text-content that is NOT the
    # (empty) one right after the heading and not nested inside the heading
    text = None
    for p in a.select(".accordeon-accroches-text-content > p"):
        if p.find_parent(["h1", "h2", "h3", "h4"]):
            continue
        t = plain_text(p)
        if t:
            text = t
            break
    style_tag = a.find("style")
    img_url = None
    if style_tag and style_tag.string:
        img_url = bg_image_from_style(style_tag.string)
    image_local = register_image(img_url) if img_url else None
    return {
        "title": plain_text(title_el) if title_el else None,
        "text": text,
        "url": href,
        "image": image_local,
        **({"slug": slug_for_url(href)} if slug_for_url(href) else {}),
    }


def parse_accordeon_accroches(node):
    """node: a container that holds one or more .accordeon-accroches widgets
    (on the homepage each widget renders exactly one teaser tile)."""
    items = []
    widgets = node.select(".accordeon-accroches")
    targets = widgets if widgets else [node]
    for widget in targets:
        for item in widget.select(".item"):
            parsed = parse_accordeon_accroches_item(item)
            if parsed:
                items.append(parsed)
    if not items:
        return None
    return {"type": "teasers", "title": None, "variant": "accroche", "items": items}


def parse_scroll_pane(node):
    items = []
    for it in node.select(".scroll-content-item"):
        a = it.select_one("a")
        if not a:
            continue
        href = urljoin(BASE, a.get("href", ""))
        title_el = a.select_one("svg title")
        label = plain_text(title_el) if title_el else plain_text(a)
        if not label:
            continue
        items.append({
            "label": label, "url": href,
            **({"slug": slug_for_url(href)} if slug_for_url(href) else {}),
        })
    if not items:
        return None
    return {"type": "links", "title": None, "variant": "icon-nav", "items": items}


def parse_full_width_carousel(node):
    seen = set()
    items = []
    for item in node.select(".full-width-carousel-inner > .item"):
        caption_el = item.select_one(".info-widget-inner-content p")
        caption = plain_text(caption_el) if caption_el else None
        copyright_el = item.select_one(".info-widget-subtitle")
        copyright_ = plain_text(copyright_el) if copyright_el else None
        style_tag = item.select_one("style")
        img_url = bg_image_from_style(style_tag.string) if style_tag and style_tag.string else None
        key = (caption, img_url)
        if key in seen:
            continue  # carousel keeps the outgoing slide in the DOM during transition
        seen.add(key)
        image_local = register_image(img_url) if img_url else None
        if not image_local and not caption:
            continue
        items.append({"src": image_local, "alt": caption or "", "caption": copyright_})
    if not items:
        return None
    return {"type": "gallery", "title": None, "items": items}


def parse_focus_gallery(node):
    items = []
    for item in node.select(".focus-gallery-item"):
        a = item.select_one("a")
        img = item.select_one("img")
        title_el = item.select_one(".focus-gallery-item-title")
        text_el = item.select_one(".focus-gallery-item-body")
        href = urljoin(BASE, a.get("href")) if a and a.get("href") else None
        image_local = register_image(img.get("src")) if img else None
        title = plain_text(title_el) if title_el else None
        if not title and not text_el:
            continue
        items.append({
            "title": title,
            "text": plain_text(text_el) if text_el else None,
            "url": href,
            "image": image_local,
            "external": (href is not None and not is_internal(href)),
            **({"slug": slug_for_url(href)} if href and slug_for_url(href) else {}),
        })
    if not items:
        return None
    return {"type": "teasers", "title": None, "variant": "carousel", "items": items}


def parse_sommaire_data_model(html_text):
    m = re.search(r"var sommaireDataModel\s*=\s*(\{.*?\});", html_text, re.S)
    if not m:
        return None
    try:
        data = json.loads(m.group(1))
    except Exception:
        return None
    items = []
    for it in data.get("items", []):
        link = urljoin(BASE, it.get("link", "")) if it.get("link") else None
        image_local = register_image(it.get("image")) if it.get("image") else None
        desc_html = it.get("description") or ""
        desc_soup = BeautifulSoup(desc_html, "html.parser")
        items.append({
            "title": it.get("title") or it.get("titleProperty"),
            "text": inline_html(desc_soup) if desc_soup else None,
            "url": link,
            "image": image_local,
            **({"slug": slug_for_url(link)} if link and slug_for_url(link) else {}),
        })
    if not items:
        return None
    return {"type": "teasers", "title": None, "variant": "grid", "items": items}


def parse_news_list(node):
    title_el = node.select_one(".title-box")
    items = []
    for row in node.select(".actus-muni"):
        a = row.select_one("a")
        date_el = row.select_one(".actus-muni-date")
        if not a:
            continue
        href = urljoin(BASE, a.get("href", ""))
        label = plain_text(a)
        if not label:
            continue
        items.append({
            "label": (plain_text(date_el) + " – " + label) if date_el and plain_text(date_el) else label,
            "url": href,
            "external": not is_internal(href),
        })
    if not items:
        return None
    return {"type": "links", "title": plain_text(title_el) if title_el else "Actualités", "variant": "news", "items": items}


def parse_generic_list(node):
    lis = node.find_all("li", recursive=False)
    items = [inline_html(li) for li in lis]
    items = [i for i in items if i]
    if not items:
        return None
    return {"type": "list", "ordered": node.name == "ol", "items": items}


def parse_conteneur_image(node):
    img = node.select_one("img")
    if not img:
        return None
    src = img.get("src")
    if not src:
        return None
    local = register_image(src)
    legende = node.select_one(".conteneur-texte")
    caption = plain_text(legende) if legende and plain_text(legende) else None
    return {"type": "image", "src": local, "alt": img.get("alt") or "", "caption": caption}


# ---------------------------------------------------------------------------
# Generic recursive block walker
# ---------------------------------------------------------------------------

def walk_container(el):
    blocks = []
    for child in el.children:
        blocks.extend(handle_node(child))
    return blocks


def handle_node(node):
    if isinstance(node, NavigableString):
        return []
    if not isinstance(node, Tag):
        return []
    name = node.name.lower()
    classes = node.get("class") or []

    if name in ("script", "style", "noscript"):
        return []
    if any_noise_class(node):
        return []
    if name == "svg":
        return []

    # --- specific components -------------------------------------------------
    if "entete-de-page" in classes:
        return []  # page header (h1/lead/cta) already extracted separately

    if "chiffres-cles" in classes:
        b = parse_keyfigures(node)
        return [b] if b else []

    if "page-footer" in classes:
        b = parse_contact(node)
        return [b] if b else []

    if "coordonnees" in classes and "white-box-container" in classes:
        b = parse_coordonnees_box(node)
        return [b] if b else []

    if "accordion-box" in classes:
        subblocks = []
        title_box = node.select_one(".title-box")
        if title_box:
            t = plain_text(title_box)
            if t:
                subblocks.append({"type": "heading", "level": 5, "text": t})
        for acc in node.select(".accordion"):
            b = parse_accordion(acc)
            if b:
                subblocks.append(b)
        return subblocks

    if name == "table":
        b = parse_table(node)
        return [b] if b else []

    if "conteneur-image" in classes:
        b = parse_conteneur_image(node)
        return [b] if b else []

    if "acces-direct" in classes or node.get("id") == "acces-direct":
        b = parse_acces_direct(node)
        return [b] if b else []

    if "quoi-de-neuf-container" in classes:
        b = parse_news_list(node)
        return [b] if b else []

    if "scroll-pane" in classes:
        b = parse_scroll_pane(node)
        return [b] if b else []

    if "full-width-carousel" in classes:
        b = parse_full_width_carousel(node)
        return [b] if b else []

    if "carousel-control" in classes or "carousel-indicators" in classes:
        return []

    if "accordeon-accroches" in classes:
        b = parse_accordeon_accroches(node)
        return [b] if b else []

    if "focus-gallery" in classes and "with-bullets" in classes:
        b = parse_focus_gallery(node)
        return [b] if b else []

    if classes and ("liste-liens" in classes):
        liens = node.select("div.lien")
        b = parse_lien_group(liens) if liens else parse_generic_list(node)
        return [b] if b else []

    if name in ("ul", "ol"):
        liens = node.select(":scope > li > div.lien")
        if liens:
            b = parse_lien_group(liens)
            return [b] if b else []
        b = parse_generic_list(node)
        return [b] if b else []

    if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
        text = plain_text(node)
        if not text:
            return []
        return [{"type": "heading", "level": int(name[1]), "text": text}]

    if name == "p":
        h = inline_html(node)
        if not h:
            return []
        return [{"type": "paragraph", "html": h}]

    if name == "iframe":
        src = node.get("src")
        if not src:
            return []
        return [{"type": "video", "url": urljoin(BASE, src) if src.startswith("/") else ("https:" + src if src.startswith("//") else src)}]

    if name == "a" and "cta-button" in classes:
        href = urljoin(BASE, node.get("href", ""))
        label = plain_text(node)
        if not label:
            return []
        entry = {"type": "cta", "label": label, "url": href}
        s = slug_for_url(href)
        if s:
            entry["slug"] = s
        return [entry]

    if name == "img":
        src = node.get("src")
        if not src:
            return []
        return [{"type": "image", "src": register_image(src), "alt": node.get("alt") or "", "caption": None}]

    if name in ("div", "section", "article", "span", "nav", "header", "footer", "form", "figure"):
        return walk_container(node)

    # fallback: unknown leaf-ish tag with text
    text = plain_text(node)
    if text:
        h = inline_html(node)
        return [{"type": "paragraph", "html": h}]
    return []


def merge_adjacent_teasers(blocks):
    """Multiple small one-item 'accroche' teaser widgets placed side by side
    in the source markup are merged into a single teasers block."""
    out = []
    for b in blocks:
        if (b.get("type") == "teasers" and b.get("variant") == "accroche"
                and out and out[-1].get("type") == "teasers" and out[-1].get("variant") == "accroche"):
            out[-1]["items"].extend(b["items"])
        elif (b.get("type") == "accordion" and out and out[-1].get("type") == "accordion"):
            out[-1]["items"].extend(b["items"])
        else:
            out.append(b)
    return out


def dedupe_blocks(blocks):
    """Remove empty / accidental exact-duplicate consecutive blocks."""
    out = []
    for b in blocks:
        if b is None:
            continue
        if b.get("type") == "paragraph" and not re.sub(r"<[^>]+>", "", b["html"]).strip():
            continue
        if out and out[-1] == b:
            continue
        out.append(b)
    return merge_adjacent_teasers(out)


# ---------------------------------------------------------------------------
# Page-level extraction
# ---------------------------------------------------------------------------

def get_title(soup):
    t = soup.title.get_text(strip=True) if soup.title else ""
    t = re.sub(r"\s*[–-]\s*Ville de Lausanne\s*$", "", t)
    return t.strip()


def get_breadcrumb(soup):
    bc = soup.select_one("ul.breadcrumb")
    if not bc:
        return []
    out = []
    for li in bc.find_all("li", recursive=False):
        a = li.find("a", recursive=False)
        if not a:
            continue
        title_attr = (a.get("title") or "").strip()
        span = a.find("span", attrs={"itemprop": "name"})
        if title_attr:
            label = title_attr
        elif span:
            label = plain_text(span)
        else:
            label = plain_text(a)
        href = urljoin(BASE, a.get("href", ""))
        entry = {"label": label, "url": href}
        s = slug_for_url(href)
        if s:
            entry["slug"] = s
        out.append(entry)
    return out


def get_hero_image(soup, tpl):
    bkg = soup.select_one(".contenu-structure__bkg")
    if bkg and bkg.get("style"):
        u = bg_image_from_style(bkg["style"])
        if u:
            return register_image(u)
    return None


def get_lead(soup):
    lead = soup.select_one(".entete-de-page .lead")
    if lead:
        h = inline_html(lead)
        return h or None
    return None


def get_page_ctas(soup):
    ctas = []
    entete = soup.select_one(".entete-de-page")
    if not entete:
        return ctas
    for a in entete.select("a.cta-button"):
        href = urljoin(BASE, a.get("href", ""))
        label = plain_text(a)
        if not label:
            continue
        entry = {"label": label, "url": href}
        s = slug_for_url(href)
        if s:
            entry["slug"] = s
        ctas.append(entry)
    return ctas


def extract_tabs(soup):
    tabs = []
    for item in soup.select(".contenu-structure__comp__tabs__content__item"):
        ref = item.get("data-ref")
        btn = item.select_one(".contenu-structure__comp__tab .tab__title")
        label = plain_text(btn) if btn else ref
        icon_img = item.select_one(".contenu-structure__comp__tab img")
        icon_local = register_image(icon_img.get("src"), kind="icons") if icon_img else None
        inner = item.select_one(".contenu-structure__comp__tabs__content__item__content__inner")
        blocks = dedupe_blocks(walk_container(inner)) if inner else []
        tabs.append({"id": ref, "label": label, "icon": icon_local, "blocks": blocks})
    return tabs


def extract_page(slug, path, section):
    raw_file = RAW / f"{slug}.html"
    html_text = raw_file.read_text(encoding="utf-8")
    soup = BeautifulSoup(html_text, "html.parser")
    main = soup.find("main", id="content")
    tpl_classes = (main.get("class") if main else None) or []
    if "contenu-structure" in tpl_classes:
        tpl = "contenu-structure"
    elif "sommaire-rubrique" in tpl_classes:
        tpl = "sommaire-rubrique"
    elif slug == "accueil":
        tpl = "accueil"
    else:
        tpl = "article"

    title = get_title(soup)
    breadcrumb = get_breadcrumb(soup)
    lead = get_lead(soup)
    hero = get_hero_image(soup, tpl)
    cta = get_page_ctas(soup)

    tabs = []
    blocks = []

    if tpl == "contenu-structure":
        tabs = extract_tabs(soup)
        # The page <title>/<h1> reflect whichever tab was clicked LAST while
        # rendering (client-side JS updates them per tab); reconstruct the
        # title for the default (first) tab instead.
        if tabs and " - " in title:
            base_title = title.rsplit(" - ", 1)[0].strip()
            title = f"{base_title} - {tabs[0]['label']}"
        # anything else inside main besides bkg / header article / tabs container
        for child in main.find_all(recursive=False):
            if has_class(child, "contenu-structure__bkg"):
                continue
            if child.name == "article":
                continue  # header, handled via entete-de-page/lead/cta
            if has_class(child, "contenu-structure__comp"):
                continue
            blocks.extend(handle_node(child))
    elif tpl == "sommaire-rubrique":
        teaser_block = parse_sommaire_data_model(html_text)
        if teaser_block:
            blocks.append(teaser_block)
        arts = main.find_all("article", recursive=False)
        for art in arts[1:]:
            if art.select_one(".page-footer"):
                blocks.extend(walk_container(art))
            elif art.select_one("#grid-list, .sommaire-rubrique-teasers-container"):
                continue  # already covered via JSON model
            else:
                blocks.extend(walk_container(art))
    elif tpl == "accueil":
        for child in main.find_all(recursive=False):
            if has_class(child, "container") and child.name == "div" and not has_class(child, "container-fluid"):
                # hero intro text (h1 + paragraph), no wrapper class beyond container
                if child.select_one("h1"):
                    for c2 in child.find_all(recursive=False):
                        blocks.extend(handle_node(c2))
                    continue
            blocks.extend(handle_node(child))
    else:  # article template
        blocks.extend(walk_container(main))

    blocks = dedupe_blocks(blocks)

    page = {
        "slug": slug,
        "url": BASE + path,
        "path": path.replace(".html", "").replace(SCOPE, "") or "/",
        "title": title,
        "section": section,
        "breadcrumb": breadcrumb,
        "lead": lead,
        "heroImage": hero,
        "cta": cta,
        "tabs": tabs,
        "blocks": blocks,
    }
    return page


def main():
    CONTENT.mkdir(exist_ok=True)
    manifest = []
    for p in CONFIG:
        page = extract_page(p["slug"], p["path"], p["section"])
        out_file = CONTENT / f"{p['slug']}.json"
        out_file.write_text(json.dumps(page, ensure_ascii=False, indent=2), encoding="utf-8")
        n_blocks = len(page["blocks"]) + sum(len(t["blocks"]) for t in page["tabs"])
        manifest.append((p["slug"], page["title"], n_blocks, len(page["tabs"])))
        print(f"{p['slug']:45s} blocks={n_blocks:3d} tabs={len(page['tabs'])}")

    (ROOT / "scripts/image_map.json").write_text(json.dumps(IMAGE_MAP, ensure_ascii=False, indent=2))
    (ROOT / "scripts/icon_map.json").write_text(json.dumps(ICON_MAP, ensure_ascii=False, indent=2))
    print(f"\n{len(IMAGE_MAP)} unique images, {len(ICON_MAP)} unique icons referenced.")


if __name__ == "__main__":
    main()
