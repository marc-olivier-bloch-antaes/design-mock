import { ArrowUpRight, Lock } from "lucide-react";
import { ArrowLink, ButtonLink, Icon, Section } from "@/components/ui";
import { findNavTrail } from "@/content";
import type { Crumb, NavNode } from "@/content/types";
import { PageHero } from "@/layout/PageHero";
import { PageMeta } from "@/layout/PageMeta";

/**
 * Entrée du menu dont la page n'a pas été crawlée (DÉCISION documentée dans ARCHITECTURE.md § Routage) :
 * la route existe (le menu reste navigable), la page l'explique et renvoie vers la page d'origine.
 */
export function OutOfScopePage({ node }: { node: NavNode }) {
  const trail = findNavTrail(node.path);
  const breadcrumb: Crumb[] = [
    { label: "Accueil", url: "/", external: false, slug: "accueil" },
    ...trail.map((n) => ({
      label: n.label,
      url: n.url,
      external: false,
      ...(n.slug ? { slug: n.slug } : { route: n.path }),
    })),
  ];
  const parent = trail.length > 1 ? trail[trail.length - 2] : undefined;

  return (
    <>
      <PageMeta title={node.label} />
      <PageHero
        title={node.label}
        breadcrumb={breadcrumb}
        lead={
          node.requiresLogin
            ? "Cette page fait partie de l'espace client authentifié des SiL : elle n'est pas reprise dans ce prototype."
            : "Cette page existe sur lausanne.ch mais se situe hors du périmètre de ce prototype."
        }
      />
      <Section spacing="sm">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          {node.requiresLogin && (
            <p className="flex items-center gap-2 text-muted">
              <Icon icon={Lock} size="sm" /> Connexion requise sur le site actuel.
            </p>
          )}
          <ButtonLink target={{ url: node.url, external: false }} icon={ArrowUpRight}>
            Voir la page actuelle sur lausanne.ch
          </ButtonLink>
          {parent ? (
            <ArrowLink to={parent.path}>Retour à « {parent.label} »</ArrowLink>
          ) : (
            <ArrowLink to="/">Retour à l&apos;accueil</ArrowLink>
          )}
        </div>
      </Section>
    </>
  );
}
