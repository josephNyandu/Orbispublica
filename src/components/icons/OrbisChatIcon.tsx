import type { SVGProps } from 'react';

/**
 * Bulle de dialogue ORBIS : le globe du logo (sphère et méridiens) dans une bulle à queue décalée.
 */
export function OrbisChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M16 3.5c6.9 0 12.5 4.8 12.5 10.8S22.9 25.1 16 25.1c-1.5 0-2.9-.2-4.2-.6L5.5 28l1.6-5.3C4.7 20.8 3.5 17.7 3.5 14.3 3.5 8.3 9.1 3.5 16 3.5z" />
      <circle cx="16" cy="14.3" r="5.2" />
      <path d="M10.8 14.3c3.4-1.6 7-1.6 10.4 0" />
      <path d="M16 9.1c-2.6 2.7-2.6 7.7 0 10.4" stroke="#00ACE7" />
    </svg>
  );
}
