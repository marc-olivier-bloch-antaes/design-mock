import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

const WIDTHS = {
  page: "max-w-page",
  wide: "max-w-wide",
  prose: "max-w-prose",
  narrow: "max-w-narrow",
} as const;

export interface ContainerProps {
  as?: ElementType;
  /** page 1280 (défaut) · wide 1440 · prose 720 · narrow 576 — gouttières incluses. */
  width?: keyof typeof WIDTHS;
  className?: string;
  children: ReactNode;
}

/** Conteneur centré avec gouttières fluides 16 → 32 px (DESIGN.md § 4). */
export function Container({
  as: Tag = "div",
  width = "page",
  className,
  children,
}: ContainerProps) {
  return <Tag className={cn("mx-auto w-full px-gutter", WIDTHS[width], className)}>{children}</Tag>;
}
