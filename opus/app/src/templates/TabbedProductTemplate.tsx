import { ReceiptText } from "lucide-react";
import { BlockRenderer } from "@/blocks/BlockRenderer";
import { Container } from "@/components/ui";
import type { HeadingBlock } from "@/content/types";
import { PageHero } from "@/layout/PageHero";
import { universeFromSlug } from "@/lib/universe";
import { AnchorNav } from "./parts/AnchorNav";
import { ContentTabs } from "./parts/ContentTabs";
import { ContentWithAside } from "./parts/ContentWithAside";
import { enhanceBlocks } from "./parts/enhanceTabBlocks";
import { ProduitsTab } from "./parts/ProduitsTab";
import { UsefulLinks } from "./parts/UsefulLinks";
import type { TemplateProps } from "./registry";

/**
 * ✅ Page produit à onglets (DESIGN.md § 12.3, maquette mockups/produit-onglets.html).
 * Hero produit, barre d'onglets collante synchronisée avec ?tab=, panneau contenu | aside.
 * L'onglet « Produits » (électricité) a sa propre composition (`ProduitsTab` : cartes produit,
 * réordonnées « défaut » puis « mis en avant »). Les autres onglets passent par `enhanceBlocks`
 * (Callout, Steps, FaqGroup, accordéons compacts, MediaRow…) qui extrait aussi l'aside
 * « Liens utiles » et alimente l'aside « Thèmes » quand l'onglet contient des groupes FAQ.
 */
export default function TabbedProductTemplate({ page }: TemplateProps) {
  const contact = page.blocks.filter((b) => b.type === "contact");
  const otherTopBlocks = page.blocks.filter((b) => b.type !== "contact");
  const rubrique = page.breadcrumb[1];
  const tarifsTab = page.tabs.find((t) => t.id === "tarifs");
  const tarifsYear = tarifsTab?.blocks.find(
    (b): b is HeadingBlock => b.type === "heading" && /^tarifs\s+\d{4}$/i.test(b.text),
  );

  return (
    <>
      <PageHero
        title={page.title}
        lead={page.lead}
        breadcrumb={page.breadcrumb}
        image={page.heroImage}
        tag={
          rubrique && rubrique.slug !== page.slug
            ? { label: rubrique.label, universe: universeFromSlug(page.slug) }
            : undefined
        }
        primaryAction={page.cta[0]}
        secondaryAction={
          tarifsTab
            ? { label: tarifsYear?.text ?? "Tarifs", to: "?tab=tarifs", icon: ReceiptText }
            : undefined
        }
      />
      <ContentTabs
        tabs={page.tabs}
        renderPanel={(tab) => {
          const allBlocks = [...tab.blocks, ...otherTopBlocks];
          const contactAside = contact.length > 0 && (
            <BlockRenderer
              blocks={contact}
              pageSlug={page.slug}
              section={page.section}
              region="aside"
              bare
            />
          );

          if (tab.id === "produits") {
            return (
              <Container>
                <ContentWithAside withTabs aside={contactAside}>
                  <ProduitsTab
                    blocks={allBlocks}
                    pageSlug={page.slug}
                    section={page.section}
                    tabId={tab.id}
                  />
                </ContentWithAside>
              </Container>
            );
          }

          const { nodes, faqGroups, usefulLinks } = enhanceBlocks(allBlocks, {
            pageSlug: page.slug,
            section: page.section,
            tabId: tab.id,
            region: "tab",
          });
          const hasAside = faqGroups.length > 1 || usefulLinks.length > 0 || Boolean(contactAside);

          return (
            <Container>
              <ContentWithAside
                withTabs
                aside={
                  hasAside && (
                    <>
                      {faqGroups.length > 1 && (
                        <AnchorNav
                          items={faqGroups.map((g) => ({
                            id: g.id,
                            label: g.label,
                            count: g.count,
                          }))}
                        />
                      )}
                      {usefulLinks.length > 0 && <UsefulLinks groups={usefulLinks} />}
                      {contactAside}
                    </>
                  )
                }
              >
                <div className="block-flow">{nodes}</div>
              </ContentWithAside>
            </Container>
          );
        }}
      />
    </>
  );
}
