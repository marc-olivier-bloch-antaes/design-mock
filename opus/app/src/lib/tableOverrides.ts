/**
 * En-têtes reconstruits à la main pour les tableaux dont le crawl a perdu la structure (en-têtes fusionnés
 * aplatis en lignes de données) — DESIGN.md § 11.13, § 14.6. Clé : `${pageSlug}:${tabId}:${indexInTab}`.
 * `skipRows` : nombre de lignes d'en-tête à ignorer en tête de `block.rows` (déjà représentées ici).
 * `padRows` : les lignes de continuation du tableau source n'ont pas toujours le même nombre de cellules
 * (colonnes fusionnées/omises) ; `true` réaligne chaque ligne sur `headers.length` (cellules manquantes
 * ajoutées en tête si la ligne est presque complète — libellé de groupe omis —, sinon en fin — message
 * libre du type « Conditions sur demande »).
 */
export interface TableOverride {
  headers: string[];
  skipRows: number;
  padRows?: boolean;
}

/**
 * Clé `${pageSlug}:${tabId}` (pas d'index de bloc : les gabarits regroupent parfois les blocs avant de les
 * rendre, l'index de position dans l'onglet n'est alors plus fiable). Un seul tableau complexe par onglet
 * dans le contenu actuel — suffisant en pratique (voir MIGRATION.md, un seul cas : gaz naturel/tarifs).
 */
export const TABLE_OVERRIDES: Record<string, TableOverride> = {
  "particuliers-gaz-naturel:tarifs": {
    headers: [
      "Tarif",
      "Consommation annuelle",
      "et / ou",
      "Puissance de l'installation",
      "Abonnement CHF/mois hors TVA",
      "Abonnement CHF/mois TTC",
      "Consommation Ct/kWh hors TVA",
      "Consommation Ct/kWh TTC",
      "Puissance CHF/kW/mois hors TVA",
      "Puissance CHF/kW/mois TTC",
    ],
    skipRows: 3,
    padRows: true,
  },
};

export function tableOverrideKey(pageSlug: string, tabId: string | undefined): string {
  return `${pageSlug}:${tabId ?? "main"}`;
}

/** Réaligne une ligne de tableau sur `width` colonnes (voir `padRows` ci-dessus). */
export function padTableRow(row: string[], width: number): string[] {
  if (row.length >= width) return row.slice(0, width);
  if (row.length >= width - 2) {
    return [...Array<string>(width - row.length).fill(""), ...row];
  }
  return [...row, ...Array<string>(width - row.length).fill("")];
}
