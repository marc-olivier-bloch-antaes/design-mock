import { RichText } from "@/components/ui";
import type { InlineHtml } from "@/content/types";
import { cn } from "@/lib/cn";

/**
 * Tableau complexe (> 4 colonnes, en-têtes fusionnés perdus au crawl) — DESIGN.md § 11.13.
 * Défilement horizontal local, 1re colonne collante, indice « Faire défiler → » sous le tableau (< lg).
 */
export function ScrollTable({
  headers,
  rows,
  caption,
}: {
  headers: InlineHtml[];
  rows: InlineHtml[][];
  caption?: string;
}) {
  return (
    <div className="rounded-card border border-border-default">
      {caption && (
        <div className="border-b border-border-default bg-surface px-5 py-3">
          <h3 className="text-h4">{caption}</h3>
        </div>
      )}
      <div className="overflow-x-auto" role="region" aria-label={caption ?? "Tableau"} tabIndex={0}>
        <table className="w-max min-w-full border-collapse text-left text-sm">
          {headers.length > 0 && (
            <thead className="bg-surface-muted font-bold">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={cn(
                      "px-4 py-3 align-bottom whitespace-nowrap",
                      i === 0 && "sticky left-0 z-10 bg-surface-muted",
                    )}
                  >
                    <RichText html={h} prose={false} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-t border-border-default">
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={cn(
                      "px-4 py-3 align-top whitespace-nowrap",
                      c === 0 && "sticky left-0 z-10 bg-surface font-bold whitespace-normal",
                    )}
                  >
                    <RichText html={cell} prose={false} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border-default px-4 py-2 text-sm text-muted lg:hidden">
        Faire défiler →
      </p>
    </div>
  );
}
