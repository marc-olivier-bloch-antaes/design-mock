import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { IconButton, ResponsiveImage } from "@/components/ui";
import type { GalleryBlock } from "@/content/types";
import type { BlockProps } from "../types";

/**
 * ✅ Galerie (DESIGN.md § 11.19) : bandeau à défilement natif scroll-snap, images 21:9 (16:10 mobile),
 * crédit en pastille, flèches précédent/suivant (désactivées aux extrémités) + compteur « 1 / 4 ». Pas d'autoplay.
 */
export function BlockGallery({ block }: BlockProps<GalleryBlock>) {
  const listRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (next: number) => {
    const list = listRef.current;
    if (!list) return;
    const clamped = Math.max(0, Math.min(block.items.length - 1, next));
    const item = list.children[clamped] as HTMLElement | undefined;
    item?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setIndex(clamped);
  };

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const itemWidth = list.children[0]?.clientWidth || 1;
    setIndex(Math.round(list.scrollLeft / (itemWidth + 16)));
  };

  return (
    <div className="-mx-gutter">
      <div className="relative">
        <ul
          ref={listRef}
          onScroll={onScroll}
          role="list"
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-2"
        >
          {block.items.map((item) => (
            <li key={item.src} className="relative w-[88%] shrink-0 snap-start md:w-[80%]">
              <figure>
                <ResponsiveImage
                  src={item.src}
                  alt={item.alt}
                  sizes="(min-width: 64rem) 1024px, 90vw"
                  fit="cover"
                  className="aspect-16/10 rounded-xl md:aspect-21/9"
                />
                {item.caption && (
                  <figcaption className="absolute right-3 bottom-3 rounded-pill bg-neutral-950/70 px-2.5 py-1 text-xs text-white">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
        {block.items.length > 1 && (
          <div className="mt-3 flex items-center justify-between px-gutter">
            <p className="text-sm text-muted tabular-nums" aria-live="polite">
              {index + 1} / {block.items.length}
            </p>
            <div className="flex gap-2">
              <IconButton
                icon={ChevronLeft}
                label="Image précédente"
                outline
                disabled={index === 0}
                onClick={() => goTo(index - 1)}
              />
              <IconButton
                icon={ChevronRight}
                label="Image suivante"
                outline
                disabled={index === block.items.length - 1}
                onClick={() => goTo(index + 1)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
