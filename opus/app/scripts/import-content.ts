/**
 * npm run import-content
 *
 * Copie et normalise le crawl (../crawl) et les ressources du design (../design)
 * dans l'app. Le résultat est versionnable : l'app ne lit plus jamais ../crawl
 * à l'exécution. Idempotent et incrémental (images déjà optimisées conservées).
 *
 * Étapes :
 *  1. Audit du crawl contre le contrat de types (échec si type/champ inconnu).
 *  2. Index des routes (pages crawlées, alias, entrées du menu non crawlées).
 *  3. Normalisation des pages → src/content/pages/<slug>.json + manifest.json.
 *  4. Navigation normalisée → src/content/navigation.json.
 *  5. Images référencées → public/images/*.avif|webp + src/content/images.json.
 *  6. Design : tokens.css + polices → src/styles/, logos → src/assets/brand/, favicon → public/.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  Block,
  BlockType,
  ImageManifest,
  Navigation,
  NavNode,
  Page,
  PageSummary,
  SectionId,
} from "../src/content/types.ts";
import { auditCrawl, readCrawlPages } from "./lib/audit.ts";
import { imageIdFromAsset, mapLimit, processImage } from "./lib/images.ts";
import {
  normalizeBlocks,
  normalizeInlineHtml,
  normalizeLabel,
  pageTitle,
  resolveTarget,
  routeFromUrl,
  SECTION_BY_ROOT_PATH,
  type LinkIndex,
  type NormalizeContext,
} from "./lib/normalize.ts";
import { CRAWL_DIR, DESIGN_DIR, OUT } from "./lib/paths.ts";

type Json = Record<string, unknown>;

const log = (msg: string) => console.log(`[import-content] ${msg}`);

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function copy(src: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

async function main() {
  /* 1. Audit --------------------------------------------------------------- */
  const { problems } = auditCrawl();
  if (problems.length) {
    console.error(problems.join("\n"));
    throw new Error(
      `${problems.length} écart(s) entre le crawl et le contrat : lancer « npm run audit-content ».`,
    );
  }
  log("audit du crawl : conforme au contrat");

  const rawPages = readCrawlPages();
  const rawManifest = JSON.parse(
    fs.readFileSync(path.join(CRAWL_DIR, "pages.json"), "utf8"),
  ) as Json[];
  const rawNav = JSON.parse(fs.readFileSync(path.join(CRAWL_DIR, "navigation.json"), "utf8")) as {
    mainMenu: Json[];
  };

  /* 2. Index des routes ------------------------------------------------------ */
  const pageByRoute = new Map<string, string>();
  const pathBySlug = new Map<string, string>();
  for (const p of rawPages) {
    pageByRoute.set(String(p.path), String(p.slug));
    pathBySlug.set(String(p.slug), String(p.path));
  }

  const redirects: Navigation["redirects"] = [];
  const navRoutes = new Set<string>();
  const walkRaw = (nodes: Json[]) => {
    for (const n of nodes) {
      const r = routeFromUrl(String(n.url));
      if (!r) throw new Error(`Entrée de menu hors section SiL : ${String(n.url)}`);
      if (n.slug) {
        const canonical = pathBySlug.get(String(n.slug))!;
        if (r.route !== canonical) {
          redirects.push({ from: r.route, to: canonical });
          pageByRoute.set(r.route, String(n.slug)); // alias → même page
        }
      } else if (!pageByRoute.has(r.route)) {
        navRoutes.add(r.route);
      }
      walkRaw((n.children as Json[] | undefined) ?? []);
    }
  };
  walkRaw(rawNav.mainMenu);
  const index: LinkIndex = { pageByRoute, navRoutes };

  /* 3. Pages ---------------------------------------------------------------- */
  const imageRefs = new Map<string, string>(); // id → chemin crawl
  const imageId = (assetPath: string) => {
    const id = imageIdFromAsset(assetPath);
    const known = imageRefs.get(id);
    if (known && known !== assetPath) throw new Error(`Collision d'identifiant d'image : ${id}`);
    imageRefs.set(id, assetPath);
    return id;
  };
  const ctx: NormalizeContext = { index, imageId };

  fs.rmSync(OUT.pages, { recursive: true, force: true });
  const summaries: PageSummary[] = [];

  for (const raw of rawPages) {
    const tabsRaw = raw.tabs as Json[];
    const pageIndex: LinkIndex = {
      ...index,
      current: { slug: String(raw.slug), tabs: tabsRaw.map((t) => String(t.id)) },
    };
    const pageCtx: NormalizeContext = { ...ctx, index: pageIndex };
    const leadRaw = String(raw.lead ?? "").trim();
    const page: Page = {
      slug: String(raw.slug),
      url: String(raw.url),
      path: String(raw.path),
      title: pageTitle(String(raw.title), tabsRaw.length > 0),
      sourceTitle: String(raw.title),
      section: raw.section as SectionId,
      breadcrumb: (raw.breadcrumb as Json[]).map((c, i) => ({
        ...resolveTarget(String(c.url), index),
        // Premier élément renommé « Accueil » (DESIGN.md § 11.4)
        label: i === 0 ? "Accueil" : normalizeLabel(String(c.label)),
      })),
      lead: leadRaw ? normalizeInlineHtml(leadRaw, pageIndex) : null,
      heroImage: raw.heroImage ? imageId(String(raw.heroImage)) : null,
      cta: (raw.cta as Json[]).map((c) => ({
        ...resolveTarget(String(c.url), index),
        label: normalizeLabel(String(c.label)),
      })),
      tabs: tabsRaw.map((t) => ({
        id: String(t.id),
        label: normalizeLabel(String(t.label)),
        blocks: normalizeBlocks(t.blocks as Json[], {
          ...pageCtx,
          index: { ...pageIndex, current: { ...pageIndex.current!, tab: String(t.id) } },
        }),
      })),
      blocks: normalizeBlocks(raw.blocks as Json[], pageCtx),
    };
    // Dernier élément du fil d'Ariane = titre normalisé de la page
    const last = page.breadcrumb[page.breadcrumb.length - 1];
    if (last && last.slug === page.slug) last.label = page.title;

    writeJson(path.join(OUT.pages, `${page.slug}.json`), page);

    const m = rawManifest.find((e) => e.slug === page.slug);
    summaries.push({
      slug: page.slug,
      path: page.path,
      url: page.url,
      title: page.title,
      sourceTitle: page.sourceTitle,
      section: page.section,
      parentSlug: (m?.parentSlug as string | null | undefined) ?? null,
      hasHeroImage: page.heroImage !== null,
      tabs: page.tabs.map(({ id, label }) => ({ id, label })),
      blockTypes: collectBlockTypes([...page.blocks, ...page.tabs.flatMap((t) => t.blocks)]),
    });
  }
  // Ordre du manifeste d'origine (accueil d'abord, puis par rubrique)
  const order = rawManifest.map((e) => String(e.slug));
  summaries.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
  writeJson(path.join(OUT.content, "manifest.json"), summaries);
  log(`${summaries.length} pages normalisées → src/content/pages/`);

  /* 4. Navigation ----------------------------------------------------------- */
  const toNode = (n: Json, depth: number): NavNode => {
    const r = routeFromUrl(String(n.url))!;
    const slug = n.slug ? String(n.slug) : undefined;
    const nodePath = slug ? pathBySlug.get(slug)! : r.route;
    const node: NavNode = {
      id: r.route.replace(/^\//, "").replace(/\//g, "--") || "accueil",
      label: normalizeLabel(String(n.label)),
      url: String(n.url),
      path: nodePath,
      kind: slug ? "page" : depth === 0 ? "rubrique" : "out-of-scope",
      children: ((n.children as Json[] | undefined) ?? []).map((c) => toNode(c, depth + 1)),
    };
    if (slug) node.slug = slug;
    if (depth === 0) node.section = SECTION_BY_ROOT_PATH[r.route];
    if (/\/(mon-compte|compte-pro)(\/|$)/.test(r.route)) node.requiresLogin = true;
    return node;
  };
  const navigation: Navigation = {
    mainMenu: rawNav.mainMenu.map((n) => toNode(n, 0)),
    redirects,
  };
  assertUniqueRoutes(navigation, summaries);
  writeJson(path.join(OUT.content, "navigation.json"), navigation);
  log(
    `navigation : ${navRoutes.size} entrées hors périmètre / rubriques, ${redirects.length} alias`,
  );

  /* 5. Images --------------------------------------------------------------- */
  fs.mkdirSync(OUT.publicImages, { recursive: true });
  const entries = [...imageRefs.entries()].sort(([a], [b]) => a.localeCompare(b));
  const concurrency = Math.max(2, Math.min(6, os.cpus().length));
  let done = 0;
  const assets = await mapLimit(entries, concurrency, async ([id, assetPath]) => {
    const src = path.join(CRAWL_DIR, assetPath);
    if (!fs.existsSync(src)) throw new Error(`Image manquante dans le crawl : ${assetPath}`);
    const asset = await processImage(src, id, OUT.publicImages);
    done++;
    if (done % 20 === 0) log(`images : ${done}/${entries.length}`);
    return [id, asset] as const;
  });
  const manifest: ImageManifest = Object.fromEntries(assets);
  writeJson(path.join(OUT.content, "images.json"), manifest);
  // Nettoyage des variantes orphelines (image retirée du crawl)
  const keep = new Set(
    Object.values(manifest).flatMap((a) =>
      [a.fallback, ...(a.avif ?? []), ...(a.webp ?? [])].map((s) =>
        path.basename(typeof s === "string" ? s : s.src),
      ),
    ),
  );
  for (const f of fs.readdirSync(OUT.publicImages))
    if (!keep.has(f)) fs.rmSync(path.join(OUT.publicImages, f));
  log(`${entries.length} images optimisées → public/images/ (AVIF + WebP, ≤ 1920 px)`);

  /* 6. Design & marque ------------------------------------------------------ */
  copy(path.join(DESIGN_DIR, "tokens.css"), path.join(OUT.styles, "tokens.css"));
  for (const f of fs.readdirSync(path.join(DESIGN_DIR, "fonts"))) {
    copy(path.join(DESIGN_DIR, "fonts", f), path.join(OUT.fonts, f));
  }
  for (const f of ["logo-sil-positif.svg", "logo-sil-negatif.svg", "logo-sil-monochrome.svg"]) {
    copy(path.join(DESIGN_DIR, "assets", f), path.join(OUT.brand, f));
  }
  copy(
    path.join(CRAWL_DIR, "assets/brand/ecusson-lausanne.svg"),
    path.join(OUT.brand, "ecusson-lausanne.svg"),
  );
  copy(path.join(CRAWL_DIR, "assets/brand/favicon.png"), path.join(OUT.public, "favicon.png"));
  log("tokens, polices, logos et favicon copiés");
}

function collectBlockTypes(blocks: Block[]): BlockType[] {
  const types = new Set<BlockType>();
  const visit = (list: Block[]) => {
    for (const b of list) {
      types.add(b.type);
      if (b.type === "accordion") b.items.forEach((i) => visit(i.blocks));
    }
  };
  visit(blocks);
  return [...types].sort();
}

function assertUniqueRoutes(nav: Navigation, pages: PageSummary[]) {
  const owner = new Map<string, string>();
  for (const p of pages) owner.set(p.path, `page:${p.slug}`);
  const visit = (nodes: NavNode[]) => {
    for (const n of nodes) {
      if (n.kind !== "page") {
        const prev = owner.get(n.path);
        if (prev && prev !== `nav:${n.id}`)
          throw new Error(`Route en double : ${n.path} (${prev} / ${n.id})`);
        owner.set(n.path, `nav:${n.id}`);
      }
      visit(n.children);
    }
  };
  visit(nav.mainMenu);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
