import type { Block } from "@/content/types";
import { extractSingleLink, type ExtractedLink } from "./extractLinks";

export interface UsefulLinkGroup {
  title: string;
  items: ExtractedLink[];
}

/**
 * Extrait les groupes « heading + paragraphes-liens » (aside « Liens utiles », DESIGN.md § 11.8) et
 * renvoie les blocs restants (les groupes sont retirés du contenu principal, ARCHITECTURE.md § 7).
 * Générique : utilisé sur les pages produit (« En relation », « Conditions des prestations »…) et
 * les pages de contenu (« Liens utiles »). Accepte aussi le motif « heading + bloc `links` sans
 * variante » (ex. particuliers-chaleur, MIGRATION.md fiche 5), équivalent à une suite de
 * paragraphes-liens sous un même titre.
 */
export function extractUsefulLinks(blocks: Block[]): { groups: UsefulLinkGroup[]; rest: Block[] } {
  const consumed = new Set<number>();
  const groups: UsefulLinkGroup[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]!;
    if (b.type !== "heading") continue;

    const next = blocks[i + 1];
    // Bloc `links` sans variante : seulement sous un titre « Liens utiles » / « En relation » (ailleurs,
    // ex. sections de Règlements, la liste fait partie du contenu et reste en place).
    if (next?.type === "links" && !next.variant && /liens utiles|en relation/i.test(b.text)) {
      const items: ExtractedLink[] = next.items.map((item) => ({
        label: item.label,
        url: item.url,
        slug: item.slug,
        tab: item.tab,
        route: item.route,
        external: item.external,
      }));
      if (items.length > 0) {
        groups.push({ title: b.text, items });
        consumed.add(i);
        consumed.add(i + 1);
        i += 1;
        continue;
      }
    }

    const items: ExtractedLink[] = [];
    let j = i + 1;
    while (j < blocks.length) {
      const p = blocks[j]!;
      if (p.type !== "paragraph") break;
      const link = extractSingleLink(p.html);
      if (!link) break;
      items.push(link);
      j++;
    }
    if (items.length === 0) continue;
    groups.push({ title: b.text, items });
    for (let k = i; k < j; k++) consumed.add(k);
    i = j - 1;
  }

  if (groups.length === 0) return { groups: [], rest: blocks };
  return { groups, rest: blocks.filter((_, idx) => !consumed.has(idx)) };
}
