import { PageHeroBanner } from '@/components/PageHeroBanner';
import { SEO } from '@/components/SEO';

export function PublicationsEvenements() {
  return (
    <>
      <SEO
        title="Événements — Publications"
        description="Annonces et comptes rendus de formations, conférences, séminaires, ateliers, rencontres professionnelles et participations institutionnelles."
      />
      <PageHeroBanner className="py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Événements</h1>
          <p className="mt-6 max-w-3xl text-xl text-slate-300">
            Annonces et comptes rendus de formations, conférences, séminaires, ateliers, rencontres professionnelles et participations institutionnelles.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <svg viewBox="0 0 320 240" className="w-full max-w-sm" role="img" aria-label="Calendrier à venir">
              <ellipse cx="160" cy="214" rx="104" ry="10" className="fill-slate-100" />
              <rect x="54" y="38" width="212" height="168" rx="14" className="fill-white stroke-blue-900" strokeWidth="3" />
              <path d="M54 52a14 14 0 0 1 14-14h184a14 14 0 0 1 14 14v38H54z" className="fill-blue-900" />
              <rect x="94" y="22" width="10" height="34" rx="5" className="fill-blue-600" />
              <rect x="216" y="22" width="10" height="34" rx="5" className="fill-blue-600" />
              {[0, 1, 2, 3, 4].map((c) =>
                [0, 1, 2].map((r) => (
                  <rect
                    key={`${c}-${r}`}
                    x={76 + c * 36}
                    y={110 + r * 28}
                    width="22"
                    height="16"
                    rx="3"
                    className={c === 3 && r === 1 ? 'fill-blue-600' : 'fill-slate-200'}
                  />
                ))
              )}
              <circle cx="244" cy="176" r="34" className="fill-white stroke-blue-600" strokeWidth="3" />
              <path d="M244 156v21l14 9" fill="none" className="stroke-blue-600" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <h2 className="mt-10 text-2xl font-bold text-slate-900 md:text-3xl">L’agenda arrive bientôt</h2>
          </div>
        </div>
      </section>
    </>
  );
}
