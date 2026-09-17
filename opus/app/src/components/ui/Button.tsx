import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";
import { Icon } from "./Icon";
import { SmartLink, type SmartLinkProps } from "./SmartLink";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pleine largeur. */
  block?: boolean;
  /** Icône avant le libellé. */
  icon?: LucideIcon;
  /** Icône après le libellé (ex. ArrowRight) : glisse de 3 px au survol. */
  trailingIcon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

function Content({
  icon,
  trailingIcon,
  children,
}: Pick<CommonProps, "icon" | "trailingIcon" | "children">) {
  return (
    <>
      {icon && <Icon icon={icon} size="button" />}
      <span>{children}</span>
      {trailingIcon && (
        <Icon
          icon={trailingIcon}
          size="button"
          className="transition-transform duration-(--sil-duration-fast) group-hover/btn:translate-x-[3px] motion-reduce:group-hover/btn:translate-x-0"
        />
      )}
    </>
  );
}

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

/** Bouton d'action (élément <button>). */
export function Button({
  variant,
  size,
  block,
  icon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, block, className })} {...rest}>
      <Content icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </button>
  );
}

export type ButtonLinkProps = CommonProps & Omit<SmartLinkProps, "children" | "className">;

/** Lien stylé en bouton (CTA) : accepte `target` (contenu), `url` (lausanne.ch) ou `to` (route). */
export function ButtonLink({
  variant,
  size,
  block,
  icon,
  trailingIcon,
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <SmartLink
      {...(linkProps as SmartLinkProps)}
      className={buttonClasses({ variant, size, block, className })}
    >
      <Content icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </SmartLink>
  );
}
