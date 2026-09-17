import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink, Container, Icon, ResponsiveImage, RichText } from "@/components/ui";
import type { Crumb, ImageId, LinkItem } from "@/content/types";
import { cn } from "@/lib/cn";
import { UNIVERSES, type Universe } from "@/lib/universe";
import { Breadcrumb } from "./Breadcrumb";

export interface PageHeroProps {
  title: string;
  /** HTML inline du chapeau (`page.lead`). */
  lead?: string | null;
  breadcrumb?: Crumb[];
  /** Variante « produit » si une image est fournie (grille 7/5), sinon « simple » (DESIGN.md § 11.7). */
  image?: ImageId | null;
  /** Tag d'univers (pastille colorée + libellé de rubrique). */
  tag?: { label: string; universe?: Universe };
  /** CTA principal (`page.cta[0]`). */
  primaryAction?: LinkItem;
  /** Action secondaire contextuelle (ex. raccourci vers l'onglet Tarifs). */
  secondaryAction?: { label: string; to: string; icon?: LucideIcon };
  children?: ReactNode;
}

/** Hero de page intérieure. Porte l'unique h1 de la page. */
export function PageHero({
  title,
  lead,
  breadcrumb,
  image,
  tag,
  primaryAction,
  secondaryAction,
  children,
}: PageHeroProps) {
  const universe = tag?.universe ? UNIVERSES[tag.universe] : undefined;
  return (
    <div className="bg-surface-subtle pt-1 pb-10 md:pt-4 md:pb-14 lg:pt-5 lg:pb-16">
      <Container>
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        <div
          className={cn(
            "mt-3 grid gap-7",
            image && "lg:mt-7 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16",
          )}
        >
          <div className={cn(!image && "max-w-3xl")}>
            {tag && (
              <p
                className={cn(
                  "mb-4 inline-flex min-h-8 items-center gap-2 rounded-pill pr-3 pl-1.5 text-sm font-[650]",
                  universe
                    ? [universe.soft, universe.ink].join(" ")
                    : "bg-surface-muted text-neutral-700",
                )}
              >
                {universe && (
                  <span className="grid size-[22px] place-items-center rounded-full bg-white">
                    <Icon icon={universe.icon} size="xs" />
                  </span>
                )}
                {tag.label}
              </p>
            )}
            <h1 className="text-h1 text-balance" tabIndex={-1} data-route-focus>
              {title}
            </h1>
            {lead && (
              <RichText
                as="p"
                html={lead}
                prose={false}
                className="mt-4 max-w-160 text-lead text-neutral-700 [&_strong]:font-bold"
              />
            )}
            {(primaryAction || secondaryAction) && (
              <div className="mt-7 flex flex-wrap gap-3 max-sm:[&>*]:flex-[1_1_100%]">
                {primaryAction && (
                  <ButtonLink target={primaryAction} trailingIcon={ArrowRight}>
                    {primaryAction.label}
                  </ButtonLink>
                )}
                {secondaryAction && (
                  <ButtonLink
                    to={secondaryAction.to}
                    variant="secondary"
                    icon={secondaryAction.icon}
                    preventScrollReset
                  >
                    {secondaryAction.label}
                  </ButtonLink>
                )}
              </div>
            )}
            {children}
          </div>
          {image && (
            <ResponsiveImage
              src={image}
              alt=""
              priority
              sizes="(min-width: 64rem) 40vw, 100vw"
              fit="cover"
              className="aspect-video rounded-lg lg:aspect-4/3 lg:rounded-xl"
            />
          )}
        </div>
      </Container>
    </div>
  );
}
