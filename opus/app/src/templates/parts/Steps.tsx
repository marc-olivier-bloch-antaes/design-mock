import { RichText } from "@/components/ui";
import type { InlineHtml } from "@/content/types";
import { cn } from "@/lib/cn";
import { splitLabel } from "@/lib/steps";

export interface StepsProps {
  /** HTML inline des items d'une `list` (DESIGN.md § 11.21). */
  items: InlineHtml[];
  /** 2 colonnes pour des items courts (composition du prix), 1 colonne pour une marche à suivre. */
  columns?: 1 | 2;
  className?: string;
}

/** Étapes numérotées : liste ordonnée en cartes neutral-50, numéro rond 30 px. */
export function Steps({ items, columns = 1, className }: StepsProps) {
  return (
    <ol className={cn("grid list-none gap-3 pl-0", columns === 2 && "md:grid-cols-2", className)}>
      {items.map((html, i) => {
        const split = splitLabel(html);
        return (
          <li key={i} className="flex gap-3.5 rounded-md bg-surface-subtle p-4">
            <span
              className="grid size-[30px] shrink-0 place-items-center rounded-full bg-action text-sm font-bold text-on-action"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="pt-0.5 leading-snug">
              {split ? (
                <>
                  <RichText as="span" html={split.label} prose={false} className="font-bold" />
                  {": "}
                  <RichText as="span" html={split.rest} prose={false} />
                </>
              ) : (
                <RichText as="span" html={html} prose={false} />
              )}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
