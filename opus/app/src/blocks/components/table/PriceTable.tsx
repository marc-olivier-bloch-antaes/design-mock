import { RichText } from "@/components/ui";
import type { InlineHtml } from "@/content/types";
import { cn } from "@/lib/cn";

interface Group {
  label: InlineHtml;
  sub: InlineHtml[][];
}

/** Une 1re cellule vide regroupe la ligne sous le libellé précédent (DESIGN.md § 11.13, « lignes de complément »). */
function groupRows(rows: InlineHtml[][]): Group[] {
  const groups: Group[] = [];
  for (const row of rows) {
    const [label, ...rest] = row;
    if ((label === undefined || label.trim() === "") && groups.length > 0) {
      groups[groups.length - 1]!.sub.push(rest);
    } else {
      groups.push({ label: label ?? "", sub: [rest] });
    }
  }
  return groups;
}

/**
 * Tableau de tarifs ≤ 4 colonnes (DESIGN.md § 11.13) : vrai `<table>` avec légende ≥ md, cartes < md.
 * Dernière colonne alignée à droite en `tabular-nums` (prix).
 */
export function PriceTable({
  headers,
  rows,
  caption,
}: {
  headers: InlineHtml[];
  rows: InlineHtml[][];
  caption?: string;
}) {
  const groups = groupRows(rows);
  return (
    <div className="overflow-hidden rounded-card border border-border-default">
      {caption && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border-default bg-surface px-5 py-3">
          <h3 className="text-h4">{caption}</h3>
          <span className="text-sm text-muted">Tarifs en CHF, hors TVA</span>
        </div>
      )}
      <table className="hidden w-full border-collapse text-left text-body md:table">
        {headers.length > 0 && (
          <thead className="bg-surface-muted text-sm font-bold">
            <tr>
              {headers.map((h, i) => (
                <th key={i} scope="col" className="px-5 py-3 align-bottom">
                  <RichText html={h} prose={false} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {groups.map((g, gi) =>
            g.sub.map((subRow, si) => (
              <tr
                key={`${gi}-${si}`}
                className="border-t border-border-default first:border-t-0 hover:bg-green-50"
              >
                {si === 0 && (
                  <th
                    rowSpan={g.sub.length}
                    scope="rowgroup"
                    className="w-[30%] border-r border-border-default px-5 py-4 align-top font-bold"
                  >
                    <RichText html={g.label} prose={false} />
                  </th>
                )}
                {subRow.map((cell, ci) => (
                  <td
                    key={ci}
                    className={cn(
                      "px-5 py-4 align-top",
                      ci === subRow.length - 1
                        ? "text-right font-[750] tabular-nums"
                        : "text-neutral-700",
                    )}
                  >
                    <RichText html={cell} prose={false} />
                  </td>
                ))}
              </tr>
            )),
          )}
        </tbody>
      </table>
      <div className="divide-y divide-border-default md:hidden">
        {groups.map((g, gi) => (
          <div key={gi} className="p-4">
            <p className="mb-2 font-bold">
              <RichText html={g.label} prose={false} />
            </p>
            <div className="space-y-1.5">
              {g.sub.map((subRow, si) => (
                <div
                  key={si}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-1",
                    si > 0 && "border-t border-dashed border-border-default pt-1.5",
                  )}
                >
                  <RichText html={subRow[0] ?? ""} prose={false} className="text-neutral-700" />
                  {subRow.length > 1 && (
                    <RichText
                      html={subRow[subRow.length - 1] ?? ""}
                      prose={false}
                      className="text-right font-[750] tabular-nums"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
