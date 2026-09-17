import type { LucideIcon } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  /** Obligatoire : nom accessible du bouton. */
  label: string;
  outline?: boolean;
}

/** Bouton rond 44 px à icône seule (recherche, fermer, flèches de carrousel). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, outline, className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-(--sil-duration-fast) disabled:cursor-default disabled:opacity-40",
        outline
          ? "border-[1.5px] border-border-strong bg-white hover:border-neutral-900"
          : "bg-transparent hover:bg-surface-muted",
        className,
      )}
      {...rest}
    >
      <Icon icon={icon} />
    </button>
  );
});
