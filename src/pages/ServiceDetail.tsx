import { useParams, Link, Navigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useServicePublications } from "@/hooks/useServicePublications";

export function ServiceDetail() {
  const { slug } = useParams();
  const { shouldRedirectUnpublished, getMergedService } = useServicePublications();
  const service = slug ? getMergedService(slug) : undefined;

  if (slug === "demarches-administratives") {
    return (
      <Navigate to="/services/gouvernance-structuration" replace />
    );
  }

  if (service && shouldRedirectUnpublished(slug)) {
    return <Navigate to="/services" replace />;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Service non trouvé
          </h2>
          <Link
            to="/services"
            className="text-blue-600 hover:underline"
          >
            Retour aux services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-800/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/services"
                className="inline-flex items-center text-slate-300 hover:text-blue-500 mb-6 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Retour aux services
              </Link>
              <div className="flex items-center mb-4 space-x-4"></div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
                {service.title}
              </h1>
              <p className="text-xl text-slate-200 max-w-2xl leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Description
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed mb-12 whitespace-pre-line">
                  {service.fullDescription}
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Ce que nous offrons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {service.details.map((detail, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start p-2 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <span className="text-slate-700 font-medium">
                        {detail}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {service.benefits && (
                  <>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                      Vos avantages
                    </h3>
                    <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-xl">
                      <ul className="space-y-4">
                        {service.benefits.map(
                          (benefit, idx) => (
                            <li
                              key={idx}
                              className="flex items-center"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                              <span className="text-lg">
                                {benefit}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-8">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    Besoin de ce service ?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Nos experts sont à votre disposition pour
                    analyser vos besoins et vous proposer une
                    solution sur mesure.
                  </p>
                  <Link
                    to="/contact"
                    className="block w-full bg-blue-500 text-slate-900 font-bold text-center py-4 rounded-lg hover:bg-blue-400 transition-colors shadow-md hover:shadow-lg"
                  >
                    Contacter un expert
                  </Link>
                </div>

                <div className="bg-slate-800 text-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4">
                    Pourquoi ORBIS ?
                  </h3>
                  <ul className="space-y-3 text-slate-300 text-sm">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />
                      Expertise multisectorielle
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />
                      Connaissance du terrain RDC
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />
                      Standards internationaux
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}