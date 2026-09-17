import type { Block } from "@/content/types";

/**
 * Le crawl a aplati le formulaire « Nous écrire » en texte (heading « actual page:Page 1 » + paragraphes
 * concaténés jusqu'au titre suivant). Ces blocs ne sont PAS du contenu (DESIGN.md § 12.5, § 14.9).
 */
export function withoutFlattenedForm(blocks: Block[]): Block[] {
  const start = blocks.findIndex((b) => b.type === "heading" && /^actual page/i.test(b.text));
  if (start === -1) return blocks;
  let end = start + 1;
  while (end < blocks.length && blocks[end]!.type !== "heading") end++;
  return [...blocks.slice(0, start), ...blocks.slice(end)];
}
