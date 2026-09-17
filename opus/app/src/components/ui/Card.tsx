import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps {
  as?: ElementType;
  /** Carte cliquable : survol ombre md + bordure strong ; l'anneau de focus est porté par la carte. */
  interactive?: boolean;
  /** `plain` : bordure neutral-200 (défaut) · `subtle` : fond neutral-50 sans bordure. */
  tone?: "plain" | "subtle";
  padding?: "none" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

/**
 * Surface de carte (DESIGN.md § 5, § 11.10) : rayon lg, bordure, pas d'ombre au repos.
 * Pour une carte entièrement cliquable, placer un <CardLink> (lien étiré) sur le titre.
 */
export function Card({
  as: Tag = "div",
  interactive,
  tone = "plain",
  padding = "md",
  className,
  children,
}: CardProps) {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden rounded-card",
        tone === "plain" ? "border border-border-default bg-surface" : "bg-surface-subtle",
        padding === "md" && "p-6",
        padding === "lg" && "p-6 md:p-9",
        interactive &&
          "transition-[box-shadow,border-color] duration-(--sil-duration-fast) focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus hover:border-border-strong hover:shadow-md",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Classe du lien étiré : à poser sur l'unique lien d'une carte `interactive`. */
export const stretchedLinkClass =
  "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

export function CardTitle({
  children,
  as: Tag = "h3",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={cn("text-[1.1875rem] leading-snug font-bold", className)}>{children}</Tag>;
}
