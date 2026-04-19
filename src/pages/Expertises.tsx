import { motion } from "motion/react";
import { SEO } from "@/components/SEO";
import { PageHeroBanner } from "@/components/PageHeroBanner";

const expertiseBlocks = [
  {
    title: "Partenariats Public-Privé (PPP) et marchés publics",
    body:
      "Accompagnement juridique, institutionnel et stratégique des partenariats public-privé (PPP), ainsi que des procédures de passation et d’exécution des marchés publics.",
  },
  {
    title: "Projets de développement",
    body:
      "Appui à la conception, à la structuration et à l’analyse des projets d’infrastructures et de développement socio-économique, de l’identification à leur maturité.",
  },
  {
    title: "Financements et modèles d’exploitation",
    body:
      "Expertise dans la mobilisation des ressources financières publiques et privées, la recherche de subventions et la structuration des modèles d’exploitation durable des projets.",
  },
] as const;

/** Page « Expertises » : positionnement éditorial du cabinet (distinct du catalogue /services). */
export function Expertises() {
  return (
    <div className="pt-20">
      <SEO
        title="Expertises"
        description="ORBIS PUBLICA : PPP et marchés publics, projets de développement, financements et modèles d’exploitation."
      />
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Expertises – ORBIS PUBLICA
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Trois axes d’intervention au service des acteurs publics, privés et du développement.
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
                  <span
                    className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
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
