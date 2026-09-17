/**
 * Données du « chrome » global (barre utilitaire, méga-menu, drawer, footer).
 * Le crawl ne les extrait volontairement pas (README du crawl, « Global, cross-page chrome ») :
 * elles sont reprises du site actuel (raw/accueil.html) et des maquettes (design/mockups).
 * Les URL sont celles de lausanne.ch : `linkFromUrl()` les route en interne quand la page existe dans l'app.
 */
import type { SectionId } from "@/content/types";

export const SITE_NAME = "Services industriels de Lausanne";
export const SITE_SHORT_NAME = "SiL";

/** Numéro unique clients / urgences (DESIGN.md § 11.15 : donnée globale reprise de particuliers-contact). */
export const PHONE = {
  display: "021 315 88 88",
  href: "tel:+41213158888",
  hours: "Lundi-vendredi : 8h-17h",
} as const;

/**
 * Chiffres clés (DESIGN.md § 11.14) : dupliqués depuis `a-propos-notre-portrait` (bloc `keyfigures`,
 * ARCHITECTURE.md § « chiffres clés viennent de a-propos-notre-portrait ») pour le panneau de l'accueil,
 * qui n'a pas ce bloc dans son propre JSON.
 */
export const KEY_FIGURES = {
  title: "Les SiL, ce sont…",
  items: [
    { value: "+ de 125 ans", label: "d'activité" },
    { value: "+ de 650", label: "collaborateurs" },
    { value: "53", label: "apprentis formés en 2021" },
    { value: "94,3%", label: "de production d'énergie renouvelable" },
  ],
} as const;

export const LAUSANNE_HOME_URL = "https://www.lausanne.ch";

/** Destinations des actions du header (pages non crawlées → page « hors périmètre »). */
export const ACCOUNT_URL =
  "/vie-pratique/energies-et-eau/services-industriels/particuliers/mon-compte.html";
export const CONTACT_URL =
  "/vie-pratique/energies-et-eau/services-industriels/particuliers/contact-sil.html";

/** Méga-menu : phrase d'intro et carte « À la une » par rubrique (maquette accueil.html). */
export interface MegaMenuExtra {
  intro?: string;
  feature?: { title: string; image: string; url: string };
}

export const MEGAMENU_EXTRAS: Record<SectionId, MegaMenuExtra> = {
  accueil: {},
  particuliers: {
    intro: "Vous êtes un particulier, un artisan ou un petit commerce?",
    feature: {
      title: "Tarifs de l'électricité 2027: infos en ligne",
      image: "design-sans-titre-1-2026-09-15-14-54-03",
      url: "/vie-pratique/energies-et-eau/services-industriels/particuliers/je-choisis-mon-offre/electricite?tab=tarifs",
    },
  },
  professionnels: {
    feature: {
      title: "Le soleil, une énergie inépuisable",
      image: "carte-500x375-2024-09-05-12-24-26",
      url: "https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels/a-propos-sil/nos-activites/electricite/production/solaire.html",
    },
  },
  partenaires: {},
  "a-propos": {
    intro:
      "Les SiL alimentent l'agglomération lausannoise en électricité, gaz, chaleur et prestations multimédia.",
    feature: {
      title: "Sur la piste des SiL",
      image: "focus-vdl-130ans-2026-09-09-12-21-34",
      url: "https://www.lausanne.ch/sil130",
    },
  },
  carrieres: {
    intro:
      "Production, distribution et services transversaux: des missions variées au service de l'énergie à Lausanne.",
    feature: {
      title: "Nos métiers: diversité et innovation au cœur de l'énergie lausannoise",
      image: "caf-carri-re-internet-2025-08-15-11-53-47",
      url: "/vie-pratique/energies-et-eau/services-industriels/carrieres/nos-metiers.html",
    },
  },
};

export interface FooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

const SIL = "/vie-pratique/energies-et-eau/services-industriels";

/** Colonnes du footer SiL actuel (raw/accueil.html), libellés normalisés. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "À propos",
    links: [
      { label: "Nos activités", url: `${SIL}/a-propos-sil/nos-activites.html` },
      { label: "Publications", url: `${SIL}/a-propos-sil/notre-portrait/publications.html` },
      { label: "Formation", url: `${SIL}/a-propos-sil/c-for.html` },
      { label: "Les SiL", url: `${SIL}/a-propos-sil.html` },
    ],
  },
  {
    title: "Produits",
    links: [
      { label: "Électricité", url: `${SIL}/particuliers/je-choisis-mon-offre/electricite.html` },
      { label: "Chaleur", url: `${SIL}/particuliers/je-choisis-mon-offre/chaleur.html` },
      { label: "Gaz", url: `${SIL}/particuliers/je-choisis-mon-offre/gaz-naturel.html` },
      { label: "Multimédia", url: `${SIL}/particuliers/je-choisis-mon-offre/multimedia.html` },
      { label: "Mobilité", url: `${SIL}/particuliers/je-choisis-mon-offre/mobilite.html` },
      { label: "Solaire", url: `${SIL}/particuliers/je-produis-mon-energie.html` },
      { label: "Conditions générales", url: `${SIL}/a-propos-sil/nos-activites/reglements.html` },
    ],
  },
  {
    title: "Subventions",
    links: [
      {
        label: "Vélo électrique",
        url: "https://www.equiwatt.ch/subventions/scooter-velo-electrique-et-batterie-de-velo.html",
      },
      {
        label: "Batterie pour vélo électrique",
        url: "https://www.equiwatt.ch/subventions/scooter-velo-electrique-et-batterie-de-velo.html",
      },
      {
        label: "Scooter électrique",
        url: "https://www.equiwatt.ch/subventions/scooter-velo-electrique-et-batterie-de-velo.html",
      },
      {
        label: "Électroménager",
        url: "https://www.equiwatt.ch/subventions/20-pourcent-prix-achat-electromenager.html",
      },
      {
        label: "Solaire thermique",
        url: "https://www.equiwatt.ch/subventions/votre-installation-solaire-thermique.html",
      },
      {
        label: "Rénovation énergétique pour les entreprises",
        url: "https://www.equiwatt.ch/subventions/renovation-energetique-de-vos-installations.html",
      },
    ],
  },
  {
    title: "Conseils énergétiques",
    links: [
      { label: "Écogestes quotidiens", url: "https://www.equiwatt.ch/ecogestes.html" },
      {
        label: "Conseils personnalisés",
        url: "https://www.equiwatt.ch/particuliers/conseils-personnalises-en-energie.html",
      },
      {
        label: "Kit d'économies d'énergie",
        url: "https://www.equiwatt.ch/particuliers/kit-economie-energie.html",
      },
      {
        label: "Audit de votre bâtiment",
        url: `${SIL}/particuliers/j-optimise-ma-consommation/renovation-de-mon-bien-immobilier.html`,
      },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Mes factures", url: `${SIL}/particuliers/mon-compte/Mes-factures.html` },
      { label: "Mon déménagement", url: `${SIL}/particuliers/mon-compte/demenagement.html` },
      { label: "Compte pour professionnels", url: `${SIL}/professionnels/compte-pro.html` },
    ],
  },
];

export const FOOTER_ADDRESS = {
  title: "Contact clients",
  lines: ["Service commercial", "Place Chauderon 23", "Case postale 7416, 1001 Lausanne"],
  transitUrl: "https://www.t-l.ch/",
} as const;

export type SocialNetwork = "facebook" | "instagram" | "linkedin" | "youtube" | "x";

export const SOCIAL_LINKS: { network: SocialNetwork; label: string; url: string }[] = [
  {
    network: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/ServicesIndustrielsLausanne",
  },
  { network: "instagram", label: "Instagram", url: "https://www.instagram.com/silausanne/" },
  {
    network: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/services-industriels-de-lausanne",
  },
  {
    network: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com/playlist?list=PLwAwyA_a37w-JxFZWMAiFUXWQXePbSCEq",
  },
  { network: "x", label: "X", url: "https://x.com/communelausanne" },
];

export const LEGAL_LINKS = [
  { label: "Webmaster", url: CONTACT_URL },
  { label: "Mentions légales", url: "https://www.lausanne.ch/hors-arbo/cgu.html" },
];
