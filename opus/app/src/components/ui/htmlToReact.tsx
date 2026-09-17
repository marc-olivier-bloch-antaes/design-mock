import { Fragment, createElement, type ReactNode } from "react";
import { SmartLink } from "./SmartLink";

/** Balises autorisées (identiques à la liste blanche de l'import, scripts/lib/normalize.ts › N8). */
const ALLOWED = new Set(["strong", "em", "br", "sup", "sub"]);

export function htmlToReact(html: string): ReactNode[] {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  return Array.from(doc.body.childNodes).map((n, i) => convert(n, String(i)));
}

function convert(node: ChildNode, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const children = Array.from(el.childNodes).map((c, i) => convert(c, `${key}.${i}`));

  if (tag === "br") return <br key={key} />;
  if (tag === "a") {
    const slug = el.getAttribute("data-slug") ?? undefined;
    const tab = el.getAttribute("data-tab") ?? undefined;
    const route = el.getAttribute("data-route") ?? undefined;
    const url = el.getAttribute("href") ?? "";
    if (!url && !slug && !route) return <Fragment key={key}>{children}</Fragment>;
    let external = false;
    try {
      external = /^https?:/.test(url) && !/^(www\.)?lausanne\.ch$/.test(new URL(url).hostname);
    } catch {
      /* href relatif ou mailto: */
    }
    return (
      <SmartLink key={key} target={{ url, slug, tab, route, external }}>
        {children}
      </SmartLink>
    );
  }
  if (ALLOWED.has(tag)) return createElement(tag, { key }, children);
  return <Fragment key={key}>{children}</Fragment>;
}

/** Texte brut d'un fragment HTML (titres de document, attributs, recherche). */
export function htmlToText(html: string): string {
  return (
    new DOMParser().parseFromString(`<body>${html}</body>`, "text/html").body.textContent?.trim() ??
    ""
  );
}
