import { Target, ShieldCheck, Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeroBanner } from '@/components/PageHeroBanner';

export function CabinetVisionMission() {
  return (
    <>
      <SEO
        title="Vision et mission — ORBIS PUBLICA"
        description="Mission, convictions et plus-value : une approche intégrée pour les projets publics et les PPP en RDC."
      />
      <PageHeroBanner className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Vision et mission</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Une approche intégrée, éthique et orientée vers les résultats.</p>
        </div>
      </PageHeroBanner>

      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">Notre mission</h2>
            <p className="text-slate-600">Les principes qui guident notre action au quotidien.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">Mission</h3>
              <p className="leading-relaxed text-slate-600">
                Apporter un accompagnement juridique, stratégique, technique et opérationnel à chaque étape du cycle de vie des projets :
                de l&apos;idéation à la structuration, du financement à la contractualisation, de l&apos;exécution à l&apos;évaluation des impacts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">Convictions</h3>
              <p className="leading-relaxed text-slate-600">
                La professionnalisation de la gestion des projets publics, le développement des partenariats public-privé (PPP), ainsi que
                l&apos;exigence de conformité, de transparence et de performance constituent des leviers essentiels du développement durable.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-slate-900">Plus-value</h3>
              <p className="leading-relaxed text-slate-600">
                Nous combinons une expertise locale éprouvée, une maîtrise du cadre réglementaire national et une expertise des standards
                internationaux en matière de PPP, de marchés publics et de gestion de projets de développement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
