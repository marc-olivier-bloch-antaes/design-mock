import { ArrowRight } from "lucide-react";
import { ArrowLink, Badge, Card, Icon, Section, SmartLink } from "@/components/ui";
import type { NavNode } from "@/content/types";
import { MEGAMENU_EXTRAS } from "@/config/site";
import { PageHero } from "@/layout/PageHero";
import { PageMeta } from "@/layout/PageMeta";
import { menuGroups } from "@/layout/navLinks";

const HOME_CRUMB = { label: "Accueil", url: "/", external: false, slug: "accueil" };

/**
 * « Vue d'ensemble » d'une rubrique racine (/particuliers, /professionnels…).
 * DÉCISION : sur lausanne.ch ces URL affichent le contenu de l'accueil à l'identique. Plutôt que de dupliquer
 * l'accueil, le prototype génère une page sommaire depuis navigation.json (cible du lien « Vue d'ensemble »
 * du méga-menu et des niveaux « Particuliers »… du fil d'Ariane).
 */
export function RubriquePage({ node }: { node: NavNode }) {
  const intro = node.section ? MEGAMENU_EXTRAS[node.section].intro : undefined;
  return (
    <>
      <PageMeta title={node.label} description={intro} />
      <PageHero
        title={node.label}
        lead={intro}
        breadcrumb={[
          HOME_CRUMB,
          { label: node.label, url: node.url, external: false, route: node.path },
        ]}
      />
      <Section>
        <ul role="list" className="grid gap-grid md:grid-cols-2 lg:grid-cols-3">
          {menuGroups(node).map(({ title, items }) => (
            <li key={title.id}>
              <Card className="h-full">
                <h2 className="text-h4">
                  {title.id === node.id ? (
                    "Pages de la rubrique"
                  ) : (
                    <SmartLink to={title.path} className="hover:text-link hover:underline">
                      {title.label}
                    </SmartLink>
                  )}
                </h2>
                {/* Entrée de menu sans sous-pages (ex. « Contact ») : lien direct plutôt qu'une carte vide. */}
                {items.length === 0 && title.id !== node.id && (
                  <ArrowLink to={title.path} className="mt-3">
                    Accéder à la page
                    {title.kind === "out-of-scope" && (
                      <Badge className="ml-1 align-middle">Hors prototype</Badge>
                    )}
                  </ArrowLink>
                )}
                {items.length > 0 && (
                  <ul role="list" className="mt-3">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="not-first:border-t not-first:border-border-default"
                      >
                        <SmartLink
                          to={item.path}
                          className="group flex min-h-11 items-center justify-between gap-3 py-2 font-semibold hover:text-link"
                        >
                          <span>
                            {item.label}
                            {item.kind === "out-of-scope" && (
                              <Badge className="ml-2 align-middle">Hors prototype</Badge>
                            )}
                          </span>
                          <Icon
                            icon={ArrowRight}
                            size="sm"
                            className="text-neutral-400 group-hover:text-link"
                          />
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
