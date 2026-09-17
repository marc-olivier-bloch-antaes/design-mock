/**
 * Normalisations SYSTÉMATIQUES du contenu crawlé (DESIGN.md § 3, § 7, § 10, § 11, § 14).
 * Tout ce qui dépend du contexte d'une page précise (ex. formulaire aplati de la
 * page contact, h5 d'intro → Callout) est laissé aux composants / gabarits
 * et documenté dans MIGRATION.md.
 *
 * Liste des normalisations (chacune testable isolément) :
 *  N1  Capitales accentuées dans les libellés et textes (« Electricité » → « Électricité », « A propos » → « À propos »).
 *  N2  Titres entièrement en capitales → casse phrase (« TARIFS 2027 » → « Tarifs 2027 » ; acronymes courts conservés).
 *  N3  Titre des pages à onglets : partie avant « - » (« Electricité - Produits » → « Électricité »).
 *  N4  Niveaux de titres remappés par liste de blocs (1er niveau → h2 ; dans un accordéon → h4), `sourceLevel` conservé.
 *  N5  `alt` d'image qui n'est qu'un crédit (« © … ») → déplacé en `caption`, `alt` = "".
 *  N6  Documents : suffixe « (PDF) » / « (JSON) » / « (DOCX) » retiré, « 1 er » → « 1er », « KB/MB » → « Ko/Mo ».
 *  N7  Liens : `slug` + `tab` pour les pages crawlées (y compris URL sans .html, ?tab=, alias, et
 *      « lausanne.ch?tab=x » cassé → onglet de la page courante), `route` pour les
 *      entrées du menu non crawlées, `external` calculé partout.
 *  N8  HTML inline : liste blanche a/strong/em/br/sup/sub, attributs réduits à href, liens internes annotés
 *      `data-slug` / `data-tab` / `data-route`, <br> finaux retirés.
 *  N9  Tableaux : en-têtes tous vides → `headers: []`.
 *  N10 Bloc contact : titre répété retiré des `lines`, « Case postale … » sur sa propre ligne, ligne ne contenant
 *      que les libellés des liens du bloc (« Ecrivez-nous Tél. +41 … ») retirée.
 *  N11 Titres : « : » final retiré.
 *  N12 Teasers : doublons exacts retirés (carrousel C-FOR).
 *  N13 Vidéo : `provider` déduit du domaine (datawrapper / google-maps / youtube).
 *  N14 Images : chemins `assets/images/x.jpg` → identifiants du manifeste d'images.
 *  N16 Coquilles connues du CMS (« Mutlimédia », espace avant « ® ») ; libellé de lien tiré d'un titre SVG erroné (« facture » → titre
 *      de la page cible « Règlements », Nos activités).
 *  N15 Exposants d'unités perdus au crawl (« 1 m 3 » → « 1 m³ », « de m 2 » → « de m² », « 100m2 » → « 100m² »,
 *      « par m3 » → « par m³ »), libellés et nœuds texte HTML.
 */
import type {
  Block,
  ContactBlock,
  DocumentFormat,
  EmbedProvider,
  HeadingBlock,
  LinkTarget,
  SectionId,
} from "../../src/content/types.ts";

export const SIL_PREFIX = "/vie-pratique/energies-et-eau/services-industriels";

type Json = Record<string, unknown>;

/* ------------------------------------------------------------ N1 / N2 / N11 */

const ACCENTED_WORDS: [string, string][] = [
  ["Electricité", "Électricité"],
  ["Electrique", "Électrique"],
  ["Economies", "Économies"],
  ["Economie", "Économie"],
  ["Energies", "Énergies"],
  ["Energie", "Énergie"],
  ["Eclairage", "Éclairage"],
  ["Evénements", "Événements"],
  ["Equiwatt", "Équiwatt"],
  ["Ecrivez", "Écrivez"],
  ["Eviter", "Éviter"],
  ["Etats", "États"],
  ["Etat", "État"],
  ["Evaluation", "Évaluation"],
  ["Eglises", "Églises"],
  ["Echange", "Échange"],
  ["Evacuation", "Évacuation"],
  ["Ecogestes", "Écogestes"],
  ["Ecologique", "Écologique"],
  ["A propos", "À propos"],
  ["A télécharger", "À télécharger"],
  ["A votre écoute", "À votre écoute"],
  ["A Lausanne", "À Lausanne"],
];
/** N16 — libellés de tuiles `icon-nav` tirés du <title> d'un SVG réutilisé (« facture » sur Nos activités). */
const SVG_TITLE_LABELS: Record<string, Record<string, string>> = {
  "a-propos-reglements": { facture: "Règlements" },
};
function fixSvgTitleLabel(label: string, slug: string | undefined): string {
  return (slug && SVG_TITLE_LABELS[slug]?.[label]) ?? label;
}

/** N16 — coquilles du CMS (titres, libellés). */
const TYPOS: [string, string][] = [["Mutlimédia", "Multimédia"]];

const ACCENTED: [RegExp, string][] = ACCENTED_WORDS.map(([from, to]) => [
  new RegExp(`(?<![\\p{L}\\d/._-])${from}(?![\\p{L}])`, "gu"),
  to,
]);

/** N1 — texte brut. */
export function accentCapitals(text: string): string {
  const fixed = TYPOS.reduce((acc, [from, to]) => acc.split(from).join(to), text)
    // « CECB ® , l'étiquette » → « CECB®, l'étiquette »
    .replace(/\s+®/g, "®")
    .replace(/®\s+,/g, "®,");
  return ACCENTED.reduce((acc, [re, to]) => acc.replace(re, to), fixed);
}

/** N1 appliqué uniquement aux nœuds texte d'un fragment HTML (jamais aux attributs). */
function accentCapitalsInHtml(html: string): string {
  return html
    .split(/(<[^>]+>)/g)
    .map((part) => (part.startsWith("<") ? part : restoreUnitSuperscripts(accentCapitals(part))))
    .join("");
}

/** N2 — « TARIFS 2027 » → « Tarifs 2027 ». Les acronymes (aucun mot ≥ 5 lettres, ex. « FAQ ») sont conservés. */
export function sentenceCaseIfShouting(text: string): string {
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (!letters || letters !== letters.toUpperCase()) return text;
  if (!/\p{L}{5,}/u.test(text)) return text;
  const lower = text.toLocaleLowerCase("fr-CH");
  return lower.charAt(0).toLocaleUpperCase("fr-CH") + lower.slice(1);
}

/** N15 — exposant d'unité aplati en « m 2 » / « m 3 », borné à un nombre ou « de » qui précède. */
const SUPERSCRIPT: Record<string, string> = { "2": "²", "3": "³" };
function restoreUnitSuperscripts(text: string): string {
  return text
    .replace(
      /(\d|\bde) m ([23])\b(?!\s*[\d.,])/g,
      (_, before: string, exp: string) => `${before} m${SUPERSCRIPT[exp]}`,
    )
    .replace(
      /(\d ?|\bpar )m([23])\b(?![\d.,])/g,
      (_, before: string, exp: string) => `${before}m${SUPERSCRIPT[exp]}`,
    );
}

export function normalizeLabel(text: string): string {
  return restoreUnitSuperscripts(accentCapitals(text.replace(/\s+/g, " ").trim()));
}

/** N1 + N2 + N11 */
export function normalizeHeadingText(text: string): string {
  return sentenceCaseIfShouting(normalizeLabel(text)).replace(/\s*:\s*$/, "");
}

/* ----------------------------------------------------------------- N7 liens */

export interface LinkIndex {
  /** Route app (sans query) → slug de page crawlée. */
  pageByRoute: Map<string, string>;
  /** Route app → route d'une entrée du menu non crawlée (rubrique / hors périmètre). */
  navRoutes: Set<string>;
  /** Page en cours de normalisation : résout les liens « lausanne.ch?tab=x » cassés du CMS. */
  current?: { slug: string; tabs: string[]; tab?: string };
}

/** Chemins courts de lausanne.ch connus (redirections côté serveur). */
const SHORT_URL_ALIASES: Record<string, string> = {
  "/silcontact": "/particuliers/contact-sil",
};

/** URL lausanne.ch de la section SiL → route de l'app (sans query). null si hors section / autre domaine. */
export function routeFromUrl(url: string): { route: string; tab?: string } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!/^(www\.)?lausanne\.ch$/.test(u.hostname)) return null;
  const tab = u.searchParams.get("tab") ?? undefined;
  let p = decodeURIComponent(u.pathname)
    .replace(/\.html$/, "")
    .replace(/\/+$/, "");
  if (SHORT_URL_ALIASES[p]) p = SIL_PREFIX + SHORT_URL_ALIASES[p];
  if (p === SIL_PREFIX) return { route: "/", tab };
  if (!p.startsWith(SIL_PREFIX + "/")) return null;
  return { route: p.slice(SIL_PREFIX.length), tab };
}

export function isExternalUrl(url: string): boolean {
  if (/^(mailto|tel):/.test(url)) return false;
  try {
    return !/^(www\.)?lausanne\.ch$/.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * N7 — « https://www.lausanne.ch?tab=faq » (lien relatif mal résolu par le CMS) → onglet de la page courante ;
 * « https://www.lausanne.ch#faq » → onglet dans lequel se trouve le lien.
 */
function currentPageTab(url: string, index: LinkIndex): string | null {
  if (!index.current) return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!/^(www\.)?lausanne\.ch$/.test(u.hostname) || u.pathname.replace(/\/+$/, "") !== "")
    return null;
  const tab = u.searchParams.get("tab");
  if (tab) return index.current.tabs.includes(tab) ? tab : null;
  // « lausanne.ch#faq » dans un onglet : ancre de l'onglet courant (ex. FAQ en bas de l'onglet IPE).
  return u.hash && index.current.tab ? index.current.tab : null;
}

export function resolveTarget(url: string, index: LinkIndex): LinkTarget {
  const target: LinkTarget = { url, external: isExternalUrl(url) };
  const ownTab = currentPageTab(url, index);
  if (ownTab && index.current) return { ...target, slug: index.current.slug, tab: ownTab };
  const r = routeFromUrl(url);
  if (!r) return target;
  const slug = index.pageByRoute.get(r.route);
  if (slug) {
    target.slug = slug;
    if (r.tab) target.tab = r.tab;
  } else if (index.navRoutes.has(r.route)) {
    target.route = r.route;
  }
  return target;
}

/* ------------------------------------------------------------ N8 HTML inline */

const ALLOWED_TAGS = new Set(["a", "strong", "em", "br", "sup", "sub"]);

export function normalizeInlineHtml(html: string, index: LinkIndex): string {
  let out = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (tag, rawName: string, attrs: string) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (tag.startsWith("</")) return `</${name}>`;
    if (name !== "a") return `<${name}>`;
    const href = /href\s*=\s*"([^"]*)"/i.exec(attrs)?.[1]?.trim() ?? "";
    if (!href || /^\s*javascript:/i.test(href)) return "<a>";
    const t = resolveTarget(href.replace(/&amp;/g, "&"), index);
    const data = [
      t.slug ? ` data-slug="${t.slug}"` : "",
      t.tab ? ` data-tab="${t.tab}"` : "",
      t.route ? ` data-route="${t.route}"` : "",
    ].join("");
    return `<a href="${href}"${data}>`;
  });
  out = out.replace(/(\s*<br>\s*)+$/g, "").trim();
  return accentCapitalsInHtml(out);
}

/* --------------------------------------------------------------- N14 images */

export type ImageIdResolver = (assetPath: string) => string;

/* ------------------------------------------------------------ Blocs (récursif) */

export interface NormalizeContext {
  index: LinkIndex;
  imageId: ImageIdResolver;
}

const CREDIT_RE = /^\s*©/;

function splitCredit(alt: string, caption: string | null): { alt: string; caption: string | null } {
  if (CREDIT_RE.test(alt)) return { alt: "", caption: caption ?? alt.trim() };
  return { alt: alt.trim(), caption };
}

function embedProvider(url: string): EmbedProvider {
  if (/datawrapper\.dwcdn\.net/.test(url)) return "datawrapper";
  if (/google\.[a-z.]+\/maps/.test(url)) return "google-maps";
  if (/youtube(-nocookie)?\.com|youtu\.be/.test(url)) return "youtube";
  return "other";
}

function normalizeDocumentLabel(label: string, format: string): string {
  const cleaned = label.replace(new RegExp(`\\s*\\(${format}\\)\\s*$`, "i"), "");
  return normalizeLabel(cleaned);
}

function normalizeFrenchDate(date: string | null): string | null {
  if (!date) return null;
  return date
    .replace(/\b1\s+er\b/g, "1er")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSize(size: string | null): string | null {
  if (!size) return null;
  return size
    .replace(/\bKB\b/i, "Ko")
    .replace(/\bMB\b/i, "Mo")
    .trim();
}

function normalizeContactLines(title: string, lines: string[], linkLabels: string[]): string[] {
  const out = lines.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (out[0] === title) out.shift();
  // Libellés des liens du bloc aplatis en une ligne de texte (« Ecrivez-nous Tél. +41 21 315 82 82 ») :
  // déjà rendus en bouton / ligne téléphone → retirés.
  const isFlattenedLinks = (line: string) =>
    linkLabels
      .filter(Boolean)
      .reduce((rest, label) => rest.split(label).join(" "), line)
      .replace(/\bT[ée]l\.?/g, "")
      .trim() === "";
  return out
    .filter((line) => !isFlattenedLinks(line))
    .flatMap((line) => line.split(/\s+(?=Case postale\b)/));
}

/** N4 : remappe les niveaux d'une liste de blocs (pas récursif : les accordéons ont leur propre base). */
function remapHeadingLevels(blocks: Json[], base: 2 | 4): Map<number, HeadingBlock["level"]> {
  const levels = [
    ...new Set(blocks.filter((b) => b.type === "heading").map((b) => Number(b.level))),
  ].sort((a, b) => a - b);
  return new Map(levels.map((lvl, i) => [lvl, Math.min(6, base + i) as HeadingBlock["level"]]));
}

export function normalizeBlocks(raw: Json[], ctx: NormalizeContext, base: 2 | 4 = 2): Block[] {
  const levelMap = remapHeadingLevels(raw, base);
  return raw.map((b) => normalizeBlock(b, ctx, levelMap));
}

function normalizeBlock(
  b: Json,
  ctx: NormalizeContext,
  levelMap: Map<number, HeadingBlock["level"]>,
): Block {
  const { index, imageId } = ctx;
  const html = (s: unknown) => normalizeInlineHtml(String(s), index);
  const items = (b.items ?? []) as Json[];

  switch (b.type) {
    case "heading": {
      const sourceLevel = Number(b.level) as HeadingBlock["sourceLevel"];
      return {
        type: "heading",
        level: levelMap.get(sourceLevel) ?? 2,
        sourceLevel,
        text: normalizeHeadingText(String(b.text)),
      };
    }
    case "paragraph":
      return { type: "paragraph", html: html(b.html) };
    case "list":
      return { type: "list", ordered: Boolean(b.ordered), items: items.map((i) => html(i)) };
    case "image":
      return {
        type: "image",
        src: imageId(String(b.src)),
        ...splitCredit(String(b.alt), (b.caption as string | null) ?? null),
      };
    case "gallery":
      return {
        type: "gallery",
        title: (b.title as string | null) ?? null,
        items: items.map((i) => ({
          src: imageId(String(i.src)),
          ...splitCredit(String(i.alt), (i.caption as string | null) || null),
        })),
      };
    case "teasers": {
      const seen = new Set<string>();
      return {
        type: "teasers",
        title: (b.title as string | null) ?? null,
        variant: b.variant as "grid" | "carousel" | "accroche",
        items: items
          .filter((i) => {
            const key = JSON.stringify(i);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((i) => ({
            ...resolveTarget(String(i.url), index),
            title: normalizeLabel(String(i.title)),
            text: html(i.text),
            image: imageId(String(i.image)),
          })),
      };
    }
    case "links":
      return {
        type: "links",
        title: b.title ? normalizeHeadingText(String(b.title)) : null,
        variant: (b.variant as "icon-nav" | "news" | undefined) ?? null,
        items: items.map((i) => {
          const target = resolveTarget(String(i.url), index);
          const label = normalizeLabel(String(i.label));
          return { ...target, label: fixSvgTitleLabel(label, target.slug) };
        }),
      };
    case "documents":
      return {
        type: "documents",
        title: (b.title as string | null) ?? null,
        items: items.map((i) => ({
          label: normalizeDocumentLabel(String(i.label), String(i.format)),
          url: String(i.url),
          format: String(i.format) as DocumentFormat,
          size: normalizeSize(i.size as string | null),
          date: normalizeFrenchDate(i.date as string | null),
        })),
      };
    case "accordion":
      return {
        type: "accordion",
        items: items.map((i) => ({
          title: normalizeHeadingText(String(i.title)),
          blocks: normalizeBlocks(i.blocks as Json[], ctx, 4),
        })),
      };
    case "table": {
      const headers = (b.headers as string[]).map((h) => html(h));
      return {
        type: "table",
        headers: headers.every((h) => h === "") ? [] : headers,
        rows: (b.rows as string[][]).map((row) => row.map((c) => html(c))),
      };
    }
    case "contact": {
      const title = normalizeLabel(String(b.title));
      const block: ContactBlock = {
        type: "contact",
        title,
        lines: normalizeContactLines(
          String(b.title),
          b.lines as string[],
          (b.links as Json[]).map((l) => String(l.label)),
        ),
        logo: imageId(String(b.logo)),
        links: (b.links as Json[]).map((l) => ({
          ...resolveTarget(String(l.url), index),
          label: normalizeLabel(String(l.label)),
        })),
      };
      return block;
    }
    case "keyfigures":
      return {
        type: "keyfigures",
        title: normalizeLabel(String(b.title)),
        items: items.map((i) => ({
          value: String(i.value).trim(),
          label: normalizeLabel(String(i.label)),
        })),
      };
    case "cta":
      return {
        type: "cta",
        ...resolveTarget(String(b.url), index),
        label: normalizeLabel(String(b.label)),
      };
    case "video":
      return { type: "video", url: String(b.url), provider: embedProvider(String(b.url)) };
    default:
      throw new Error(`Type de bloc non géré par le normaliseur : ${String(b.type)}`);
  }
}

/* ------------------------------------------------------------------- Pages */

/** N3 */
export function pageTitle(rawTitle: string, hasTabs: boolean): string {
  const t = normalizeLabel(rawTitle);
  if (!hasTabs) return t;
  return t.split(/\s+-\s+/)[0] ?? t;
}

export const SECTION_BY_ROOT_PATH: Record<string, SectionId> = {
  "/particuliers": "particuliers",
  "/professionnels": "professionnels",
  "/partenaires": "partenaires",
  "/a-propos-sil": "a-propos",
  "/carrieres": "carrieres",
};
