/**
 * Inférence de forme (« schéma observé ») d'un ensemble d'objets JSON.
 * Utilisé par `audit-content.ts` pour VÉRIFIER (et non supposer) les types de
 * blocs réellement présents dans le crawl et la forme exacte de leurs champs.
 */

export type Kind = "string" | "number" | "boolean" | "null" | "array" | "object";

export interface FieldStats {
  /** Nombre d'objets du groupe portant ce champ. */
  present: number;
  kinds: Set<Kind>;
  /** Valeurs distinctes (scalaires uniquement, plafonnées). */
  values: Set<string>;
}

export interface GroupStats {
  count: number;
  fields: Map<string, FieldStats>;
}

const MAX_VALUES = 12;

export function kindOf(v: unknown): Kind {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return t;
  return "object";
}

export class ShapeRecorder {
  readonly groups = new Map<string, GroupStats>();

  record(group: string, obj: Record<string, unknown>): void {
    let g = this.groups.get(group);
    if (!g) {
      g = { count: 0, fields: new Map() };
      this.groups.set(group, g);
    }
    g.count++;
    for (const [k, v] of Object.entries(obj)) {
      let f = g.fields.get(k);
      if (!f) {
        f = { present: 0, kinds: new Set(), values: new Set() };
        g.fields.set(k, f);
      }
      f.present++;
      f.kinds.add(kindOf(v));
      if (
        (typeof v === "string" && v.length <= 40) ||
        typeof v === "number" ||
        typeof v === "boolean"
      ) {
        if (f.values.size <= MAX_VALUES) f.values.add(String(v));
      }
    }
  }

  /** Rapport texte lisible, trié par groupe. */
  report(): string {
    const lines: string[] = [];
    for (const [name, g] of [...this.groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`\n■ ${name}  (${g.count})`);
      for (const [k, f] of g.fields) {
        const optional = f.present < g.count ? `optionnel ${f.present}/${g.count}` : "requis";
        const kinds = [...f.kinds].join(" | ");
        const vals =
          f.values.size > 0 &&
          f.values.size <= MAX_VALUES &&
          ![
            "url",
            "label",
            "title",
            "text",
            "src",
            "alt",
            "html",
            "caption",
            "slug",
            "date",
            "size",
            "value",
            "logo",
            "image",
            "icon",
            "id",
          ].includes(k)
            ? `  valeurs: ${[...f.values].join(", ")}`
            : "";
        lines.push(`    ${k.padEnd(10)} ${kinds.padEnd(22)} ${optional}${vals}`);
      }
    }
    return lines.join("\n");
  }
}
