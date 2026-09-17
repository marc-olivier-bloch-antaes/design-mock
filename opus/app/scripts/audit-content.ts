/**
 * npm run audit-content
 * Parcourt le crawl brut (../crawl/content/*.json) et imprime la forme
 * OBSERVÉE de chaque type de bloc (champs, optionalité, valeurs d'énumération),
 * puis la compare au contrat attendu (scripts/lib/crawl-contract.ts).
 * Sort en erreur (code 1) si le crawl contient un type ou un champ non modélisé.
 */
import { auditCrawl } from "./lib/audit.ts";

const { recorder, problems, stats } = auditCrawl();
console.log(recorder.report());
console.log("\n── Occurrences par type (blocs de page + onglets + accordéons récursifs)");
for (const [type, n] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${type.padEnd(12)} ${n}`);
}
if (problems.length) {
  console.error(`\n✖ ${problems.length} écart(s) avec le contrat :`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("\n✔ Le crawl est conforme au contrat de types (src/content/types.ts).");
