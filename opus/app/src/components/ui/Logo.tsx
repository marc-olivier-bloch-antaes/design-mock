import logoNegatif from "@/assets/brand/logo-sil-negatif.svg";
import logoPositif from "@/assets/brand/logo-sil-positif.svg";
import { cn } from "@/lib/cn";

/**
 * Logo SiL recadré (viewBox 106.73×30) — DESIGN.md § 9.
 * `positive` sur fond clair, `negative` sur fond sombre (footer). Hauteur via className (h-[26px] lg:h-8…).
 */
export function Logo({
  variant = "positive",
  alt = "",
  className,
}: {
  variant?: "positive" | "negative";
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={variant === "positive" ? logoPositif : logoNegatif}
      alt={alt}
      width={107}
      height={30}
      className={cn("h-[26px] w-auto", className)}
    />
  );
}
