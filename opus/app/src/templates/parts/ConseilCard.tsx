import { ArrowRight } from "lucide-react";
import { ButtonLink, Heading, RichText, type HeadingLevel } from "@/components/ui";
import type { LinkTarget } from "@/content/types";

/**
 * Encart d'appel à l'action (DESIGN.md § 11.16) : titre court isolé suivi d'un seul `cta` dans le CMS
 * (ex. « Vous souhaitez un conseil? » + « Contactez-nous »), ou d'un paragraphe contenant le lien
 * (`html`, ex. « Obtenez rapidement vos plans de réseaux… »). Empilé sur mobile, en ligne ≥ sm.
 */
export function ConseilCard({
  title,
  level,
  label,
  target,
  html,
}: {
  title: string;
  level: HeadingLevel;
  label?: string;
  target?: LinkTarget;
  html?: string;
}) {
  return (
    <div className="flex max-w-(--sil-container-prose) flex-col gap-4 rounded-card bg-surface-brand-subtle p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <Heading level={level} size="h4" className="text-green-900">
          {title}
        </Heading>
        {html && <RichText as="p" html={html} />}
      </div>
      {target && label && (
        <ButtonLink target={target} trailingIcon={ArrowRight} className="shrink-0">
          {label}
        </ButtonLink>
      )}
    </div>
  );
}
