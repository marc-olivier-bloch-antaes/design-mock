import type { ReactNode } from "react";
import { ResponsiveImage } from "@/components/ui";
import { images } from "@/content";
import type { ImageId } from "@/content/types";
import { cn } from "@/lib/cn";

/**
 * Média + texte (DESIGN.md § 11.19) : vignette carrée 14rem à gauche du texte ≥ md, empilé sur mobile.
 * Visuel large non recadrable (`contain`, ratio ≥ 1.8, ex. bannière Calculateur) : toujours empilé, au
 * ratio d'origine, pour rester lisible.
 */
export function MediaRow({
  image,
  alt = "",
  fit,
  children,
  className,
}: {
  image: ImageId;
  alt?: string;
  fit?: "cover" | "contain";
  children: ReactNode;
  className?: string;
}) {
  const asset = images[image];
  const wide = !!asset && (fit ?? asset.fit) === "contain" && asset.width / asset.height >= 1.8;
  if (wide) {
    return (
      <div className={cn("flex max-w-(--sil-container-prose) flex-col gap-5", className)}>
        <ResponsiveImage
          src={image}
          alt={alt}
          fit={fit}
          sizes="(min-width: 64rem) 45rem, 100vw"
          // Petite source (< 600 px, ex. logo CECB 310 px) : pas d'agrandissement flou au-delà de 24rem.
          wrapperClassName={asset.width < 600 ? "max-w-sm" : undefined}
          className="w-full rounded-lg"
        />
        <div className="min-w-0 space-y-3">{children}</div>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-start", className)}>
      <ResponsiveImage
        src={image}
        alt={alt}
        fit={fit}
        sizes="(min-width: 48rem) 14rem, 100vw"
        wrapperClassName="shrink-0 md:w-56"
        className="aspect-square w-full rounded-lg md:w-56"
      />
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
    </div>
  );
}
