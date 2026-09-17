import {
  BadgePercent,
  Cable,
  CircleUser,
  Clock,
  Gauge,
  GraduationCap,
  Lightbulb,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  Tags,
  TriangleAlert,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AccordionList } from "@/blocks/components/Accordion";
import { BlockRenderer } from "@/blocks/BlockRenderer";
import {
  ArrowLink,
  ButtonLink,
  Card,
  Heading,
  Icon,
  RichText,
  Section,
  SectionHead,
  htmlToText,
} from "@/components/ui";
import type { Block, ContactBlock } from "@/content/types";
import { PageHero } from "@/layout/PageHero";
import { extractSingleLink } from "@/lib/extractLinks";
import { Callout } from "./parts/Callout";
import { ContactBand } from "./parts/ContactBand";
import { withoutFlattenedForm } from "./parts/contactForm";
import type { TemplateProps } from "./registry";

type Of<T extends Block["type"]> = Extract<Block, { type: T }>;

/**
 * Sujets du formulaire « Nous écrire » (DESIGN.md § 12.5) : le formulaire lui-même a été aplati par le
 * crawl (blocs filtrés par `withoutFlattenedForm`), seule la liste des sujets est reprise, en dur.
 */
const TOPICS: { label: string; icon: LucideIcon }[] = [
  { label: "Adresse et déménagement", icon: Truck },
  { label: "Compteur / Compteur intelligent", icon: Gauge },
  { label: "Consommation et factures", icon: Receipt },
  { label: "Dépannage et coupure", icon: Wrench },
  { label: "Subvention 80", icon: BadgePercent },
  { label: "Tarifs et prestations", icon: Tags },
  { label: "Mon compte / Compte pro", icon: CircleUser },
  { label: "Conseils énergétiques", icon: Lightbulb },
  { label: "Formation", icon: GraduationCap },
  { label: "Raccordement au réseau", icon: Cable },
  { label: "Contrôle", icon: ShieldCheck },
  { label: "Pénurie", icon: TriangleAlert },
];

/** Bloc suivant le premier heading dont le texte correspond. */
function after<T extends Block["type"]>(blocks: Block[], re: RegExp, type: T): Of<T> | undefined {
  const i = blocks.findIndex((b) => b.type === "heading" && re.test(b.text));
  return blocks.slice(i + 1).find((b): b is Of<T> => b.type === type);
}

/** « Questions administratives: » → « Questions administratives ». */
const label = (html: string) => htmlToText(html).replace(/\s*:\s*$/, "");

/**
 * ✅ Page contact (DESIGN.md § 12.5, § 14.9) — fiche 20.
 * Tableaux 2 colonnes du CMS (lieux/horaires, lignes/horaires, professionnels) → `dl` et cartes, jamais `<table>`.
 */
export default function ContactTemplate({ page }: TemplateProps) {
  const ctx = { pageSlug: page.slug, section: page.section } as const;
  const blocks = withoutFlattenedForm(page.blocks);
  const contact = blocks.find((b): b is ContactBlock => b.type === "contact");

  // Au guichet et par téléphone
  const phoneHeading = blocks.find(
    (b): b is Of<"heading"> => b.type === "heading" && /^T[ée]l\./.test(b.text),
  );
  const phoneDisplay = phoneHeading?.text.replace(/^T[ée]l\.\s*|\s*\*$/g, "") ?? "021 315 88 88";
  const phoneHref = `tel:+41${phoneDisplay.replace(/\D/g, "").replace(/^0/, "")}`;
  const phoneRows = after(blocks, /^T[ée]l\./, "table")?.rows ?? [];
  const urgentRow = phoneRows.find((r) => /urgence/i.test(r[0] ?? ""));
  const hoursRows = phoneRows.filter((r) => r !== urgentRow);
  const counters = after(blocks, /espace clients/i, "table")?.rows ?? [];
  const guichetIntro = after(blocks, /guichet/i, "paragraph");
  const recordingNote = blocks.find(
    (b): b is Of<"paragraph"> => b.type === "paragraph" && b.html.trim().startsWith("*"),
  );

  // FAQ
  const faqIntro = after(blocks, /foire aux questions/i, "paragraph");
  const faq = after(blocks, /foire aux questions/i, "accordion");
  const faqAll = blocks
    .filter((b): b is Of<"paragraph"> => b.type === "paragraph")
    .map((b) => extractSingleLink(b.html))
    .find((l) => l && /faq/i.test(l.label));

  // Professionnels
  const pro = after(blocks, /^professionnels$/i, "table")?.rows[0];

  return (
    <>
      <PageHero title={page.title} lead={page.lead} breadcrumb={page.breadcrumb} />

      <Section aria-labelledby="guichet-telephone">
        <SectionHead
          titleId="guichet-telephone"
          title="Au guichet et par téléphone"
          description={guichetIntro && htmlToText(guichetIntro.html)}
        />
        <div className="grid gap-grid lg:grid-cols-3">
          <Card className="flex flex-col gap-5">
            <Heading level={3} size="h4" className="flex items-center gap-2">
              <Icon icon={Phone} className="text-link" /> Par téléphone
            </Heading>
            <ButtonLink url={phoneHref} size="lg" icon={Phone} block>
              {phoneDisplay}
              <span aria-hidden="true">*</span>
            </ButtonLink>
            <dl className="grid gap-3">
              {hoursRows.map(([term = "", value = ""]) => (
                <div key={term}>
                  <dt className="font-semibold">{label(term)}</dt>
                  <RichText as="dd" html={value} prose={false} className="text-muted" />
                </div>
              ))}
            </dl>
          </Card>

          <Card className="flex flex-col gap-5">
            <Heading level={3} size="h4" className="flex items-center gap-2">
              <Icon icon={TriangleAlert} className="text-danger" /> Urgences ou pannes
            </Heading>
            {urgentRow && (
              <Callout variant="urgent" html={urgentRow[1]!.replace(/<br>\s*/g, " — ")} />
            )}
            <p className="text-muted">
              Même numéro : <a href={phoneHref}>{phoneDisplay}</a>
            </p>
          </Card>

          <Card className="flex flex-col gap-5">
            <Heading level={3} size="h4" className="flex items-center gap-2">
              <Icon icon={MapPin} className="text-link" /> Au guichet — Espace clients
            </Heading>
            <ul role="list" className="grid gap-4">
              {counters.map(([place = "", hours = ""]) => (
                <li key={place} className="grid gap-1">
                  <span className="flex items-center gap-2 font-semibold">
                    <Icon icon={MapPin} size="sm" className="text-muted" />
                    {htmlToText(place)}
                  </span>
                  <span className="flex items-start gap-2 text-muted">
                    <Icon icon={Clock} size="sm" className="mt-1 shrink-0" />
                    <RichText as="span" html={hours} prose={false} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        {recordingNote && (
          <RichText
            as="p"
            html={recordingNote.html}
            prose={false}
            className="mt-5 max-w-(--sil-measure) text-sm text-muted"
          />
        )}
      </Section>

      {faq && (
        <Section tone="subtle" aria-labelledby="faq">
          <SectionHead
            titleId="faq"
            title="Foire aux questions"
            description={faqIntro && htmlToText(faqIntro.html)}
          />
          <div className="grid max-w-(--sil-container-prose) gap-5">
            <AccordionList
              items={faq.items}
              defaultOpenIndex={0}
              renderBlocks={(list, region) => (
                <BlockRenderer blocks={list} {...ctx} region={region} />
              )}
            />
            {faqAll && (
              <ArrowLink target={faqAll} externalIcon>
                Consulter toutes nos questions (FAQ)
              </ArrowLink>
            )}
          </div>
        </Section>
      )}

      <Section aria-labelledby="nous-ecrire">
        <SectionHead
          titleId="nous-ecrire"
          title="Nous écrire"
          description="Sélectionnez le sujet de votre demande dans le formulaire en ligne."
        />
        <ul role="list" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TOPICS.map((t) => (
            <li
              key={t.label}
              className="flex min-h-18 min-w-0 flex-col items-start gap-2.5 rounded-card border border-border-default bg-surface p-3.5 leading-snug font-semibold hyphens-auto sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-brand-subtle text-link">
                <Icon icon={t.icon} size="md" />
              </span>
              {t.label}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {/* Le formulaire n'est pas reproduit dans le prototype : renvoi vers la page actuelle. */}
          <ButtonLink url={page.url} variant="secondary">
            Accéder au formulaire sur lausanne.ch
          </ButtonLink>
        </div>
      </Section>

      {pro && (
        <Section spacing="sm" className="pt-0" aria-labelledby="professionnels">
          <SectionHead titleId="professionnels" title="Professionnels" />
          <Card className="grid max-w-3xl gap-6 md:grid-cols-2">
            <RichText as="p" html={pro[0] ?? ""} prose className="leading-relaxed" />
            <p className="flex items-start gap-2 text-muted">
              <Icon icon={Clock} size="sm" className="mt-1 shrink-0" />
              <RichText as="span" html={pro[1] ?? ""} prose={false} />
            </p>
          </Card>
        </Section>
      )}

      {contact && <ContactBand block={contact} {...ctx} />}
    </>
  );
}
