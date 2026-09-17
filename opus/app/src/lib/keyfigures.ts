/**
 * Découpe la valeur brute d'un chiffre clé (DESIGN.md § 11.14) :
 * « + de 125 ans » → préfixe « plus de », valeur « 125 », unité « ans » ;
 * « + de 650 » → préfixe « plus de », valeur « 650 » ;
 * « 94,3% » → valeur « 94,3% » (inchangée, pas d'unité séparée).
 */
export interface ParsedFigure {
  prefix?: string;
  value: string;
  unit?: string;
}

export function parseKeyFigure(raw: string): ParsedFigure {
  let s = raw.trim();
  let prefix: string | undefined;
  const prefixMatch = /^\+\s*de\s+/i.exec(s);
  if (prefixMatch) {
    prefix = "plus de";
    s = s.slice(prefixMatch[0].length);
  }
  s = s.replace(/^\+\s+(?=\d)/, "+"); // « + 200 » → « +200 » (DESIGN.md § 11.14)
  const unitMatch = /^([\d'.,]+)\s+([a-zà-ÿ]+)$/i.exec(s);
  if (unitMatch) return { prefix, value: unitMatch[1]!, unit: unitMatch[2]! };
  return { prefix, value: s };
}
