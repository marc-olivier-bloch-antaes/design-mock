import type { ComponentType } from "react";
import type { Block, SectionId } from "@/content/types";
import { cn } from "@/lib/cn";
import { blockRegistry } from "./registry";
import type { BlockContext, BlockProps, BlockRegion } from "./types";

export interface BlockRendererProps {
  blocks: readonly Block[];
  pageSlug: string;
  section: SectionId;
  region?: BlockRegion;
  tabId?: string;
  /** Classe du conteneur. Par défaut `block-flow` (espacement vertical régulier). */
  className?: string;
  /** Rendre les blocs sans conteneur (le parent gère la mise en page). */
  bare?: boolean;
}

/**
 * Rend une liste de blocs en déléguant chaque bloc à son composant du registre.
 * Les gabarits filtrent / regroupent les blocs AVANT de les passer ici (ex. bloc contact dans l'aside).
 */
export function BlockRenderer({
  blocks,
  pageSlug,
  section,
  region = "main",
  tabId,
  className,
  bare,
}: BlockRendererProps) {
  const renderBlocks = (list: readonly Block[], subRegion: BlockRegion) => (
    <BlockRenderer
      blocks={list}
      pageSlug={pageSlug}
      section={section}
      region={subRegion}
      tabId={tabId}
    />
  );

  const children = blocks.map((block, index) => {
    const Component = blockRegistry[block.type] as ComponentType<BlockProps>;
    const context: BlockContext = {
      pageSlug,
      section,
      region,
      tabId,
      index,
      siblings: blocks,
      renderBlocks,
    };
    return <Component key={`${block.type}-${index}`} block={block} context={context} />;
  });

  if (bare) return <>{children}</>;
  return <div className={cn("block-flow", className)}>{children}</div>;
}
