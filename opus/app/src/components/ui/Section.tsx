import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container, type ContainerProps } from "./Container";

const TONES = {
  default: "bg-surface",
  subtle: "bg-surface-subtle",
  brand: "on-dark bg-surface-brand text-inverse",
  inverse: "on-dark bg-surface-inverse text-inverse",
} as const;

export interface SectionProps {
  /** Alternance blanc / neutral-50 ; `brand` = bandeau green-900 (un seul par page). */
  tone?: keyof typeof TONES;
  /** Padding vertical : `section` 56 → 104 px, `sm` 40 → 64 px, `none`. */
  spacing?: "default" | "sm" | "none";
  /** Largeur du conteneur interne ; `false` pour gérer soi-même le conteneur (débords de carrousel). */
  container?: ContainerProps["width"] | false;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

/** Section de page pleine largeur (fond) + conteneur centré. */
export function Section({
  tone = "default",
  spacing = "default",
  container = "page",
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        TONES[tone],
        spacing === "default" && "py-section",
        spacing === "sm" && "py-section-sm",
        className,
      )}
      {...rest}
    >
      {container ? <Container width={container}>{children}</Container> : children}
    </section>
  );
}

export interface SectionHeadProps {
  title: ReactNode;
  titleId?: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Action à droite (lien flèche « Toutes nos offres → », flèches de carrousel). */
  action?: ReactNode;
  className?: string;
}

/** En-tête de section : titre h2 + description + action alignée à droite (≥ sm). */
export function SectionHead({
  title,
  titleId,
  eyebrow,
  description,
  action,
  className,
}: SectionHeadProps) {
  return (
    <div
      className={cn("mb-stack flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}
    >
      <div className="max-w-176">
        {eyebrow}
        <h2 id={titleId} className="text-h2">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-body-lg text-muted on-dark:text-green-100">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
