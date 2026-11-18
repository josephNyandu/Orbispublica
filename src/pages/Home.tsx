import avocatsEnLigneImage from '../assets/avocats-en-ligne-une-solution-rapide-efficace-pour-les-particuliers-et-les-professionnels.jpg';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useServicePublications } from '@/hooks/useServicePublications';
import { SEO } from '@/components/SEO';

export function Home() {
  const { visibleServices } = useServicePublications();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1676647018922-9b9e8ec7622d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLaW5zaGFzYSUyMGNpdHklMjBza3lsaW5lJTIwbW9kZXJuJTIwYnVpbGRpbmdzfGVufDF8fHx8MTc2NjE0NDMwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1573164574511-73c773193279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwYnVzaW5lc3MlMjBtZWV0aW5nJTIwZGl2ZXJzZSUyMHRlYW0lMjBjb3Jwb3JhdGV8ZW58MXx8fHwxNzY2MTQ0MzA0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1746171136129-d59a8bc0507b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBpbnRlcmlvciUyMGFyY2hpdGVjdHVyZSUyMGFmcmljYXxlbnwxfHx8fDE3NjYxNDQzMDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1738574138187-ae52275c61c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmZyYXN0cnVjdHVyZSUyMGNvbnN0cnVjdGlvbiUyMHByb2plY3QlMjBhZnJpY2ElMjByb2FkfGVufDF8fHx8MTc2NjE0NDMwNHww&ixlib=rb-4.1.0&q=80&w=1080"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white">
      <SEO />
      {/* Bandeau d'accueil façon ANAPI : photo, voile bleu à gauche, titre blanc, deux boutons arrondis */}
      <section className="relative flex min-h-[620px] h-screen items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-blue-700">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentImageIndex}
              src={backgroundImages[currentImageIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 h-full w-full object-cover"
              alt=""
            />
          </AnimatePresence>
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,56,97,0.88)_0%,rgba(3,56,97,0.6)_55%,rgba(3,56,97,0.15)_100%)]"
            aria-hidden
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 pt-20 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Projets, <span className="text-blue-400">Partenariats</span>
              <br />& Financements
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
              Expertise en PPP, marchés publics et projets de développement, intégrant la mobilisation de financements, subventions et exonérations, au service de la mise en œuvre de projets en RDC et en Afrique.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/expertises" className="anapi-btn anapi-btn--pill">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Nos expertises
              </Link>
              <Link to="/contact" className="anapi-btn anapi-btn--pill anapi-btn--gold">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Présentation */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="anapi-title mb-8 max-w-xl text-3xl md:text-4xl">
                Un partenaire de référence pour structurer et garantir la viabilité des projets à fort impact
              </h2>

              <div className="max-w-xl space-y-5 text-justify">
                <p className="text-lg leading-relaxed text-slate-800">
                  Dans un contexte marqué par une exigence croissante de transparence et de performance,{' '}
                  <strong className="text-blue-600">ORBIS PUBLICA</strong> accompagne les acteurs publics et privés dans
                  la structuration, la sécurisation et la mise en œuvre efficace de projets en partenariats
                  public-privé (PPP), marchés publics et projets de développement.
                </p>
                <p className="leading-relaxed text-slate-600">
                  Nous transformons les défis réglementaires et administratifs en opportunités stratégiques, dans
                  une approche orientée conformité, performance et résultats.
                </p>
              </div>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Expertise locale éprouvée',
                  'Réseau institutionnel',
                  'Standards internationaux',
                  'Approche sur-mesure',
                ].map((item, idx) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 * idx, duration: 0.45 }}
                    className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-[0_10px_30px_rgba(3,80,137,0.12)]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-anapi">
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-sm font-bold leading-snug text-blue-600">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <Link to="/notre-cabinet" className="anapi-btn mt-8">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Notre cabinet
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative pb-10"
            >
              <img
                src={avocatsEnLigneImage}
                alt="Avocats en ligne, solution rapide et efficace pour particuliers et professionnels"
                className="aspect-[4/5] max-h-[min(32rem,70vh)] w-full rounded-xl object-cover shadow-xl"
              />
              <div className="absolute bottom-0 left-4 max-w-[17rem] rounded-xl bg-blue-600 p-5 text-white shadow-2xl">
                <p className="m-0 text-sm font-bold text-blue-300">Projets accompagnés</p>
                <p className="m-0 font-[family-name:var(--font-head)] text-5xl font-bold tabular-nums">+50</p>
                <p className="mt-2 border-t border-white/20 pt-2 text-sm italic leading-snug text-white/90">
                  « L&apos;excellence au service du bien commun »
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services : cartes façon « Dernières actualités » d'ANAPI */}
      <section className="bg-mint py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="anapi-title mb-4 text-3xl md:text-4xl">Une offre de services à 360°</h2>
              <p className="m-0 text-lg text-slate-700">
                Des solutions concrètes et opérationnelles pour répondre aux défis des acteurs publics et privés en RDC.
              </p>
            </div>
            <Link to="/services" className="anapi-btn shrink-0">
              <ChevronRight className="h-4 w-4" aria-hidden />
              Tous nos services
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((service, idx) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <Link to={`/services/${service.slug}`} className="anapi-card group flex h-full flex-col bg-white">
                  <div className="aspect-[3/2] overflow-hidden bg-mint">
                    <img
                      src={service.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 text-xl font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
                      {service.title}
                    </h3>
                    <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-anapi">
                      <ChevronRight className="h-4 w-4" aria-hidden />
                      En savoir plus
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partenaires : bandeau de logos façon ANAPI */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="anapi-title mb-10 text-center text-3xl md:text-4xl">Ils nous font confiance</h2>
          <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-5">
            {['Banque Mondiale', 'Union Européenne', 'BAD', 'Gouvernement RDC', 'Entreprises Privées'].map((partner) => (
              <li
                key={partner}
                className="grid min-h-28 place-items-center rounded-xl bg-white p-4 text-center font-[family-name:var(--font-head)] text-lg font-semibold text-blue-600 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
              >
                {partner}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Appel à l'action : bandeau bleu ANAPI */}
      <section className="bg-anapi py-16 text-center text-white md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mx-auto mb-5 max-w-3xl text-3xl font-semibold leading-tight text-gold-bright md:text-4xl">
              Prêt à concrétiser vos ambitions ?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/90">
              Discutons de votre projet autour d'un café ou en visio. Notre équipe est prête à vous accompagner.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/contact" className="anapi-btn">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Démarrer une collaboration
              </Link>
              <Link to="/nos-realisations" className="anapi-btn anapi-btn--gold">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Voir nos réalisations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
