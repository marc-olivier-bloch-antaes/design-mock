import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import { Outlet, ScrollRestoration, useLocation, useNavigation } from "react-router";
import { cn } from "@/lib/cn";
import figtreeLatin from "@/styles/fonts/figtree-latin.woff2?url";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { SkipLink } from "./SkipLink";
import { UtilityBar } from "./UtilityBar";

/**
 * Gabarit global commun à toutes les routes :
 * lien d'évitement → barre utilitaire → header (+ méga-menu, drawer) → <main id="contenu"> → footer.
 *
 * Navigation :
 * - <ScrollRestoration> : haut de page à chaque nouvelle page, position restaurée au retour arrière.
 *   Les changements d'onglet utilisent `preventScrollReset` (pas de saut).
 * - Focus : après un changement de CHEMIN (pas de ?tab=), le focus va sur le h1 de la nouvelle page
 *   (`[data-route-focus]`) pour que les lecteurs d'écran annoncent la page.
 */
export function RootLayout() {
  // Précharge le sous-ensemble latin de Figtree (DESIGN.md § 14.1).
  preload(figtreeLatin, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const target =
      document.querySelector<HTMLElement>("main [data-route-focus]") ??
      document.getElementById("contenu");
    target?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <SkipLink />
      <UtilityBar />
      <Header />
      <main
        id="contenu"
        tabIndex={-1}
        aria-busy={navigation.state === "loading"}
        className={cn(
          "outline-none",
          navigation.state === "loading" && "opacity-70 transition-opacity delay-150",
        )}
      >
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
