import imgChantier from '@/assets/images/cabinet-chantier.jpg';
import imgSignature from '@/assets/images/cabinet-signature.jpg';
import { SEO } from '@/components/SEO';
import { PageHeroBanner } from '@/components/PageHeroBanner';

export function CabinetQuiSommesNous() {
  return (
    <>
      <SEO
        title="Qui sommes-nous — ORBIS PUBLICA"
        description="Présentation du cabinet ORBIS PUBLICA : conformité, commande publique et ingénierie de projets, depuis Kinshasa."
      />
      <PageHeroBanner className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Qui sommes-nous ?</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Identité, expertise et mission du cabinet.</p>
        </div>
      </PageHeroBanner>

      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col items-start gap-12 md:flex-row">
            <div className="md:w-1/2">
              <p className="mb-6 leading-relaxed text-slate-600">
                <strong className="text-slate-900">ORBIS PUBLICA</strong> est un cabinet de conseil et d’expertise qui accompagne les acteurs publics et privés dans la maîtrise de leurs enjeux de conformité, la conduite de leurs opérations de commande publique et le développement de leurs projets.
              </p>
              <p className="mb-4 leading-relaxed text-slate-600">
                Son expertise s’articule autour de trois domaines complémentaires :
              </p>
              <ul className="mb-6 space-y-3 leading-relaxed text-slate-600">
                <li className="border-l-4 border-blue-500 pl-4">
                  <strong className="text-slate-900">Conformité :</strong> audit juridique, éthique, gouvernance, prévention et gestion des risques.
                </li>
                <li className="border-l-4 border-blue-500 pl-4">
                  <strong className="text-slate-900">Commande publique :</strong> identification des opportunités, accompagnement dans les procédures de passation et suivi de l’exécution des marchés publics et des partenariats public-privé (PPP).
                </li>
                <li className="border-l-4 border-blue-500 pl-4">
                  <strong className="text-slate-900">Ingénierie de projets :</strong> montage, structuration et développement de projets, ainsi que mobilisation des ressources nécessaires à leur mise en œuvre.
                </li>
              </ul>
              <p className="leading-relaxed text-slate-600">
                Établi à Kinshasa, en République démocratique du Congo (RDC), le cabinet développe ses activités au croisement des enjeux juridiques, institutionnels, techniques et stratégiques. Son approche contribue à la sécurisation juridique et organisationnelle des activités, au renforcement des pratiques de gouvernance ainsi qu'à la structuration et au développement de projets viables.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-4 md:w-1/2">
              <img
                src={imgChantier}
                alt="Chantier et ingénierie"
                className="h-48 w-full rounded-lg object-cover shadow-md"
              />
              <img
                src={imgSignature}
                alt="Documents et conformité"
                className="h-48 w-full translate-y-8 rounded-lg object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
