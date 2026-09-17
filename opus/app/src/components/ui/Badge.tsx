import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  new: "bg-action text-on-action",
  neutral: "bg-surface-muted text-neutral-700",
  pdf: "bg-red-50 text-red-700",
  docx: "bg-blue-50 text-blue-700",
  json: "bg-amber-50 text-amber-700",
  link: "bg-surface-muted text-neutral-700",
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

/** Pastille 24 px, 13 px / 700 (« Nouveau », « Produit par défaut », formats de documents). */
export function Badge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-pill px-2.5 text-xs leading-none font-bold tracking-[0.01em]",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
