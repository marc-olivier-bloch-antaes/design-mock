/**
 * Table des routes, GÉNÉRÉE depuis le contenu (manifest.json + navigation.json) :
 *  - une route par page crawlée, à son chemin d'origine sans « .html » (loader = JSON + gabarit) ;
 *  - une route « vue d'ensemble » par rubrique racine (/particuliers…) ;
 *  - une route « hors périmètre » par entrée de menu non crawlée ;
 *  - les alias du menu (ex. /partenaires/reglements) redirigent vers la route canonique ;
 *  - `*` : 404 (avec redirection des anciennes URL en .html).
 */
import type { RouteObject } from "react-router";
import { flattenNav, manifest, navigation } from "@/content";
import { RootLayout } from "@/layout/RootLayout";
import { ContentPage } from "@/pages/ContentPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OutOfScopePage } from "@/pages/OutOfScopePage";
import { RedirectKeepingQuery } from "@/pages/RedirectKeepingQuery";
import { RouteError } from "@/pages/RouteError";
import { RubriquePage } from "@/pages/RubriquePage";
import { pageLoader } from "@/pages/pageRoute";

const pageRoutes: RouteObject[] = manifest.map((p) =>
  p.path === "/"
    ? {
        index: true,
        loader: pageLoader(p.slug),
        element: <ContentPage />,
        handle: { slug: p.slug },
      }
    : {
        path: p.path,
        loader: pageLoader(p.slug),
        element: <ContentPage />,
        handle: { slug: p.slug },
      },
);

const seen = new Set(manifest.map((p) => p.path));
const navRoutes: RouteObject[] = flattenNav()
  .filter((n) => n.kind !== "page" && !seen.has(n.path) && seen.add(n.path))
  .map((n) => ({
    path: n.path,
    element: n.kind === "rubrique" ? <RubriquePage node={n} /> : <OutOfScopePage node={n} />,
  }));

const redirectRoutes: RouteObject[] = navigation.redirects.map((r) => ({
  path: r.from,
  element: <RedirectKeepingQuery to={r.to} />,
}));

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: null,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          ...pageRoutes,
          ...navRoutes,
          ...redirectRoutes,
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
