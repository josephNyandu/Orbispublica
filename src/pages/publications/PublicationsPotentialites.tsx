import { Lightbulb, LineChart, Target } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { SEO } from '@/components/SEO';

const themes = [
  {
    title: 'Horizons réglementaires',
    text: 'Anticipation des évolutions législatives et des standards internationaux applicables aux projets publics et aux financements.',
    icon: LineChart,
  },
  {
    title: 'Leviers de structuration',
    text: 'Identification des schémas de gouvernance, de montage et de contractualisation les plus adaptés au contexte des pays en développement.',
    icon: Target,
  },
  {
    title: 'Idées & perspectives',
    text: 'Notes prospectives sur les PPP, la mobilisation de capitaux et le renforcement des capacités institutionnelles.',
    icon: Lightbulb,
  },
];

export function PublicationsPotentialites() {
  return (
    <>
      <SEO
        title="Potentialités — Publications"
        description="Notes de prospective et analyses de fond ORBIS PUBLICA sur les trajectoires de développement et les modèles de projet."
      />
      <PageHeroBanner className="py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Potentialités</h1>
          <p className="mt-6 max-w-3xl text-xl text-slate-300">
            Une série d’angles prospectifs : tendances, scénarios et opportunités de transformation pour les acteurs publics et leurs partenaires.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.title}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <Icon className="mb-5 h-10 w-10 text-blue-600" aria-hidden />
                  <h2 className="text-xl font-bold text-slate-900">{t.title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-slate-600">
              Les publications détaillées sous « Potentialités » seront progressivement enrichies. Pour les dossiers concrets
              d’appels et de financements, consultez la rubrique{' '}
              <Link to="/opportunites" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
                Opportunités
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
