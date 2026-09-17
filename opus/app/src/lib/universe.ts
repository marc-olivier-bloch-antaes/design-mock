/**
 * Univers (Électricité, Chaleur…) : pastilles d'icônes colorées (DESIGN.md § 2.4).
 * Les classes sont écrites en toutes lettres pour que Tailwind les détecte.
 */
import { Flame, Heater, PlugZap, Sun, Wifi, Zap, type LucideIcon } from "lucide-react";

export type Universe = "electricite" | "chaleur" | "gaz" | "multimedia" | "mobilite" | "solaire";

export interface UniverseStyle {
  icon: LucideIcon;
  /** fond de pastille */
  soft: string;
  /** icône / texte sur `soft` ou sur blanc */
  ink: string;
  /** bordure décorative (survol) */
  accentBorder: string;
}

export const UNIVERSES: Record<Universe, UniverseStyle> = {
  electricite: {
    icon: Zap,
    soft: "bg-univ-electricite-soft",
    ink: "text-univ-electricite-ink",
    accentBorder: "hover:border-univ-electricite",
  },
  chaleur: {
    icon: Heater,
    soft: "bg-univ-chaleur-soft",
    ink: "text-univ-chaleur-ink",
    accentBorder: "hover:border-univ-chaleur",
  },
  gaz: {
    icon: Flame,
    soft: "bg-univ-gaz-soft",
    ink: "text-univ-gaz-ink",
    accentBorder: "hover:border-univ-gaz",
  },
  multimedia: {
    icon: Wifi,
    soft: "bg-univ-multimedia-soft",
    ink: "text-univ-multimedia-ink",
    accentBorder: "hover:border-univ-multimedia",
  },
  mobilite: {
    icon: PlugZap,
    soft: "bg-univ-mobilite-soft",
    ink: "text-univ-mobilite-ink",
    accentBorder: "hover:border-univ-mobilite",
  },
  solaire: {
    icon: Sun,
    soft: "bg-univ-solaire-soft",
    ink: "text-univ-solaire-ink",
    accentBorder: "hover:border-univ-solaire",
  },
};

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Détecte l'univers d'un libellé (« Électricité », « Gaz naturel », « Solaire photovoltaïque »…). */
export function universeFromLabel(label: string): Universe | undefined {
  const l = normalize(label);
  if (l.startsWith("electricite")) return "electricite";
  if (l.startsWith("chaleur") || l.includes("chauffage")) return "chaleur";
  if (l.startsWith("gaz")) return "gaz";
  if (l.startsWith("multimedia")) return "multimedia";
  if (l.startsWith("mobilite")) return "mobilite";
  if (l.startsWith("solaire")) return "solaire";
  return undefined;
}

/** Univers d'une page produit, déduit de la fin de son slug. */
export function universeFromSlug(slug: string): Universe | undefined {
  if (slug.endsWith("-electricite")) return "electricite";
  if (slug.endsWith("-chaleur")) return "chaleur";
  if (slug.endsWith("-gaz-naturel")) return "gaz";
  if (slug.endsWith("-multimedia")) return "multimedia";
  if (slug.endsWith("-solaire-photovoltaique")) return "solaire";
  return undefined;
}
