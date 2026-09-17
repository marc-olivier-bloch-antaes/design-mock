/**
 * Contrat attendu du crawl BRUT (avant normalisation), bloc par bloc.
 * Il reflète la forme observée par `npm run audit-content` : si le crawl
 * évolue (nouveau type, nouveau champ), l'import échoue ici au lieu de
 * produire silencieusement des données que les types TS ne décrivent pas.
 * Toute modification ici doit être répercutée dans `src/content/types.ts`.
 */
import { kindOf, type Kind } from "./infer-shape.ts";

interface FieldRule {
  kinds: Kind[];
  optional?: boolean;
  /** Valeurs autorisées (énumération). */
  values?: readonly (string | number | boolean | null)[];
}
type Contract = Record<string, FieldRule>;

const str: FieldRule = { kinds: ["string"] };
const strOrNull: FieldRule = { kinds: ["string", "null"] };
const arr: FieldRule = { kinds: ["array"] };

export const BLOCK_CONTRACT = {
  heading: { level: { kinds: ["number"], values: [2, 3, 4, 5] }, text: str },
  paragraph: { html: str },
  list: { ordered: { kinds: ["boolean"] }, items: arr },
  image: { src: str, alt: str, caption: strOrNull },
  gallery: { title: strOrNull, items: arr },
  teasers: {
    title: strOrNull,
    variant: { kinds: ["string"], values: ["grid", "carousel", "accroche"] },
    items: arr,
  },
  links: {
    title: strOrNull,
    variant: { kinds: ["string"], values: ["icon-nav", "news"], optional: true },
    items: arr,
  },
  documents: { title: strOrNull, items: arr },
  accordion: { items: arr },
  table: { headers: arr, rows: arr },
  contact: { title: str, lines: arr, logo: str, links: arr },
  keyfigures: { title: str, items: arr },
  cta: { label: str, url: str },
  video: { url: str },
} satisfies Record<string, Contract>;

export type CrawlBlockType = keyof typeof BLOCK_CONTRACT;

export function checkBlockAgainstContract(b: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const type = String(b.type);
  const contract = (BLOCK_CONTRACT as Record<string, Contract>)[type];
  if (!contract) return [`type de bloc inconnu « ${type} »`];
  for (const [field, rule] of Object.entries(contract)) {
    if (!(field in b)) {
      if (!rule.optional) problems.push(`${type}: champ requis manquant « ${field} »`);
      continue;
    }
    const v = b[field];
    if (!rule.kinds.includes(kindOf(v)))
      problems.push(`${type}.${field}: type ${kindOf(v)} inattendu`);
    if (rule.values && !rule.values.includes(v as never))
      problems.push(`${type}.${field}: valeur « ${String(v)} » hors énumération`);
  }
  for (const field of Object.keys(b)) {
    if (field !== "type" && !(field in contract))
      problems.push(`${type}: champ non modélisé « ${field} »`);
  }
  return problems;
}
