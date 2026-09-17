import { Info, Leaf, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Icon, RichText } from "@/components/ui";
import { cn } from "@/lib/cn";

export type CalloutVariant = "brand" | "info" | "urgent";

const STYLES: Record<CalloutVariant, { icon: LucideIcon; classes: string }> = {
  brand: { icon: Leaf, classes: "bg-green-50 text-green-900" },
  info: { icon: Info, classes: "bg-blue-50 text-blue-700" },
  urgent: { icon: TriangleAlert, classes: "bg-red-50 text-red-700" },
};

/**
 * Bloc de mise en exergue (DESIGN.md § 11.21) : `brand` pour une phrase-clé de marque (h5 d'intro d'un
 * onglet Tarifs), `info` pour une condition (validité), `urgent` pour les urgences.
 * Assemblé par les gabarits à partir d'un `heading`/`paragraph` — ce n'est pas un type de bloc du CMS.
 */
export function Callout({
  variant = "info",
  html,
  children,
  className,
}: {
  variant?: CalloutVariant;
  html?: string;
  children?: ReactNode;
  className?: string;
}) {
  const s = STYLES[variant];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-card p-5 text-[1.125rem] leading-snug font-[550]",
        s.classes,
        className,
      )}
    >
      <Icon icon={s.icon} size="lg" className="mt-0.5 shrink-0" />
      {html ? <RichText html={html} prose={false} /> : <div>{children}</div>}
    </div>
  );
}
