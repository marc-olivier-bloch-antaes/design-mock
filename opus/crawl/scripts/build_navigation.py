#!/usr/bin/env python3
"""Build navigation.json from the real desktop mega-menu (#nav-desktop) found
in raw/accueil.html, marking crawled pages with their slug."""
import json
from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup

ROOT = Path("/home/mob/sil/opus/crawl")
BASE = "https://www.lausanne.ch"

CONFIG = json.loads((ROOT / "scripts/pages.config.json").read_text())
URL_TO_SLUG = {BASE + p["path"]: p["slug"] for p in CONFIG}
URL_TO_SLUG[BASE + "/vie-pratique/energies-et-eau/services-industriels/partenaires/reglements.html"] = "a-propos-reglements"


def slug_for(href):
    return URL_TO_SLUG.get(href.split("#")[0])


def node_entry(a):
    href = urljoin(BASE, a.get("href", ""))
    label = a.get_text(strip=True)
    entry = {"label": label, "url": href}
    s = slug_for(href)
    if s:
        entry["slug"] = s
    return entry


def main():
    html = (ROOT / "raw/accueil.html").read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")
    nav = soup.find("nav", id="nav-desktop")

    top_ul = nav.select_one(".menu-level0 .sup-menu")
    tree = []
    for li in top_ul.find_all("li", recursive=False):
        a = li.find("a")
        menu_id = li.get("data-menu")
        top_entry = node_entry(a)
        top_entry["children"] = []

        sub_ul = nav.find("ul", id=menu_id)
        if sub_ul:
            for li2 in sub_ul.find_all("li", recursive=False):
                a2 = li2.find("a", recursive=False)
                if not a2:
                    continue
                label2 = a2.get_text(strip=True)
                if not label2:
                    continue  # the "home" bare-icon entry inside each sub-menu
                entry2 = node_entry(a2)
                entry2["children"] = []
                sub_ul2 = li2.find("ul")
                if sub_ul2:
                    for li3 in sub_ul2.find_all("li", recursive=False):
                        a3 = li3.find("a", recursive=False)
                        if a3 and a3.get_text(strip=True):
                            entry2["children"].append(node_entry(a3))
                if not entry2["children"]:
                    del entry2["children"]
                top_entry["children"].append(entry2)
        if not top_entry["children"]:
            del top_entry["children"]
        tree.append(top_entry)

    # The Ville-de-Lausanne "breadcrumb root" above the SiL section (Eau / SiL)
    root_crumb = soup.select_one("ul.breadcrumb li:first-child .bc-sub-nav-body ul")
    root_siblings = []
    if root_crumb:
        for li in root_crumb.find_all("li"):
            a = li.find("a")
            if a:
                root_siblings.append(node_entry(a))

    navigation = {
        "site": "Services industriels de Lausanne (SiL)",
        "root": {"label": "Services industriels (SiL)", "url": BASE + "/vie-pratique/energies-et-eau/services-industriels.html", "slug": "accueil"},
        "parentSiteSiblings": root_siblings,
        "mainMenu": tree,
    }
    (ROOT / "navigation.json").write_text(json.dumps(navigation, ensure_ascii=False, indent=2), encoding="utf-8")
    print("navigation.json written,", len(tree), "top-level entries")
    for t in tree:
        print(" -", t["label"], "children:", len(t.get("children", [])))


if __name__ == "__main__":
    main()
