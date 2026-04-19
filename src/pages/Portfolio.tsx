import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fetchPublicRealisations, type Realisation } from "@/lib/api";
import { SEO } from "@/components/SEO";
import { PageHeroBanner } from "@/components/PageHeroBanner";

export function Portfolio() {
  const [projects, setProjects] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicRealisations()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Impossible de charger les réalisations.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pt-20">
      <SEO 
        title="Nos Réalisations" 
        description="Découvrez nos projets réussis dans divers secteurs et contextes institutionnels en République Démocratique du Congo." 
      />
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Nos réalisations</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Un portefeuille diversifié de missions réussies, couvrant un large éventail de secteurs et de contextes institutionnels.
          </p>
        </div>
      </PageHeroBanner>

      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6 md:px-10">
          {loading && (
            <p className="text-center text-slate-600 py-12">Chargement des réalisations…</p>
          )}
          {error && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-center text-red-800">
              {error}
            </div>
          )}
          {!loading && !error && projects.length === 0 && (
            <p className="text-center text-slate-600 py-12">
              Aucune réalisation publiée pour le moment.
            </p>
          )}
          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      {project.category}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{project.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{project.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
