import fs from "node:fs";
import path from "node:path";
import { checkBlockAgainstContract, BLOCK_CONTRACT } from "./crawl-contract.ts";
import { ShapeRecorder } from "./infer-shape.ts";
import { CRAWL_DIR } from "./paths.ts";

type Json = Record<string, unknown>;

export function readCrawlPages(): Json[] {
  const dir = path.join(CRAWL_DIR, "content");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Json);
}

export function auditCrawl() {
  const recorder = new ShapeRecorder();
  const problems: string[] = [];
  const byType: Record<string, number> = {};

  const visitBlock = (b: Json, where: string) => {
    const type = String(b.type);
    byType[type] = (byType[type] ?? 0) + 1;
    const variant = "variant" in b ? `[${String(b.variant)}]` : "";
    recorder.record(`block:${type}`, b);
    problems.push(...checkBlockAgainstContract(b).map((p) => `${where}: ${p}`));
    if (!(type in BLOCK_CONTRACT)) return;
    const items = b.items;
    if (Array.isArray(items)) {
      items.forEach((it, i) => {
        if (it && typeof it === "object") {
          recorder.record(`item:${type}${variant}`, it as Json);
          if (type === "accordion") {
            ((it as Json).blocks as Json[]).forEach((child, j) =>
              visitBlock(child, `${where}.items[${i}].blocks[${j}]`),
            );
          }
        }
      });
    }
    if (type === "contact" && Array.isArray(b.links)) {
      (b.links as Json[]).forEach((l) => recorder.record("item:contact.links", l));
    }
  };

  for (const page of readCrawlPages()) {
    const slug = String(page.slug);
    recorder.record("page", page);
    (page.breadcrumb as Json[]).forEach((c) => recorder.record("page.breadcrumb", c));
    (page.cta as Json[]).forEach((c) => recorder.record("page.cta", c));
    (page.blocks as Json[]).forEach((b, i) => visitBlock(b, `${slug}.blocks[${i}]`));
    (page.tabs as Json[]).forEach((t) => {
      recorder.record("page.tab", t);
      (t.blocks as Json[]).forEach((b, i) => visitBlock(b, `${slug}.tabs.${String(t.id)}[${i}]`));
    });
  }

  return { recorder, problems, stats: { byType } };
}
