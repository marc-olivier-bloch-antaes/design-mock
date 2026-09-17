import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { TeaserCard } from "@/blocks/components/BlockTeasers";
import { IconButton } from "@/components/ui";
import type { TeaserItem } from "@/content/types";

/**
 * Carrousel de cartes (DESIGN.md § 11.10) : défilement natif `scroll-snap`, flèches rondes en en-tête
 * (≥ lg, désactivées aux extrémités), barre de progression 3 px, débord à droite. Pas d'autoplay.
 */
export function Carousel({ title, items }: { title: string; items: TeaserItem[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [progress, setProgress] = useState({ ratio: 0, atStart: true, atEnd: items.length <= 1 });

  const update = () => {
    const el = listRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress({
      ratio: max <= 0 ? 0 : el.scrollLeft / max,
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft >= max - 1,
    });
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const thumbWidth = 100 / Math.max(items.length, 1);

  return (
    <div>
      <div className="mb-stack flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <h2 className="text-h2">{title}</h2>
        <div className="hidden gap-2 lg:flex">
          <IconButton
            icon={ChevronLeft}
            label="Élément précédent"
            outline
            disabled={progress.atStart}
            onClick={() => scrollBy(-1)}
          />
          <IconButton
            icon={ChevronRight}
            label="Élément suivant"
            outline
            disabled={progress.atEnd}
            onClick={() => scrollBy(1)}
          />
        </div>
      </div>
      <ul
        ref={listRef}
        onScroll={update}
        role="list"
        className="-mx-gutter scrollbar-none flex snap-x snap-mandatory gap-grid overflow-x-auto px-gutter pb-2"
      >
        {items.map((item) => (
          <li
            key={item.url + item.title}
            data-carousel-item
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-2*var(--sil-grid-gap))/2.15)] lg:w-[calc((100%-3*var(--sil-grid-gap))/3.25)]"
          >
            <TeaserCard item={item} className="h-full" />
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div
          className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-surface-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-green-500 transition-[margin-left] duration-(--sil-duration-fast)"
            style={{
              width: `${thumbWidth}%`,
              marginLeft: `${progress.ratio * (100 - thumbWidth)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
