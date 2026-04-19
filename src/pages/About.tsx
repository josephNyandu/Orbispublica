import { motion } from 'motion/react';
import { CheckCircle, Target, Users, ShieldCheck, Lightbulb } from 'lucide-react';
import { firmPositioningParagraph, firmStrategicContextParagraph } from '@/data/siteCopy';
import { SEO } from '@/components/SEO';

export function About() {
  return (
    <div className="pt-20">
      <SEO 
        title="Notre Cabinet" 
        description="Partenaire de confiance et facilitateur de projets, ORBIS PUBLICA accompagne les initiatives publiques et privées en RDC." 
      />
      {/* Header */}
      <div className="bg-slate-800 py-20 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos de nous</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Partenaire de confiance et facilitateur de projets, ORBIS PUBLICA accompagne les initiatives publiques et privées en République Démocratique du Congo, en assurant leur structuration, leur sécurisation et leur mise en œuvre dans le respect des exigences juridiques, financières et opérationnelles.
          </p>
        </div>
      </div>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Qui sommes-nous ?</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                <strong className="text-slate-900">ORBIS PUBLICA</strong>
                {firmPositioningParagraph.replace(/^ORBIS PUBLICA/, '')}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {firmStrategicContextParagraph}
              </p>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
               <img 
                src="https://images.unsplash.com/photo-1600249194900-ab1df847da11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwZW5naW5lZXJpbmclMjBhZnJpY2F8ZW58MXx8fHwxNzYzOTIwMzcxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Construction" 
                className="rounded-lg w-full h-48 object-cover shadow-md"
              />
              <img 
                src="https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMHNpZ25pbmclMjBwZW58ZW58MXx8fHwxNzYzOTIwMzcxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Legal" 
                className="rounded-lg w-full h-48 object-cover shadow-md translate-y-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Notre mission</h2>
            <p className="text-slate-600">
              Une approche intégrée, éthique et orientée vers les résultats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                Apporter un accompagnement juridique, stratégique, technique et opérationnel à chaque étape du cycle de vie des projets : de l’idéation à la structuration, du financement à la contractualisation, de l’exécution à l’évaluation des impacts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Convictions</h3>
              <p className="text-slate-600 leading-relaxed">
                La professionnalisation de la gestion des projets publics, le développement des partenariats public-privé (PPP), ainsi que
                l’exigence de conformité, de transparence et de performance constituent des leviers essentiels du développement durable.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Plus-value</h3>
              <p className="text-slate-600 leading-relaxed">
                Nous combinons une expertise locale éprouvée, une maîtrise du cadre réglementaire national et une expertise des standards
                internationaux en matière de PPP, de marchés publics et de gestion de projets de développement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us List */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-10">
          <div className="bg-slate-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-6">Pourquoi choisir ORBIS PUBLICA ?</h3>
                <p className="text-slate-300 mb-6">
                  Nous portons un appui structuré et stratégique pour faciliter un accès sécurisé et équitable aux opportunités.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0" />
                    <p>Garantir la conformité des projets avec les exigences règlementaires et contractuelles.</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0" />
                    <p>Assurer une mise en œuvre rigoureuse, traçable et orientée vers la performance.</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-blue-500 mr-4 flex-shrink-0" />
                    <p>Renforcer durablement la gouvernance et la transparence.</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-6">Nos méthodes d'intervention</h3>
                <ul className="space-y-4">
                  <li className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                    Une lecture rigoureuse du cadre légal et institutionnel.
                  </li>
                  <li className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                    Des solutions pratiques, adaptées aux réalités locales.
                  </li>
                  <li className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                    Un accompagnement multidisciplinaire (Droit, Stratégie, Gouvernance).
                  </li>
                  <li className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500">
                    Une culture du dialogue constructif entre toutes les parties prenantes.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
