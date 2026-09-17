import { ResponsiveImage, RichText } from "@/components/ui";
import type { ImageId, InlineHtml } from "@/content/types";

export interface Feature {
  icon: ImageId;
  html: InlineHtml;
}

/**
 * Grille d'avantages à pictogrammes (DESIGN.md § 11.21) : suite « picto + paragraphe court » du CMS
 * (ex. onglet Pompe à chaleur) → 2 colonnes mobile, 4 colonnes ≥ lg. Les pictos sont décoratifs
 * (`alt=""`), leurs crédits ne sont pas affichés.
 */
export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <ul role="list" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {features.map((f, i) => (
        <li key={i} className="flex flex-col gap-3 rounded-md bg-surface-subtle p-4">
          <ResponsiveImage
            src={f.icon}
            alt=""
            fit="contain"
            padded={false}
            sizes="48px"
            wrapperClassName="size-12"
            className="size-12"
          />
          <RichText as="p" html={f.html} prose={false} className="leading-snug font-[550]" />
        </li>
      ))}
    </ul>
  );
}
