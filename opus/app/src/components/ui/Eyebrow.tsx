import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Surtitre : 14 px / 650, précédé de la pastille rouge 8 px (le point du logo) — DESIGN.md § 3.2. */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span";
}) {
  return (
    <Tag
      className={cn(
        "mb-3.5 inline-flex items-center gap-2.5 text-sm leading-tight font-[650] tracking-[0.02em] text-neutral-700 on-dark:text-green-100",
        "before:size-2 before:shrink-0 before:rounded-full before:bg-accent before:content-['']",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
