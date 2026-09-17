import { RichText } from "@/components/ui";
import type { ListBlock } from "@/content/types";
import { cn } from "@/lib/cn";
import type { BlockProps } from "../types";

/**
 * ✅ FINI (variante Prose) — composant de référence des conventions.
 *
 * Liste à puces / numérotée en texte courant, puces green-600 (décoratif).
 * La variante « Étapes » (DESIGN.md § 11.21, marche à suivre / « Libellé : description ») est le
 * composant distinct `templates/parts/Steps.tsx`, choisi par les gabarits (détection dans
 * `enhanceTabBlocks` : liste « Libellé : texte » → 2 colonnes, liste après un titre « Marche à suivre »
 * → 1 colonne) — ce composant reste le rendu par défaut d'une liste dans le flux de blocs.
 */
export function BlockList({ block }: BlockProps<ListBlock>) {
  const Tag = block.ordered ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "prose-sil space-y-2 pl-5 text-body marker:text-green-600",
        block.ordered ? "list-decimal marker:font-bold" : "list-disc",
      )}
    >
      {block.items.map((html, i) => (
        <RichText key={i} as="li" html={html} className="pl-1" />
      ))}
    </Tag>
  );
}
