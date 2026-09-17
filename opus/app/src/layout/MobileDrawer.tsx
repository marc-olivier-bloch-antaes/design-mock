import { ChevronDown, CircleUserRound, Phone, Search, TriangleAlert, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink, Icon, IconButton, Logo, SmartLink } from "@/components/ui";
import { navigation } from "@/content";
import { ACCOUNT_URL, PHONE, SITE_NAME } from "@/config/site";
import { cn } from "@/lib/cn";
import { menuGroups } from "./navLinks";

/**
 * Menu mobile plein écran (DESIGN.md § 11.3).
 * Implémenté avec <dialog>.showModal() : le reste de la page devient inerte (piège de focus natif),
 * Échap ferme, `::backdrop` sert de voile. Le focus est rendu au bouton Menu par le parent (`onClose`).
 */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog
        .querySelector<HTMLButtonElement>("[data-drawer-close]")
        ?.focus({ preventScroll: true });
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <dialog
      ref={ref}
      id="menu-mobile"
      data-drawer
      aria-label="Menu"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clic sur le voile (::backdrop) : la cible est le <dialog> lui-même.
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-104 overflow-y-auto overscroll-contain border-0 bg-white p-0 text-ink shadow-xl",
        "backdrop:bg-(--sil-overlay-scrim) open:flex open:animate-slide-in-right open:flex-col",
      )}
    >
      <div className="sticky top-0 z-10 flex h-(--sil-header-h) shrink-0 items-center justify-between border-b border-border-default bg-white px-gutter">
        <SmartLink
          to="/"
          aria-label={`${SITE_NAME}, accueil`}
          className="flex min-h-11 items-center"
          onClick={onClose}
        >
          <Logo />
        </SmartLink>
        <IconButton data-drawer-close icon={X} label="Fermer le menu" outline onClick={onClose} />
      </div>

      {/* Champ de recherche visuel : hors périmètre du prototype. */}
      <div
        aria-hidden="true"
        className="mx-gutter mt-4 mb-2 flex min-h-12 items-center gap-2.5 rounded-pill bg-surface-muted px-4 text-muted"
      >
        <Icon icon={Search} />
        <span>Rechercher sur le site</span>
      </div>

      <nav aria-label="Navigation principale" className="px-gutter">
        <ul role="list">
          {navigation.mainMenu.map((root) => {
            const isOpen = expanded.has(root.id);
            const panelId = `drawer-${root.id}`;
            return (
              <li key={root.id} className="border-b border-border-default">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(root.id)}
                  className="flex min-h-15 w-full items-center justify-between text-left text-[1.1875rem] font-bold tracking-[-0.01em]"
                >
                  {root.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-5 transition-transform duration-(--sil-duration-base)",
                      isOpen ? "rotate-180 text-ink" : "text-neutral-600",
                    )}
                  />
                </button>
                <div id={panelId} hidden={!isOpen} className="pb-4">
                  <SmartLink
                    to={root.path}
                    className="flex min-h-11 items-center font-[650] text-link no-underline"
                  >
                    Vue d&apos;ensemble
                  </SmartLink>
                  {menuGroups(root).map(({ title, items }) =>
                    title.id === root.id ? (
                      items.map((item) => (
                        <SmartLink
                          key={item.id}
                          to={item.path}
                          className="flex min-h-11 items-center font-[650] no-underline"
                        >
                          {item.label}
                        </SmartLink>
                      ))
                    ) : (
                      <div key={title.id}>
                        <SmartLink
                          to={title.path}
                          className="flex min-h-11 items-center font-[650] no-underline"
                        >
                          {title.label}
                        </SmartLink>
                        {items.length > 0 && (
                          <ul role="list" className="mb-2 ml-0.5 border-l-2 border-neutral-100">
                            {items.map((item) => (
                              <li key={item.id}>
                                <SmartLink
                                  to={item.path}
                                  className="flex min-h-11 items-center pl-4 text-neutral-700 no-underline"
                                >
                                  {item.label}
                                </SmartLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto grid gap-3 bg-surface-subtle px-gutter pt-6 pb-8">
        <ButtonLink url={ACCOUNT_URL} icon={CircleUserRound} block>
          Espace client
        </ButtonLink>
        <a
          href={PHONE.href}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-pill border-[1.5px] border-border-strong bg-surface px-6 font-[650] no-underline hover:border-neutral-900"
        >
          <Icon icon={Phone} size="button" />
          {PHONE.display}
        </a>
        <p className="flex items-center gap-2 text-sm text-muted">
          <Icon icon={TriangleAlert} size="sm" />
          Urgences ou pannes&nbsp;: 7j/7, 24h/24
        </p>
      </div>
    </dialog>
  );
}
