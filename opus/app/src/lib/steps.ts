import type { InlineHtml } from "@/content/types";

/** Découpe « Libellé : description » sur le premier « : » hors balise (DESIGN.md § 11.21). */
export function splitLabel(html: InlineHtml): { label: string; rest: string } | null {
  const idx = html.indexOf(":");
  if (idx === -1 || idx > 60) return null;
  if (html.slice(0, idx).includes("<")) return null;
  return { label: html.slice(0, idx), rest: html.slice(idx + 1).trim() };
}

/** Utilisé par `enhanceTabBlocks` pour détecter une liste « composition du prix » (→ Steps 2 colonnes). */
export function isColonItem(html: InlineHtml): boolean {
  return splitLabel(html) !== null;
}
