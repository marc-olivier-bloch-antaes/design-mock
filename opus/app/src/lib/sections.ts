import type { SectionId } from "@/content/types";

/** Premier segment d'URL → rubrique (pour le rail « rubrique courante » du header). */
const SECTION_BY_SEGMENT: Record<string, SectionId> = {
  particuliers: "particuliers",
  professionnels: "professionnels",
  partenaires: "partenaires",
  "a-propos-sil": "a-propos",
  carrieres: "carrieres",
};

export function sectionFromPath(pathname: string): SectionId | undefined {
  const segment = pathname.split("/")[1] ?? "";
  return SECTION_BY_SEGMENT[segment];
}
