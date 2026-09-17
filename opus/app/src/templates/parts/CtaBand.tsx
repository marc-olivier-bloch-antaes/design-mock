import { ArrowRight, Phone, TriangleAlert } from "lucide-react";
import logoMonochrome from "@/assets/brand/logo-sil-monochrome.svg";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { CONTACT_URL, PHONE } from "@/config/site";

/**
 * ✅ Bandeau d'appel à l'action green-900 (DESIGN.md § 11.20) : filigrane des lettres du logo (5 %) en
 * bas à droite. Un seul par page.
 */
export function CtaBand() {
  return (
    <section
      aria-labelledby="cta-band-title"
      className="on-dark relative isolate overflow-hidden bg-surface-brand py-section-sm text-inverse"
    >
      <img
        src={logoMonochrome}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -bottom-10 h-40 w-auto text-white opacity-5 select-none md:h-52"
      />
      <Container className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <h2 id="cta-band-title" className="text-h2">
            Vous avez une question ?
          </h2>
          <p className="mt-3 text-body-lg text-green-100">
            Formulaire, guichet ou téléphone, nos spécialistes sont à votre disposition !
          </p>
          <p className="mt-5 flex items-start gap-2.5 text-sm text-green-100">
            <Icon icon={TriangleAlert} size="sm" className="mt-0.5 text-amber-400" />
            Urgences ou pannes : 7j/7, 24h/24 au {PHONE.display} (menu vocal, tapez 4)
          </p>
        </div>
        <div className="flex flex-wrap gap-3 max-sm:[&>*]:flex-[1_1_100%]">
          <ButtonLink url={CONTACT_URL} variant="inverse" size="lg" trailingIcon={ArrowRight}>
            Nous contacter
          </ButtonLink>
          <a
            href={PHONE.href}
            className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-pill border-[1.5px] border-white/55 px-7 text-[1.0625rem] font-[650] text-white no-underline hover:border-white hover:bg-white/8"
          >
            <Icon icon={Phone} size="button" />
            {PHONE.display}
          </a>
        </div>
      </Container>
    </section>
  );
}
