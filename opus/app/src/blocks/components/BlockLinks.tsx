import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ArrowLink, Icon, SmartLink, stretchedLinkClass } from "@/components/ui";
import type { LinkItem, LinksBlock } from "@/content/types";
import { cn } from "@/lib/cn";
import { parseNewsLabel } from "@/lib/newsDate";
import { UNIVERSES, universeFromLabel } from "@/lib/universe";
import type { BlockProps } from "../types";

/**
 * ✅ Grilles et listes de liens (DESIGN.md § 11.11).
 * `icon-nav` univers → tuiles à pastille colorée (2 → 3 → 6 colonnes, verticale ≥ lg avec flèche qui glisse) ;
 * `icon-nav` hors univers → `LinkTiles` ; liste simple → `LinkList` ; `news` → `NewsList` (tuile date, 5 items + lien « Toutes »).
 */
export function BlockLinks({ block }: BlockProps<LinksBlock>) {
  const allUniverses =
    block.variant === "icon-nav" && block.items.every((i) => universeFromLabel(i.label));

  if (allUniverses) return <UniverseGrid items={block.items} />;

  if (block.variant === "news") {
    return (
      <div>
        {block.title && <h2 className="mb-4 text-h3">{block.title}</h2>}
        <NewsList items={block.items} />
      </div>
    );
  }

  if (block.variant === "icon-nav") return <LinkTiles items={block.items} />;

  return <LinkList items={block.items} />;
}

/**
 * Tuiles de liens `icon-nav` hors univers (DESIGN.md § 6, § 11.11 ; Nos activités, Notre portrait…) :
 * les icônes SVG du CMS ne sont pas reprises (titres erronés, style daté) → tuile bordée libellé + flèche,
 * 1 → 2 (sm) → 3 (lg) colonnes.
 */
export function LinkTiles({ items }: { items: LinkItem[] }) {
  return (
    <ul role="list" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.url + item.label}>
          <SmartLink
            target={item}
            className="group flex min-h-16 items-center justify-between gap-3 rounded-card border border-border-default bg-surface px-5 py-3 leading-snug font-bold transition-[border-color,box-shadow] duration-(--sil-duration-fast) hover:border-border-strong hover:shadow-md"
          >
            <span>{item.label}</span>
            <Icon
              icon={item.external ? ArrowUpRight : ArrowRight}
              size="sm"
              className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-[3px] group-hover:text-link"
            />
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

export function UniverseGrid({ items }: { items: LinkItem[] }) {
  return (
    <ul role="list" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
      {items.map((item) => {
        const u = UNIVERSES[universeFromLabel(item.label)!];
        return (
          <li key={item.url}>
            <div
              className={cn(
                "group relative flex min-h-18 items-center gap-3 rounded-card border border-border-default bg-surface p-3.5 transition-[border-color,box-shadow,transform] duration-(--sil-duration-fast) focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus hover:shadow-md lg:min-h-38 lg:flex-col lg:items-start lg:justify-between lg:p-5 lg:hover:-translate-y-0.5 motion-reduce:lg:hover:translate-y-0",
                u.accentBorder,
              )}
            >
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-md lg:size-13",
                  u.soft,
                  u.ink,
                )}
              >
                <Icon icon={u.icon} size="lg" />
              </span>
              <SmartLink target={item} className={cn("font-bold lg:text-lg", stretchedLinkClass)}>
                {item.label}
              </SmartLink>
              <Icon
                icon={ArrowRight}
                size="sm"
                className={cn(
                  "hidden text-neutral-400 transition-[transform,color] duration-(--sil-duration-fast) lg:block lg:self-end lg:group-hover:translate-x-1",
                  u.ink,
                )}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <ul role="list">
      {items.map((item) => (
        <li
          key={item.url + item.label}
          className="not-first:border-t not-first:border-border-default"
        >
          <SmartLink
            target={item}
            className="group flex min-h-11 items-center justify-between gap-3 py-2 leading-snug font-semibold hover:text-link"
          >
            <span>{item.label}</span>
            <Icon
              icon={ArrowRight}
              size="sm"
              className="text-neutral-400 transition-transform group-hover:translate-x-[3px] group-hover:text-link"
            />
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}

/** Actualités (DESIGN.md § 11.11) : tuile date 56 px + titre, 5 items affichés + lien « Toutes les actualités ». */
export function NewsList({ items, seeAllUrl }: { items: LinkItem[]; seeAllUrl?: string }) {
  const visible = items.slice(0, 5);
  return (
    <div>
      <ul role="list" className="rounded-card border border-border-default">
        {visible.map((item) => {
          const { day, month, title } = parseNewsLabel(item.label);
          return (
            <li
              key={item.url}
              className="group relative flex items-center gap-4 px-5 py-3 not-first:border-t not-first:border-border-default hover:bg-neutral-25"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-md bg-surface-muted text-center leading-tight">
                <span className="block">
                  <span className="block text-lg leading-none font-[750] tabular-nums">
                    {day || "•"}
                  </span>
                  <span className="mt-0.5 block text-[0.6875rem] font-[650] tracking-[0.02em] text-muted uppercase">
                    {month}
                  </span>
                </span>
              </span>
              <SmartLink target={item} className={cn("font-semibold", stretchedLinkClass)}>
                {title || item.label}
              </SmartLink>
              <Icon
                icon={ArrowRight}
                size="sm"
                className="ml-auto shrink-0 text-neutral-400 transition-transform group-hover:translate-x-[3px] group-hover:text-link"
              />
            </li>
          );
        })}
      </ul>
      {seeAllUrl && (
        <div className="mt-4">
          <ArrowLink url={seeAllUrl} externalIcon>
            Toutes les actualités
          </ArrowLink>
        </div>
      )}
    </div>
  );
}
