import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse" | "outline-inverse";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-action text-on-action hover:bg-action-hover active:bg-action-active",
  secondary:
    "bg-surface text-ink border-border-strong hover:border-neutral-900 hover:bg-neutral-25",
  ghost: "border-transparent bg-transparent text-link hover:bg-action-subtle hover:text-link-hover",
  inverse: "border-transparent bg-white text-neutral-900 hover:bg-green-50",
  "outline-inverse":
    "bg-transparent text-white border-white/55 hover:border-white hover:bg-white/8",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-[18px] text-[0.9375rem]",
  md: "min-h-12 px-6 text-base",
  lg: "min-h-14 px-7 text-[1.0625rem]",
};

/** Classes d'un bouton (DESIGN.md § 11.16), exportées pour les rares cas non couverts par <Button>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  block,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}) {
  return cn(
    "group/btn inline-flex items-center justify-center gap-2.5 rounded-pill border-[1.5px] py-2",
    "text-center font-[650] leading-tight text-balance no-underline",
    "transition-[background-color,border-color,color,transform] duration-(--sil-duration-fast) ease-standard active:translate-y-px motion-reduce:active:translate-y-0",
    VARIANTS[variant],
    variant === "ghost" ? cn(SIZES[size].replace(/px-\S+/, ""), "px-3") : SIZES[size],
    block && "w-full",
    className,
  );
}
