import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardTitle,
  Eyebrow,
  Icon,
  ResponsiveImage,
  RichText,
  SmartLink,
  stretchedLinkClass,
} from "@/components/ui";
import type { TeaserItem, TeasersBlock } from "@/content/types";
import { cn } from "@/lib/cn";
import { UNIVERSES, universeFromLabel } from "@/lib/universe";
import type { BlockProps } from "../types";

/**
 * ✅ Cartes teaser / carrousel / accroches (DESIGN.md § 11.10).
 * Fait : carte teaser (image 4:3, zoom 1.04 au survol, titre lien étiré, texte 3 lignes, pied « En savoir
 * plus » / « Site partenaire »), grille 1 → 2 → 3 colonnes, carrousel scroll-snap natif (largeurs
 * 82 % / 2.15 / 3.25 cartes visibles, débord à droite), carte d'accroche horizontale (vignette 104 px
 * mobile / 200 px ≥ lg, grille 2×2 sur l'accueil), pastille d'univers sur les cartes de la grille rubrique.
 * Le carrousel « À la une » de l'accueil utilise `templates/parts/Carousel.tsx` (flèches en en-tête de
 * section + barre de progression) : ce composant reste le rendu par défaut (scroll-snap simple, sans
 * flèches) pour un carrousel générique dans le flux de blocs (ex. C-FOR, un seul teaser).
 */
export function BlockTeasers({ block }: BlockProps<TeasersBlock>) {
  if (block.variant === "accroche") {
    return (
      <ul role="list" className="grid gap-grid md:grid-cols-2">
        {block.items.map((item) => (
          <li key={item.url}>
            <PromptCard item={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.variant === "carousel") {
    return (
      <ul
        role="list"
        className="-mx-gutter scrollbar-none flex snap-x snap-mandatory gap-grid overflow-x-auto px-gutter pb-2"
      >
        {block.items.map((item) => (
          <li
            key={item.url + item.title}
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-2*var(--sil-grid-gap))/2.15)] lg:w-[calc((100%-3*var(--sil-grid-gap))/3.25)]"
          >
            <TeaserCard item={item} className="h-full" />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul role="list" className="grid gap-grid md:grid-cols-2 lg:grid-cols-3">
      {block.items.map((item) => (
        <li key={item.url}>
          <TeaserCard item={item} className="h-full" showUniverse />
        </li>
      ))}
    </ul>
  );
}

export function TeaserCard({
  item,
  className,
  showUniverse = false,
  eyebrow,
}: {
  item: TeaserItem;
  className?: string;
  /** Surtitre (catégorie d'offre) au-dessus du titre. */
  eyebrow?: string;
  /** Pastille d'univers en surimpression de l'image (grille de la page rubrique, DESIGN.md § 2.4). */
  showUniverse?: boolean;
}) {
  const universeId = showUniverse ? universeFromLabel(item.title) : undefined;
  const universe = universeId ? UNIVERSES[universeId] : undefined;
  return (
    <Card interactive padding="none" className={cn("group flex flex-col", className)}>
      {universe && (
        <span
          className={cn(
            "absolute top-3 left-3 z-1 grid size-10 place-items-center rounded-md shadow-sm",
            universe.soft,
            universe.ink,
          )}
          aria-hidden="true"
        >
          <Icon icon={universe.icon} size="md" />
        </span>
      )}
      <ResponsiveImage
        src={item.image}
        alt=""
        sizes="(min-width: 64rem) 400px, (min-width: 40rem) 45vw, 82vw"
        fit="cover"
        className="aspect-4/3 transition-transform duration-(--sil-duration-slower) group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        {eyebrow && <Eyebrow className="mb-0">{eyebrow}</Eyebrow>}
        <CardTitle>
          <SmartLink
            target={item}
            className={cn(
              "group-hover:underline group-hover:underline-offset-3",
              stretchedLinkClass,
            )}
          >
            {item.title}
          </SmartLink>
        </CardTitle>
        <RichText as="p" html={item.text} prose={false} className="line-clamp-3 text-muted" />
        <p className="mt-auto flex items-center gap-2 pt-2 font-[650] text-link" aria-hidden="true">
          {item.external ? "Site partenaire" : "En savoir plus"}
          <Icon icon={item.external ? ArrowUpRight : ArrowRight} size="sm" />
        </p>
      </div>
    </Card>
  );
}

function PromptCard({ item }: { item: TeaserItem }) {
  return (
    <Card interactive padding="none" className="group flex h-full items-stretch">
      <ResponsiveImage
        src={item.image}
        alt=""
        sizes="200px"
        fit="cover"
        wrapperClassName="shrink-0"
        className="aspect-square h-full w-26 transition-transform duration-(--sil-duration-slower) group-hover:scale-[1.04] motion-reduce:group-hover:scale-100 lg:w-50"
      />
      <div className="flex flex-1 flex-col gap-1.5 p-4 lg:p-6">
        <CardTitle className="text-[1.0625rem] lg:text-[1.3125rem]">
          <SmartLink target={item} className={cn("group-hover:underline", stretchedLinkClass)}>
            {item.title}
          </SmartLink>
        </CardTitle>
        <p className="text-muted">{item.text}</p>
        <p className="mt-auto flex items-center gap-2 font-[650] text-link" aria-hidden="true">
          Découvrir <Icon icon={ArrowRight} size="sm" />
        </p>
      </div>
    </Card>
  );
}
