import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/components/ui/utils";
import { EASE } from "@/components/motion/Motion";

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
        className="orbis-kenburns absolute inset-0 bg-cover bg-[center_top] bg-no-repeat sm:bg-center"
        style={{ backgroundImage: `url(${PAGE_HERO_IMAGE})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy/80" aria-hidden />
      {/* Le contenu du bandeau monte en place, chaque bloc avec un léger décalage */}
      <motion.div
        className="relative z-10"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 30, clipPath: "inset(0 0 100% 0)" },
            show: { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.9, ease: EASE } },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
