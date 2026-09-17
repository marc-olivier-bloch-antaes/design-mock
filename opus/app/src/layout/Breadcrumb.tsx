import { ArrowLeft, ChevronRight } from "lucide-react";
import { Icon, SmartLink } from "@/components/ui";
import type { Crumb } from "@/content/types";

/**
 * Fil d'Ariane (DESIGN.md § 11.4).
 * ≥ md : liste complète, page courante `aria-current`. < md : lien retour vers le parent.
 * Les niveaux sans page (« Particuliers ») pointent vers la vue d'ensemble de la rubrique.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;
  const parent = items[items.length - 2]!;
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
      <ol className="hidden flex-wrap items-center gap-x-1.5 gap-y-0.5 md:flex">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={crumb.url + i} className="inline-flex items-center gap-1.5">
              {i > 0 && <Icon icon={ChevronRight} size="xs" className="opacity-60" />}
              {isLast ? (
                <span aria-current="page" className="font-semibold text-ink">
                  {crumb.label}
                </span>
              ) : (
                <SmartLink
                  target={crumb}
                  className="inline-flex min-h-8 items-center no-underline hover:text-ink hover:underline hover:underline-offset-3"
                >
                  {crumb.label}
                </SmartLink>
              )}
            </li>
          );
        })}
      </ol>
      <SmartLink
        target={parent}
        className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink no-underline md:hidden"
      >
        <Icon icon={ArrowLeft} size="sm" />
        {parent.label}
      </SmartLink>
    </nav>
  );
}
