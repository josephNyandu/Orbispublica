import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

/** Royalty-free stock (Pexels); see `public/images/page-hero-banner.source.txt`. */
const PAGE_HERO_IMAGE = "/images/page-hero-banner.jpg";

type PageHeroBannerProps = {
  children: ReactNode;
  /** Merged with default padding; use to match page-specific vertical rhythm (e.g. py-16, py-20). */
  className?: string;
};

/**
 * Bandeau de page façon ANAPI : image partagée, voile bleu nuit, texte blanc centré.
 */
export function PageHeroBanner({ children, className }: PageHeroBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden text-white text-center",
        "py-14 md:py-20",
        /* Style ANAPI : titre centré, paragraphe centré et lisible sur fond bleu nuit */
        "[&_h1]:font-semibold [&_h1]:text-white [&_p]:mx-auto [&_p]:text-white/85",
        className
      )}
    >
      <div className="absolute inset-0 bg-navy" aria-hidden />
      <div
        className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat sm:bg-center"
        style={{ backgroundImage: `url(${PAGE_HERO_IMAGE})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy/80" aria-hidden />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
