import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useServicePublications } from "@/hooks/useServicePublications";

export function Services() {
  const { visibleServices } = useServicePublications();

  return (
    <div className="pt-20">
      <div className="bg-slate-800 py-20 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos domaines d'intervention</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Une offre de services intégrée pour accompagner maîtres d’ouvrage, entreprises et bailleurs de fonds.
          </p>
        </div>
      </div>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col h-full border border-slate-100"
              >
                <div className="p-8 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    <Link
                      to={`/expertises/${service.slug}`}
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
                      to={`/expertises/${service.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                    >
                      Fiche détaillée
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
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
