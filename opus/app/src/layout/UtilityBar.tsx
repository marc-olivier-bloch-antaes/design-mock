import { TriangleAlert } from "lucide-react";
import ecusson from "@/assets/brand/ecusson-lausanne.svg";
import { Container, Icon, SmartLink } from "@/components/ui";
import { CONTACT_URL, LAUSANNE_HOME_URL, PHONE } from "@/config/site";

/** Barre utilitaire neutral-950, 36 px, non collante (DESIGN.md § 11.1). */
export function UtilityBar() {
  return (
    <div className="on-dark bg-neutral-950 text-xs leading-none text-neutral-300">
      <Container className="flex min-h-(--sil-utility-bar-h) items-center justify-between gap-4">
        <a
          href={LAUSANNE_HOME_URL}
          rel="noopener"
          className="inline-flex min-h-(--sil-utility-bar-h) items-center gap-2.5 no-underline hover:text-white"
        >
          <span>Un site de la</span>
          <img
            src={ecusson}
            alt="Ville de Lausanne"
            className="h-[13px] w-auto"
            width={124}
            height={13}
          />
        </a>
        <div className="hidden gap-6 md:flex">
          <a
            href={PHONE.href}
            className="inline-flex min-h-(--sil-utility-bar-h) items-center gap-2.5 no-underline hover:text-white"
          >
            <Icon icon={TriangleAlert} size="sm" />
            <span>
              Urgences ou pannes 24h/24&nbsp;:{" "}
              <strong className="font-[650] text-white">{PHONE.display}</strong>
            </span>
          </a>
          <SmartLink
            url={CONTACT_URL}
            className="inline-flex min-h-(--sil-utility-bar-h) items-center no-underline hover:text-white"
          >
            Contact
          </SmartLink>
        </div>
      </Container>
    </div>
  );
}
