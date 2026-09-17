import type { ReactNode } from "react";
import { BlockRenderer } from "@/blocks/BlockRenderer";
import { AccordionList } from "@/blocks/components/Accordion";
import { TeaserCard } from "@/blocks/components/BlockTeasers";
import type { BlockRegion } from "@/blocks/types";
import { ArrowLink, Heading, ResponsiveImage, RichText } from "@/components/ui";
import { images } from "@/content";
import type { AccordionItem, Block, SectionId, TeaserItem } from "@/content/types";
import { extractSingleLink } from "@/lib/extractLinks";
import { slugify } from "@/lib/slugify";
import { isColonItem } from "@/lib/steps";
import { extractUsefulLinks, type UsefulLinkGroup } from "@/lib/usefulLinks";
import { Callout } from "./Callout";
import { ConseilCard } from "./ConseilCard";
import { FaqGroup } from "./FaqGroup";
import { FeatureGrid, type Feature } from "./FeatureGrid";
import { MediaRow } from "./MediaRow";
import { Steps } from "./Steps";

/** Ligne « <strong>N</strong> | texte » d'une légende de schéma aplatie en tableaux 2 colonnes sans en-têtes. */
const isLegendRow = (row: string[]) =>
  row.length === 2 && /^<strong>\d+<\/strong>$/.test(row[0]!.trim());

export interface EnhanceContext {
  pageSlug: string;
  section: SectionId;
  tabId?: string;
  /** Région de rendu des blocs non transformés (`tab` pour un onglet, `main` sinon). */
  region: "tab" | "main";
}

export interface EnhanceResult {
  nodes: ReactNode[];
  faqGroups: { id: string; label: string; count: number }[];
  usefulLinks: UsefulLinkGroup[];
}

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Panneau d'accordéon : conteneur `block-flow` (espacement entre paragraphes, listes, tableaux) ;
// ailleurs le parent (MediaRow…) gère la mise en page.
const renderBlocksIn = (ctx: EnhanceContext) => (blocks: Block[], region: BlockRegion) => (
  <BlockRenderer
    blocks={blocks}
    pageSlug={ctx.pageSlug}
    section={ctx.section}
    tabId={ctx.tabId}
    region={region}
    bare={region !== "accordion"}
  />
);

/** Encart « Obtenez rapidement vos plans de réseaux… » (fin de chaque onglet de Raccordements). */
const isPlansPromo = (b: Block | undefined, next: Block | undefined) =>
  b?.type === "heading" && /obtenez.*plans/i.test(b.text) && next?.type === "paragraph";

/**
 * Niveaux de titres continus : si le 1er niveau d'un onglet est h3 (ex. Raccordements, où seul l'encart
 * « plans » était en h2), tous les titres de premier niveau remontent d'autant. L'encart est ignoré.
 */
function liftHeadingLevels(blocks: Block[]): Block[] {
  const levels = blocks
    .filter((b, i) => b.type === "heading" && !isPlansPromo(b, blocks[i + 1]))
    .map((b) => (b as Extract<Block, { type: "heading" }>).level);
  const shift = levels.length > 0 ? Math.min(...levels) - 2 : 0;
  if (shift <= 0) return blocks;
  return blocks.map((b) =>
    b.type === "heading"
      ? {
          ...b,
          level: Math.max(2, b.level - shift) as Extract<Block, { type: "heading" }>["level"],
        }
      : b,
  );
}

/** Pictogramme : image source ≤ 160 px de côté (les photos du crawl font ≥ 224 px). */
const isPicto = (b: Block | undefined): b is Extract<Block, { type: "image" }> =>
  b?.type === "image" &&
  (images[b.src]?.width ?? 999) <= 160 &&
  (images[b.src]?.height ?? 999) <= 160;

/** Ancre des titres h2 (cible du sommaire des pages de contenu), comme `BlockHeading`. */
const anchorId = (h: Extract<Block, { type: "heading" }>) =>
  h.level === 2 ? slugify(h.text) : undefined;

/** Paragraphe entièrement en gras (pseudo-titre du CMS), texte renvoyé sans balises ou null. */
const strongOnlyText = (b: Block | undefined): string | null =>
  b?.type === "paragraph"
    ? (/^\s*<strong>([^<]*)<\/strong>\s*$/.exec(b.html)?.[1]?.trim() ?? null)
    : null;

/** Offre « image + titre + paragraphe(s) + cta » à partir de `start`, ou null. */
function readOffer(
  blocks: Block[],
  from: number,
): { item: TeaserItem; eyebrow?: string; end: number } | null {
  // Titre de catégorie facultatif avant l'image (« Offres Combo », Multimédia) → surtitre de la carte.
  const lead = blocks[from];
  const hasEyebrow =
    lead?.type === "heading" &&
    blocks[from + 1]?.type === "image" &&
    blocks[from + 2]?.type === "heading";
  const start = hasEyebrow ? from + 1 : from;
  const [img, head] = [blocks[start], blocks[start + 1]];
  if (img?.type !== "image" || head?.type !== "heading") return null;
  let j = start + 2;
  const html: string[] = [];
  while (blocks[j]?.type === "paragraph") {
    html.push((blocks[j] as Extract<Block, { type: "paragraph" }>).html);
    j++;
  }
  const cta = blocks[j];
  if (html.length === 0 || cta?.type !== "cta") return null;
  const target = {
    url: cta.url,
    external: cta.external,
    slug: cta.slug,
    tab: cta.tab,
    route: cta.route,
  };
  return {
    item: { ...target, title: head.text, text: html.join(" "), image: img.src },
    eyebrow: hasEyebrow ? (lead as Extract<Block, { type: "heading" }>).text : undefined,
    end: j + 1,
  };
}

/**
 * Passe d'enrichissement générique appliquée au contenu d'un onglet / d'une page produit
 * (DESIGN.md § 12.3, MIGRATION.md fiches 1–8) : transforme des SUITES de blocs bruts en composants
 * dédiés, sans jamais éditer le JSON. Retire aussi les groupes « Liens utiles » du flux principal.
 *
 * Règles (toutes bornées à des motifs explicitement documentés dans MIGRATION.md, sûres à appliquer
 * uniformément à toutes les pages produit) :
 *  1. 1er bloc = heading de niveau source 5 (h5 d'intro), sauf s'il est immédiatement suivi d'un
 *     accordéon (1er groupe FAQ, cf. règle 6) → `Callout brand`.
 *  2. heading « Validité » + paragraphes suivants → `Callout info`.
 *  3. heading « Marche à suivre » + liste suivante → titre + `Steps` (1 colonne).
 *  4. accordéon à un seul item « Archives… » → accordéon `compact`.
 *  5. accordéon à un seul item « Glossaire » → accordéon `compact`.
 *  6. heading directement suivi d'un accordéon → `FaqGroup` (titre + compteur), collecté pour l'aside
 *     « Thèmes » (fonctionne aussi bien pour la mini-FAQ d'un onglet Tarifs que pour les 7 groupes de
 *     l'onglet FAQ).
 *  7. accordéon seul (FAQ courte, glossaire déjà exclu) → 1er item ouvert si ≤ 5 questions.
 *  8. liste non ordonnée de 2 à 6 items « Libellé : texte » → `Steps` (2 colonnes).
 *  9. image + heading (dans un ordre ou l'autre) puis au moins un paragraph → `MediaRow` (bornée : n'absorbe
 *     que les paragraphes qui suivent immédiatement, s'arrête à la prochaine liste/titre/image).
 * 11. ≥ 2 offres consécutives « image + heading + paragraphe(s) + cta » → grille de `TeaserCard`.
 * 12. heading suivi de ≥ 3 couples « pictogramme (≤ 160 px) + paragraphe » → titre + `FeatureGrid`.
 * 13. heading de niveau source 5 immédiatement suivi d'un seul `cta` → `ConseilCard`.
 * 14. heading « Questions fréquentes » + groupes « heading plus profond + blocs » → accordéon (1er ouvert),
 *     suivi éventuel d'un paragraphe-lien (« Plus de FAQ… ») → `ArrowLink`.
 * 16. paragraphe court entièrement en gras terminé par « ? » suivi d'un paragraphe → vrai titre h2 ; la
 *     règle 9 s'arrête aussi sur ces pseudo-titres.
 * 17. titre + accordéon dont la majorité des items ne sont pas des questions → titre + accordéon simple
 *     (pas de FaqGroup) ; « Obtenez rapidement vos plans… » + paragraphe → `ConseilCard` ; niveaux de
 *     titres remontés si l'onglet commence en h3 (`liftHeadingLevels`).
 * 18. image + heading + liste → en-tête de section à vignette 80 px ; la règle 9 absorbe un `cta` final ; la
 *     règle 11 accepte un titre de catégorie avant l'image (surtitre de carte, Multimédia).
 * 15. paragraphe annonçant un « schéma » immédiatement suivi d'une image → figure `contain` (jamais recadrée).
 * 10. liste → cta → liste non ordonnée : la 2e liste est une grille d'illustrations aplatie au crawl
 *     (SVG perdus, ex. onglet Gaz-solaire) → `Steps` (1 colonne) pour ne pas prolonger la 1re liste.
 */
export function enhanceBlocks(rawBlocks: Block[], ctx: EnhanceContext): EnhanceResult {
  const { groups: usefulLinks, rest } = extractUsefulLinks(rawBlocks);
  const blocks = liftHeadingLevels(rest);
  const render = renderBlocksIn(ctx);

  // Onglet Sécurité : paragraphes-liens OIBT / ESTI en fin d'onglet, sans heading groupeur →
  // aside « Bases légales » (MIGRATION.md fiche 1, réutilisé par les autres pages électricité/gaz).
  if (ctx.tabId === "securite") {
    const legal: (typeof usefulLinks)[number]["items"] = [];
    while (blocks.length > 0) {
      const last = blocks[blocks.length - 1]!;
      if (last.type !== "paragraph") break;
      const link = extractSingleLink(last.html);
      if (!link) break;
      legal.unshift(link);
      blocks.pop();
    }
    if (legal.length > 0) usefulLinks.push({ title: "Bases légales", items: legal });
  }
  const nodes: ReactNode[] = [];
  const faqGroups: EnhanceResult["faqGroups"] = [];
  let i = 0;

  while (i < blocks.length) {
    const b = blocks[i]!;

    // Exclut le cas où le heading initial est en fait le 1er groupe FAQ (heading + accordéon
    // immédiat, ex. onglet FAQ de particuliers-gaz-naturel) : traité par la règle FaqGroup ci-dessous.
    if (
      i === 0 &&
      b.type === "heading" &&
      b.sourceLevel === 5 &&
      blocks[i + 1]?.type !== "accordion"
    ) {
      nodes.push(
        <Callout key={i} variant="brand">
          {b.text}
        </Callout>,
      );
      i++;
      continue;
    }

    if (b.type === "heading" && normalize(b.text) === "validite") {
      let j = i + 1;
      const html: string[] = [];
      while (j < blocks.length && blocks[j]!.type === "paragraph") {
        html.push((blocks[j] as Extract<Block, { type: "paragraph" }>).html);
        j++;
      }
      nodes.push(<Callout key={i} variant="info" html={html.join(" ")} />);
      i = j;
      continue;
    }

    if (
      b.type === "heading" &&
      /marche\s*a\s*suivre/.test(normalize(b.text)) &&
      blocks[i + 1]?.type === "list"
    ) {
      const list = blocks[i + 1] as Extract<Block, { type: "list" }>;
      nodes.push(
        <Heading key={`${i}-h`} level={b.level} id={anchorId(b)} className="max-w-(--sil-measure)">
          {b.text}
        </Heading>,
      );
      nodes.push(<Steps key={`${i}-s`} items={list.items} columns={1} />);
      i += 2;
      continue;
    }

    // Onglet Raccordement (électricité) : image 16:9 en tête de colonne (DESIGN.md § 12.3), pas 3:2.
    if (b.type === "image" && ctx.tabId === "raccordement") {
      nodes.push(
        <figure key={i} className="max-w-(--sil-container-prose)">
          <ResponsiveImage
            src={b.src}
            alt={b.alt}
            sizes="(min-width: 64rem) 45rem, 100vw"
            className="aspect-video rounded-lg"
          />
          {b.caption && <figcaption className="mt-2.5 text-sm text-muted">{b.caption}</figcaption>}
        </figure>,
      );
      i++;
      continue;
    }

    if (b.type === "accordion" && b.items.length === 1 && /^archives/i.test(b.items[0]!.title)) {
      nodes.push(<AccordionList key={i} items={b.items} variant="compact" renderBlocks={render} />);
      i++;
      continue;
    }

    if (isPlansPromo(b, blocks[i + 1])) {
      const body = blocks[i + 1] as Extract<Block, { type: "paragraph" }>;
      nodes.push(
        <ConseilCard
          key={i}
          title={(b as Extract<Block, { type: "heading" }>).text}
          level={(b as Extract<Block, { type: "heading" }>).level}
          html={body.html}
        />,
      );
      i += 2;
      continue;
    }

    // Titre + accordéon dont les items ne sont PAS des questions (ex. grilles tarifaires de
    // Raccordements) : simple titre + accordéon, sans compteur « N questions » ni entrée « Thèmes ».
    if (
      b.type === "heading" &&
      blocks[i + 1]?.type === "accordion" &&
      (blocks[i + 1] as Extract<Block, { type: "accordion" }>).items.filter((it) =>
        it.title.trim().endsWith("?"),
      ).length *
        2 <
        (blocks[i + 1] as Extract<Block, { type: "accordion" }>).items.length
    ) {
      const acc = blocks[i + 1] as Extract<Block, { type: "accordion" }>;
      nodes.push(
        <Heading key={`${i}-h`} level={b.level} id={anchorId(b)} className="max-w-(--sil-measure)">
          {b.text}
        </Heading>,
      );
      nodes.push(
        <AccordionList
          key={`${i}-a`}
          items={acc.items}
          defaultOpenIndex={acc.items.length <= 5 ? 0 : null}
          renderBlocks={render}
        />,
      );
      i += 2;
      continue;
    }

    if (b.type === "heading" && blocks[i + 1]?.type === "accordion") {
      const acc = blocks[i + 1] as Extract<Block, { type: "accordion" }>;
      const id = slugify(b.text);
      faqGroups.push({ id, label: b.text, count: acc.items.length });
      nodes.push(
        <FaqGroup
          key={i}
          id={id}
          title={b.text}
          items={acc.items}
          pageSlug={ctx.pageSlug}
          section={ctx.section}
          tabId={ctx.tabId}
        />,
      );
      i += 2;
      continue;
    }

    if (b.type === "accordion") {
      const compact = b.items.length === 1 && /glossaire/i.test(b.items[0]!.title);
      nodes.push(
        <AccordionList
          key={i}
          items={b.items}
          variant={compact ? "compact" : "default"}
          defaultOpenIndex={!compact && b.items.length <= 5 ? 0 : null}
          renderBlocks={render}
        />,
      );
      i++;
      continue;
    }

    if (
      b.type === "list" &&
      !b.ordered &&
      b.items.length >= 2 &&
      b.items.length <= 6 &&
      b.items.every(isColonItem)
    ) {
      nodes.push(<Steps key={i} items={b.items} columns={2} />);
      i++;
      continue;
    }

    const firstOffer = readOffer(blocks, i);
    const secondOffer = firstOffer && readOffer(blocks, firstOffer.end);
    if (firstOffer && secondOffer) {
      const offers = [firstOffer];
      let j = firstOffer.end;
      for (let o = readOffer(blocks, j); o; o = readOffer(blocks, j)) {
        offers.push(o);
        j = o.end;
      }
      nodes.push(
        <ul key={i} role="list" className="grid gap-4 sm:grid-cols-2">
          {offers.map(({ item, eyebrow }) => (
            // Le surtitre remplace un h2 du CMS : l'ancre du sommaire est portée par la carte.
            <li
              key={item.title}
              id={eyebrow ? slugify(eyebrow) : undefined}
              className="flex scroll-mt-32"
            >
              <TeaserCard item={item} eyebrow={eyebrow} className="w-full" />
            </li>
          ))}
        </ul>,
      );
      i = j;
      continue;
    }

    if (b.type === "heading" && isPicto(blocks[i + 1]) && blocks[i + 2]?.type === "paragraph") {
      const features: Feature[] = [];
      let j = i + 1;
      while (isPicto(blocks[j]) && blocks[j + 1]?.type === "paragraph") {
        const icon = blocks[j] as Extract<Block, { type: "image" }>;
        features.push({
          icon: icon.src,
          html: (blocks[j + 1] as Extract<Block, { type: "paragraph" }>).html,
        });
        j += 2;
      }
      if (features.length >= 3) {
        nodes.push(
          <Heading
            key={`${i}-h`}
            level={b.level}
            id={anchorId(b)}
            className="max-w-(--sil-measure)"
          >
            {b.text}
          </Heading>,
        );
        nodes.push(<FeatureGrid key={`${i}-g`} features={features} />);
        i = j;
        continue;
      }
    }

    if (
      b.type === "heading" &&
      b.sourceLevel === 5 &&
      blocks[i + 1]?.type === "cta" &&
      blocks[i + 2]?.type !== "cta"
    ) {
      const cta = blocks[i + 1] as Extract<Block, { type: "cta" }>;
      nodes.push(
        <ConseilCard key={i} title={b.text} level={b.level} label={cta.label} target={cta} />,
      );
      i += 2;
      continue;
    }

    if (b.type === "heading" && /questions\s*frequentes/.test(normalize(b.text))) {
      const items: AccordionItem[] = [];
      let j = i + 1;
      while (
        blocks[j]?.type === "heading" &&
        (blocks[j] as Extract<Block, { type: "heading" }>).level > b.level
      ) {
        const q = blocks[j] as Extract<Block, { type: "heading" }>;
        const answer: Block[] = [];
        j++;
        while (
          j < blocks.length &&
          blocks[j]!.type !== "heading" &&
          !(
            blocks[j]!.type === "paragraph" &&
            extractSingleLink((blocks[j] as Extract<Block, { type: "paragraph" }>).html)
          )
        ) {
          answer.push(blocks[j]!);
          j++;
        }
        items.push({ title: q.text, blocks: answer });
      }
      if (items.length >= 2) {
        nodes.push(
          <Heading
            key={`${i}-h`}
            level={b.level}
            id={anchorId(b)}
            className="max-w-(--sil-measure)"
          >
            {b.text}
          </Heading>,
        );
        nodes.push(
          <AccordionList
            key={`${i}-a`}
            items={items}
            defaultOpenIndex={items.length <= 5 ? 0 : null}
            renderBlocks={render}
          />,
        );
        const more =
          blocks[j]?.type === "paragraph"
            ? extractSingleLink((blocks[j] as Extract<Block, { type: "paragraph" }>).html)
            : null;
        if (more) {
          nodes.push(
            <ArrowLink key={`${i}-l`} target={more} externalIcon>
              {more.label}
            </ArrowLink>,
          );
          j++;
        }
        i = j;
        continue;
      }
    }

    if (b.type === "paragraph" && /sch[ée]ma/i.test(b.html) && blocks[i + 1]?.type === "image") {
      const img = blocks[i + 1] as Extract<Block, { type: "image" }>;
      nodes.push(render([b], ctx.region));
      nodes.push(
        <figure key={`${i}-f`} className="max-w-(--sil-container-prose)">
          <ResponsiveImage
            src={img.src}
            alt={img.alt}
            fit="contain"
            sizes="(min-width: 64rem) 45rem, 100vw"
            className="rounded-lg"
          />
          {img.caption && (
            <figcaption className="mt-2.5 text-sm text-muted">{img.caption}</figcaption>
          )}
        </figure>,
      );
      i += 2;
      continue;
    }

    if (
      b.type === "list" &&
      !b.ordered &&
      blocks[i - 1]?.type === "cta" &&
      blocks[i - 2]?.type === "list"
    ) {
      nodes.push(<Steps key={i} items={b.items} columns={1} />);
      i++;
      continue;
    }

    // Légende numérotée d'un schéma (ex. biogaz, gaz naturel) : plusieurs tableaux 2 colonnes consécutifs
    // sans en-têtes, 1re cellule « <strong>N</strong> » → une seule liste ordonnée (DESIGN.md § 11.13, 14.6).
    if (b.type === "table" && b.headers.length === 0 && b.rows.every(isLegendRow)) {
      const items: string[] = [];
      let j = i;
      while (
        j < blocks.length &&
        blocks[j]!.type === "table" &&
        (blocks[j] as Extract<Block, { type: "table" }>).headers.length === 0 &&
        (blocks[j] as Extract<Block, { type: "table" }>).rows.every(isLegendRow)
      ) {
        items.push(...(blocks[j] as Extract<Block, { type: "table" }>).rows.map((r) => r[1]!));
        j++;
      }
      nodes.push(
        <ol
          key={i}
          className="prose-sil list-decimal space-y-2 pl-5 text-body marker:font-bold marker:text-green-600"
        >
          {items.map((html, idx) => (
            <RichText key={idx} as="li" html={html} className="pl-1" />
          ))}
        </ol>,
      );
      i = j;
      continue;
    }

    // Pseudo-titre du CMS : question courte entièrement en gras suivie d'un paragraphe → vrai titre.
    const pseudoHeading = strongOnlyText(b);
    if (
      pseudoHeading &&
      pseudoHeading.endsWith("?") &&
      pseudoHeading.length <= 80 &&
      blocks[i + 1]?.type === "paragraph"
    ) {
      nodes.push(
        <Heading key={i} level={2} id={slugify(pseudoHeading)} className="max-w-(--sil-measure)">
          {pseudoHeading}
        </Heading>,
      );
      i++;
      continue;
    }

    // Section illustrée : image + titre + liste(s) (Économies d'énergie) → vignette 80 px à côté du titre,
    // les listes restent en pleine colonne.
    if (b.type === "image" && blocks[i + 1]?.type === "heading" && blocks[i + 2]?.type === "list") {
      const heading = blocks[i + 1] as Extract<Block, { type: "heading" }>;
      nodes.push(
        <div key={i} className="flex items-center gap-4">
          <ResponsiveImage
            src={b.src}
            alt={b.alt}
            sizes="80px"
            wrapperClassName="shrink-0"
            className="size-20 rounded-lg"
          />
          <Heading level={heading.level} id={anchorId(heading)}>
            {heading.text}
          </Heading>
        </div>,
      );
      i += 2;
      continue;
    }

    const mediaPair =
      b.type === "image" && blocks[i + 1]?.type === "heading"
        ? { image: b, heading: blocks[i + 1] as Extract<Block, { type: "heading" }> }
        : b.type === "heading" && blocks[i + 1]?.type === "image"
          ? { image: blocks[i + 1] as Extract<Block, { type: "image" }>, heading: b }
          : null;
    if (mediaPair && blocks[i + 2]?.type === "paragraph") {
      const { image, heading } = mediaPair;
      let j = i + 2;
      const paras: Block[] = [];
      // S'arrête à un pseudo-titre en gras (hors 1er paragraphe, qui peut être un chapeau en gras).
      while (
        j < blocks.length &&
        blocks[j]!.type === "paragraph" &&
        (paras.length === 0 || strongOnlyText(blocks[j]) === null)
      ) {
        paras.push(blocks[j]!);
        j++;
      }
      // Titre en tête : exclut les grilles de pictos (titre, puis image + paragraphe répétés, ex. Chaleur).
      const isPictoGrid = b.type === "heading" && blocks[j]?.type === "image";
      if (!isPictoGrid) {
        // Un `cta` isolé juste après fait partie de la rangée (sinon il reste orphelin sous la vignette).
        if (blocks[j]?.type === "cta" && blocks[j + 1]?.type !== "cta") {
          paras.push(blocks[j]!);
          j++;
        }
        nodes.push(
          <MediaRow key={i} image={image.src} alt={image.alt}>
            <Heading level={heading.level} size="h4" id={anchorId(heading)}>
              {heading.text}
            </Heading>
            {render(paras, "main")}
          </MediaRow>,
        );
        i = j;
        continue;
      }
    }

    nodes.push(
      <BlockRenderer
        key={i}
        blocks={[b]}
        pageSlug={ctx.pageSlug}
        section={ctx.section}
        tabId={ctx.tabId}
        region={ctx.region}
        bare
      />,
    );
    i++;
  }

  return { nodes, faqGroups, usefulLinks };
}
