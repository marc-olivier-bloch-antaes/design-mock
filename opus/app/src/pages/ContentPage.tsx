import { Suspense } from "react";
import { useLoaderData } from "react-router";
import { PageMeta } from "@/layout/PageMeta";
import { htmlToText } from "@/components/ui";
import { templates } from "@/templates/registry";
import type { PageLoaderData } from "./pageRoute";

/** Page crawlée : choisit le gabarit de la table PAGE_TEMPLATES et lui passe la page typée. */
export function ContentPage() {
  const { page, template } = useLoaderData() as PageLoaderData;
  const Template = templates[template];
  const title = page.slug === "accueil" ? "" : page.title;
  return (
    <>
      <PageMeta
        title={title}
        description={page.lead ? htmlToText(page.lead).slice(0, 160) : undefined}
      />
      <Suspense fallback={null}>
        <Template page={page} />
      </Suspense>
    </>
  );
}
