import { RichText } from "@/components/ui";
import type { ParagraphBlock } from "@/content/types";
import type { BlockProps } from "../types";

/**
 * ✅ FINI — composant de référence des conventions.
 *
 * - HTML inline rendu via <RichText> (liste blanche, liens internes → <Link>) : jamais de dangerouslySetInnerHTML.
 * - Longueur de ligne ≤ 68 caractères (`--sil-measure`), 16 px minimum.
 * - Les heuristiques contextuelles (paragraphe-lien « En relation » → LinkList dans l'aside) sont
 *   du ressort des GABARITS, qui retirent ces blocs avant de rendre le contenu principal.
 */
export function BlockParagraph({ block }: BlockProps<ParagraphBlock>) {
  if (!block.html) return null;
  return <RichText as="p" html={block.html} className="text-body text-ink" />;
}
