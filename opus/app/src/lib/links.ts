/**
 * Résolution des liens du contenu vers le routeur.
 * Règle unique (voir ARCHITECTURE.md § Liens) :
 *  1. `slug` → page crawlée : lien interne vers sa route (+ ?tab=) ;
 *  2. `route` → entrée du menu non crawlée (rubrique / hors périmètre) : lien interne ;
 *  3. sinon : lien sortant vers `url` (lausanne.ch ou autre domaine).
 */
import { flattenNav, getPageSummary, manifest } from "@/content";
import type { LinkTarget } from "@/content/types";

export type ResolvedLink =
  | { kind: "internal"; to: string }
  | { kind: "external"; href: string; /** autre domaine que lausanne.ch */ offsite: boolean };

export function pagePath(slug: string, tab?: string): string | undefined {
  const summary = getPageSummary(slug);
  if (!summary) return undefined;
  return tab ? `${summary.path}?tab=${encodeURIComponent(tab)}` : summary.path;
}

export function resolveLink(
  target: Pick<LinkTarget, "url" | "slug" | "tab" | "route" | "external">,
): ResolvedLink {
  if (target.slug) {
    const to = pagePath(target.slug, target.tab);
    if (to) return { kind: "internal", to };
  }
  if (target.route) return { kind: "internal", to: target.route };
  return { kind: "external", href: target.url, offsite: target.external };
}

/* Index URL d'origine → route, pour les liens saisis à la main (config du footer, etc.). */
const SIL_PREFIX = "/vie-pratique/energies-et-eau/services-industriels";
const normalizeUrlPath = (url: string) => {
  try {
    const u = new URL(url, "https://www.lausanne.ch");
    return u.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  } catch {
    return url;
  }
};
const routeByUrlPath = new Map<string, string>([
  ...flattenNav().map((n) => [normalizeUrlPath(n.url), n.path] as const),
  ...manifest.map((p) => [normalizeUrlPath(p.url), p.path] as const),
]);

/** Lien à partir d'une URL lausanne.ch (absolue ou relative au domaine), résolu comme le contenu. */
export function linkFromUrl(url: string): ResolvedLink {
  const path = normalizeUrlPath(url.startsWith(SIL_PREFIX) ? `https://www.lausanne.ch${url}` : url);
  const route = routeByUrlPath.get(path);
  if (route) {
    const tab = new URL(url, "https://www.lausanne.ch").searchParams.get("tab");
    return { kind: "internal", to: tab ? `${route}?tab=${encodeURIComponent(tab)}` : route };
  }
  let offsite = true;
  try {
    offsite = !/^(www\.)?lausanne\.ch$/.test(new URL(url, "https://www.lausanne.ch").hostname);
  } catch {
    /* URL relative inconnue */
  }
  return {
    kind: "external",
    href: url.startsWith("/") ? `https://www.lausanne.ch${url}` : url,
    offsite,
  };
}

/** Cible d'un <SmartLink> : `to` (route) > `target` (contenu) > `url` (lausanne.ch). */
export function resolveSmartTarget(props: {
  target?: Pick<LinkTarget, "url" | "slug" | "tab" | "route" | "external">;
  url?: string;
  to?: string;
}): ResolvedLink {
  if (props.to !== undefined) return { kind: "internal", to: props.to };
  if (props.target) return resolveLink(props.target);
  return linkFromUrl(props.url ?? "/");
}
