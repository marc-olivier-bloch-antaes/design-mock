import { SITE_NAME } from "@/config/site";

/**
 * Métadonnées de page. React 19 hisse <title> et <meta> dans <head> :
 * `document.title` = « Titre de page | Services industriels de Lausanne ».
 */
export function PageMeta({ title, description }: { title: string; description?: string }) {
  const full = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  return (
    <>
      <title>{full}</title>
      {description && <meta name="description" content={description} />}
    </>
  );
}
