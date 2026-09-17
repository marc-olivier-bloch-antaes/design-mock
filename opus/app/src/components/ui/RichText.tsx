import { createElement, useMemo, type ElementType } from "react";
import { cn } from "@/lib/cn";
import { htmlToReact } from "./htmlToReact";

export interface RichTextProps {
  html: string;
  /** Élément enveloppe (p, div, li, span…). Sans `as`, rend un fragment (à placer dans un parent existant). */
  as?: ElementType;
  className?: string;
  /** Applique les styles de texte riche (liens soulignés green-700, strong 700). Défaut : true. */
  prose?: boolean;
  id?: string;
}

/**
 * Rendu SÛR du HTML inline du CMS, sans `dangerouslySetInnerHTML` :
 * le fragment est analysé par DOMParser puis reconstruit en éléments React à partir d'une liste blanche
 * (a, strong, em, br, sup, sub). Tout autre élément est remplacé par son texte ; aucun attribut n'est recopié.
 * Liens : `data-slug` (+ `data-tab`) / `data-route` → <Link> du routeur ; sinon <a> sortant.
 */
export function RichText({ html, as, className, prose = true, id }: RichTextProps) {
  const nodes = useMemo(() => htmlToReact(html), [html]);
  if (!as) return <>{nodes}</>;
  return createElement(as, { className: cn(prose && "prose-sil", className), id }, nodes);
}
