import type { NavNode } from "@/content/types";

/** Libellé de la page « vue d'ensemble » d'une rubrique. */
export const OVERVIEW_LABEL = "Vue d'ensemble";

/** Groupes du méga-menu / drawer : une rubrique sans niveau 3 (Partenaires, Carrières) devient un seul groupe. */
export function menuGroups(root: NavNode): { title: NavNode; items: NavNode[] }[] {
  const hasLevel3 = root.children.some((c) => c.children.length > 0);
  if (!hasLevel3) return [{ title: root, items: root.children }];
  return root.children.map((c) => ({ title: c, items: c.children }));
}
