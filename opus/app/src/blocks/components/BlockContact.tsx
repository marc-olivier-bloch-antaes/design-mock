import { Bus, Clock, Phone } from "lucide-react";
import { ButtonLink, Icon, Logo, SmartLink, SocialIcon } from "@/components/ui";
import { images } from "@/content";
import type { ContactBlock } from "@/content/types";
import { PHONE } from "@/config/site";
import type { SocialNetwork } from "@/config/site";
import type { BlockProps } from "../types";

const SOCIAL: Record<string, SocialNetwork> = {
  facebook: "facebook",
  instagram: "instagram",
  linkedin: "linkedin",
  youtube: "youtube",
};

export type ContactVariant = "aside" | "band";

/**
 * ✅ Carte contact (DESIGN.md § 11.15). `aside` : colonne collante bordée. `band` : bandeau pleine largeur
 * neutral-50 en 3 colonnes ≥ lg (logo/adresse | téléphone | CTA), empilé sur mobile. Le téléphone n'est pas
 * dans le bloc CMS : donnée globale `PHONE` (config/site.ts), affichée sauf si le bloc en fournit déjà un.
 */
export function BlockContact({
  block,
  variant = "aside",
  logo,
}: BlockProps<ContactBlock> & { variant?: ContactVariant; logo?: "sil" | "c-for" }) {
  const transit = block.links.find((l) => /t-l\.ch/.test(l.url));
  const primary = block.links.find(
    (l) => !l.external && !/t-l\.ch/.test(l.url) && !l.url.startsWith("tel:"),
  );
  const socials = block.links.filter((l) => SOCIAL[l.label.toLowerCase()]);
  const blockPhone = block.links.find((l) => l.url.startsWith("tel:"));
  const isCFor = logo === "c-for" || block.logo === "logo-c-for";
  const cForLogo = images["logo-c-for"];

  // Logo du bloc CMS : C-FOR (page a-propos-c-for) ou SiL par défaut.
  const logoEl =
    isCFor && cForLogo ? (
      <img src={cForLogo.fallback} alt="C-FOR!" className="h-10 w-auto self-start" />
    ) : (
      <Logo className="h-[22px]" alt="" />
    );

  const address = (
    <address className="leading-normal not-italic">
      <strong className="block font-bold">{block.title}</strong>
      {block.lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </address>
  );

  const phoneLine = (
    <div>
      <a
        href={blockPhone?.url ?? PHONE.href}
        className="inline-flex items-center gap-2 text-xl font-[750] tracking-[-0.01em] text-ink no-underline"
      >
        <Icon icon={Phone} size="button" className="text-link" />
        {blockPhone?.label ?? PHONE.display}
      </a>
      {/* Horaires de la ligne principale uniquement : ceux d'un numéro propre au bloc sont inconnus
          (ou déjà dans les lignes d'adresse, ex. « lun-ven 07h30 à 12h00 »). */}
      {!blockPhone && (
        <p className="mt-1 flex items-center gap-1.5 pl-[26px] text-sm text-muted">
          <Icon icon={Clock} size="sm" />
          {PHONE.hours}
        </p>
      )}
    </div>
  );

  const transitLine = transit && (
    <SmartLink
      target={transit}
      className="inline-flex min-h-11 items-center gap-2 font-semibold text-link hover:text-link-hover"
    >
      <Icon icon={Bus} size="button" />
      S&apos;y rendre en transports publics
    </SmartLink>
  );

  const socialList = socials.length > 0 && (
    <ul className="-ml-2.5 flex gap-1" role="list">
      {socials.map((s) => (
        <li key={s.url}>
          <a
            href={s.url}
            rel="noopener noreferrer"
            aria-label={`${s.label} (site externe)`}
            className="grid size-11 place-items-center rounded-full text-neutral-700 hover:bg-surface-muted hover:text-ink"
          >
            <SocialIcon network={SOCIAL[s.label.toLowerCase()]!} />
          </a>
        </li>
      ))}
    </ul>
  );

  const cta = primary && (
    <ButtonLink target={primary} block>
      {primary.label}
    </ButtonLink>
  );

  if (variant === "band") {
    return (
      <section
        aria-label={block.title}
        className="grid gap-8 rounded-xl border border-border-default bg-surface-subtle p-6 md:p-9 lg:grid-cols-3 lg:items-center"
      >
        <div className="grid gap-4">
          {logoEl}
          {address}
          {transitLine}
        </div>
        {phoneLine}
        <div className="grid gap-4 lg:justify-items-end">
          {cta}
          {socialList}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={block.title}
      className="grid gap-4 rounded-card border border-border-default bg-surface p-6"
    >
      {logoEl}
      {address}
      {phoneLine}
      {transitLine}
      {cta}
      {socialList}
    </section>
  );
}
