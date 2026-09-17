import { Heading, type HeadingSize } from "@/components/ui";
import type { HeadingBlock } from "@/content/types";
import { slugify } from "@/lib/slugify";
import type { BlockProps } from "../types";

/**
 * ✅ FINI — composant de référence des conventions.
 *
 * - Le niveau SÉMANTIQUE vient de la normalisation (`block.level`, déjà remappé : h2 = 1er niveau).
 * - La taille VISUELLE dépend de la région : dans un accordéon ou un aside, on reste compact.
 * - Le texte est déjà normalisé (casse phrase, capitales accentuées, « : » final retiré).
 * - Les h2 hors accordéon/aside portent une ancre `id` (slug du texte) : cible du sommaire des pages de contenu.
 */
const SIZE_BY_LEVEL: Record<HeadingBlock["level"], HeadingSize> = {
  2: "h2",
  3: "h3",
  4: "h4",
  5: "body-lg",
  6: "body-lg",
};

export function BlockHeading({ block, context }: BlockProps<HeadingBlock>) {
  const compact = context.region === "accordion" || context.region === "aside";
  const size: HeadingSize = compact
    ? block.level <= 4
      ? "h4"
      : "body-lg"
    : SIZE_BY_LEVEL[block.level];
  return (
    <Heading
      level={block.level}
      size={size}
      id={block.level === 2 && !compact ? slugify(block.text) : undefined}
      className="max-w-(--sil-measure)"
    >
      {block.text}
    </Heading>
  );
}
