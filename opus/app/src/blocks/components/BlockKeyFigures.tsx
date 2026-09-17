import logoMonochrome from "@/assets/brand/logo-sil-monochrome.svg";
import type { KeyFiguresBlock } from "@/content/types";
import { parseKeyFigure } from "@/lib/keyfigures";
import { cn } from "@/lib/cn";
import type { BlockProps } from "../types";

export type KeyFiguresVariant = "brand" | "light";

/**
 * Panneau chiffres clés (DESIGN.md § 11.14), composant présentationnel partagé : `variant="brand"`
 * (fond green-900, filigrane du logo — accueil) et `variant="light"` (pages À propos, fond neutral-50,
 * valeurs green-800). Le bloc `keyfigures` du CMS ne porte pas de variante : c'est le gabarit qui choisit
 * (voir `BlockKeyFigures` ci-dessous pour le rendu par défaut dans le flux de blocs).
 */
export function KeyFigures({
  title,
  items,
  variant = "brand",
  /** 4 colonnes pleine largeur (pages À propos) ou 2 colonnes (accueil, panneau 5/12) — DESIGN.md § 11.14. */
  columns = 4,
  className,
}: {
  title: string;
  items: KeyFiguresBlock["items"];
  variant?: KeyFiguresVariant;
  columns?: 2 | 4;
  className?: string;
}) {
  const brand = variant === "brand";
  return (
    <section
      aria-label={title}
      className={cn(
        "relative isolate overflow-hidden rounded-xl p-8 md:p-10",
        brand ? "on-dark bg-surface-brand text-inverse" : "bg-surface-subtle",
        className,
      )}
    >
      {brand && (
        <img
          src={logoMonochrome}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -bottom-8 h-28 w-auto text-white opacity-5 select-none md:h-36"
        />
      )}
      <h2 className={cn("relative text-h3", !brand && "text-ink")}>{title}</h2>
      <dl
        className={cn(
          "relative mt-6 grid grid-cols-2 gap-x-6 gap-y-8",
          columns === 4 && "lg:grid-cols-4",
        )}
      >
        {items.map((item) => {
          const { prefix, value, unit } = parseKeyFigure(item.value);
          return (
            <div key={item.label} className="flex flex-col-reverse gap-1">
              <dt className={cn("text-[0.9375rem]", brand ? "text-green-100" : "text-muted")}>
                {item.label}
              </dt>
              <dd
                className={cn(
                  "text-figure font-extrabold tabular-nums",
                  brand ? "text-white" : "text-green-800",
                )}
              >
                {prefix && (
                  <span
                    className={cn(
                      "block text-sm font-[650] tracking-normal",
                      brand ? "text-green-200" : "text-green-700",
                    )}
                  >
                    {prefix}
                  </span>
                )}
                {value}
                {unit && <span className="opacity-45"> {unit}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

/** ✅ Rendu par défaut dans le flux de blocs (variante `brand`). */
export function BlockKeyFigures({ block }: BlockProps<KeyFiguresBlock>) {
  return <KeyFigures title={block.title} items={block.items} variant="brand" />;
}
