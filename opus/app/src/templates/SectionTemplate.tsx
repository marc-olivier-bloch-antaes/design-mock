import { BlockRenderer } from "@/blocks/BlockRenderer";
import { Section, SectionHead } from "@/components/ui";
import type { Block, ContactBlock } from "@/content/types";
import { PageHero } from "@/layout/PageHero";
import { ContactBand } from "./parts/ContactBand";
import type { TemplateProps } from "./registry";

/** Titres de section (absents du CMS) : hiérarchie h1 → h2 → h3 des cartes, repères de lecture. */
const SECTION_TITLES: Partial<Record<Block["type"], { title: string; visible: boolean }>> = {
  teasers: { title: "Nos offres", visible: false },
  links: { title: "Nos domaines d'activité", visible: true },
};
const ACCROCHE_TITLE = "À découvrir";

/**
 * ✅ Page rubrique / sommaire (DESIGN.md § 12.2) : hero simple, puis chaque bloc dans sa section
 * (grille de teasers avec pastilles d'univers, galerie, tuiles de liens `icon-nav`, accroches), titres h2
 * ajoutés (masqués quand la grille se suffit à elle-même), contact en bandeau `band`.
 */
export default function SectionTemplate({ page }: TemplateProps) {
  const ctx = { pageSlug: page.slug, section: page.section } as const;
  const contact = page.blocks.find((b): b is ContactBlock => b.type === "contact");
  const body = page.blocks.filter((b) => b.type !== "contact");
  return (
    <>
      <PageHero title={page.title} lead={page.lead} breadcrumb={page.breadcrumb} />
      <Section>
        <div className="grid gap-section-sm">
          {body.map((block, i) => {
            const head =
              block.type === "teasers" && block.variant === "accroche"
                ? { title: ACCROCHE_TITLE, visible: true }
                : SECTION_TITLES[block.type];
            return (
              <div key={i}>
                {head &&
                  (head.visible ? (
                    <SectionHead title={head.title} />
                  ) : (
                    <h2 className="sr-only">{head.title}</h2>
                  ))}
                <BlockRenderer blocks={[block]} {...ctx} bare />
              </div>
            );
          })}
        </div>
      </Section>
      {contact && <ContactBand block={contact} {...ctx} />}
    </>
  );
}
