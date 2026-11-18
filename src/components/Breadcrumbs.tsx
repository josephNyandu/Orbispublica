import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';

export type Crumb = { label: string; to?: string };

/** Fil d'Ariane façon ANAPI, placé sous le titre des bandeaux de page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: 'Accueil', to: '/' }, ...items];
  return (
    <nav aria-label="Fil d’Ariane" className="mt-4 mb-6">
      <ol className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0 text-sm">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
              {c.to && !last ? (
                <Link to={c.to} className="text-blue-400 transition-colors hover:text-gold-bright">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white/85" aria-current={last ? 'page' : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight className="h-3 w-3 text-white/60" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
