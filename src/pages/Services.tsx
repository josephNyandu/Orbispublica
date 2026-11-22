import { motion } from "motion/react";
import { TiltCard } from "@/components/motion/Motion";
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: (index % 2) * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <TiltCard className="group h-full rounded-xl">
                <div className="anapi-card flex h-full flex-col bg-white sm:flex-row">
                <Link to={`/services/${service.slug}`} className="block aspect-[3/2] shrink-0 overflow-hidden bg-mint sm:aspect-auto sm:w-2/5" tabIndex={-1} aria-hidden>
                  <img
                    src={service.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </Link>
                <div className="p-6 md:p-8 flex flex-col flex-1">
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
                </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
