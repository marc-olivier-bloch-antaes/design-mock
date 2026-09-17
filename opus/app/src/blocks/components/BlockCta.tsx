import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import type { CtaBlock } from "@/content/types";
import type { BlockProps } from "../types";

/**
 * ✅ FINI — Bouton primaire (DESIGN.md § 11.16) : tous les CTA verts inline du site actuel deviennent `primary`.
 * Dans une carte produit (onglet Produits), le CTA est rendu directement par `ProductCard`
 * (`ProduitsTab` retire ces blocs du flux avant de passer le reste à `BlockRenderer`), pas par ce composant.
 */
export function BlockCta({ block }: BlockProps<CtaBlock>) {
  return (
    <div>
      <ButtonLink target={block} variant="primary" trailingIcon={ArrowRight}>
        {block.label}
      </ButtonLink>
    </div>
  );
}
