import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/components/ui/utils';

/** Courbe commune à toutes les animations du site (décélération douce). */
export const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */
/* Apparition au défilement                                            */
/* ------------------------------------------------------------------ */

type RevealFrom = 'up' | 'down' | 'left' | 'right' | 'zoom';

const offsets: Record<RevealFrom, { x?: number; y?: number; scale?: number }> = {
  up: { y: 48 },
  down: { y: -48 },
  left: { x: -64 },
  right: { x: 64 },
  zoom: { scale: 0.9 },
};

/** Fait apparaître son contenu quand il entre à l'écran (une seule fois). */
export function Reveal({
  children,
  from = 'up',
  delay = 0,
  duration = 0.8,
  className,
  as = 'div',
}: {
  children: ReactNode;
  from?: RevealFrom;
  delay?: number;
  duration?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'span';
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, filter: 'blur(6px)', ...offsets[from] }}
      whileInView={{ opacity: 1, filter: 'blur(0px)', x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Conteneur qui déclenche l'apparition en cascade de ses enfants `StaggerItem`. */
export function Stagger({
  children,
  className,
  gap = 0.1,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  as?: 'div' | 'ul';
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Tag>
  );
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE } },
};

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li';
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={staggerItem}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Titre révélé mot par mot (masque)                                   */
/* ------------------------------------------------------------------ */

/**
 * Affiche une ligne de texte dont chaque mot monte depuis sous un masque.
 * `start` permet d'enchaîner plusieurs lignes.
 */
export function WordsReveal({
  text,
  className,
  start = 0,
  gap = 0.06,
  inView = false,
}: {
  text: string;
  className?: string;
  start?: number;
  gap?: number;
  /** true : se déclenche à l'entrée dans l'écran ; false : dès l'affichage. */
  inView?: boolean;
}) {
  const words = text.split(' ');
  const trigger = inView
    ? { whileInView: 'show' as const, viewport: { once: true } }
    : { animate: 'show' as const };
  return (
    <motion.span
      className={cn('inline', className)}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: start } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              show: { y: '0%', rotate: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Compteur animé                                                      */
/* ------------------------------------------------------------------ */

export function CountUp({ to, prefix = '', suffix = '', duration = 2 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Carte inclinable en 3D qui suit la souris                           */
/* ------------------------------------------------------------------ */

export function TiltCard({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 18 });
  const glowX = useTransform(px, (v) => `${v * 100}%`);
  const glowY = useTransform(py, (v) => `${v * 100}%`);
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(420px circle at ${x} ${y}, rgba(255,255,255,0.28), transparent 45%)`,
  );

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={cn('relative [transform-style:preserve-3d]', className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {children}
      {/* Reflet lumineux qui suit le pointeur */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-100"
        style={{ background: glow }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Parallaxe d'image                                                   */
/* ------------------------------------------------------------------ */

/** Image qui glisse plus lentement que la page, révélée par un rideau à l'entrée. */
export function ParallaxImage({ src, alt, className, imgClassName }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <motion.div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.2, ease: EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1.12 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE }}
        className={cn('h-full w-full object-cover', imgClassName)}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Barre de progression de lecture                                     */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-blue-500 via-blue-400 to-gold"
      style={{ scaleX }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Bande défilante infinie                                             */
/* ------------------------------------------------------------------ */

export function Marquee({ children, speed = 30, className }: { children: ReactNode; speed?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div
      className={cn(
        'group/marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]',
        className,
      )}
    >
      <div
        className="flex w-max gap-4 [animation:orbis-marquee_var(--marquee-speed)_linear_infinite] group-hover/marquee:[animation-play-state:paused]"
        style={{ ['--marquee-speed' as string]: `${speed}s` }}
      >
        <div className="flex gap-4">{children}</div>
        <div className="flex gap-4" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
