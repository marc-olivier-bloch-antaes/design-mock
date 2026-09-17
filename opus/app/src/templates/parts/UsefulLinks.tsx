import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Icon, SmartLink } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { UsefulLinkGroup } from "@/lib/usefulLinks";

/**
 * Aside « Liens utiles » (DESIGN.md § 11.8, § 11.11) : groupes de couples heading + paragraphes-liens
 * (« En relation », « Conditions des prestations »…) extraits du contenu principal par `extractUsefulLinks`.
 */
export function UsefulLinks({
  groups,
  title = "Liens utiles",
}: {
  groups: UsefulLinkGroup[];
  title?: string;
}) {
  if (groups.length === 0) return null;
  return (
    <section aria-label={title} className="rounded-card border border-border-default p-5">
      <h2 className="text-h4">{title}</h2>
      <div className="mt-3 divide-y divide-border-default">
        {groups.map((g) => (
          <div key={g.title} className="py-3 first:pt-1">
            {g.title.trim().toLowerCase() !== title.trim().toLowerCase() && (
              <p className="mb-1 text-sm font-bold text-neutral-700">{g.title}</p>
            )}
            <ul role="list">
              {g.items.map((item) => (
                <li key={item.url + item.label}>
                  <SmartLink
                    target={item}
                    className="group flex min-h-11 items-start justify-between gap-2 py-1.5 leading-snug font-semibold hover:text-link"
                  >
                    <span>
                      <span className="block">{item.label}</span>
                      {item.description && (
                        <span className="block text-sm font-normal text-muted">
                          {item.description}
                        </span>
                      )}
                    </span>
                    <Icon
                      icon={item.external ? ArrowUpRight : ArrowRight}
                      size="sm"
                      className={cn(
                        "mt-1 shrink-0 text-neutral-400 transition-transform group-hover:text-link",
                        !item.external && "group-hover:translate-x-[3px]",
                      )}
                    />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
