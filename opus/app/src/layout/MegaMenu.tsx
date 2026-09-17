import { ArrowLink, Container, Eyebrow, ResponsiveImage, SmartLink } from "@/components/ui";
import type { NavNode } from "@/content/types";
import { MEGAMENU_EXTRAS } from "@/config/site";
import { cn } from "@/lib/cn";
import { menuGroups, OVERVIEW_LABEL } from "./navLinks";

/**
 * Panneau de méga-menu d'une rubrique (DESIGN.md § 11.2) : intro | groupes (3 col.) | « À la une ».
 * Toujours rendu (attribut `hidden` quand fermé) pour que `aria-controls` pointe sur un élément existant.
 */
export function MegaMenu({ root, open }: { root: NavNode; open: boolean }) {
  const extra = root.section ? MEGAMENU_EXTRAS[root.section] : undefined;
  const groups = menuGroups(root);

  return (
    <div
      id={`mega-${root.id}`}
      hidden={!open}
      className="absolute inset-x-0 top-full z-(--sil-z-megamenu) hidden animate-dropdown border-t border-border-default bg-white shadow-lg lg:block lg:[&[hidden]]:hidden"
    >
      <Container className="grid grid-cols-[15rem_1fr_18rem] gap-12 pt-10 pb-12">
        <div>
          <h2 className="text-h3 leading-[1.2]">{root.label}</h2>
          {extra?.intro && <p className="mt-2.5 text-sm text-muted">{extra.intro}</p>}
          <ArrowLink to={root.path} className="mt-3">
            {OVERVIEW_LABEL}
          </ArrowLink>
        </div>

        <div className="grid grid-cols-3 content-start gap-x-8 gap-y-7">
          {groups.map(({ title, items }) => (
            <div key={title.id}>
              <h3 className="text-base font-bold">
                <SmartLink
                  to={title.path}
                  className="flex min-h-10 items-start pt-2.5 pb-1.5 leading-[1.3] no-underline hover:text-link pointer-coarse:min-h-11"
                >
                  {title.label}
                </SmartLink>
              </h3>
              {items.length > 0 && (
                <ul role="list" className="mt-0.5 border-l-2 border-neutral-100">
                  {items.map((item) => (
                    <li key={item.id + item.path}>
                      <SmartLink
                        to={item.path}
                        className={cn(
                          "-ml-0.5 flex min-h-9 items-center border-l-2 border-transparent py-1 pl-3.5 text-[0.9375rem] leading-normal text-neutral-700 no-underline",
                          "hover:border-green-500 hover:text-ink pointer-coarse:min-h-11",
                        )}
                      >
                        {item.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div>
          {extra?.feature && (
            <SmartLink
              url={extra.feature.url}
              className="group block overflow-hidden rounded-card bg-surface-subtle no-underline"
            >
              <ResponsiveImage
                src={extra.feature.image}
                alt=""
                sizes="18rem"
                fit="cover"
                className="aspect-16/10"
              />
              <span className="block px-5 pt-4 pb-5">
                <Eyebrow as="span" className="mb-1.5 text-xs">
                  À la une
                </Eyebrow>
                <strong className="block text-[1.0625rem] leading-[1.3] group-hover:underline group-hover:underline-offset-3">
                  {extra.feature.title}
                </strong>
              </span>
            </SmartLink>
          )}
        </div>
      </Container>
    </div>
  );
}
