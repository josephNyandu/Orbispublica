import { CheckCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeroBanner } from '@/components/PageHeroBanner';

export function CabinetAPropos() {
  return (
    <>
      <SEO
        title="À propos — Notre cabinet"
        description="ORBIS PUBLICA accompagne les initiatives publiques et privées en RDC : structuration, sécurisation et mise en œuvre des projets."
      />
      <PageHeroBanner className="py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">À propos de nous</h1>
          <p className="mt-6 max-w-3xl text-xl text-slate-300">
            Partenaire de confiance et facilitateur de projets, ORBIS PUBLICA accompagne les initiatives publiques et privées en République
            Démocratique du Congo, en assurant leur structuration, leur sécurisation et leur mise en œuvre dans le respect des exigences
            juridiques, financières et opérationnelles.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 md:p-12">
            <div className="flex flex-col gap-12 md:flex-row">
              <div className="md:w-1/2">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Pourquoi choisir ORBIS PUBLICA ?</h2>
                <p className="mb-6 text-slate-600">
                  Nous portons un appui structuré et stratégique pour faciliter un accès sécurisé et équitable aux opportunités.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="mr-4 h-6 w-6 flex-shrink-0 text-blue-500" />
                    <p className="text-slate-700">Garantir la conformité des projets avec les exigences règlementaires et contractuelles.</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="mr-4 h-6 w-6 flex-shrink-0 text-blue-500" />
                    <p className="text-slate-700">Assurer une mise en œuvre rigoureuse, traçable et orientée vers la performance.</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="mr-4 h-6 w-6 flex-shrink-0 text-blue-500" />
                    <p className="text-slate-700">Renforcer durablement la gouvernance et la transparence.</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="mb-6 text-2xl font-bold text-slate-900">Nos méthodes d&apos;intervention</h2>
                <ul className="space-y-4">
                  <li className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                    Une lecture rigoureuse du cadre légal et institutionnel.
                  </li>
                  <li className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                    Des solutions pratiques, adaptées aux réalités locales.
                  </li>
                  <li className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                    Un accompagnement multidisciplinaire (Droit, Stratégie, Gouvernance).
                  </li>
                  <li className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-sm">
                    Une culture du dialogue constructif entre toutes les parties prenantes.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
