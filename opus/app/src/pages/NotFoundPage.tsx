import { Navigate, useLocation } from "react-router";
import { ArrowLink, Section } from "@/components/ui";
import { CONTACT_URL } from "@/config/site";
import { PageHero } from "@/layout/PageHero";
import { PageMeta } from "@/layout/PageMeta";

/**
 * 404. Les anciennes URL du site (`…/electricite.html`) sont redirigées vers la route propre équivalente.
 * Note : servie en SPA, la page répond HTTP 200 (fallback index.html) ; seul le contenu indique l'erreur.
 */
export function NotFoundPage() {
  const { pathname, search, hash } = useLocation();
  if (pathname.endsWith(".html")) {
    const clean =
      pathname
        .replace(/^\/vie-pratique\/energies-et-eau\/services-industriels/, "")
        .replace(/\.html$/, "") || "/";
    return <Navigate to={`${clean}${search}${hash}`} replace />;
  }
  return (
    <>
      <PageMeta title="Page introuvable" />
      <PageHero title="Page introuvable" lead="La page demandée n'existe pas ou a été déplacée." />
      <Section spacing="sm">
        <ul role="list" className="flex flex-col items-start gap-1">
          <li>
            <ArrowLink to="/">Retour à l&apos;accueil</ArrowLink>
          </li>
          <li>
            <ArrowLink url={CONTACT_URL}>Nous contacter</ArrowLink>
          </li>
        </ul>
      </Section>
    </>
  );
}
