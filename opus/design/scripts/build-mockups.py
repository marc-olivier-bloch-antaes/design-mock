#!/usr/bin/env python3
"""Génère les maquettes HTML statiques à partir des gabarits (scripts/mockup-src) et du
contenu crawlé (../crawl/content/*.json). Sortie : design/mockups/*.html.
Usage : python3 design/scripts/build-mockups.py
Les styles (mockups/mockups.css) et le JS (mockups/mockups.js) s'éditent directement."""
import json, os, re, html

ROOT = "/home/mob/sil/opus"
CRAWL = f"{ROOT}/crawl"
OUT = f"{ROOT}/design/mockups"
SRC = f"{ROOT}/design/scripts/mockup-src"  # gabarits HTML + icônes SVG (Lucide ISC, Simple Icons CC0)
A = "../../crawl/"  # préfixe relatif vers les assets crawlés

nav = json.load(open(f"{CRAWL}/navigation.json"))
home = json.load(open(f"{CRAWL}/content/accueil.json"))
elec = json.load(open(f"{CRAWL}/content/particuliers-electricite.json"))
portrait = json.load(open(f"{CRAWL}/content/a-propos-notre-portrait.json"))
offre = json.load(open(f"{CRAWL}/content/particuliers-je-choisis-mon-offre.json"))
metiers = json.load(open(f"{CRAWL}/content/carrieres-nos-metiers.json"))

PAGES = {"accueil": "accueil.html", "particuliers-electricite": "produit-onglets.html"}

def href(item):
    return PAGES.get(item.get("slug"), "#")

def esc(s):
    return html.escape(s, quote=True)

def ic(name, cls="icon"):
    return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'

# ---------------------------------------------------------------- sprite
def sprite():
    d = f"{SRC}/icons"
    out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none">']
    for f in sorted(os.listdir(d)):
        s = open(f"{d}/{f}").read()
        name = f[:-4]
        if name.startswith("si-"):
            inner = "".join(re.findall(r"<path[^>]*/>", s))
            out.append(f'<symbol id="i-{name}" viewBox="0 0 24 24"><g fill="currentColor">{inner}</g></symbol>')
        else:
            body = re.search(r">\s*(.*)</svg>", s, re.S).group(1)
            body = re.sub(r"\s+", " ", body).strip()
            out.append(
                f'<symbol id="i-{name}" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" '
                f'stroke-linecap="round" stroke-linejoin="round">{body}</g></symbol>'
            )
    out.append("</svg>")
    return "\n".join(out)

LOGO_MONO = open(f"{ROOT}/design/assets/logo-sil-monochrome.svg").read()
LOGO_DECO = LOGO_MONO.replace('role="img" aria-labelledby="t"', 'aria-hidden="true"').replace(
    "<title id=\"t\">SiL – Services industriels de Lausanne</title>", "")

UNIVERSE = {  # libellé -> (classe, icône lucide)
    "Electricité": ("u-electricite", "zap"),
    "Chaleur": ("u-chaleur", "heater"),
    "Gaz": ("u-gaz", "flame"),
    "Multimédia": ("u-multimedia", "wifi"),
    "Mobilité": ("u-mobilite", "plug-zap"),
    "Solaire": ("u-solaire", "sun"),
}

def fix_label(s):
    """Normalisation typographique d'affichage (accents sur capitales)."""
    return s.replace("Electricité", "Électricité").replace("A propos", "À propos").replace("Economies", "Économies").replace("Eclairage", "Éclairage").replace("Energies", "Énergies").replace("Evénements", "Événements").replace("Equiwatt", "Équiwatt")

# ---------------------------------------------------------------- header
MEGA_INTRO = {
    "Particuliers": "Vous êtes un particulier, un artisan ou un petit commerce?",
    "A propos des SiL": "Les SiL alimentent l'agglomération lausannoise en électricité, gaz, chaleur et prestations multimédia.",
    "Carrières": "Production, distribution et services transversaux: des missions variées au service de l'énergie à Lausanne.",
}
MEGA_FEATURE = {
    "Particuliers": ("Design-sans-titre-1-.2026-09-15-14-54-03.jpg", "Tarifs de l'électricité 2027: infos en ligne"),
    "Professionnels": ("carte_500x375.2024-09-05-12-24-26.jpg", "Le soleil, une énergie inépuisable"),
    "A propos des SiL": ("focus-vdl-130ans.2026-09-09-12-21-34.webp", "Sur la piste des SiL"),
    "Carrières": ("Caf--Carri-re-Internet.2025-08-15-11-53-47.jpg", "Nos métiers: diversité et innovation au cœur de l'énergie lausannoise"),
}

def slugify(s):
    s = s.lower()
    for a, b in (("é", "e"), ("è", "e"), ("à", "a"), ("ê", "e"), ("ô", "o")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def megamenu(item):
    key = slugify(item["label"])
    groups = []
    kids = item.get("children", [])
    has_l3 = any(c.get("children") for c in kids)
    if has_l3:
        for c in kids:
            lis = "".join(f'<li><a href="{href(g)}">{esc(fix_label(g["label"]))}</a></li>' for g in c.get("children", []))
            groups.append(
                f'<div class="megamenu__group"><h3><a href="{href(c)}">{esc(fix_label(c["label"]))}</a></h3>'
                + (f"<ul role=\"list\">{lis}</ul>" if lis else "") + "</div>"
            )
    else:
        lis = "".join(f'<li><a href="{href(g)}">{esc(fix_label(g["label"]))}</a></li>' for g in kids)
        groups.append(f'<div class="megamenu__group"><h3><a href="#">{esc(fix_label(item["label"]))}</a></h3><ul role="list">{lis}</ul></div>')
    intro = MEGA_INTRO.get(item["label"])
    feat = MEGA_FEATURE.get(item["label"])
    feat_html = ""
    if feat:
        feat_html = (
            f'<a class="megamenu__feature" href="#"><img src="{A}assets/images/{feat[0]}" alt="" loading="lazy">'
            f'<div><p class="eyebrow">À la une</p><strong>{esc(feat[1])}</strong></div></a>'
        )
    return f'''
    <div class="megamenu" id="mega-{key}" hidden>
      <div class="container megamenu__inner">
        <div class="megamenu__intro">
          <h2>{esc(fix_label(item["label"]))}</h2>
          {f'<p>{esc(intro)}</p>' if intro else ''}
          <a class="arrow-link" href="#">Vue d'ensemble {ic("arrow-right")}</a>
        </div>
        <div class="megamenu__groups">{''.join(groups)}</div>
        <div>{feat_html}</div>
      </div>
    </div>'''

def header(current):
    items = []
    megas = []
    for it in nav["mainMenu"]:
        key = slugify(it["label"])
        cur = ' data-current' if it["label"] == current else ''
        items.append(
            f'<li><button class="nav__item" type="button" aria-expanded="false" aria-controls="mega-{key}" data-mega="{key}"{cur}>'
            f'{esc(fix_label(it["label"]))}{ic("chevron-down")}</button></li>'
        )
        megas.append(megamenu(it))
    drawer_items = []
    for it in nav["mainMenu"]:
        key = slugify(it["label"])
        blocks = []
        for c in it.get("children", []):
            sub = "".join(f'<li><a href="{href(g)}">{esc(fix_label(g["label"]))}</a></li>' for g in c.get("children", []))
            blocks.append(f'<a class="drawer__l2" href="{href(c)}">{esc(fix_label(c["label"]))}</a>' + (f'<ul class="drawer__l3" role="list">{sub}</ul>' if sub else ""))
        drawer_items.append(
            f'<li><button class="drawer__l1" type="button" aria-expanded="false" aria-controls="dr-{key}" data-drawer-l1>{esc(fix_label(it["label"]))}{ic("chevron-down")}</button>'
            f'<div class="drawer__panel" id="dr-{key}" hidden>{"".join(blocks)}</div></li>'
        )
    return f'''
<a class="skip-link" href="#contenu">Aller au contenu</a>
<div class="utility on-dark">
  <div class="container">
    <a class="utility__city" href="#"><span class="sr-only">Un site de la </span><span aria-hidden="true">Un site de la</span><img src="{A}assets/brand/ecusson-lausanne.svg" alt="Ville de Lausanne"></a>
    <div class="utility__links">
      <a class="utility__urgent" href="#">{ic("triangle-alert", "icon icon--sm")}Urgences ou pannes 24h/24&nbsp;: <strong>021 315 88 88</strong></a>
      <a href="#">Contact</a>
    </div>
  </div>
</div>
<header class="header" id="header">
  <div class="container header__bar">
    <a class="brand" href="accueil.html" aria-label="SiL – Services industriels de Lausanne, accueil">
      <img src="../assets/logo-sil-positif.svg" alt="" width="107" height="30">
      <span class="brand__name">Services industriels<br>de Lausanne</span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      <ul class="nav__list" role="list">{''.join(items)}</ul>
    </nav>
    <div class="header__actions">
      <button class="icon-btn header__search" type="button" aria-label="Rechercher">{ic("search")}</button>
      <a class="btn btn--secondary btn--sm header__account" href="#">{ic("circle-user-round")}Espace client</a>
      <a class="icon-btn header__account-icon" href="#" aria-label="Espace client">{ic("circle-user-round")}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="drawer" data-drawer-open>Menu {ic("menu")}</button>
    </div>
  </div>
  {''.join(megas)}
</header>
<div class="scrim" hidden data-scrim></div>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="drawer__head">
    <a class="brand" href="accueil.html" aria-label="SiL, accueil"><img src="../assets/logo-sil-positif.svg" alt="" width="93" height="26"></a>
    <button class="icon-btn icon-btn--outline" type="button" aria-label="Fermer le menu" data-drawer-close>{ic("x")}</button>
  </div>
  <div class="drawer__search" aria-hidden="true">{ic("search")}<span>Rechercher sur le site</span></div>
  <ul class="drawer__nav" role="list">{''.join(drawer_items)}</ul>
  <div class="drawer__foot">
    <a class="btn btn--primary btn--block" href="#">{ic("circle-user-round")}Espace client</a>
    <a class="btn btn--secondary btn--block" href="#">{ic("phone")}021 315 88 88</a>
    <p class="t-sm t-muted">{ic("triangle-alert", "icon icon--sm")}Urgences ou pannes&nbsp;: 7j/7, 24h/24</p>
  </div>
</div>'''

# ---------------------------------------------------------------- footer
FOOTER_COLS = [
    ("À propos", ["Nos activités", "Publications", "Formation", "Les SiL"]),
    ("Produits", ["Électricité", "Chaleur", "Gaz", "Multimédia", "Mobilité", "Solaire", "Conditions générales"]),
    ("Subventions", ["Vélo électrique", "Batterie pour vélo électrique", "Scooter électrique", "Électroménager", "Solaire thermique", "Rénovation énergétique pour les entreprises"]),
    ("Conseils énergétiques", ["Écogestes quotidiens", "Conseils personnalisés", "Kit d'économies d'énergie", "Audit de votre bâtiment"]),
    ("Mon compte", ["Mes factures", "Mon déménagement", "Compte pour professionnels"]),
]
SOCIAL = [("Facebook", "si-facebook"), ("Instagram", "si-instagram"), ("LinkedIn", "si-linkedin"), ("YouTube", "si-youtube"), ("X", "si-x")]

def footer():
    cols = "".join(
        f'<details class="footer__col" data-footer-col><summary>{esc(t)}{ic("chevron-down")}</summary><ul role="list">'
        + "".join(f'<li><a href="{"produit-onglets.html" if l == "Électricité" else "#"}">{esc(l)}</a></li>' for l in links)
        + "</ul></details>"
        for t, links in FOOTER_COLS
    )
    soc = "".join(f'<a href="#" aria-label="{n}">{ic(i, "")}</a>' for n, i in SOCIAL)
    return f'''
<footer class="footer on-dark">
  <div class="container footer__top">
    <div class="footer__brand">
      <img src="../assets/logo-sil-negatif.svg" alt="SiL – Services industriels de Lausanne" width="114" height="32">
      <address><strong>Contact clients</strong><br>Service commercial<br>Place Chauderon 23<br>Case postale 7416, 1001 Lausanne</address>
      <a class="footer__transit" href="#">{ic("bus", "icon icon--sm")}S'y rendre en transports publics</a>
      <div class="footer__social">{soc}</div>
    </div>
    <nav class="footer__cols" aria-label="Liens de pied de page">{cols}</nav>
  </div>
  <div class="footer__bottom">
    <div class="container">
      <a class="footer__city" href="#" aria-label="Un site de la Ville de Lausanne"><img src="{A}assets/brand/ecusson-lausanne.svg" alt=""></a>
      <div class="footer__legal"><a href="#">Webmaster</a><a href="#">Mentions légales</a></div>
      <button class="footer__totop" type="button" data-totop>Haut de page {ic("arrow-up", "icon icon--sm")}</button>
    </div>
  </div>
</footer>'''

# ---------------------------------------------------------------- blocs de contenu
def contact_card(block, phone=True):
    lines = block["lines"]
    addr = lines[-1].replace(" Case postale", "<br>Case postale").replace(" 1001", ", 1001")
    sub = "".join(f"{esc(l)}<br>" for l in lines[1:-1])
    soc = "".join(f'<a href="#" aria-label="{l["label"]}">{ic("si-" + l["label"].lower(), "")}</a>' for l in block["links"] if l["label"] in ("Facebook", "Instagram", "Linkedin"))
    return f'''
<section class="aside-card contact-card" aria-labelledby="contact-title">
  <img class="contact-card__logo" src="../assets/logo-sil-positif.svg" alt="" width="78" height="22">
  <h2 id="contact-title">{esc(block["title"])}</h2>
  <address>{sub}{addr}</address>
  {f'<div class="contact-card__row">{ic("phone")}<div><a class="contact-card__phone" href="#">021 315 88 88</a><p class="t-sm t-muted">Lundi-vendredi: 8h-17h</p></div></div>' if phone else ''}
  <div class="contact-card__row">{ic("bus")}<a class="link" href="#">S'y rendre en transports publics</a></div>
  <a class="btn btn--primary btn--block" href="#">Nous contacter {ic("arrow-right", "icon icon--move")}</a>
  <div class="contact-card__social">{soc}</div>
</section>'''

def doc_list(items):
    rows = []
    for d in items:
        fmt = d["format"].upper()
        t = {"PDF": "pdf", "DOCX": "docx", "JSON": "json"}.get(fmt, "link")
        badge = fmt if t != "link" else ic("link", "icon")
        if t == "link":
            meta = "Page web · lausanne.ch"
            act = ic("arrow-up-right")
            sr = " (lien)"
        else:
            meta = f"{fmt} · {d['size']}" if d.get("size") else fmt
            act = ic("download")
            sr = f" ({fmt}, {d['size']})"
        rows.append(
            f'<li class="doc"><span class="doc__type doc__type--{t}" aria-hidden="true">{badge}</span>'
            f'<span class="doc__label"><a href="#">{esc(re.sub(r"\s*\((PDF|JSON)\)$", "", d["label"]))}<span class="sr-only">{esc(sr)}</span></a>'
            f'<span class="doc__meta" aria-hidden="true">{esc(meta)}</span></span>'
            f'<span class="doc__action" aria-hidden="true">{act}</span></li>'
        )
    return f'<ul class="doc-list" role="list">{"".join(rows)}</ul>'

def render_inline(h):
    # liens absolus -> "#" dans la maquette
    return re.sub(r'href="[^"]*"', 'href="#"', h)

def render_blocks(blocks, hl=3):
    out = []
    for b in blocks:
        t = b["type"]
        if t == "paragraph":
            out.append(f"<p>{render_inline(b['html'])}</p>")
        elif t == "list":
            tag = "ol" if b["ordered"] else "ul"
            out.append(f"<{tag}>" + "".join(f"<li>{render_inline(i)}</li>" for i in b["items"]) + f"</{tag}>")
        elif t == "heading":
            out.append(f"<h{hl} class=\"t-h4\">{esc(b['text'])}</h{hl}>")
        elif t == "documents":
            out.append(doc_list(b["items"]))
    return "\n".join(out)

acc_counter = [0]
def accordion(items, open_first=False, compact=False, hl=3):
    rows = []
    for i, it in enumerate(items):
        acc_counter[0] += 1
        n = acc_counter[0]
        is_open = open_first and i == 0
        rows.append(
            f'<div class="accordion__item"><h{hl} class="sr-heading" style="margin:0;font:inherit">'
            f'<button class="accordion__trigger" type="button" id="acc-t{n}" aria-expanded="{"true" if is_open else "false"}" aria-controls="acc-p{n}" data-accordion>'
            f'<span>{esc(it["title"])}</span><span class="accordion__icon">{ic("chevron-down")}</span></button></h{hl}>'
            f'<div class="accordion__panel" id="acc-p{n}" role="region" aria-labelledby="acc-t{n}"{"" if is_open else " hidden"}>'
            f'<div class="prose">{render_blocks(it["blocks"], hl=hl + 1)}</div></div></div>'
        )
    return f'<div class="accordion{" accordion--compact" if compact else ""}">{"".join(rows)}</div>'

def embed(url, title):
    host = re.sub(r"https?://([^/]+)/.*", r"\1", url)
    return f'''
<figure class="embed">
  <div class="embed__placeholder">
    <span class="icon-circle">{ic("chart-column", "icon icon--lg")}</span>
    <p><strong>{esc(title)}</strong>Graphique interactif hébergé par Datawrapper. En l'affichant, vous acceptez le chargement de contenu externe.</p>
    <button class="btn btn--secondary btn--sm" type="button">Afficher le graphique</button>
  </div>
  <figcaption class="embed__bar"><span>Source&nbsp;: {esc(host)}</span><a class="btn btn--ghost btn--sm" href="#">Ouvrir {ic("arrow-up-right", "icon icon--sm")}<span class="sr-only"> dans un nouvel onglet</span></a></figcaption>
</figure>'''

def tabs_of(page):
    return {t["id"]: t for t in page["tabs"]}

# ---------------------------------------------------------------- page produit : onglets
def tab_produits(t):
    b = t["blocks"]
    card = lambda name, suffix, label, para, emb, cta, featured: f'''
<article class="product-card{' product-card--featured' if featured else ''}">
  <div class="product-card__head">
    {'<span class="badge badge--neutral product-card__ribbon">Sur simple demande</span>' if featured else '<span class="badge badge--new product-card__ribbon">Produit par défaut</span>'}
    <p class="product-card__label">{ic("leaf")}{esc(label)}</p>
    <h2 class="product-card__name">{name} <em>– {esc(suffix)}</em></h2>
  </div>
  <div class="product-card__body">
    <div class="prose">{para}</div>
    {emb}
    <div class="btn-group"><a class="btn btn--primary" href="#">{esc(cta)} {ic("arrow-right", "icon icon--move")}</a></div>
  </div>
</article>'''
    nativa = card("nativa", "100% renouvelable, 100% régionale", "Électricité de référence des SiL",
                  f"<p>{render_inline(b[5]['html'])}</p>", embed(b[6]["url"], "Composition du produit nativa") +
                  f'<p class="t-sm t-muted mt-4">{render_inline(b[7]["html"])}</p>', b[8]["label"], False)
    plus = card("nativaplus", "100% écologique pour plus d'engagement", "Certifié naturemade star",
                f"<p>{render_inline(b[1]['html'])}</p>", embed(b[2]["url"], "Composition du produit nativaplus"), b[3]["label"], True)
    return f'''
<div class="content-layout">
  <div class="content-main">
    <div class="block__head"><p class="eyebrow">Nos produits d'électricité</p><h2 class="t-h2">Choisissez l'origine de votre électricité</h2></div>
    <div style="display:grid;gap:24px">{nativa}{plus}</div>
  </div>
  <aside class="content-aside" aria-label="Informations complémentaires">{contact_card(elec["blocks"][0])}</aside>
</div>'''

def tab_tarifs(t):
    b = t["blocks"]
    steps = []
    for item in b[6]["items"]:
        k, _, v = item.partition(":")
        steps.append(f"<li><strong class=\"step-title\">{esc(k.strip())}</strong><span>{esc(v.strip())}</span></li>")
    archives = accordion(b[15]["items"], compact=True)
    faq = accordion(b[17]["items"], open_first=True)
    def links(idx_head, idxs):
        lis = []
        for i in idxs:
            h = b[i]["html"]
            m = re.match(r'<a href="[^"]*">(.*?)</a>(?:<br>\s*(.*))?', h, re.S)
            desc = f'<span class="link-list__desc">{m.group(2)}</span>' if m.group(2) else ""
            lis.append(f'<li><a href="#">{m.group(1).strip()}{ic("arrow-right")}</a>{desc}</li>')
        return f'<h3>{esc(b[idx_head]["text"])}</h3><ul class="link-list" role="list">{"".join(lis)}</ul>'
    return f'''
<div class="content-layout">
  <div class="content-main">
    <div class="callout">{ic("leaf", "icon icon--lg")}<p>{esc(b[0]["text"])}</p></div>
    <div class="prose mt-6"><p>{render_inline(b[1]["html"])}</p></div>

    <section class="block" aria-labelledby="t2027">
      <div class="block__head">
        <div class="year-head"><h2 class="t-h2" id="t2027">Tarifs 2027</h2><span class="badge badge--new">Nouveau</span></div>
      </div>
      <div class="prose">
        <h3 class="t-h4">{esc(b[3]["text"])}</h3>
        <p>{render_inline(b[4]["html"])}</p>
        <p>{render_inline(b[5]["html"])}</p>
      </div>
      <ol class="steps mt-6" role="list">{"".join(steps)}</ol>
      <p class="mt-6">{render_inline(b[7]["html"])}</p>
      <h3 class="t-h4 mt-8" style="margin-bottom:16px">{esc(b[8]["text"])}</h3>
      {doc_list(b[9]["items"])}
      <div class="callout callout--info mt-6">{ic("info")}<p style="font-size:1rem;font-weight:500">{render_inline(b[19]["html"])}</p></div>
      <div class="btn-group mt-6"><a class="btn btn--primary" href="#">{esc(b[20]["label"])} {ic("arrow-right", "icon icon--move")}</a></div>
    </section>

    <section class="block" aria-labelledby="faq-tarifs">
      <div class="block__head"><p class="eyebrow">Questions fréquentes</p><h2 class="t-h2" id="faq-tarifs">{esc(b[16]["text"])} sur les tarifs 2027</h2></div>
      {faq}
      <a class="arrow-link mt-4" href="?tab=faq" data-goto-tab="faq">Toutes les questions sur l'électricité {ic("arrow-right")}</a>
    </section>

    <section class="block" aria-labelledby="t2026">
      <div class="block__head"><h2 class="t-h3" id="t2026">Tarifs précédents</h2><p class="t-muted">Tarifs 2026, reprise de l'énergie et archives.</p></div>
      <h3 class="t-h4" style="margin-bottom:16px">Tarifs 2026 – {esc(b[11]["text"])}</h3>
      {doc_list(b[12]["items"])}
      <h3 class="t-h4 mt-8" style="margin-bottom:16px">{esc(b[13]["text"])}</h3>
      {doc_list(b[14]["items"])}
      <div class="mt-6">{archives}</div>
    </section>
  </div>
  <aside class="content-aside" aria-label="Liens utiles">
    <section class="aside-card aside-card--subtle">
      <h2>Liens utiles</h2>
      {links(21, [22, 23])}
      {links(24, [25])}
      {links(26, [27, 28])}
    </section>
    {contact_card(elec["blocks"][0])}
  </aside>
</div>'''

def tab_raccordement(t):
    b = t["blocks"]
    return f'''
<div class="content-layout">
  <div class="content-main">
    <div class="media-row" style="grid-template-columns:1fr">
      <figure class="figure"><img src="{A}{b[4]["src"]}" alt="" style="aspect-ratio:16/9"><figcaption>{esc(b[4]["alt"])}</figcaption></figure>
    </div>
    <div class="prose mt-8">
      <h2 class="t-h2">{esc(b[0]["text"])}</h2>
      <p class="t-lead">{render_inline(b[1]["html"])}</p>
      <p>{render_inline(b[2]["html"])}</p>
    </div>
    <div class="btn-group mt-6"><a class="btn btn--primary" href="#">{esc(b[3]["label"])} {ic("arrow-right", "icon icon--move")}</a></div>
  </div>
  <aside class="content-aside">{contact_card(elec["blocks"][0])}</aside>
</div>'''

def tab_securite(t):
    b = t["blocks"]
    table = b[11]
    groups = []
    cur = None
    for row in table["rows"]:
        if row[0]:
            cur = [row]
            groups.append(cur)
        else:
            cur.append(row)
    body = []
    for g in groups:
        trs = []
        for i, r in enumerate(g):
            price = r[2].replace(".-", ".–")
            if i == 0:
                trs.append(f'<tr><th scope="rowgroup" rowspan="{len(g)}">{esc(r[0])}</th><td class="desc">{r[1]}</td><td class="num">{price}<small>CHF</small></td></tr>')
            else:
                trs.append(f'<tr class="is-sub"><td class="desc">{r[1]}</td><td class="num">{price}<small>CHF</small></td></tr>')
        body.append(f'<tbody class="group">{"".join(trs)}</tbody>')
    table_html = f'''
<div class="table-block">
  <div class="table-block__caption"><h3 class="t-h4" id="tab-frais">Frais liés au contrôle des installations</h3><span class="t-sm t-muted">Tarifs en CHF, hors TVA</span></div>
  <div class="table-wrap"><table class="price-table" aria-labelledby="tab-frais">
    <thead><tr><th scope="col">{table["headers"][0]}</th><th scope="col">{table["headers"][1]}</th><th scope="col" class="num">Tarif (CHF)</th></tr></thead>
    {"".join(body)}
  </table></div>
</div>'''
    return f'''
<div class="content-layout">
  <div class="content-main">
    <div class="media-row">
      <figure class="figure"><img src="{A}{b[0]["src"]}" alt=""><figcaption>{esc(b[0]["alt"])}</figcaption></figure>
      <div class="prose">
        <h2 class="t-h2">{esc(b[1]["text"])}</h2>
        <p>{render_inline(b[2]["html"])}</p>
      </div>
    </div>
    <div class="prose mt-6">
      <p>{render_inline(b[3]["html"])}</p>
      {render_blocks([b[4]])}
      <h2 class="t-h3">{esc(b[5]["text"])}</h2>
      {render_blocks([b[6]])}
      <h2 class="t-h3">{esc(b[7]["text"])}</h2>
    </div>
    <ol class="steps mt-4" role="list" style="grid-template-columns:1fr">{"".join(f"<li><span>{render_inline(i)}</span></li>" for i in b[8]["items"])}</ol>
    <section class="block" aria-labelledby="tarifs-oibt">
      <div class="prose"><h2 class="t-h2" id="tarifs-oibt">{esc(b[9]["text"])}</h2><p>{render_inline(b[10]["html"])}</p></div>
      <div class="mt-6">{table_html}</div>
    </section>
    <section class="block" aria-labelledby="docs-secu">
      <h2 class="t-h3" id="docs-secu" style="margin-bottom:16px">{esc(b[12]["text"])}</h2>
      {doc_list(b[13]["items"])}
    </section>
  </div>
  <aside class="content-aside" aria-label="Liens utiles">
    <section class="aside-card aside-card--subtle">
      <h2>Bases légales</h2>
      <ul class="link-list" role="list">
        <li><a href="#">{re.sub("<[^>]+>", "", b[14]["html"]).strip()}{ic("arrow-up-right")}</a></li>
        <li><a href="#">{re.sub("<[^>]+>", "", b[15]["html"]).strip()}{ic("arrow-up-right")}</a></li>
      </ul>
    </section>
    {contact_card(elec["blocks"][0])}
  </aside>
</div>'''

def tab_faq(t):
    b = t["blocks"]
    groups = []
    anchors = []
    i = 2
    # b[0] heading, b[1] paragraph, puis (accordion glossaire) + paires heading/accordion
    gloss = b[2]
    i = 3
    while i < len(b):
        if b[i]["type"] == "heading" and i + 1 < len(b) and b[i + 1]["type"] == "accordion":
            title = b[i]["text"].rstrip(":").strip()
            gid = "faq-" + slugify(title)[:40]
            n = len(b[i + 1]["items"])
            groups.append(
                f'<section class="faq-group" aria-labelledby="{gid}"><div class="faq-group__head"><h3 class="t-h3" id="{gid}">{esc(title)}</h3>'
                f'<span class="t-sm t-muted">{n} question{"s" if n > 1 else ""}</span></div>{accordion(b[i + 1]["items"], hl=4)}</section>'
            )
            anchors.append(f'<li><a href="#{gid}">{esc(title)}<span>{n}</span></a></li>')
            i += 2
        else:
            i += 1
    rel = [re.match(r'<a href="[^"]*">(.*?)</a>', x["html"]).group(1) for x in b[-3:]]
    return f'''
<div class="content-layout">
  <div class="content-main">
    <div class="block__head"><p class="eyebrow">FAQ</p><h2 class="t-h2">{esc(b[0]["text"])}</h2><p class="t-lead mt-2">{render_inline(b[1]["html"])}</p></div>
    <div class="mt-6">{accordion(gloss["items"], compact=True)}</div>
    <div class="mt-8">{"".join(groups)}</div>
  </div>
  <aside class="content-aside" aria-label="Navigation dans la FAQ">
    <nav class="aside-card show-lg" aria-label="Thèmes de la FAQ"><h2>Thèmes</h2><ul class="anchor-nav mt-4" role="list">{"".join(anchors)}</ul></nav>
    <section class="aside-card aside-card--subtle"><h2>En relation</h2><ul class="link-list" role="list">{"".join(f'<li><a href="#">{esc(r)}{ic("arrow-right")}</a></li>' for r in rel)}</ul></section>
  </aside>
</div>'''

TAB_ICONS = {"produits": "package", "tarifs": "receipt-text", "raccordement": "cable", "securite": "shield-check", "faq": "circle-help"}

def product_tabs():
    tabs = elec["tabs"]
    renders = {"produits": tab_produits, "tarifs": tab_tarifs, "raccordement": tab_raccordement, "securite": tab_securite, "faq": tab_faq}
    btns, panels = [], []
    for i, t in enumerate(tabs):
        sel = i == 0
        btns.append(
            f'<button class="tab" role="tab" type="button" id="tab-{t["id"]}" aria-controls="panel-{t["id"]}" aria-selected="{"true" if sel else "false"}" tabindex="{0 if sel else -1}" data-tab="{t["id"]}">'
            f'{ic(TAB_ICONS[t["id"]])}{esc(t["label"])}</button>'
        )
        panels.append(
            f'<div class="tabpanel" role="tabpanel" id="panel-{t["id"]}" aria-labelledby="tab-{t["id"]}" tabindex="0"{"" if sel else " hidden"}>'
            f'<div class="container">{renders[t["id"]](t)}</div></div>'
        )
    return f'''
<div class="tabs-bar" id="onglets">
  <div class="container"><div class="tablist" role="tablist" aria-label="Rubriques de la page Électricité">{"".join(btns)}</div></div>
</div>
{"".join(panels)}'''

# ---------------------------------------------------------------- accueil
def home_sections():
    blocks = home["blocks"]
    carousel, icons, accroche, news, contact = blocks
    # univers
    tiles = []
    for l in icons["items"]:
        cls, icon = UNIVERSE[l["label"]]
        tiles.append(
            f'<a class="universe-tile {cls}" href="{href(l)}"><span class="universe-tile__icon">{ic(icon)}</span>'
            f'{esc(fix_label(l["label"]))}{ic("arrow-right", "icon universe-tile__arrow")}</a>'
        )
    # carrousel
    cards = []
    for it in carousel["items"]:
        ext = it.get("external")
        u = "produit-onglets.html?tab=tarifs" if "electricite?tab=tarifs" in it["url"] else "#"
        foot = (f'<span class="t-muted">Site partenaire</span>{ic("arrow-up-right")}' if ext else f'<span>En savoir plus</span>{ic("arrow-right")}')
        cards.append(
            f'<li><article class="card"><div class="card__media"><img src="{A}{it["image"]}" alt="" loading="lazy"></div>'
            f'<div class="card__body"><h3 class="card__title"><a href="{u}">{esc(it["title"].replace(": ", " : ").replace("2027 : ", "2027 : "))}'
            f'{"<span class=sr-only> (site externe)</span>" if ext else ""}</a></h3>'
            f'<p class="card__text">{esc(it["text"])}</p><div class="card__foot">{foot}</div></div></article></li>'
        )
    # accroches
    prompts = []
    for it in accroche["items"]:
        prompts.append(
            f'<article class="prompt-card"><img src="{A}{it["image"]}" alt="" loading="lazy"><div class="prompt-card__body">'
            f'<h3 class="prompt-card__title"><a href="{href(it)}">{esc(it["title"])}</a></h3><p>{esc(it["text"])}</p>'
            f'<span class="prompt-card__go" aria-hidden="true">Découvrir {ic("arrow-right", "icon icon--sm")}</span></div></article>'
        )
    # news
    MONTHS = {"01": "janv.", "02": "févr.", "03": "mars", "04": "avr.", "05": "mai", "06": "juin", "07": "juil.", "08": "août", "09": "sept.", "10": "oct.", "11": "nov.", "12": "déc."}
    news_items = []
    for it in news["items"][:5]:
        date, _, label = it["label"].partition(" – ")
        dd, mm = date.split(".")
        news_items.append(
            f'<li class="news-item"><time datetime="2026-{mm}-{dd}">{int(dd)}<small>{MONTHS[mm]}</small></time>'
            f'<a href="#">{esc(label)}</a>{ic("arrow-right")}</li>'
        )
    kf = portrait["blocks"][2]
    figs = []
    for it in kf["items"]:
        v = esc(it["value"]).replace("+ de ", '<span class="pre">plus de</span>').replace(" ans", "<small> ans</small>")
        figs.append(f'<div class="keyfigure"><dt>{esc(it["label"])}</dt><dd>{v}</dd></div>')
    return dict(tiles="".join(tiles), cards="".join(cards), prompts="".join(prompts), news="".join(news_items),
                kf_title=esc(kf["title"]), figs="".join(figs), deco=LOGO_DECO)

# ---------------------------------------------------------------- assemblage
def build(template, out, **ctx):
    s = open(f"{SRC}/{template}").read()
    for k, v in ctx.items():
        s = s.replace("{{" + k + "}}", v)
    left = re.findall(r"\{\{[a-z_]+\}\}", s)
    assert not left, left
    open(f"{OUT}/{out}", "w").write(s)
    print("écrit", out, len(s) // 1024, "Ko")

common = dict(sprite=sprite(), footer=footer())
h = home_sections()
build("accueil.html", "accueil.html", header=header(""), **common, **h)

hero_lead = elec["lead"]
build("produit-onglets.html", "produit-onglets.html", header=header("Particuliers"), **common,
      lead=hero_lead, hero=A + elec["heroImage"], tabs=product_tabs(), cta=esc(elec["cta"][0]["label"]))
