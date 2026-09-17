import { ArrowUp, Bus, ChevronDown } from "lucide-react";
import { useState } from "react";
import ecusson from "@/assets/brand/ecusson-lausanne.svg";
import { Container, Icon, Logo, SmartLink, SocialIcon } from "@/components/ui";
import {
  FOOTER_ADDRESS,
  FOOTER_COLUMNS,
  LAUSANNE_HOME_URL,
  LEGAL_LINKS,
  SITE_NAME,
  SOCIAL_LINKS,
  type FooterColumn,
} from "@/config/site";
import { MQ, useMediaQuery } from "@/lib/useMediaQuery";

/** Pied de page (DESIGN.md § 11.5) : colonne marque + 5 colonnes de liens (accordéons < md), bas de page légal. */
export function Footer() {
  const isMd = useMediaQuery(MQ.md);

  return (
    <footer className="on-dark bg-surface-inverse text-[0.9375rem] text-neutral-300">
      <Container className="grid gap-10 pt-14 pb-10 lg:grid-cols-[minmax(0,3.2fr)_minmax(0,8.8fr)] lg:gap-16 lg:pt-18 lg:pb-14">
        <div>
          <Logo variant="negative" alt={`SiL – ${SITE_NAME}`} className="h-8" />
          <address className="mt-5 leading-[1.6] not-italic">
            <strong className="font-[650] text-white">{FOOTER_ADDRESS.title}</strong>
            {FOOTER_ADDRESS.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a
            href={FOOTER_ADDRESS.transitUrl}
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-11 items-center gap-2 font-semibold text-green-300 hover:underline hover:underline-offset-3"
          >
            <Icon icon={Bus} size="button" />
            S&apos;y rendre en transports publics
            <span className="sr-only"> (site externe)</span>
          </a>
          <ul role="list" className="mt-4 flex gap-2">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.network}>
                <a
                  href={s.url}
                  rel="noopener noreferrer"
                  aria-label={`${s.label} (site externe)`}
                  className="grid size-11 place-items-center rounded-full border border-white/18 text-white hover:border-white/50 hover:bg-white/8"
                >
                  <SocialIcon network={s.network} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav
          aria-label="Liens de pied de page"
          className="grid md:grid-cols-3 md:gap-x-6 md:gap-y-8 lg:grid-cols-5"
        >
          {FOOTER_COLUMNS.map((col) => (
            <FooterCol key={col.title} column={col} forceOpen={isMd} />
          ))}
        </nav>
      </Container>

      <div className="border-t border-(--sil-border-inverse)">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 text-sm text-neutral-400">
          <a
            href={LAUSANNE_HOME_URL}
            rel="noopener"
            aria-label="Un site de la Ville de Lausanne"
            className="inline-flex min-h-11 items-center"
          >
            <img src={ecusson} alt="" className="h-3.5 w-auto" width={132} height={14} />
          </a>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {LEGAL_LINKS.map((l) => (
              <SmartLink
                key={l.label}
                url={l.url}
                className="inline-flex min-h-11 items-center no-underline hover:text-white hover:underline"
              >
                {l.label}
              </SmartLink>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
              })
            }
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white"
          >
            Haut de page <Icon icon={ArrowUp} size="sm" />
          </button>
        </Container>
      </div>
    </footer>
  );
}

/** Colonne repliable < md (details/summary 56 px), toujours ouverte ≥ md. */
function FooterCol({ column, forceOpen }: { column: FooterColumn; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      open={forceOpen || open}
      onToggle={(e) => {
        if (!forceOpen) setOpen(e.currentTarget.open);
      }}
      className="group border-t border-(--sil-border-inverse) md:border-t-0"
    >
      <summary
        tabIndex={forceOpen ? -1 : undefined}
        className="flex min-h-14 cursor-pointer list-none items-center justify-between font-bold text-white md:pointer-events-none md:mb-3 md:min-h-0 md:cursor-default md:text-[0.9375rem]"
      >
        {column.title}
        <Icon
          icon={ChevronDown}
          className="text-neutral-400 transition-transform duration-(--sil-duration-base) group-open:rotate-180 md:hidden"
        />
      </summary>
      <ul role="list" className="pb-4">
        {column.links.map((link) => (
          <li key={link.label}>
            <SmartLink
              url={link.url}
              className="flex min-h-10 items-center no-underline hover:text-white hover:underline hover:underline-offset-3 md:min-h-0 md:py-1.5 md:leading-[1.4]"
            >
              {link.label}
            </SmartLink>
          </li>
        ))}
      </ul>
    </details>
  );
}
