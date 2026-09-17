/**
 * Accès typé au contenu importé (généré par `npm run import-content`).
 * - Manifeste, navigation et images : chargés statiquement (petits, utiles partout).
 * - Pages : chargées à la demande (un chunk JSON par page) via `loadPage`.
 *
 * Les JSON sont validés à l'import (contrat + normaliseur typé) : le transtypage
 * ci-dessous est donc sûr. Ne jamais éditer les JSON à la main.
 */
import imagesJson from "./images.json";
import manifestJson from "./manifest.json";
import navigationJson from "./navigation.json";
import type { ImageManifest, Navigation, NavNode, Page, PageSummary } from "./types";

export type * from "./types";

export const manifest = manifestJson as unknown as PageSummary[];
export const navigation = navigationJson as unknown as Navigation;
export const images = imagesJson as unknown as ImageManifest;

const pageModules = import.meta.glob<{ default: Page }>("./pages/*.json");

const summaryBySlug = new Map(manifest.map((p) => [p.slug, p]));

export function getPageSummary(slug: string): PageSummary | undefined {
  return summaryBySlug.get(slug);
}

export async function loadPage(slug: string): Promise<Page> {
  const load = pageModules[`./pages/${slug}.json`];
  if (!load) throw new Response(`Page inconnue : ${slug}`, { status: 404 });
  const mod = await load();
  return mod.default;
}

/** Parcours à plat de l'arbre de navigation (profondeur d'abord). */
export function flattenNav(nodes: NavNode[] = navigation.mainMenu): NavNode[] {
  return nodes.flatMap((n) => [n, ...flattenNav(n.children)]);
}

/** Chemin d'ancêtres (racine → nœud) du premier nœud de menu correspondant à `path`. */
export function findNavTrail(path: string, nodes: NavNode[] = navigation.mainMenu): NavNode[] {
  for (const node of nodes) {
    if (node.path === path) return [node];
    const sub = findNavTrail(path, node.children);
    if (sub.length) return [node, ...sub];
  }
  return [];
}
