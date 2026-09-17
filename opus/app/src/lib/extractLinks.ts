/**
 * Détecte un paragraphe qui ne contient QU'un lien (+ une description facultative après un <br>) :
 * pattern des paragraphes-liens « En relation » / « Conditions des prestations » / « Démarches en ligne »
 * (DESIGN.md § 11.8, § 11.11 ; ARCHITECTURE.md « Non normalisé »). Utilisé pour construire `UsefulLinks`.
 */
export interface ExtractedLink {
  label: string;
  url: string;
  slug?: string;
  tab?: string;
  route?: string;
  external: boolean;
  description?: string;
}

export function extractSingleLink(html: string): ExtractedLink | null {
  // Le lien doit être le tout début du paragraphe (pas de texte introductif avant, ex.
  // « Contactez-nous au … ou par <a>e-mail</a> … » n'est PAS un paragraphe-lien).
  if (!/^\s*<a[\s>]/i.test(html)) return null;
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const a = doc.body.querySelector("a");
  if (!a) return null;

  const label = a.textContent?.trim() ?? "";
  const url = a.getAttribute("href") ?? "";
  if (!label || !url) return null;

  const slug = a.getAttribute("data-slug") ?? undefined;
  const tab = a.getAttribute("data-tab") ?? undefined;
  const route = a.getAttribute("data-route") ?? undefined;

  let external = false;
  try {
    external = /^https?:/.test(url) && !/^(www\.)?lausanne\.ch$/.test(new URL(url).hostname);
  } catch {
    /* href relatif ou mailto: */
  }

  const clone = doc.body.cloneNode(true) as HTMLElement;
  clone.querySelector("a")?.remove();
  clone.querySelector("br")?.remove();
  const description = clone.textContent?.trim() || undefined;

  return { label, url, slug, tab, route, external, description };
}
