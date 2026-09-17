import { BlockRenderer } from "@/blocks/BlockRenderer";
import { BlockContact } from "@/blocks/components/BlockContact";
import { Container } from "@/components/ui";
import type { ContactBlock, SectionId } from "@/content/types";

/**
 * Bloc contact en bandeau pleine largeur en fin de page (DESIGN.md § 11.15 variante `band`, § 12.2) :
 * pages sans aside (rubriques, pages de contenu courtes).
 */
export function ContactBand({
  block,
  pageSlug,
  section,
  logo,
}: {
  block: ContactBlock;
  pageSlug: string;
  section: SectionId;
  logo?: "sil" | "c-for";
}) {
  return (
    <Container className="pb-section-sm">
      <BlockContact
        block={block}
        variant="band"
        logo={logo}
        context={{
          pageSlug,
          section,
          region: "main",
          index: 0,
          siblings: [block],
          renderBlocks: (blocks, region) => (
            <BlockRenderer blocks={blocks} pageSlug={pageSlug} section={section} region={region} />
          ),
        }}
      />
    </Container>
  );
}
