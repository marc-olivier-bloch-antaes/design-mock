/**
 * Registre type de bloc → composant.
 * Ajouter un type dans src/content/types.ts sans l'enregistrer ici = erreur de compilation
 * (le type mappé `BlockRegistry` exige toutes les clés).
 */
import { BlockAccordion } from "./components/BlockAccordion";
import { BlockContact } from "./components/BlockContact";
import { BlockCta } from "./components/BlockCta";
import { BlockDocuments } from "./components/BlockDocuments";
import { BlockGallery } from "./components/BlockGallery";
import { BlockHeading } from "./components/BlockHeading";
import { BlockImage } from "./components/BlockImage";
import { BlockKeyFigures } from "./components/BlockKeyFigures";
import { BlockLinks } from "./components/BlockLinks";
import { BlockList } from "./components/BlockList";
import { BlockParagraph } from "./components/BlockParagraph";
import { BlockTable } from "./components/BlockTable";
import { BlockTeasers } from "./components/BlockTeasers";
import { BlockVideo } from "./components/BlockVideo";
import type { BlockRegistry } from "./types";

export const blockRegistry = {
  heading: BlockHeading,
  paragraph: BlockParagraph,
  list: BlockList,
  image: BlockImage,
  gallery: BlockGallery,
  teasers: BlockTeasers,
  links: BlockLinks,
  documents: BlockDocuments,
  accordion: BlockAccordion,
  table: BlockTable,
  contact: BlockContact,
  keyfigures: BlockKeyFigures,
  cta: BlockCta,
  video: BlockVideo,
} satisfies BlockRegistry;
