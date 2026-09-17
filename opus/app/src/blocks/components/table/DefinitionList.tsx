import { RichText } from "@/components/ui";
import type { InlineHtml } from "@/content/types";

/**
 * Tableau-liste à 2 colonnes (contact : lieux/horaires) — DESIGN.md § 11.13 : jamais un `<table>`.
 * Rendu en `<dl>` : libellé (1re colonne) + valeur (2e colonne).
 */
export function DefinitionList({ rows, className }: { rows: InlineHtml[][]; className?: string }) {
  return (
    <dl className={className}>
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid gap-x-4 gap-y-0.5 py-3 not-first:border-t not-first:border-border-default sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
        >
          <dt className="font-bold">
            <RichText html={row[0] ?? ""} prose={false} />
          </dt>
          <dd className="text-muted sm:text-right">
            <RichText html={row[1] ?? ""} prose={false} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
