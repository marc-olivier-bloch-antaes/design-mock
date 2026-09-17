import { BlockRenderer } from "@/blocks/BlockRenderer";
import type {
  Block,
  CtaBlock,
  HeadingBlock,
  ParagraphBlock,
  SectionId,
  VideoBlock,
} from "@/content/types";
import { enhanceBlocks } from "./enhanceTabBlocks";
import { ProductCard, type ProductCardData } from "./ProductCard";

function splitByHeading(blocks: Block[]): { lead: Block[]; groups: Block[][] } {
  const lead: Block[] = [];
  const groups: Block[][] = [];
  for (const b of blocks) {
    if (b.type === "heading") groups.push([b]);
    else if (groups.length === 0) lead.push(b);
    else groups[groups.length - 1]!.push(b);
  }
  return { lead, groups };
}

function toProductCard(group: Block[]): ProductCardData | null {
  const heading = group[0];
  if (!heading || heading.type !== "heading") return null;
  const cta = group.find((b): b is CtaBlock => b.type === "cta");
  if (!cta) return null;
  const paragraphs = group.filter((b): b is ParagraphBlock => b.type === "paragraph");
  const video = group.find((b): b is VideoBlock => b.type === "video");
  const description = paragraphs[0]?.html ?? "";
  return {
    title: (heading as HeadingBlock).text,
    titleBlock: heading as HeadingBlock,
    description,
    note: paragraphs[1]?.html,
    video,
    cta,
    featured: /sur simple demande/i.test(description),
  };
}

/**
 * Onglet « Produits » (DESIGN.md § 12.3, MIGRATION.md fiches 1 & 3) : groupe les blocs par `heading`,
 * identifie les groupes « carte produit » (heading + paragraph + cta), les réordonne (produit par défaut
 * d'abord) et rend le reste (intro, sections « Grands consommateurs »…) en contenu courant avant/après.
 */
export function ProduitsTab({
  blocks,
  pageSlug,
  section,
  tabId,
}: {
  blocks: Block[];
  pageSlug: string;
  section: SectionId;
  tabId: string;
}) {
  const { lead, groups } = splitByHeading(blocks);
  const cards: ProductCardData[] = [];
  const trailing: Block[] = [];
  for (const group of groups) {
    const card = toProductCard(group);
    if (card) cards.push(card);
    else trailing.push(...group);
  }
  cards.sort((a, b) => Number(a.featured) - Number(b.featured));
  const trailingEnhanced =
    trailing.length > 0
      ? enhanceBlocks(trailing, { pageSlug, section, tabId, region: "tab" })
      : null;

  return (
    <div className="block-flow">
      {lead.length > 0 && (
        <BlockRenderer
          blocks={lead}
          pageSlug={pageSlug}
          section={section}
          tabId={tabId}
          region="tab"
          bare
        />
      )}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <ProductCard key={card.title} data={card} pageSlug={pageSlug} section={section} />
          ))}
        </div>
      )}
      {trailingEnhanced && <div className="block-flow">{trailingEnhanced.nodes}</div>}
    </div>
  );
}
