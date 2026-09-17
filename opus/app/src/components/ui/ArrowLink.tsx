import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { SmartLink, type SmartLinkProps } from "./SmartLink";

/** Lien flèche « En savoir plus → » (DESIGN.md § 11.16) : 650, green-700, 44 px de haut. */
export function ArrowLink({ className, children, ...rest }: SmartLinkProps) {
  return (
    <SmartLink
      {...rest}
      className={cn(
        "group/arrow inline-flex min-h-11 items-center gap-2 font-[650] text-link no-underline hover:text-link-hover",
        className,
      )}
    >
      {children}
      <Icon
        icon={ArrowRight}
        className="transition-transform duration-(--sil-duration-fast) group-hover/arrow:translate-x-[3px] motion-reduce:group-hover/arrow:translate-x-0"
      />
    </SmartLink>
  );
}
