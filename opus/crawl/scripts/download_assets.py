#!/usr/bin/env python3
"""Download every image/icon referenced during extraction, plus the fixed
brand assets (SiL logo, Ville de Lausanne ecusson, favicon, main CSS bundle).
Large ".../original/..." imaging variants are downsized to a <=1920px
imaging preset when available, to avoid pulling multi-MB originals.
"""
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests

ROOT = Path("/home/mob/sil/opus/crawl")
BASE = "https://www.lausanne.ch"
UA = "SIL-POC-Crawler/1.0 (+https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels)"
HEADERS = {"User-Agent": UA}
PAUSE = 0.2

session = requests.Session()
session.headers.update(HEADERS)


def downsize_if_original(url):
    if "/.imaging/mte/lausanne/original/" in url:
        return url.replace("/.imaging/mte/lausanne/original/", "/.imaging/mte/lausanne/1920x/")
    return url


def fetch(url, dest: Path, allow_downsize=True):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return "cached"
    try_urls = [url]
    if allow_downsize:
        d = downsize_if_original(url)
        if d != url:
            try_urls = [d, url]
    for u in try_urls:
        try:
            r = session.get(u, timeout=30)
            if r.status_code == 200 and r.content:
                dest.write_bytes(r.content)
                return "ok"
        except requests.RequestException as e:
            last_err = str(e)
    return "FAILED"


def main():
    image_map = json.loads((ROOT / "scripts/image_map.json").read_text())
    icon_map = json.loads((ROOT / "scripts/icon_map.json").read_text())

    results = {"ok": 0, "cached": 0, "failed": []}
    for url, local in image_map.items():
        dest = ROOT / local
        status = fetch(url, dest)
        results[status if status in ("ok", "cached") else "failed"] = results.get(status, 0) + 1 if status in ("ok","cached") else results["failed"]
        if status == "FAILED":
            results["failed"].append(url)
        else:
            results["ok" if status == "ok" else "cached"] = results.get("ok" if status=="ok" else "cached", 0)
        time.sleep(PAUSE)
    print(f"images: {len(image_map)} total, failed={len(results['failed'])}")
    for f in results["failed"]:
        print("  FAILED image:", f)

    icon_failed = []
    for url, local in icon_map.items():
        dest = ROOT / local
        status = fetch(url, dest, allow_downsize=False)
        if status == "FAILED":
            icon_failed.append(url)
        time.sleep(PAUSE)
    print(f"icons: {len(icon_map)} total, failed={len(icon_failed)}")
    for f in icon_failed:
        print("  FAILED icon:", f)

    # ------------------------------------------------------------------
    # Brand assets
    # ------------------------------------------------------------------
    brand_assets = {
        "assets/brand/logo-sil.svg": BASE + "/dam/jcr:9130c40a-f8c2-41d8-b1fc-b7fcba2041b2/Logo_SiL(2).svg",
        "assets/brand/logo-sil-filigrane.svg": BASE + "/dam/jcr:873de83c-efca-4514-93bf-d8a0d1c5003f/logo-sil-filigrane.svg",
        "assets/brand/logo-sil-footer.svg": BASE + "/dam/jcr:3abddad1-dd7d-498a-b633-9eb79e19c67a/logo-sil2.svg",
    }
    for local, url in brand_assets.items():
        dest = ROOT / local
        status = fetch(url, dest, allow_downsize=False)
        print(f"brand {local}: {status}")
        time.sleep(PAUSE)

    home_html = (ROOT / "raw/accueil.html").read_text(encoding="utf-8")

    # favicon: prefer the 32x32 png icon
    m = re.search(r'<link[^>]+rel="icon"[^>]+sizes="32x32"[^>]+href="([^"]+)"', home_html)
    if not m:
        m = re.search(r'<link[^>]+rel="[^"]*icon[^"]*"[^>]+href="([^"]+)"', home_html)
    if m:
        favicon_url = urljoin(BASE, m.group(1))
        ext = favicon_url.rsplit(".", 1)[-1].split("?")[0]
        dest = ROOT / f"assets/brand/favicon.{ext}"
        status = fetch(favicon_url, dest, allow_downsize=False)
        print(f"favicon ({favicon_url}): {status}")
    else:
        print("favicon: not found in homepage <head>")

    # main CSS bundle (fetched first: the Ville-de-Lausanne "ecusson" emblem is
    # only defined there, as a CSS background-image, not inline in the HTML)
    m3 = re.search(r'href="(/\.resources/vdl-templating-light/webresources/css/dist/main-[^"]+\.css)"', home_html)
    css_text = ""
    if m3:
        css_url = urljoin(BASE, m3.group(1))
        dest = ROOT / "assets/brand/main.min.css"
        status = fetch(css_url, dest, allow_downsize=False)
        print(f"main.css ({css_url}): {status}")
        if dest.exists():
            css_text = dest.read_text(encoding="utf-8", errors="ignore")
    else:
        print("main.css: link not found in homepage <head>")

    # ecusson (Ville de Lausanne emblem) - background-image on .ecusson, defined in main.css
    ecusson_url = None
    m2 = re.search(r'\.ecusson\{background-image:url\(["\']?([^)\'"]+)', css_text)
    if m2 and m3:
        ecusson_url = urljoin(css_url, m2.group(1))
    if ecusson_url:
        ext = ecusson_url.rsplit(".", 1)[-1].split("?")[0]
        dest = ROOT / f"assets/brand/ecusson-lausanne.{ext}"
        status = fetch(ecusson_url, dest, allow_downsize=False)
        print(f"ecusson ({ecusson_url}): {status}")
    else:
        print("ecusson: not found (checked main.css .ecusson rule)")


if __name__ == "__main__":
    main()
