import { useSyncExternalStore } from "react";

/** Vrai si la media query correspond (se met à jour au redimensionnement). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Breakpoints du design (tokens.css › @theme). */
export const MQ = {
  sm: "(min-width: 40rem)",
  md: "(min-width: 48rem)",
  lg: "(min-width: 64rem)",
} as const;
