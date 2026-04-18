import { Briefcase, GraduationCap } from 'lucide-react';

export function Careers() {
  return (
    <div className="pt-20">
       <div className="bg-slate-800 py-20 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Carrières & talents</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Nous croyons fermement que le capital humain constitue le levier le plus stratégique 
            pour accompagner la transformation des économies africaines.
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-2/3">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Profils recherchés</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Nous sommes en permanence à la recherche de talents seniors et experts aux compétences éprouvées, 
                capables d’intervenir dans des environnements complexes.
              </p>

              <div className="space-y-6 mb-12">
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Domaines prioritaires</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Juriste senior (Commande publique)",
                    "Expert gestion projets financés (UE, BAD)",
                    "Fiscaliste & Comptable (OHADA)",
                    "Spécialiste montage financements",
                    "Consultant gouvernance institutionnelle",
                    "Chargé de veille réglementaire"
                  ].map((job, i) => (
                    <li key={i} className="flex items-center bg-slate-50 p-4 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-slate-700 font-medium">{job}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 mb-12">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Compétences transversales</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Maîtrise professionnelle du français et de l’anglais (impératif)</li>
                  <li>Capacité à produire des livrables de haut niveau</li>
                  <li>Forte autonomie et culture du résultat</li>
                  <li>Connaissance du contexte africain, notamment RDC</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Comment postuler ?</h2>
                <div className="bg-white border border-slate-200 p-6 rounded-xl">
                  <p className="text-slate-600 mb-4">
                    Envoyez votre CV et lettre de motivation à :
                    <a href="mailto:recrutement@orbispublica.org" className="text-blue-600 font-bold hover:underline ml-1">recrutement@orbispublica.org</a>
                  </p>
                  <p className="text-sm text-slate-500 italic">
                    Objet : Candidature (Nom du poste ou Spontanée). Seuls les candidats présélectionnés seront contactés.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-slate-800 text-white p-8 rounded-2xl sticky top-24">
                <h3 className="text-2xl font-bold mb-6">Stages & jeunes pros</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Nous encourageons la relève. Des programmes de stages encadrés sont régulièrement ouverts.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Jeunes diplômés</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Étudiants en fin de cycle</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-blue-500 mr-3" />
                    <span>Chercheurs en formation</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-600/60">
                  <p className="text-sm text-slate-400">
                    <strong className="text-white">Durée :</strong> 3 à 6 mois<br/>
                    Possibilité d’intégration selon les performances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
