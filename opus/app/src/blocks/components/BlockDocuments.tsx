import { ArrowUpRight, Download, Link as LinkIcon } from "lucide-react";
import { Icon, VisuallyHidden, stretchedLinkClass } from "@/components/ui";
import type { DocumentFormat, DocumentsBlock } from "@/content/types";
import { cn } from "@/lib/cn";
import type { BlockProps } from "../types";

const BADGE_STYLE: Record<DocumentFormat, string> = {
  PDF: "bg-red-50 text-red-700",
  DOCX: "bg-blue-50 text-blue-700",
  JSON: "bg-amber-50 text-amber-700",
  LINK: "bg-surface-muted text-neutral-700",
};

/**
 * ✅ Liste de documents (DESIGN.md § 11.12) : lignes 72 px, badge carré 44 px rayon sm, lien étiré,
 * méta « PDF · 144 Ko · date » (« Page web · lausanne.ch » pour un lien), survol fond neutral-25 +
 * action green-50, annonce accessible du format et du poids.
 */
export function BlockDocuments({ block }: BlockProps<DocumentsBlock>) {
  return (
    <ul role="list" className="overflow-hidden rounded-card border border-border-default">
      {block.items.map((doc) => {
        const isLink = doc.format === "LINK";
        const host = isLink ? safeHost(doc.url) : null;
        const meta = [isLink ? "Page web" : doc.format, host, doc.size, doc.date]
          .filter(Boolean)
          .join(" · ");
        return (
          <li
            key={doc.url + doc.label}
            className="group relative flex min-h-18 items-center gap-4 px-5 py-3 not-first:border-t not-first:border-border-default focus-within:outline-3 focus-within:-outline-offset-3 focus-within:outline-focus hover:bg-neutral-25"
          >
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-sm text-sm font-bold",
                BADGE_STYLE[doc.format],
              )}
              aria-hidden="true"
            >
              {isLink ? <Icon icon={LinkIcon} size="sm" /> : doc.format}
            </span>
            <div className="min-w-0 flex-1">
              <a
                href={doc.url}
                rel="noopener noreferrer"
                className={cn("font-[650] hover:underline", stretchedLinkClass)}
              >
                {doc.label}
                {!isLink && (
                  <VisuallyHidden>{` (${[doc.format, doc.size].filter(Boolean).join(", ")})`}</VisuallyHidden>
                )}
              </a>
              <p className="text-sm text-muted">{meta}</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full text-link transition-colors group-hover:bg-green-50">
              <Icon icon={isLink ? ArrowUpRight : Download} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
