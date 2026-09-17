import type { ComponentType, ReactNode } from "react";
import type { Block, BlockOf, BlockType, SectionId } from "@/content/types";

/** Zone où une liste de blocs est rendue : permet d'adapter tailles et variantes. */
export type BlockRegion = "main" | "tab" | "aside" | "accordion";

export interface BlockContext {
  pageSlug: string;
  section: SectionId;
  region: BlockRegion;
  /** Onglet courant (pages à onglets). */
  tabId?: string;
  /** Position du bloc et liste complète : heuristiques de voisinage (titre avant un accordéon, image après un titre…). */
  index: number;
  siblings: readonly Block[];
  /** Rend une sous-liste de blocs (accordéon récursif) sans import circulaire du BlockRenderer. */
  renderBlocks: (blocks: readonly Block[], region: BlockRegion) => ReactNode;
}

export interface BlockProps<T extends Block = Block> {
  block: T;
  context: BlockContext;
}

export type BlockComponent<T extends BlockType> = ComponentType<BlockProps<BlockOf<T>>>;

/** Registre exhaustif : TypeScript exige un composant pour CHAQUE type de l'union `Block`. */
export type BlockRegistry = { [T in BlockType]: BlockComponent<T> };
