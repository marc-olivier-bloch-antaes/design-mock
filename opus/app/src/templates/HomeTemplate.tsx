import { ArrowRight, Building2, Handshake, House } from "lucide-react";
import { BlockRenderer } from "@/blocks/BlockRenderer";
import { KeyFigures } from "@/blocks/components/BlockKeyFigures";
import { NewsList } from "@/blocks/components/BlockLinks";
import {
  ArrowLink,
  ButtonLink,
  Container,
  Eyebrow,
  Icon,
  ResponsiveImage,
  RichText,
  Section,
  SectionHead,
  SmartLink,
} from "@/components/ui";
import { CONTACT_URL, KEY_FIGURES } from "@/config/site";
import type { Block, BlockOf } from "@/content/types";
import { Carousel } from "./parts/Carousel";
import { CtaBand } from "./parts/CtaBand";
import type { TemplateProps } from "./registry";

const HERO_IMAGE = "back-business-2000x1334-2025-12-16-11-50-29";
const NEWS_SEE_ALL_URL = "https://www.lausanne.ch/apps/actualites/index.php";

function findBlock<T extends Block["type"]>(
  blocks: Block[],
  type: T,
  predicate: (b: BlockOf<T>) => boolean = () => true,
) {
  return blocks.find((b): b is BlockOf<T> => b.type === type && predicate(b as BlockOf<T>));
}

/**
 * ✅ Accueil (DESIGN.md § 12.1, maquette mockups/accueil.html).
 * Hero (texte, CTA, profils, image + carte « À la une » débordant de 40 px ≥ lg), grille d'univers,
 * `Carousel` (flèches + progression), accroches, `NewsList` + `KeyFigures` (7/12 + 5/12), bandeau CTA.
 * Le bloc `contact` de la page n'est pas rendu ici : il alimente uniquement la colonne marque du footer.
 */
export default function HomeTemplate({ page }: TemplateProps) {
  const ctx = { pageSlug: page.slug, section: page.section } as const;
  const universes = findBlock(page.blocks, "links", (b) => b.variant === "icon-nav");
  const carousel = findBlock(page.blocks, "teasers", (b) => b.variant === "carousel");
  const prompts = findBlock(page.blocks, "teasers", (b) => b.variant === "accroche");
  const news = findBlock(page.blocks, "links", (b) => b.variant === "news");
  const featured = carousel?.items.find((i) => i.slug);
  // Le lead commence par la phrase du H1 : on garde la suite (après le premier <br>).
  const lead =
    page.lead
      ?.split(/<br\s*\/?>/i)
      .slice(1)
      .join(" ")
      .trim() || page.lead;

  return (
    <>
      <section className="pt-6 pb-section-sm lg:pt-14">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Services industriels de Lausanne</Eyebrow>
            <h1 className="text-display text-balance" tabIndex={-1} data-route-focus>
              Bienvenue dans le monde de l&apos;énergie<span className="text-accent">.</span>
            </h1>
            {lead && (
              <RichText
                as="p"
                html={lead}
                prose={false}
                className="mt-5 max-w-xl text-lead text-neutral-700 [&_strong]:font-bold"
              />
            )}
            <div className="mt-7 flex flex-wrap gap-3 max-sm:[&>*]:flex-[1_1_100%]">
              <ButtonLink to="#offres" size="lg" trailingIcon={ArrowRight}>
                Je choisis mon offre
              </ButtonLink>
              <ButtonLink url={CONTACT_URL} variant="secondary" size="lg">
                Nous contacter
              </ButtonLink>
            </div>
            <div className="mt-8 hidden border-t border-border-default pt-6 lg:block">
              <ProfileChips />
            </div>
          </div>
          <div className="relative">
            <ResponsiveImage
              src={HERO_IMAGE}
              alt=""
              priority
              sizes="(min-width: 64rem) 50vw, 100vw"
              fit="cover"
              className="aspect-4/3 rounded-xl lg:aspect-[5/4.4] lg:rounded-2xl"
            />
            {featured && (
              <SmartLink
                target={featured}
                className="relative mx-3 -mt-12 flex items-center gap-3.5 rounded-card bg-white p-3 pr-4 text-ink no-underline shadow-lg lg:absolute lg:bottom-8 lg:-left-10 lg:mx-0 lg:mt-0 lg:max-w-96"
              >
                <ResponsiveImage
                  src={featured.image}
                  alt=""
                  sizes="64px"
                  fit="cover"
                  wrapperClassName="shrink-0"
                  className="size-16 rounded-md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-red-600">À la une</span>
                  <span className="block leading-snug font-[650]">{featured.title}</span>
                </span>
                <Icon icon={ArrowRight} className="text-link" />
              </SmartLink>
            )}
          </div>
          <div className="border-t border-border-default pt-6 lg:hidden">
            <ProfileChips />
          </div>
        </Container>
      </section>

      {universes && (
        <Section id="offres" spacing="sm" aria-labelledby="offres-titre" className="scroll-mt-24">
          <SectionHead
            titleId="offres-titre"
            title="Je choisis mon offre"
            action={
              <ArrowLink to="/particuliers/je-choisis-mon-offre">Toutes nos offres</ArrowLink>
            }
          />
          <BlockRenderer blocks={[universes]} {...ctx} bare />
        </Section>
      )}

      {carousel && (
        <Section tone="subtle" aria-labelledby="une-titre">
          <Carousel title="À la une" items={carousel.items} />
        </Section>
      )}

      {prompts && (
        <Section aria-labelledby="projets-titre">
          <SectionHead titleId="projets-titre" title="Vos projets" />
          <BlockRenderer blocks={[prompts]} {...ctx} bare />
        </Section>
      )}

      {news && (
        <Section tone="subtle" aria-labelledby="news-titre">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-12">
            <div>
              <h2 id="news-titre" className="mb-stack text-h2">
                {news.title ?? "Quoi de neuf ?"}
              </h2>
              <NewsList items={news.items} seeAllUrl={NEWS_SEE_ALL_URL} />
            </div>
            <KeyFigures
              title={KEY_FIGURES.title}
              items={[...KEY_FIGURES.items]}
              variant="brand"
              columns={2}
            />
          </div>
        </Section>
      )}

      <CtaBand />
    </>
  );
}

function ProfileChips() {
  const chips = [
    { label: "Particulier", to: "/particuliers", icon: House },
    { label: "Professionnel", to: "/professionnels", icon: Building2 },
    { label: "Partenaire", to: "/partenaires", icon: Handshake },
  ];
  return (
    <>
      <p className="mb-3 text-sm font-semibold text-muted">Vous êtes :</p>
      <ul role="list" className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <li key={c.to}>
            <SmartLink
              to={c.to}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-surface-muted pr-4 pl-3 text-[0.9375rem] font-semibold text-ink no-underline hover:bg-green-50"
            >
              <Icon icon={c.icon} size="button" className="text-green-700" />
              {c.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </>
  );
}
