import { ResponsiveImage } from "@/components/ui";
import type { ImageBlock } from "@/content/types";
import type { BlockProps } from "../types";

/**
 * ✅ FINI (variante Figure) — composant de référence des conventions (DESIGN.md § 7, § 11.19).
 *
 * - Photo : ratio 3:2, `object-cover`, rayon lg. Schéma / visuel à texte (`fit: contain` dans le
 *   manifeste) : jamais recadré, fond neutral-50 + padding.
 * - `alt` vide si le CMS ne donnait qu'un crédit ; le crédit s'affiche en figcaption.
 * - La variante « Média + texte » (image + titre voisins) est composée par les gabarits avec
 *   `templates/parts/MediaRow.tsx` (détection dans `enhanceTabBlocks` / `ContentTemplate`), qui ne
 *   passe pas par ce composant.
 */
export function BlockImage({ block, context }: BlockProps<ImageBlock>) {
  const inAside = context.region === "aside";
  return (
    <figure className="max-w-(--sil-container-prose)">
      <ResponsiveImage
        src={block.src}
        alt={block.alt}
        sizes={inAside ? "20rem" : "(min-width: 64rem) 45rem, 100vw"}
        className="aspect-3/2 rounded-lg"
      />
      {block.caption && (
        <figcaption className="mt-2.5 text-sm text-muted">{block.caption}</figcaption>
      )}
    </figure>
  );
}
