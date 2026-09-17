#!/usr/bin/env python3
"""Build pages.json: a flat manifest of every crawled page."""
import json
import re
from pathlib import Path

ROOT = Path("/home/mob/sil/opus/crawl")
CONFIG = json.loads((ROOT / "scripts/pages.config.json").read_text())
NAV = json.loads((ROOT / "navigation.json").read_text())

# slug -> parentSlug, depth, by walking navigation.json
PARENT = {}
DEPTH = {}


def walk(node, parent_slug, depth):
    slug = node.get("slug")
    if slug:
        PARENT[slug] = parent_slug
        DEPTH[slug] = depth
    for c in node.get("children", []):
        walk(c, slug or parent_slug, depth + 1)


PARENT["accueil"] = None
DEPTH["accueil"] = 0
for top in NAV["mainMenu"]:
    walk(top, "accueil", 1)


def extract_linked_slugs(page):
    found = set()

    def scan(obj):
        if isinstance(obj, dict):
            if "slug" in obj and isinstance(obj["slug"], str):
                found.add(obj["slug"])
            for v in obj.values():
                scan(v)
        elif isinstance(obj, list):
            for v in obj:
                scan(v)

    scan(page.get("blocks", []))
    scan(page.get("tabs", []))
    scan(page.get("cta", []))
    found.discard(page["slug"])
    return sorted(found)


def count_blocks_recursive(blocks):
    n = 0
    for b in blocks:
        n += 1
        if b.get("type") == "accordion":
            for it in b.get("items", []):
                n += count_blocks_recursive(it.get("blocks", []))
    return n


def main():
    manifest = []
    for p in CONFIG:
        page = json.loads((ROOT / "content" / f"{p['slug']}.json").read_text())
        n_blocks = count_blocks_recursive(page["blocks"])
        n_tab_blocks = sum(count_blocks_recursive(t["blocks"]) for t in page["tabs"])
        manifest.append({
            "slug": page["slug"],
            "url": page["url"],
            "path": page["path"],
            "title": page["title"],
            "section": page["section"],
            "depth": DEPTH.get(page["slug"], None),
            "parentSlug": PARENT.get(page["slug"]),
            "linkedSlugs": extract_linked_slugs(page),
            "numBlocks": n_blocks,
            "numTabBlocks": n_tab_blocks,
            "tabs": [t["id"] for t in page["tabs"]],
            "hasHeroImage": page["heroImage"] is not None,
        })
    (ROOT / "pages.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"pages.json written with {len(manifest)} pages")


if __name__ == "__main__":
    main()
