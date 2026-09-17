import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const SIZES = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  button: "size-[1.125rem]",
} as const;

export interface IconProps {
  icon: LucideIcon;
  /** xs 14 · sm 16 (inline, méta) · button 18 · md 20 (défaut) · lg 24 (pastilles). */
  size?: keyof typeof SIZES;
  className?: string;
  /** Si l'icône porte seule le sens (rare : préférer un libellé visible), fournir un label. */
  label?: string;
}

/**
 * Icône Lucide (DESIGN.md § 6). Décorative par défaut (`aria-hidden`) :
 * le libellé doit être porté par le texte voisin ou l'`aria-label` du bouton parent.
 */
export function Icon({ icon: Component, size = "md", className, label }: IconProps) {
  return (
    <Component
      className={cn("shrink-0", SIZES[size], className)}
      strokeWidth={2}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable={false}
    />
  );
}
