import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router";
import { Container, Icon } from "@/components/ui";
import type { Tab } from "@/content/types";
import { cn } from "@/lib/cn";
import { tabIcon } from "@/lib/tabIcons";

export interface ContentTabsProps {
  tabs: Tab[];
  /** Contenu du panneau actif. */
  renderPanel: (tab: Tab) => ReactNode;
}

/**
 * ✅ Onglets de contenu (DESIGN.md § 11.8) — pattern ARIA Tabs, activation automatique.
 * - `?tab=<id>` est l'état source (liens entrants) ; mis à jour en `replace` sans remonter la page.
 * - ←/→/Début/Fin déplacent la sélection ; tabindex itinérant.
 * - Barre collante sous le header ; pilules défilantes < md (onglet actif recentré, fondu sur le bord qui
 *   cache encore des onglets), soulignés ≥ md.
 * - Lien interne vers un autre onglet de la page affichée (« voir la FAQ ») : défilement jusqu'à la barre.
 */
export function ContentTabs({ tabs, renderPanel }: ContentTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const requested = searchParams.get("tab");
  const active = tabs.find((t) => t.id === requested) ?? tabs[0];

  // Changement d'onglet venu de la barre elle-même : pas de défilement de la page.
  const fromBar = useRef(false);
  const firstRender = useRef(true);

  const select = (id: string, focus = false) => {
    fromBar.current = true;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", id);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
    if (focus) document.getElementById(`${baseId}-tab-${id}`)?.focus();
  };

  // Recentre l'onglet actif dans la barre défilante (mobile).
  useEffect(() => {
    const list = listRef.current;
    const tab = active && document.getElementById(`${baseId}-tab-${active.id}`);
    if (!list || !tab) return;
    list.scrollTo({ left: Math.max(0, tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2) });
  }, [active, baseId]);

  // Lien interne (contenu, aside) vers un onglet de la page déjà affichée : amène la barre en haut de l'écran.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (fromBar.current) {
      fromBar.current = false;
      return;
    }
    document.getElementById("onglets")?.scrollIntoView({ block: "start" });
  }, [requested]);

  // Fondus gauche/droite de la barre défilante : seulement du côté où des onglets sont masqués.
  const [edges, setEdges] = useState({ left: false, right: false });
  const updateEdges = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    setEdges({ left: list.scrollLeft > 4, right: list.scrollLeft < max - 4 });
  }, []);
  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);
  // `mask-image` n'utilise que l'opacité : « black » = visible, « transparent » = fondu (pas une couleur affichée).
  const fade = 28;
  const maskStyle: CSSProperties | undefined =
    edges.left || edges.right
      ? {
          maskImage: `linear-gradient(to right, ${edges.left ? "transparent" : "black"}, black ${fade}px, black calc(100% - ${fade}px), ${edges.right ? "transparent" : "black"})`,
        }
      : undefined;

  if (!active) return null;

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const target = tabs[(moves[e.key]! + tabs.length) % tabs.length]!;
    select(target.id, true);
  };

  return (
    <>
      <div
        id="onglets"
        className="sticky top-(--sil-header-h) z-(--sil-z-sticky-tabs) border-b border-border-default bg-white/96 backdrop-blur-md lg:top-(--sil-header-h-lg)"
      >
        <Container>
          <div
            ref={listRef}
            onScroll={updateEdges}
            style={maskStyle}
            role="tablist"
            aria-label="Rubriques de la page"
            className="relative -mx-gutter scrollbar-none flex snap-x scroll-px-gutter gap-2 overflow-x-auto px-gutter py-2.5 md:gap-1 md:py-0"
          >
            {tabs.map((tab, i) => {
              const selected = tab.id === active.id;
              return (
                <button
                  key={tab.id}
                  id={`${baseId}-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(tab.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "group relative inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-pill pr-4 pl-3.5 text-[0.9375rem] font-[650] whitespace-nowrap transition-colors",
                    selected
                      ? "bg-neutral-900 text-white"
                      : "bg-surface-muted text-ink hover:bg-neutral-200",
                    // ≥ md : onglets soulignés
                    "md:min-h-(--sil-tabs-h) md:rounded-none md:bg-transparent md:px-[18px] md:text-base md:hover:bg-transparent",
                    "md:after:absolute md:after:inset-x-3 md:after:-bottom-px md:after:h-[3px] md:after:rounded-[3px] md:after:content-['']",
                    selected
                      ? "md:text-ink md:after:bg-green-500"
                      : "md:text-neutral-600 md:hover:text-ink md:hover:after:bg-neutral-300",
                  )}
                >
                  <Icon
                    icon={tabIcon(tab.id)}
                    size="button"
                    className={cn(selected && "md:text-green-700")}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Container>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active.id}
          tabIndex={0}
          className="animate-fade-in pt-10 pb-section outline-none focus-visible:outline-3 focus-visible:-outline-offset-3 lg:pt-14"
        >
          {tab.id === active.id && renderPanel(tab)}
        </div>
      ))}
    </>
  );
}
