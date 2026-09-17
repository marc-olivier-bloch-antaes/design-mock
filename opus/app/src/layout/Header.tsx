import { ChevronDown, CircleUserRound, Menu, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { buttonClasses, Icon, IconButton, Logo, SmartLink } from "@/components/ui";
import { navigation } from "@/content";
import { ACCOUNT_URL, SITE_NAME } from "@/config/site";
import { cn } from "@/lib/cn";
import { sectionFromPath } from "@/lib/sections";
import { MegaMenu } from "./MegaMenu";
import { MobileDrawer } from "./MobileDrawer";

/**
 * Header collant (DESIGN.md § 11.1–11.3) : logo + nom, navigation principale (≥ lg) avec méga-menu
 * en disclosure, actions (recherche visuelle, Espace client, bouton Menu < lg).
 */
export function Header() {
  const { pathname, search } = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const currentSection = sectionFromPath(pathname);

  const closeMega = useCallback((returnFocus = false) => {
    setOpenId((id) => {
      if (returnFocus && id)
        headerRef.current
          ?.querySelector<HTMLButtonElement>(`[aria-controls="mega-${id}"]`)
          ?.focus();
      return null;
    });
  }, []);

  // Fermeture à chaque navigation (clic sur un lien du menu).
  const [lastLocation, setLastLocation] = useState(pathname + search);
  if (lastLocation !== pathname + search) {
    setLastLocation(pathname + search);
    setOpenId(null);
    setDrawerOpen(false);
  }

  // Échap ferme le méga-menu et rend le focus au bouton de rubrique.
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMega(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId, closeMega]);

  // Ombre après 8 px de défilement.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 border-b border-border-default bg-white/94 backdrop-blur-[14px] backdrop-saturate-[1.4] transition-shadow",
          // Méga-menu ouvert : le header passe au-dessus du voile (DESIGN.md § 14.11).
          openId ? "z-[calc(var(--sil-z-scrim)+1)]" : "z-(--sil-z-header)",
          scrolled && "shadow-sm",
        )}
      >
        <div className="mx-auto flex h-(--sil-header-h) w-full max-w-page items-center gap-3 px-gutter lg:h-(--sil-header-h-lg) lg:gap-6">
          <Link
            to="/"
            className="flex min-h-11 shrink-0 items-center gap-3 text-ink no-underline"
            aria-label={`${SITE_NAME}, accueil`}
          >
            <Logo className="lg:h-8" />
            <span
              aria-hidden="true"
              className="border-l border-border-strong pl-3 text-xs leading-[1.2] font-semibold text-neutral-700 max-xs:hidden lg:hidden lg:text-[0.8125rem] 2xl:block"
            >
              Services industriels
              <br />
              de Lausanne
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="ml-auto hidden lg:block">
            <ul role="list" className="flex gap-0.5">
              {navigation.mainMenu.map((root) => {
                const expanded = openId === root.id;
                const current = root.section === currentSection;
                return (
                  <li key={root.id}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mega-${root.id}`}
                      data-current={current || undefined}
                      onClick={() => setOpenId(expanded ? null : root.id)}
                      className={cn(
                        "relative inline-flex min-h-11 items-center gap-1 rounded-pill px-3 text-base font-semibold whitespace-nowrap transition-colors",
                        expanded ? "bg-green-50 text-green-800" : "text-ink hover:bg-surface-muted",
                        // Rubrique courante : rail vert à bouts ronds collé au bas du header
                        current &&
                          "after:absolute after:right-7 after:-bottom-[18px] after:left-3 after:h-[3px] after:rounded-[3px] after:bg-green-500 after:content-['']",
                      )}
                    >
                      {root.label}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "size-4 transition-transform duration-(--sil-duration-base)",
                          expanded ? "rotate-180" : "text-neutral-600",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-2 lg:gap-2">
            {/* Recherche : visuelle uniquement (hors périmètre du prototype). */}
            <IconButton
              icon={Search}
              label="Rechercher (non disponible dans le prototype)"
              className="max-sm:hidden"
            />
            <SmartLink
              url={ACCOUNT_URL}
              className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "max-lg:hidden")}
            >
              <Icon icon={CircleUserRound} size="button" />
              Espace client
            </SmartLink>
            <SmartLink
              url={ACCOUNT_URL}
              aria-label="Espace client"
              className="hidden size-11 items-center justify-center rounded-full hover:bg-surface-muted sm:inline-flex lg:hidden"
            >
              <Icon icon={CircleUserRound} />
            </SmartLink>
            <button
              ref={menuButtonRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="menu-mobile"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border-[1.5px] border-border-strong bg-white pr-3.5 pl-4 font-[650] lg:hidden"
            >
              Menu <Icon icon={Menu} />
            </button>
          </div>
        </div>

        {navigation.mainMenu.map((root) => (
          <MegaMenu key={root.id} root={root} open={openId === root.id} />
        ))}
      </header>

      {openId && (
        <div
          className="fixed inset-0 z-(--sil-z-scrim) animate-fade-in bg-(--sil-overlay-scrim)"
          aria-hidden="true"
          onClick={() => closeMega()}
        />
      )}

      <MobileDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          menuButtonRef.current?.focus({ preventScroll: true });
        }}
      />
    </>
  );
}
