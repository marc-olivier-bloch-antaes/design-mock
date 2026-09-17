import { isRouteErrorResponse, useRouteError } from "react-router";
import { ArrowLink, Container } from "@/components/ui";
import { NotFoundPage } from "./NotFoundPage";

/** Erreur de route (loader ou rendu) : 404 → page introuvable, sinon message générique. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  if (import.meta.env.DEV) console.error(error);
  return (
    <Container className="py-section">
      <h1 className="text-h1" tabIndex={-1} data-route-focus>
        Une erreur est survenue
      </h1>
      <p className="mt-4 text-lead text-neutral-700">La page n&apos;a pas pu être affichée.</p>
      <ArrowLink to="/" className="mt-6">
        Retour à l&apos;accueil
      </ArrowLink>
    </Container>
  );
}
