import { useParams, Link, Navigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { useServicePublications } from "@/hooks/useServicePublications";
import { legacyServiceSlugs } from "@/data/services";

export function ServiceDetail() {
  const { slug } = useParams();
  const { shouldRedirectUnpublished, getMergedService } = useServicePublications();
  const service = slug ? getMergedService(slug) : undefined;

  if (slug && legacyServiceSlugs[slug]) {
    return <Navigate to={`/services/${legacyServiceSlugs[slug]}`} replace />;
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

  const whyUs = service.whyUs ?? [
    "Expertise multisectorielle",
    "Connaissance du terrain RDC",
    "Standards internationaux",
  ];

  return (
    <div className="pt-20">
      {/* Bandeau : texte à gauche, photo à droite */}
      <section className="bg-navy text-white">
        <div className="container mx-auto grid items-center gap-10 px-6 py-12 md:px-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/services"
              className="group mb-6 inline-flex items-center text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Retour aux services
            </Link>
            <h1 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">{service.title}</h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/85">{service.description}</p>
            <Link to="/contact" className="anapi-btn anapi-btn--pill">
              <ChevronRight className="h-4 w-4" aria-hidden />
              Contacter un expert
            </Link>
          </motion.div>
          <motion.div
            className="overflow-hidden rounded-2xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <img src={service.image} alt={service.title} className="aspect-[4/3] w-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="anapi-title mb-8 text-3xl">Description</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-slate-700">{service.fullDescription}</p>
          </motion.div>
        </div>
      </section>

      {/* Ce que nous offrons */}
      <section className="bg-mint py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="anapi-title mb-10 text-3xl">Ce que nous offrons</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {service.details.map((detail, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 2) * 0.08 }}
                className="flex items-start gap-3 rounded-xl bg-white p-5 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" aria-hidden />
                <span className="font-medium text-slate-800">{detail}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vos avantages */}
      {service.benefits && service.benefits.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-10">
            <h2 className="anapi-title mb-10 text-3xl">Vos avantages</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {service.benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-xl border-l-4 border-blue-500 bg-slate-800 p-6 text-white shadow-lg"
                >
                  {benefit}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pourquoi Orbis Publica ? + contact */}
      <section className="bg-navy py-16 text-white md:py-20">
        <div className="container mx-auto grid gap-10 px-6 md:px-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="mb-6 text-3xl font-bold">Pourquoi Orbis Publica ?</h2>
            <ul className="space-y-3 text-slate-200">
              {whyUs.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-8 text-slate-900 shadow-xl">
            <h3 className="mb-3 text-2xl font-bold">Besoin de ce service ?</h3>
            <p className="mb-6 text-slate-600">
              Nos experts analysent vos besoins et vous proposent une solution sur mesure.
            </p>
            <Link to="/contact" className="anapi-btn">
              <ChevronRight className="h-4 w-4" aria-hidden />
              Contacter un expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
