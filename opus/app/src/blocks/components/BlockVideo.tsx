import { ArrowUpRight, ChartColumn, Map as MapIcon, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Icon } from "@/components/ui";
import type { Block, EmbedProvider, VideoBlock } from "@/content/types";
import { cn } from "@/lib/cn";
import type { BlockContext, BlockProps } from "../types";

const PROVIDERS: Record<
  EmbedProvider,
  { icon: typeof Play; noun: string; host: string; action: string }
> = {
  datawrapper: {
    icon: ChartColumn,
    noun: "Graphique interactif",
    host: "Datawrapper",
    action: "Afficher le graphique",
  },
  "google-maps": {
    icon: MapIcon,
    noun: "Carte interactive",
    host: "Google My Maps",
    action: "Afficher la carte",
  },
  youtube: { icon: Play, noun: "Vidéo", host: "YouTube", action: "Afficher la vidéo" },
  other: {
    icon: Play,
    noun: "Contenu externe",
    host: "un service tiers",
    action: "Afficher le contenu",
  },
};

const CONSENT_KEY = (provider: EmbedProvider) => `sil-embed-consent:${provider}`;

function readConsent(provider: EmbedProvider): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY(provider)) === "1";
  } catch {
    return false;
  }
}

function writeConsent(provider: EmbedProvider) {
  try {
    localStorage.setItem(CONSENT_KEY(provider), "1");
  } catch {
    /* Stockage indisponible (navigation privée…) : le consentement n'est simplement pas mémorisé. */
  }
}

/** YouTube : domaine sans cookies tiers (DESIGN.md § 11.17). */
function embedSrc(block: VideoBlock): string {
  if (block.provider !== "youtube") return block.url;
  try {
    const u = new URL(block.url);
    u.hostname = "www.youtube-nocookie.com";
    return u.href;
  } catch {
    return block.url;
  }
}

/** Titre déduit du dernier `heading` voisin avant le bloc (ex. « Composition du produit nativa »). */
function deducedTitle(context: BlockContext, noun: string, host: string): string {
  const before = context.siblings.slice(0, context.index);
  for (let i = before.length - 1; i >= 0; i--) {
    const b = before[i] as Block;
    if (b.type === "heading") return `${noun} — ${b.text}`;
  }
  return `${noun} (${host})`;
}

/**
 * ✅ Embed avec consentement (DESIGN.md § 11.17). Aucun iframe tiers n'est chargé sans clic.
 * Fait : zone de consentement (icône, texte, bouton), iframe[title][loading=lazy] après clic, titre déduit
 * du titre voisin, mémorisation du choix par fournisseur (localStorage), hauteur auto Datawrapper
 * (postMessage, repli 420 px), YouTube en youtube-nocookie.com, cartes 4:3 mobile / 16:9 desktop.
 */
export function BlockVideo({ block, context }: BlockProps<VideoBlock>) {
  const [consented, setConsented] = useState(() => readConsent(block.provider));
  const [dwHeight, setDwHeight] = useState<number | null>(null);
  const p = PROVIDERS[block.provider];
  const host = new URL(block.url).hostname;
  const title = deducedTitle(context, p.noun, p.host);

  useEffect(() => {
    if (block.provider !== "datawrapper" || !consented) return;
    function onMessage(e: MessageEvent) {
      const data = e.data as Record<string, unknown> | undefined;
      const heights = data?.["datawrapper-height"];
      if (heights && typeof heights === "object") {
        const first = Object.values(heights as Record<string, number>)[0];
        if (typeof first === "number") setDwHeight(first);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [block.provider, consented]);

  const consent = () => {
    setConsented(true);
    writeConsent(block.provider);
  };

  return (
    <figure className="overflow-hidden rounded-card border border-border-default bg-surface-subtle">
      {consented ? (
        <iframe
          src={embedSrc(block)}
          title={title}
          loading="lazy"
          style={dwHeight ? { height: dwHeight } : undefined}
          className={cn(
            "w-full bg-surface",
            dwHeight
              ? undefined
              : block.provider === "google-maps"
                ? "aspect-4/3 md:aspect-video"
                : "aspect-video min-h-105",
          )}
        />
      ) : (
        <div className="flex aspect-video min-h-60 w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="grid size-12 place-items-center rounded-md bg-surface text-link">
            <Icon icon={p.icon} size="lg" />
          </span>
          <p className="font-[650]">{p.noun}</p>
          <p className="w-full max-w-md text-sm text-muted">
            {p.noun} hébergé par {p.host}. En l&apos;affichant, vous acceptez le chargement de
            contenu externe.
          </p>
          <Button variant="secondary" size="sm" onClick={consent}>
            {p.action}
          </Button>
        </div>
      )}
      <figcaption className="flex items-center justify-between gap-3 border-t border-border-default bg-surface px-4 py-1 text-sm text-muted">
        <span>Source : {host}</span>
        <a
          href={block.url}
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 font-[650] text-link"
        >
          Ouvrir <Icon icon={ArrowUpRight} size="sm" />
          <span className="sr-only"> (site externe)</span>
        </a>
      </figcaption>
    </figure>
  );
}
