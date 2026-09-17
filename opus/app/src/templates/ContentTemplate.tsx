import { BlockRenderer } from "@/blocks/BlockRenderer";
import { KeyFigures } from "@/blocks/components/BlockKeyFigures";
import { ResponsiveImage, Section, SectionHead } from "@/components/ui";
import { images } from "@/content";
import type { Block, ContactBlock, HeadingBlock } from "@/content/types";
import { PageHero } from "@/layout/PageHero";
import { slugify } from "@/lib/slugify";
import { AnchorNav } from "./parts/AnchorNav";
import { ContactBand } from "./parts/ContactBand";
import { ContentWithAside } from "./parts/ContentWithAside";
import { enhanceBlocks } from "./parts/enhanceTabBlocks";
import { UsefulLinks } from "./parts/UsefulLinks";
import type { TemplateProps } from "./registry";

/** Seuils d'affichage de l'aside : en dessous, contact en bandeau (pages sans corps ou très courtes). */
const MIN_TOC_ENTRIES = 3;
const MIN_BODY_BLOCKS = 6;

/**
 * Page entièrement contenue dans un seul accordéon (Règlements) : chaque item devient une section h2
 * dépliée, ses titres internes (h4) remontent d'un niveau — lisible d'un coup d'œil, avec sommaire.
 */
function unfoldSingleAccordion(blocks: Block[]): Block[] {
  if (blocks.length !== 1 || blocks[0]!.type !== "accordion") return blocks;
  return blocks[0]!.items.flatMap((item): Block[] => [
    { type: "heading", level: 2, sourceLevel: 4, text: item.title },
    ...item.blocks.map((b) =>
      b.type === "heading" ? { ...b, level: Math.max(3, b.level - 1) as HeadingBlock["level"] } : b,
    ),
  ]);
}

/**
 * ✅ Page de contenu (DESIGN.md § 12.4) — fiches 11 à 19 de MIGRATION.md.
 * - Ouverture : `gallery` en bandeau, ou 1re `image` en 21:9 (3:2 mobile) pleine largeur.
 * - Corps : règles d'enrichissement communes aux pages produit (`enhanceBlocks` : MediaRow, cartes d'offre,
 *   FAQ, Steps…), aside collant = sommaire des h2 + Liens utiles + contact, si le corps est assez long ;
 *   sinon contact en bandeau `band` en fin de page.
 * - Pleine largeur après le corps : `links[icon-nav]` → « Pour aller plus loin » (tuiles), `keyfigures` →
 *   panneau clair 4 colonnes.
 */
export default function ContentTemplate({ page }: TemplateProps) {
  const ctx = { pageSlug: page.slug, section: page.section } as const;
  const contact = page.blocks.find((b): b is ContactBlock => b.type === "contact");

  const [first, ...others] = page.blocks;
  // Média d'ouverture : galerie, ou image assez large pour un bandeau 21:9 (pas un picto de section).
  const opening =
    first &&
    (first.type === "gallery" || (first.type === "image" && (images[first.src]?.width ?? 0) >= 900))
      ? first
      : null;
  const remaining = opening ? others : page.blocks;

  const isFullWidth = (b: Block) =>
    (b.type === "links" && b.variant === "icon-nav") || b.type === "keyfigures";
  const fullWidth = remaining.filter(isFullWidth);
  const body = unfoldSingleAccordion(
    remaining
      .filter((b) => b.type !== "contact" && !isFullWidth(b))
      // Carrousel réduit à un seul teaser (C-FOR, doublon retiré par N12) : carte d'accroche, sans flèches.
      .map((b): Block =>
        b.type === "teasers" && b.variant === "carousel" && b.items.length === 1
          ? { ...b, variant: "accroche" }
          : b,
      ),
  );

  const { nodes, usefulLinks } = enhanceBlocks(body, { ...ctx, region: "main" });
  const toc = body
    .filter((b): b is HeadingBlock => b.type === "heading" && b.level === 2)
    .map((h) => ({ id: slugify(h.text), label: h.text }));
  const withAside =
    toc.length >= MIN_TOC_ENTRIES || body.length >= MIN_BODY_BLOCKS || usefulLinks.length > 0;

  return (
    <>
      <PageHero title={page.title} lead={page.lead} breadcrumb={page.breadcrumb} />

      {opening?.type === "gallery" && (
        <Section spacing="sm" className="pb-0">
          <BlockRenderer blocks={[opening]} {...ctx} bare />
        </Section>
      )}
      {opening?.type === "image" && (
        <Section spacing="sm" className="pb-0">
          <figure>
            <ResponsiveImage
              src={opening.src}
              alt={opening.alt}
              priority
              sizes="(min-width: 80rem) 76rem, 100vw"
              className="aspect-3/2 rounded-xl md:aspect-21/9"
            />
            {opening.caption && (
              <figcaption className="mt-2.5 text-sm text-muted">{opening.caption}</figcaption>
            )}
          </figure>
        </Section>
      )}

      {nodes.length > 0 && (
        <Section>
          {withAside ? (
            <ContentWithAside
              aside={
                <>
                  {/* Sommaire utile seulement en colonne collante (≥ lg) : sur mobile l'aside suit le contenu. */}
                  {toc.length >= MIN_TOC_ENTRIES && (
                    <div className="hidden lg:block">
                      <AnchorNav title="Sur cette page" items={toc} />
                    </div>
                  )}
                  {usefulLinks.length > 0 && <UsefulLinks groups={usefulLinks} />}
                  {contact && <BlockRenderer blocks={[contact]} {...ctx} region="aside" bare />}
                </>
              }
            >
              <div className="block-flow">{nodes}</div>
            </ContentWithAside>
          ) : (
            <div className="block-flow max-w-(--sil-container-prose)">{nodes}</div>
          )}
        </Section>
      )}

      {fullWidth.map((block, i) => (
        <Section key={i} spacing="sm" className={nodes.length > 0 ? "pt-0" : undefined}>
          {block.type === "keyfigures" ? (
            <KeyFigures title={block.title} items={block.items} variant="light" columns={4} />
          ) : (
            <>
              <SectionHead title="Pour aller plus loin" />
              <BlockRenderer blocks={[block]} {...ctx} bare />
            </>
          )}
        </Section>
      ))}

      {contact && !(withAside && nodes.length > 0) && <ContactBand block={contact} {...ctx} />}
    </>
  );
}
