import { ArrowRight, Leaf } from "lucide-react";
import { BlockVideo } from "@/blocks/components/BlockVideo";
import type { BlockContext } from "@/blocks/types";
import { Badge, ButtonLink, Icon, RichText } from "@/components/ui";
import type { CtaBlock, HeadingBlock, InlineHtml, SectionId, VideoBlock } from "@/content/types";
import { cn } from "@/lib/cn";

export interface ProductCardData {
  title: string;
  /** Bloc titre d'origine : permet à BlockVideo de déduire le titre accessible de l'iframe. */
  titleBlock: HeadingBlock;
  description: InlineHtml;
  note?: InlineHtml;
  video?: VideoBlock;
  cta?: CtaBlock;
  /** true = mis en avant (« Sur simple demande »), false = produit par défaut. */
  featured: boolean;
}

/**
 * Carte produit (DESIGN.md § 11.10, § 12.3) : composée par le gabarit à partir d'un groupe
 * heading + paragraph + video? + paragraph(note)? + cta de l'onglet Produits.
 */
export function ProductCard({
  data,
  pageSlug,
  section,
}: {
  data: ProductCardData;
  pageSlug: string;
  section: SectionId;
}) {
  const videoContext: BlockContext = {
    pageSlug,
    section,
    region: "main",
    index: 1,
    siblings: [data.titleBlock, data.video!],
    renderBlocks: () => null,
  };
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border bg-surface p-6 md:p-9",
        data.featured ? "border-green-300" : "border-border-default",
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant={data.featured ? "neutral" : "new"}>
          {data.featured ? "Sur simple demande" : "Produit par défaut"}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
          <Icon icon={Leaf} size="sm" />
          Produit renouvelable
        </span>
      </div>
      <h3 className="text-h3">{data.title}</h3>
      <RichText as="p" html={data.description} className="mt-3 text-body text-ink" />
      {data.video && (
        <div className="mt-5">
          <BlockVideo block={data.video} context={videoContext} />
        </div>
      )}
      {data.note && <RichText as="p" html={data.note} className="mt-3 text-sm text-muted" />}
      {data.cta && (
        <ButtonLink target={data.cta} trailingIcon={ArrowRight} className="mt-6 self-start">
          {data.cta.label}
        </ButtonLink>
      )}
    </div>
  );
}
