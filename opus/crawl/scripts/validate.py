#!/usr/bin/env python3
"""Validation pass for the SiL crawl. Checks, per page:
  - block counts by type (tabs included, accordion items counted recursively)
  - presence of a title
  - every referenced image/icon file actually exists on disk
  - no duplicate crawled URLs
  - no leftover '.pre-loading-icon' placeholder in the rendered raw HTML
  - no empty paragraph blocks
Prints a full report and a final PASS/FAIL summary.
"""
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path("/home/mob/sil/opus/crawl")
CONFIG = json.loads((ROOT / "scripts/pages.config.json").read_text())

problems = []
warnings = []


def collect_block_types(blocks, counter):
    for b in blocks:
        t = b.get("type", "?")
        counter[t] += 1
        if t == "accordion":
            for it in b.get("items", []):
                collect_block_types(it.get("blocks", []), counter)


def collect_image_refs(obj, refs):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("src", "logo", "icon", "image") and isinstance(v, str) and v.startswith("assets/"):
                refs.add(v)
            else:
                collect_image_refs(v, refs)
    elif isinstance(obj, list):
        for v in obj:
            collect_image_refs(v, refs)


def find_empty_paragraphs(obj, slug, where):
    if isinstance(obj, dict):
        if obj.get("type") == "paragraph":
            text = re.sub(r"<[^>]+>", "", obj.get("html", "")).strip()
            if not text:
                problems.append(f"[{slug}] empty paragraph block ({where})")
        for k, v in obj.items():
            find_empty_paragraphs(v, slug, where)
    elif isinstance(obj, list):
        for v in obj:
            find_empty_paragraphs(v, slug, where)


def main():
    seen_urls = {}
    rows = []

    for p in CONFIG:
        slug = p["slug"]
        raw_path = ROOT / "raw" / f"{slug}.html"
        content_path = ROOT / "content" / f"{slug}.json"

        if not raw_path.exists():
            problems.append(f"[{slug}] MISSING raw HTML file")
            continue
        if not content_path.exists():
            problems.append(f"[{slug}] MISSING content JSON file")
            continue

        raw_html = raw_path.read_text(encoding="utf-8")
        page = json.loads(content_path.read_text(encoding="utf-8"))

        # 1. residual pre-loading-icon
        if "pre-loading-icon" in raw_html:
            n = raw_html.count("pre-loading-icon")
            problems.append(f"[{slug}] {n} residual .pre-loading-icon left in raw HTML (tab not fully loaded)")

        # 2. duplicate URLs
        url = page["url"]
        if url in seen_urls:
            problems.append(f"[{slug}] duplicate URL with [{seen_urls[url]}]: {url}")
        else:
            seen_urls[url] = slug

        # 3. title present
        if not page.get("title"):
            problems.append(f"[{slug}] missing title")

        # 4. block type counts (recursive through accordions), tabs included
        counter = Counter()
        collect_block_types(page.get("blocks", []), counter)
        top_block_total = sum(counter.values())
        tab_counter = Counter()
        for t in page.get("tabs", []):
            collect_block_types(t.get("blocks", []), tab_counter)
        tab_block_total = sum(tab_counter.values())
        grand_total = top_block_total + tab_block_total

        # 5. empty paragraphs
        find_empty_paragraphs(page.get("blocks", []), slug, "blocks")
        for t in page.get("tabs", []):
            find_empty_paragraphs(t.get("blocks", []), slug, f"tab:{t['id']}")

        # 6. image/icon existence
        refs = set()
        collect_image_refs(page, refs)
        missing_assets = [r for r in sorted(refs) if not (ROOT / r).exists()]
        for m in missing_assets:
            problems.append(f"[{slug}] referenced asset missing on disk: {m}")

        # 7. richness threshold
        if grand_total < 3:
            warnings.append(f"[{slug}] only {grand_total} total blocks (incl. tabs) - review recommended")

        rows.append({
            "slug": slug, "title": page.get("title"),
            "blocks": top_block_total, "tabBlocks": tab_block_total,
            "total": grand_total, "numTabs": len(page.get("tabs", [])),
            "numImages": len({r for r in refs if r.startswith("assets/images/")}),
            "types": dict(counter), "tabTypes": dict(tab_counter),
        })

    # --- report ---------------------------------------------------------
    print("=" * 100)
    print(f"{'slug':40s} {'title':35s} {'blk':>4s} {'tabblk':>7s} {'tabs':>5s} {'imgs':>5s}")
    print("-" * 100)
    for r in rows:
        title = (r["title"] or "")[:33]
        print(f"{r['slug']:40s} {title:35s} {r['blocks']:4d} {r['tabBlocks']:7d} {r['numTabs']:5d} {r['numImages']:5d}")
    print("=" * 100)

    print("\nBlock type distribution (top-level, all pages combined):")
    all_types = Counter()
    all_tab_types = Counter()
    for r in rows:
        all_types.update(r["types"])
        all_tab_types.update(r["tabTypes"])
    for t, n in sorted(all_types.items(), key=lambda x: -x[1]):
        print(f"  {t:15s} {n:4d}")
    print("\nBlock type distribution (inside tabs, all pages combined):")
    for t, n in sorted(all_tab_types.items(), key=lambda x: -x[1]):
        print(f"  {t:15s} {n:4d}")

    print(f"\nTotal pages: {len(rows)}")
    print(f"Total blocks (all pages, blocks+tabs, accordions flattened): {sum(r['total'] for r in rows)}")

    if warnings:
        print(f"\n{len(warnings)} WARNING(S):")
        for w in warnings:
            print("  -", w)

    if problems:
        print(f"\n{len(problems)} PROBLEM(S):")
        for pr in problems:
            print("  -", pr)
        print("\nRESULT: FAIL")
        return 1
    else:
        print("\nRESULT: PASS (no blocking problems found)")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
