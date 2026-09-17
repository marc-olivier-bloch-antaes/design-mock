import type { LoaderFunctionArgs } from "react-router";
import { getPageSummary, loadPage } from "@/content";
import { preloadTemplate, templateForSlug } from "@/templates/registry";

/**
 * Loader d'une page crawlée : charge le JSON de la page ET le code de son gabarit en parallèle
 * (aucun écran de chargement intermédiaire). Le slug est porté par `handle` de la route.
 */
export function pageLoader(slug: string) {
  return async (_args: LoaderFunctionArgs) => {
    const summary = getPageSummary(slug);
    if (!summary) throw new Response("Not Found", { status: 404 });
    const template = templateForSlug(slug, summary.tabs.length > 0);
    const [page] = await Promise.all([loadPage(slug), preloadTemplate(template)]);
    return { page, template };
  };
}

export type PageLoaderData = Awaited<ReturnType<ReturnType<typeof pageLoader>>>;
