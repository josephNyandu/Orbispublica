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
 * Full-width page hero with shared background art, dark overlay for white text,
 * and a slate fallback if the image is missing.
 */
export function PageHeroBanner({ children, className }: PageHeroBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden text-white",
        "py-12 md:py-20",
        className
      )}
    >
      <div className="absolute inset-0 bg-slate-900" aria-hidden />
      <div
        className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat sm:bg-center"
        style={{ backgroundImage: `url(${PAGE_HERO_IMAGE})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-950/93 via-slate-900/80 to-slate-800/50"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
