import type { SVGProps } from 'react';

/**
 * Pictogrammes ORBIS PUBLICA : trait marine et aplat bleu ciel, dessinés sur la même grille 48 px
 * (angles arrondis, une courbe de méridien rappelant le logo).
 */
const ACCENT = '#00ACE7';

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

/** Demi-globe qui se lève sur un horizon, avec un repère de texte réglementaire. */
export function IconHorizon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M8 32a16 16 0 0 1 32 0z" fill={ACCENT} fillOpacity="0.22" stroke="none" />
      <path d="M8 32a16 16 0 0 1 32 0" />
      <path d="M24 16c-7 4-7 12 0 16" />
      <path d="M4 32h40" />
      <path d="M12 39h12M12 44h20" stroke={ACCENT} />
    </Base>
  );
}

/** Levier et point d'appui : la structure qui fait peser l'effort. */
export function IconLevier(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M24 28l-8 14h16z" fill={ACCENT} fillOpacity="0.22" />
      <path d="M6 34L42 20" />
      <rect x="31" y="9" width="12" height="11" rx="2.5" fill={ACCENT} fillOpacity="0.22" transform="rotate(-21 37 14.5)" />
      <circle cx="9" cy="33" r="3.5" fill="currentColor" stroke="none" />
      <path d="M4 42h40" />
    </Base>
  );
}

/** Sphère en orbite : les perspectives, sur le motif du logo. */
export function IconOrbite(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="24" cy="24" r="10" fill={ACCENT} fillOpacity="0.22" />
      <path d="M14.5 21c6-3 13-3 19 0M14.5 27c6 3 13 3 19 0" />
      <ellipse cx="24" cy="24" rx="20" ry="7.5" transform="rotate(-24 24 24)" />
      <circle cx="41" cy="14" r="3" fill={ACCENT} stroke="none" />
    </Base>
  );
}
