import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4" | "body-lg";

const SIZE_CLASSES: Record<HeadingSize, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  "body-lg": "text-body-lg font-bold",
};

/** Taille visuelle par défaut d'un niveau sémantique. */
const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "body-lg",
  6: "body-lg",
};

export interface HeadingProps {
  /** Niveau SÉMANTIQUE (continuité h1 → h2 → h3 obligatoire, DESIGN.md § 10). */
  level: HeadingLevel;
  /** Taille VISUELLE, découplée du niveau (ex. un h3 de carte en taille h4). */
  size?: HeadingSize;
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Titre typographique : les tokens text-h1…h4 portent taille, interligne, approche et graisse. */
export function Heading({ level, size, id, className, children }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      id={id}
      className={cn(SIZE_CLASSES[size ?? DEFAULT_SIZE[level]], "text-balance", className)}
    >
      {children}
    </Tag>
  );
}
