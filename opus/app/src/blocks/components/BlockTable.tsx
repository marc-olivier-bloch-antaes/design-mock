import type { TableBlock } from "@/content/types";
import { padTableRow, TABLE_OVERRIDES, tableOverrideKey } from "@/lib/tableOverrides";
import { DefinitionList } from "./table/DefinitionList";
import { PriceTable } from "./table/PriceTable";
import { ScrollTable } from "./table/ScrollTable";
import type { BlockProps } from "../types";

/**
 * ✅ Tableau (DESIGN.md § 11.13) : choisit le composant selon la forme.
 * - `headers` vide et ≤ 2 colonnes (lieu/horaire…) → `DefinitionList` (jamais de `<table>`).
 * - ≤ 4 colonnes (tarifs, frais) → `PriceTable` (cartes < md, vrai tableau ≥ md, dernière colonne = prix).
 * - > 4 colonnes (en-têtes fusionnés perdus au crawl, ex. gaz naturel 10 col.) → `ScrollTable`, défilement
 *   horizontal local, 1re colonne collante ; en-têtes reconstruits à la main (`lib/tableOverrides.ts`).
 */
export function BlockTable({ block, context }: BlockProps<TableBlock>) {
  const override = TABLE_OVERRIDES[tableOverrideKey(context.pageSlug, context.tabId)];
  const headers = override ? override.headers : block.headers;
  let rows = override ? block.rows.slice(override.skipRows) : block.rows;
  if (override?.padRows) rows = rows.map((r) => padTableRow(r, headers.length));
  const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 0);

  if (headers.length === 0 && colCount <= 2) {
    return <DefinitionList rows={rows} />;
  }
  if (colCount <= 4) {
    return <PriceTable headers={headers} rows={rows} />;
  }
  return <ScrollTable headers={headers} rows={rows} />;
}
