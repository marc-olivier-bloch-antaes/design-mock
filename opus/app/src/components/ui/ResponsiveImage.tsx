import { images } from "@/content";
import type { ImageId } from "@/content/types";
import { cn } from "@/lib/cn";

export interface ResponsiveImageProps {
  /** Identifiant du manifeste d'images (champ `src` / `image` / `heroImage` du contenu). */
  src: ImageId;
  /** "" pour une image décorative (le crédit va en figcaption). */
  alt: string;
  /** Attribut `sizes` : largeur d'affichage prévue, ex. "(min-width: 64rem) 40vw, 100vw". */
  sizes?: string;
  /** Image principale au-dessus de la ligne de flottaison (LCP) : chargement prioritaire. */
  priority?: boolean;
  /** Force le mode de recadrage ; par défaut celui du manifeste (`contain` pour schémas / visuels à texte). */
  fit?: "cover" | "contain";
  /** Mode `contain` : fond neutral-50 + padding (défaut). `false` pour un pictogramme posé tel quel. */
  padded?: boolean;
  /** Classes de l'<img> (ratio, rayon, taille). Par défaut l'image occupe toute la largeur disponible. */
  className?: string;
  /** Classes de l'enveloppe <picture> (placement dans une grille / un flex). */
  wrapperClassName?: string;
}

/**
 * <picture> AVIF + WebP avec srcset, width/height (pas de décalage de mise en page),
 * `loading="lazy"` sauf `priority` (DESIGN.md § 7). Le cadrage (ratio, rayon) est donné par `className`.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = "100vw",
  priority = false,
  fit,
  padded = true,
  className,
  wrapperClassName,
}: ResponsiveImageProps) {
  const asset = images[src];
  if (!asset) {
    if (import.meta.env.DEV) console.warn(`[ResponsiveImage] image inconnue : ${src}`);
    return null;
  }
  const mode = fit ?? asset.fit;
  // Largeur par défaut : pleine largeur, sauf si l'appelant fixe une taille (size-*, w-*).
  const sized = /(^|\s)(size|w)-/.test(className ?? "");
  const imgClass = cn(
    "block h-auto",
    !sized && "w-full",
    mode === "contain" ? cn("object-contain", padded && "bg-surface-subtle p-4") : "object-cover",
    className,
  );
  const common = {
    alt,
    width: asset.width,
    height: asset.height,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    fetchPriority: priority ? ("high" as const) : undefined,
  };
  if (!asset.avif || !asset.webp) {
    return <img src={asset.fallback} className={cn(imgClass, wrapperClassName)} {...common} />;
  }
  const srcSet = (list: { width: number; src: string }[]) =>
    list.map((s) => `${s.src} ${s.width}w`).join(", ");
  return (
    <picture className={cn("block", wrapperClassName)}>
      <source type="image/avif" srcSet={srcSet(asset.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset.webp)} sizes={sizes} />
      <img src={asset.fallback} className={imgClass} {...common} />
    </picture>
  );
}
