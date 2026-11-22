import { motion } from "motion/react";
import { SEO } from "@/components/SEO";
import { PageHeroBanner } from "@/components/PageHeroBanner";

const expertiseBlocks = [
  {
    title: "Conformité",
    body:
      "Expertise en audit juridique, éthique, gouvernance, prévention et gestion des risques. Accompagnement des organisations dans la sécurisation de leurs activités et le renforcement de leurs dispositifs de conformité et de contrôle.",
  },
  {
    title: "Commande publique",
    body:
      "Accompagnement des acteurs dans l’accès aux marchés publics et aux partenariats public-privé (PPP), les procédures de passation et le suivi de l’exécution des contrats. Appui à l’identification des opportunités et à la préparation des dossiers de soumission.",
  },
  {
    title: "Ingénierie de projets",
    body:
      "Appui au montage, à la structuration et au développement de projets, ainsi qu’à la mobilisation des ressources nécessaires à leur mise en œuvre.",
  },
] as const;

/** Page « Expertises » : positionnement éditorial du cabinet (distinct du catalogue /services). */
export function Expertises() {
  return (
    <div className="pt-20">
      <SEO
        title="Expertises"
        description="ORBIS PUBLICA : conformité, commande publique et ingénierie de projets au service des acteurs publics, privés et du développement."
      />
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Nos expertises
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Trois domaines complémentaires au service des acteurs publics, privés et des acteurs du développement.
          </p>
        </div>
      </PageHeroBanner>

      <section className="py-12 md:py-20 bg-slate-50" aria-label="Domaines d’expertise">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseBlocks.map((block, index) => (
              <motion.article
                key={block.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border border-slate-100"
              >
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 leading-snug">{block.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">{block.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
