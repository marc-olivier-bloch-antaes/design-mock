import { BlockRenderer } from "@/blocks/BlockRenderer";
import { AccordionList } from "@/blocks/components/Accordion";
import type { AccordionItem, SectionId } from "@/content/types";

/** Groupe FAQ (DESIGN.md § 11.9) : titre h3 + compteur « N questions » au-dessus de l'accordéon. */
export function FaqGroup({
  id,
  title,
  items,
  pageSlug,
  section,
  tabId,
}: {
  id: string;
  title: string;
  items: AccordionItem[];
  pageSlug: string;
  section: SectionId;
  tabId?: string;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-32">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id={id} className="text-h3">
          {title}
        </h3>
        <span className="text-sm text-muted">
          {items.length} question{items.length > 1 ? "s" : ""}
        </span>
      </div>
      <AccordionList
        items={items}
        defaultOpenIndex={items.length <= 5 ? 0 : null}
        ariaLabelledBy={id}
        renderBlocks={(blocks, region) => (
          <BlockRenderer
            blocks={blocks}
            pageSlug={pageSlug}
            section={section}
            tabId={tabId}
            region={region}
          />
        )}
      />
    </section>
  );
}
