"""Build a compact, source-faithful content inventory from saved SIL pages."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urljoin

from bs4 import BeautifulSoup


ROOT = "https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels"
BASE = "https://www.lausanne.ch"
SOURCES = Path(__file__).parent / "sources"

PAGES = [
    ("home", "/", f"{ROOT}.html"),
    ("electricite", "/electricite", f"{ROOT}/particuliers/je-choisis-mon-offre/electricite.html"),
    ("chaleur", "/chaleur", f"{ROOT}/particuliers/je-choisis-mon-offre/chaleur.html"),
    ("gaz-naturel", "/gaz-naturel", f"{ROOT}/particuliers/je-choisis-mon-offre/gaz-naturel.html"),
    ("multimedia", "/multimedia", f"{ROOT}/particuliers/je-choisis-mon-offre/multimedia.html"),
    ("mobilite", "/mobilite", f"{ROOT}/particuliers/je-choisis-mon-offre/mobilite.html"),
    ("produire-energie", "/produire-mon-energie", f"{ROOT}/particuliers/je-produis-mon-energie.html"),
    ("solaire-photovoltaique", "/solaire-photovoltaique", f"{ROOT}/particuliers/je-produis-mon-energie/solaire-photovoltaique.html"),
    ("renovation", "/renovation", f"{ROOT}/particuliers/j-optimise-ma-consommation/renovation-de-mon-bien-immobilier.html"),
    ("demenagement", "/demenagement", f"{ROOT}/particuliers/mon-compte/demenagement.html"),
    ("contact", "/contact", f"{ROOT}/particuliers/contact-sil.html"),
    ("a-propos", "/a-propos", f"{ROOT}/a-propos-sil.html"),
    ("nos-activites", "/nos-activites", f"{ROOT}/a-propos-sil/nos-activites.html"),
    ("production-solaire", "/production-solaire", f"{ROOT}/a-propos-sil/nos-activites/electricite/production/solaire.html"),
    ("reglements", "/reglements", f"{ROOT}/a-propos-sil/nos-activites/reglements.html"),
    ("publications", "/publications", f"{ROOT}/a-propos-sil/notre-portrait/publications.html"),
    ("c-for", "/c-for", f"{ROOT}/a-propos-sil/c-for.html"),
    ("compte-pro", "/professionnels", f"{ROOT}/professionnels/compte-pro.html"),
]

ASSETS = [
    {
        "file": "/assets/brand/logo-sil.svg",
        "sourceUrl": f"{BASE}/dam/jcr:9130c40a-f8c2-41d8-b1fc-b7fcba2041b2/Logo_SiL(2).svg",
        "alt": "Services industriels (SiL)",
        "credit": "Services industriels de Lausanne",
        "usedBy": ["all"],
    },
    {
        "file": "/assets/images/hero-lausanne-sil.jpg",
        "sourceUrl": f"{BASE}/.imaging/mte/lausanne/original/website/lausanne/vie-pratique/energies-et-eau/services-industriels/a-propos-sil/importSocial/SIL-A-propos.2024-10-16-08-31-16.jpg",
        "alt": "Services industriels de Lausanne",
        "credit": "Source: page officielle SiL «A propos des SiL»",
        "usedBy": ["home", "a-propos"],
    },
    {
        "file": "/assets/images/solaire-photovoltaique.jpg",
        "sourceUrl": f"{BASE}/.imaging/mte/lausanne/original/website/lausanne/vie-pratique/energies-et-eau/services-industriels/particuliers/je-produis-mon-energie/solaire-photovoltaique/importSocial/Solaire-photovoltaique-AdobeStock-1024x576.2026-05-27-14-59-13.jpg",
        "alt": "Installation solaire photovoltaïque",
        "credit": "Adobe Stock (crédit indiqué par la source SiL)",
        "usedBy": ["solaire-photovoltaique", "produire-energie"],
    },
    {
        "file": "/assets/images/chaleur.jpg",
        "sourceUrl": f"{BASE}/.imaging/mte/lausanne/530x/website/lausanne/vie-pratique/energies-et-eau/services-industriels/particuliers/je-choisis-mon-offre/chaleur/importSocial/Chaleur-1024x576.2025-08-28-11-09-03.jpg",
        "alt": "Solution de chaleur des SiL",
        "credit": "Source: page officielle SiL «Chaleur»",
        "usedBy": ["chaleur"],
    },
    {
        "file": "/assets/images/mobilite.jpg",
        "sourceUrl": f"{BASE}/.imaging/mte/lausanne/original/website/lausanne/vie-pratique/energies-et-eau/services-industriels/particuliers/je-choisis-mon-offre/mobilite/importSocial/Mobilite-Unsplash-1024x576.2026-06-19-12-45-51.jpg",
        "alt": "Mobilité électrique",
        "credit": "Unsplash (crédit indiqué par la source SiL)",
        "usedBy": ["mobilite"],
    },
]


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def extract(filename: str, slug: str, source_url: str) -> dict:
    soup = BeautifulSoup((SOURCES / f"{filename}.html").read_text(errors="ignore"), "html.parser")
    main = soup.select_one("main#content") or soup.find("main")
    title_node = main.find("h1") if main else soup.find("h1")
    lead = main.select_one(".lead") if main else soup.select_one(".lead")
    page = {
        "slug": slug,
        "title": clean(title_node.get_text(" ", strip=True)) if title_node else filename,
        "sourceUrl": source_url,
        "intro": clean(lead.get_text(" ", strip=True)) if lead else "",
        "sections": [],
        "usefulLinks": [],
    }
    if not main:
        return page

    sections: list[dict] = []
    current = None
    seen_headings: set[str] = set()
    for node in main.find_all(["h2", "h3", "h4", "p", "li"]):
        text = clean(node.get_text(" ", strip=True))
        if not text or node.find_parent(["nav", "footer"]):
            continue
        if node.name in {"h2", "h3", "h4"}:
            if text == page["intro"] or text in seen_headings or len(text) > 150:
                continue
            seen_headings.add(text)
            current = {"heading": text, "body": [], "links": []}
            sections.append(current)
            continue
        if node.find_parent(["h1", "h2", "h3", "h4", "script", "style"]):
            continue
        if current is None:
            current = {"heading": "L’essentiel", "body": [], "links": []}
            sections.append(current)
        if text != page["intro"] and text not in current["body"] and 2 < len(text) <= 700:
            current["body"].append(text)

    # Keep the inventory useful for a POC while preserving the source wording.
    for section in sections:
        section["body"] = section["body"][:8]
    page["sections"] = [s for s in sections if s["body"] or s["heading"]][:12]

    seen_links: set[tuple[str, str]] = set()
    for anchor in main.find_all("a", href=True):
        label = clean(anchor.get_text(" ", strip=True))
        href = urljoin(source_url, anchor["href"])
        if not label or href.startswith(("javascript:", "mailto:", "tel:")):
            continue
        if "/iam-ui" in href or "-my-" in href:
            continue
        item = (label, href)
        if item in seen_links:
            continue
        seen_links.add(item)
        page["usefulLinks"].append({"label": label, "url": href})
    page["usefulLinks"] = page["usefulLinks"][:12]
    return page


result = {
    "generatedAt": str(date.today()),
    "sourceRoot": f"{ROOT}.html",
    "notes": "Inventaire éditorial destiné au prototype. Les libellés et textes proviennent des pages publiques SiL sauvegardées dans research/sources.",
    "pages": [extract(filename, slug, source_url) for filename, slug, source_url in PAGES],
    "assets": ASSETS,
}

(Path(__file__).parent / "content.json").write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + "\n"
)
