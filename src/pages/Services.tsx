import { motion } from "motion/react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { useServicePublications } from "@/hooks/useServicePublications";
import { SEO } from "@/components/SEO";
import { PageHeroBanner } from "@/components/PageHeroBanner";

export function Services() {
  const { visibleServices } = useServicePublications();

  return (
    <div className="pt-20">
      <SEO
        title="Services"
        description="Découvrez l’offre de services d’ORBIS PUBLICA : PPP, marchés publics, projets de développement et conformité réglementaire."
      />
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Nos domaines d'intervention</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Une offre de services intégrée pour accompagner maîtres d’ouvrage, entreprises et bailleurs de fonds.
          </p>
        </div>
      </PageHeroBanner>

      <section className="py-12 md:py-20 bg-mint">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="anapi-card group flex h-full flex-col bg-white"
              >
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    <Link
                      to={`/services/${service.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {service.title}
                    </Link>
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed flex-grow">
                    {service.description}
                  </p>

                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-anapi hover:text-blue-500"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                      Fiche détaillée
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
