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
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Pourquoi choisir ORBIS PUBLICA ?</h2>
              <p className="mb-8 text-lg text-slate-600">
                Nous portons un appui structuré et stratégique pour faciliter un accès sécurisé et équitable aux opportunités.
              </p>
              <ul className="divide-y divide-slate-200 border-t border-slate-200 text-slate-700">
                <li className="py-4">Garantir la conformité des projets avec les exigences règlementaires et contractuelles.</li>
                <li className="py-4">Assurer une mise en œuvre rigoureuse, traçable et orientée vers la performance.</li>
                <li className="py-4">Renforcer durablement la gouvernance et la transparence.</li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Nos méthodes d&apos;intervention</h2>
              <ul className="divide-y divide-slate-200 border-y border-slate-200 text-slate-700">
                <li className="py-4">Une lecture rigoureuse du cadre légal et institutionnel.</li>
                <li className="py-4">Des solutions pratiques, adaptées aux réalités locales.</li>
                <li className="py-4">Un accompagnement multidisciplinaire (Droit, Stratégie, Gouvernance).</li>
                <li className="py-4">Une culture du dialogue constructif entre toutes les parties prenantes.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
