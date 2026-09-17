import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import type { LinkTarget } from "@/content/types";
import { resolveSmartTarget } from "@/lib/links";
import { Icon } from "./Icon";
import { VisuallyHidden } from "./VisuallyHidden";

type Target =
  | {
      target: Pick<LinkTarget, "url" | "slug" | "tab" | "route" | "external">;
      url?: never;
      to?: never;
    }
  | { url: string; target?: never; to?: never }
  | { to: string; target?: never; url?: never };

export type SmartLinkProps = Target &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target"> & {
    children: ReactNode;
    /** Ajoute l'icône ArrowUpRight après le libellé pour un lien vers un autre domaine. */
    externalIcon?: boolean;
    /** Liens internes : ne pas remonter en haut de page (changement d'onglet). */
    preventScrollReset?: boolean;
  };

/**
 * LE composant de lien de l'app. Accepte une cible du contenu (`target`), une URL lausanne.ch (`url`)
 * ou une route (`to`) et rend un <Link> du routeur ou un <a> sortant.
 * Liens vers un autre domaine : « (site externe) » masqué pour les lecteurs d'écran (DESIGN.md § 10).
 */
export function SmartLink({
  target,
  url,
  to,
  children,
  externalIcon = false,
  preventScrollReset,
  ...rest
}: SmartLinkProps) {
  const resolved = resolveSmartTarget({ target, url, to });
  if (resolved.kind === "internal") {
    return (
      <Link to={resolved.to} preventScrollReset={preventScrollReset} {...rest}>
        {children}
      </Link>
    );
  }
  const isWeb = /^https?:/.test(resolved.href);
  return (
    <a href={resolved.href} {...(isWeb ? { rel: "noopener noreferrer" } : {})} {...rest}>
      {children}
      {resolved.offsite && isWeb && (
        <>
          {externalIcon && (
            <Icon icon={ArrowUpRight} size="sm" className="ml-1 inline-block align-[-0.125em]" />
          )}
          <VisuallyHidden> (site externe)</VisuallyHidden>
        </>
      )}
    </a>
  );
}
