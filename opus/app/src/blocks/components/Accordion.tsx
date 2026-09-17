import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import type { AccordionItem, Block } from "@/content/types";
import { cn } from "@/lib/cn";
import type { BlockRegion } from "../types";

export interface AccordionListProps {
  items: AccordionItem[];
  /** `default` (FAQ, 60 px) · `compact` (glossaire, archives, 56 px). */
  variant?: "default" | "compact";
  /** Index ouvert par défaut (ex. 0 pour un aperçu court ≤ 5 questions), `null` = tout fermé. */
  defaultOpenIndex?: number | null;
  /** Rend une liste de blocs (contenu d'un panneau) — fourni par l'appelant pour éviter tout cycle
   * d'import avec BlockRenderer (context.renderBlocks dans le registre, <BlockRenderer> direct ailleurs). */
  renderBlocks: (blocks: Block[], region: BlockRegion) => ReactNode;
  ariaLabelledBy?: string;
  className?: string;
}

/**
 * Accordéon (DESIGN.md § 11.9) — pattern ARIA (`button[aria-expanded][aria-controls]` dans un titre +
 * `role=region`), plusieurs items ouvrables, contenu récursif. Composant PRÉSENTATIONNEL partagé par
 * `BlockAccordion` (registre) et les gabarits (FaqGroup, accordéons compacts extraits par `enhanceTabBlocks`).
 */
export function AccordionList({
  items,
  variant = "default",
  defaultOpenIndex = null,
  renderBlocks,
  ariaLabelledBy,
  className,
}: AccordionListProps) {
  const baseId = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() =>
    defaultOpenIndex === null ? new Set() : new Set([defaultOpenIndex]),
  );
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const compact = variant === "compact";

  return (
    <div
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "overflow-hidden rounded-card border border-border-default bg-surface",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const triggerId = `${baseId}-t${i}`;
        const panelId = `${baseId}-p${i}`;
        return (
          <div key={i} className="border-border-default not-first:border-t">
            <h3
              className={cn(
                "font-[650]",
                compact ? "text-[0.9375rem] leading-snug" : "text-[1.0625rem] leading-snug",
              )}
            >
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className={cn(
                  "group flex w-full items-center justify-between gap-4 text-left",
                  compact ? "min-h-14 px-4 py-2.5" : "min-h-15 px-5 py-3.5",
                  "hover:bg-neutral-25 focus-visible:-outline-offset-3",
                  isOpen && "bg-neutral-25",
                )}
              >
                <span>{item.title}</span>
                <span
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full transition-[background-color,rotate] duration-(--sil-duration-base)",
                    compact ? "size-7" : "size-8",
                    isOpen ? "rotate-180 bg-action text-on-action" : "bg-surface-muted text-ink",
                  )}
                  aria-hidden="true"
                >
                  <ChevronDown className={compact ? "size-3.5" : "size-4"} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className={cn("bg-neutral-25", compact ? "px-4 pb-4" : "px-5 pb-6")}
            >
              {isOpen && renderBlocks(item.blocks, "accordion")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
