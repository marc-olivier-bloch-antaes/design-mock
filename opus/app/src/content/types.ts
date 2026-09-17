/**
 * Modèle de contenu typé de l'app (données NORMALISÉES par `npm run import-content`).
 *
 * La liste des types de blocs n'est pas supposée : elle est vérifiée contre le
 * crawl par `npm run audit-content` (contrat : scripts/lib/crawl-contract.ts).
 * 14 types observés : heading, paragraph, list, image, gallery, teasers, links,
 * documents, accordion, table, contact, keyfigures, cta, video.
 *
 * Toute évolution ici ⇒ mettre à jour le contrat, le normaliseur
 * (scripts/lib/normalize.ts) et le registre (src/blocks/registry.ts) — TypeScript
 * signalera le composant manquant dans le registre.
 */

/** HTML inline assaini à l'import : uniquement a / strong / em / br / sup / sub. À rendre avec <RichText>. */
export type InlineHtml = string;

/** Identifiant d'image : clé de `src/content/images.json` (à rendre avec <ResponsiveImage>). */
export type ImageId = string;

export type SectionId =
  "accueil" | "particuliers" | "professionnels" | "partenaires" | "a-propos" | "carrieres";

/**
 * Cible de lien normalisée. Règle de résolution (voir src/lib/links.ts) :
 * 1. `slug` → page crawlée (lien interne <Link>, `tab` ajouté en ?tab=) ;
 * 2. `route` → page du menu non crawlée (rubrique ou « hors périmètre ») ;
 * 3. sinon lien sortant `url` (icône ArrowUpRight si `external`).
 */
export interface LinkTarget {
  url: string;
  /** true si le domaine n'est pas lausanne.ch. */
  external: boolean;
  slug?: string;
  tab?: string;
  route?: string;
}

export interface LinkItem extends LinkTarget {
  label: string;
}

/* ------------------------------------------------------------------ Blocs */

export interface HeadingBlock {
  type: "heading";
  /** Niveau sémantique remappé (h2 = premier niveau de la liste de blocs ; h4 dans un accordéon). */
  level: 2 | 3 | 4 | 5 | 6;
  /** Niveau d'origine dans le CMS (h2–h5), utile aux heuristiques (ex. h5 d'intro → Callout). */
  sourceLevel: 2 | 3 | 4 | 5;
  text: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  html: InlineHtml;
}

export interface ListBlock {
  type: "list";
  ordered: boolean;
  items: InlineHtml[];
}

export interface ImageBlock {
  type: "image";
  src: ImageId;
  /** "" si l'alt d'origine n'était qu'un crédit (déplacé dans `caption`). */
  alt: string;
  /** Crédit / légende (« © Ville de Lausanne »), ou null. */
  caption: string | null;
}

export interface GalleryItem {
  src: ImageId;
  alt: string;
  caption: string | null;
}

export interface GalleryBlock {
  type: "gallery";
  title: string | null;
  items: GalleryItem[];
}

export type TeasersVariant = "grid" | "carousel" | "accroche";

export interface TeaserItem extends LinkTarget {
  title: string;
  text: InlineHtml;
  image: ImageId;
}

export interface TeasersBlock {
  type: "teasers";
  title: string | null;
  variant: TeasersVariant;
  items: TeaserItem[];
}

/** `null` = simple liste de liens (pas de variante dans le CMS). */
export type LinksVariant = "icon-nav" | "news" | null;

export interface LinksBlock {
  type: "links";
  title: string | null;
  variant: LinksVariant;
  items: LinkItem[];
}

export type DocumentFormat = "PDF" | "DOCX" | "JSON" | "LINK";

export interface DocumentItem {
  label: string;
  url: string;
  format: DocumentFormat;
  /** « 286 Ko », « 1 Mo », ou null. */
  size: string | null;
  date: string | null;
}

export interface DocumentsBlock {
  type: "documents";
  title: string | null;
  items: DocumentItem[];
}

export interface AccordionItem {
  title: string;
  blocks: Block[];
}

export interface AccordionBlock {
  type: "accordion";
  items: AccordionItem[];
}

export interface TableBlock {
  type: "table";
  /** [] quand le CMS n'a pas d'en-têtes (cas le plus fréquent : en-têtes perdus au crawl). */
  headers: InlineHtml[];
  rows: InlineHtml[][];
}

export interface ContactBlock {
  type: "contact";
  title: string;
  /** Lignes d'adresse, titre répété retiré, « Case postale … » sur sa propre ligne. */
  lines: string[];
  logo: ImageId;
  links: LinkItem[];
}

export interface KeyFigureItem {
  value: string;
  label: string;
}

export interface KeyFiguresBlock {
  type: "keyfigures";
  title: string;
  items: KeyFigureItem[];
}

export interface CtaBlock extends LinkTarget {
  type: "cta";
  label: string;
}

export type EmbedProvider = "datawrapper" | "google-maps" | "youtube" | "other";

export interface VideoBlock {
  type: "video";
  url: string;
  /** Déduit du domaine à l'import. */
  provider: EmbedProvider;
}

/** Union discriminée de tous les blocs. */
export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | GalleryBlock
  | TeasersBlock
  | LinksBlock
  | DocumentsBlock
  | AccordionBlock
  | TableBlock
  | ContactBlock
  | KeyFiguresBlock
  | CtaBlock
  | VideoBlock;

export type BlockType = Block["type"];

/** Extrait le type de bloc correspondant à un discriminant : BlockOf<"image"> = ImageBlock. */
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

/* ------------------------------------------------------------------ Pages */

export interface Tab {
  id: string;
  label: string;
  blocks: Block[];
}

export interface Crumb extends LinkTarget {
  label: string;
}

export interface Page {
  slug: string;
  /** URL d'origine sur lausanne.ch. */
  url: string;
  /** Route de l'app, ex. /particuliers/je-choisis-mon-offre/electricite. */
  path: string;
  /** Titre affiché (H1), normalisé : « Électricité » (sans « - Produits »). */
  title: string;
  /** Titre brut du CMS. */
  sourceTitle: string;
  section: SectionId;
  breadcrumb: Crumb[];
  lead: InlineHtml | null;
  heroImage: ImageId | null;
  cta: LinkItem[];
  tabs: Tab[];
  blocks: Block[];
}

/** Entrée du manifeste (src/content/manifest.json) : tout sauf le contenu, pour le routage et les menus. */
export interface PageSummary {
  slug: string;
  path: string;
  url: string;
  title: string;
  sourceTitle: string;
  section: SectionId;
  parentSlug: string | null;
  hasHeroImage: boolean;
  tabs: { id: string; label: string }[];
  /** Types de blocs présents (récursif, onglets compris), triés. */
  blockTypes: BlockType[];
}

/* ------------------------------------------------------------- Navigation */

/**
 * - `page` : page crawlée (a un `slug`) ;
 * - `rubrique` : entrée racine (Particuliers…), page « vue d'ensemble » générée depuis le menu ;
 * - `out-of-scope` : page existante sur lausanne.ch mais non reprise dans le prototype.
 */
export type NavKind = "page" | "rubrique" | "out-of-scope";

export interface NavNode {
  /** Identifiant stable (chemin sans « / » initial, « / » → « -- »). */
  id: string;
  label: string;
  url: string;
  /** Route de l'app (canonique pour une page crawlée). */
  path: string;
  kind: NavKind;
  slug?: string;
  /** Rubriques uniquement. */
  section?: SectionId;
  /** Espace authentifié (Mon Compte, Compte Pro) : non crawlable. */
  requiresLogin?: boolean;
  children: NavNode[];
}

export interface Navigation {
  mainMenu: NavNode[];
  /** Anciennes URL (alias) → route canonique, ex. /partenaires/reglements → /a-propos-sil/nos-activites/reglements. */
  redirects: { from: string; to: string }[];
}

/* ----------------------------------------------------------------- Images */

export interface ImageSource {
  width: number;
  src: string;
}

export interface ImageAsset {
  width: number;
  height: number;
  /** `contain` pour schémas / visuels contenant du texte (ne jamais recadrer). */
  fit: "cover" | "contain";
  /** Absent pour les SVG. Trié par largeur croissante. */
  avif?: ImageSource[];
  webp?: ImageSource[];
  /** URL de repli (plus grande variante WebP, ou le SVG). */
  fallback: string;
}

export type ImageManifest = Record<ImageId, ImageAsset>;
