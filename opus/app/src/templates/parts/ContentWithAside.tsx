import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Mise en page contenu + aside collant 20rem (≥ lg), aside APRÈS le contenu sur mobile (DESIGN.md § 11.8, § 12.4).
 * `withTabs` : l'aside se colle sous la barre d'onglets.
 */
export function ContentWithAside({
  children,
  aside,
  withTabs = false,
}: {
  children: ReactNode;
  aside?: ReactNode;
  withTabs?: boolean;
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-18">
      <div className="min-w-0">{children}</div>
      {aside && (
        <aside
          aria-label="Informations complémentaires"
          className={cn(
            "grid gap-5 lg:sticky",
            withTabs
              ? "lg:top-[calc(var(--sil-header-h-lg)+var(--sil-tabs-h)+32px)]"
              : "lg:top-[calc(var(--sil-header-h-lg)+32px)]",
          )}
        >
          {aside}
        </aside>
      )}
    </div>
  );
}
