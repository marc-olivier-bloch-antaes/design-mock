import type { AccordionBlock } from "@/content/types";
import { AccordionList } from "./Accordion";
import type { BlockProps } from "../types";

/**
 * ✅ Accordéon (DESIGN.md § 11.9). Fait : pattern ARIA, plusieurs items ouvrables, contenu récursif,
 * 1er item ouvert quand l'accordéon est un aperçu court (≤ 5 questions), variante `compact`.
 * Le rendu proprement dit est dans `AccordionList` (partagé avec `FaqGroup` et les accordéons compacts
 * extraits par les gabarits, ex. archives de tarifs, glossaire — voir templates/parts/enhanceTabBlocks).
 */
export function BlockAccordion({ block, context }: BlockProps<AccordionBlock>) {
  return (
    <AccordionList
      items={block.items}
      defaultOpenIndex={block.items.length <= 5 ? 0 : null}
      renderBlocks={context.renderBlocks}
    />
  );
}
