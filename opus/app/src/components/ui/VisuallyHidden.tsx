import type { ReactNode } from "react";

/** Texte lu par les lecteurs d'écran mais invisible (« (site externe) », « (PDF, 286 Ko) »). */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
