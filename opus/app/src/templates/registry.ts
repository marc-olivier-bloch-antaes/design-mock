/**
 * Table page → gabarit (DESIGN.md § 12) et chargement paresseux des gabarits.
 * Toute page du manifeste DOIT figurer dans PAGE_TEMPLATES (vérifié par le smoke test et en dev).
 */
import { lazy, type ComponentType } from "react";
import type { Page } from "@/content/types";

export type TemplateId = "home" | "section" | "tabbed-product" | "content" | "contact";

export interface TemplateProps {
  page: Page;
}

export const PAGE_TEMPLATES: Record<string, TemplateId> = {
  accueil: "home",
  // Pages rubrique / sommaire (§ 12.2)
  "particuliers-je-choisis-mon-offre": "section",
  "a-propos-nos-activites": "section",
  // Pages produit à onglets (§ 12.3)
  "particuliers-electricite": "tabbed-product",
  "particuliers-chaleur": "tabbed-product",
  "particuliers-gaz-naturel": "tabbed-product",
  "particuliers-solaire-photovoltaique": "tabbed-product",
  "professionnels-electricite": "tabbed-product",
  "professionnels-solaire-photovoltaique": "tabbed-product",
  "partenaires-raccordements": "tabbed-product",
  // Pages de contenu (§ 12.4)
  "particuliers-multimedia": "content",
  "particuliers-economies-energie": "content",
  "particuliers-renovation-bien-immobilier": "content",
  "professionnels-telegestion": "content",
  "a-propos-reglements": "content",
  "a-propos-notre-portrait": "content",
  "a-propos-c-for": "content",
  "a-propos-notre-engagement": "content",
  "carrieres-nos-metiers": "content",
  // Page contact (§ 12.5)
  "particuliers-contact": "contact",
};

type TemplateModule = { default: ComponentType<TemplateProps> };

const loaders: Record<TemplateId, () => Promise<TemplateModule>> = {
  home: () => import("./HomeTemplate"),
  section: () => import("./SectionTemplate"),
  "tabbed-product": () => import("./TabbedProductTemplate"),
  content: () => import("./ContentTemplate"),
  contact: () => import("./ContactTemplate"),
};

export const templates: Record<TemplateId, ComponentType<TemplateProps>> = {
  home: lazy(loaders.home),
  section: lazy(loaders.section),
  "tabbed-product": lazy(loaders["tabbed-product"]),
  content: lazy(loaders.content),
  contact: lazy(loaders.contact),
};

export function templateForSlug(slug: string, hasTabs: boolean): TemplateId {
  const id = PAGE_TEMPLATES[slug];
  if (id) return id;
  if (import.meta.env.DEV) console.warn(`[templates] page « ${slug} » absente de PAGE_TEMPLATES`);
  return hasTabs ? "tabbed-product" : "content";
}

/** Précharge le code du gabarit (appelé par le loader de route : pas de flash de Suspense). */
export function preloadTemplate(id: TemplateId): Promise<unknown> {
  return loaders[id]();
}
