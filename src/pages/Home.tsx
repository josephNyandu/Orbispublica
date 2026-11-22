import introImage from '../assets/images/intro-reunion.jpg';
import heroKinshasa from '../assets/images/hero-kinshasa-nuit.jpg';
import heroPort from '../assets/images/hero-port-grues.jpg';
import heroPanorama from '../assets/images/hero-ville-panorama.jpg';
import heroTour from '../assets/images/hero-tour-verre.jpg';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { ChevronRight, CheckCircle2, Building2 } from 'lucide-react';
import logoBanqueMondiale from '../assets/partners/banque-mondiale.svg';
import logoUnionEuropeenne from '../assets/partners/union-europeenne.svg';
import logoBad from '../assets/partners/bad.svg';
import logoRdc from '../assets/partners/rdc-armoiries.svg';
import { useState, useEffect, useRef } from 'react';
import { CountUp, Marquee, ParallaxImage, Reveal, Stagger, StaggerItem, TiltCard, WordsReveal, EASE } from '@/components/motion/Motion';
import { useServicePublications } from '@/hooks/useServicePublications';
import { SEO } from '@/components/SEO';

/** Logos : Wikimedia Commons (domaine public). « Entreprises privées » n'a pas de logo propre. */
const partners: { name: string; logo?: string }[] = [
  { name: 'Banque Mondiale', logo: logoBanqueMondiale },
  { name: 'Union Européenne', logo: logoUnionEuropeenne },
  { name: 'BAD', logo: logoBad },
  { name: 'Gouvernement RDC', logo: logoRdc },
  { name: 'Entreprises Privées' },
];

const SLIDE_MS = 6500;

export function Home() {
  const { visibleServices } = useServicePublications();
  const reduce = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const backgroundImages = [heroKinshasa, heroPort, heroPanorama, heroTour];

  // Parallaxe du bandeau : le texte monte et s'efface, la photo descend plus lentement.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, SLIDE_MS);
    return () => clearInterval(interval);
  }, [reduce, currentImageIndex, backgroundImages.length]);

  return (
    <div className="bg-white">
      <SEO />
      {/* Bandeau d'accueil : diaporama en fondu avec zoom lent, parallaxe et titre révélé mot à mot */}
      <section ref={heroRef} className="relative flex h-screen min-h-[620px] items-center overflow-hidden">
        <motion.div className="absolute inset-0 z-0 bg-blue-700" style={{ y: reduce ? 0 : bgY }}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.6, ease: 'easeInOut' }, scale: { duration: 1.6, ease: EASE } }}
            >
              <img src={backgroundImages[currentImageIndex]} alt="" className="orbis-kenburns h-full w-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,56,97,0.9)_0%,rgba(3,56,97,0.62)_55%,rgba(3,56,97,0.18)_100%)]"
            aria-hidden
          />
        </motion.div>

        <motion.div
          className="container relative z-10 mx-auto px-6 pt-20 md:px-10"
          style={reduce ? undefined : { y: textY, opacity: textOpacity }}
        >
          <div className="max-w-3xl">
            <h1 className="mb-8 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              <WordsReveal text="Conformité" start={0.2} />{' '}
              <span className="text-blue-400" aria-hidden>•</span>{' '}
              <WordsReveal text="Commande publique" start={0.35} className="text-blue-400" />{' '}
              <span className="text-blue-400" aria-hidden>•</span>{' '}
              <WordsReveal text="Ingénierie de projets" start={0.55} />
            </h1>

            <motion.ul
              className="mb-8 max-w-3xl space-y-3 text-base leading-relaxed text-white/90 md:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
            >
              {[
                'Expertise en audit juridique, éthique, gouvernance, prévention et gestion des risques.',
                'Accès, passation et exécution des marchés publics et des partenariats public‑privé.',
                'Montage, structuration et développement de projets, ainsi que la mobilisation des ressources nécessaires à leur mise en œuvre',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-blue-400" aria-hidden />
                  <span style={{ textWrap: 'balance' }}>{item}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
            >
              <Link to="/expertises" className="anapi-btn anapi-btn--pill">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Nos expertises
              </Link>
              <Link to="/contact" className="anapi-btn anapi-btn--pill anapi-btn--gold">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Nous contacter
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Indicateurs du diaporama : la barre active se remplit pendant l'affichage de la photo */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {backgroundImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentImageIndex(i)}
              aria-label={`Afficher la photo ${i + 1}`}
              aria-current={i === currentImageIndex}
              className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/30"
            >
              {i === currentImageIndex && (
                <motion.span
                  key={`bar-${currentImageIndex}`}
                  className="absolute inset-y-0 left-0 bg-white"
                  initial={{ width: reduce ? '100%' : '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: 'linear' }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Présentation */}
      <section className="overflow-hidden bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal from="left">
                <h2 className="anapi-title mb-8 max-w-xl text-3xl md:text-4xl" style={{ textWrap: 'balance' }}>
                  Un partenaire stratégique pour la conformité, la commande publique et le développement des projets
                </h2>
              </Reveal>

              <Reveal from="left" delay={0.15}>
                <div className="max-w-xl space-y-5 text-left" style={{ textWrap: 'pretty' }}>
                  <p className="text-lg leading-relaxed text-slate-800">
                    Face à la complexité des cadres réglementaires, aux exigences de bonne gouvernance et aux enjeux liés à la réalisation des investissements et aux initiatives de développement,{' '}
                    <strong className="text-blue-600">ORBIS PUBLICA</strong> accompagne les acteurs publics et privés dans leurs démarches de sécurisation juridique, d&apos;accompagnement institutionnel et de développement économique.
                  </p>
                  <p className="leading-relaxed text-slate-600">
                    Son intervention privilégie une approche intégrée, combinant conseil spécialisé, appui technique et solutions opérationnelles, au plus près des enjeux et des objectifs poursuivis par ses partenaires.
                  </p>
                </div>
              </Reveal>

              <Stagger as="ul" className="mt-8 grid gap-3 sm:grid-cols-2">
                {['Expertise locale éprouvée', 'Réseau institutionnel', 'Standards internationaux', 'Approche sur-mesure'].map((item) => (
                  <StaggerItem
                    as="li"
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-[0_10px_30px_rgba(3,80,137,0.12)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-anapi">
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-sm font-bold leading-snug text-blue-600">{item}</span>
                  </StaggerItem>
                ))}
              </Stagger>

              <Reveal delay={0.2}>
                <Link to="/notre-cabinet" className="anapi-btn mt-8">
                  <ChevronRight className="h-4 w-4" aria-hidden />
                  Notre cabinet
                </Link>
              </Reveal>
            </div>

            <div className="relative pb-10">
              <ParallaxImage
                src={introImage}
                alt="Équipe en réunion de travail autour d'une table"
                className="aspect-[4/5] max-h-[min(32rem,70vh)] w-full rounded-xl shadow-xl"
              />
              <motion.div
                className="absolute bottom-0 left-4 max-w-[17rem] rounded-xl bg-blue-600 p-5 text-white shadow-2xl"
                initial={{ opacity: 0, y: 40, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
              >
                <p className="m-0 text-sm font-bold text-blue-300">Projets accompagnés</p>
                <p className="m-0 font-[family-name:var(--font-head)] text-5xl font-bold">
                  <CountUp to={50} prefix="+" />
                </p>
                <p className="mt-2 border-t border-white/20 pt-2 text-sm italic leading-snug text-white/90">
                  « L&apos;excellence au service du bien commun »
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services : cartes inclinables en 3D, apparition en cascade */}
      <section className="bg-mint py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="anapi-title mb-4 text-3xl md:text-4xl">
                <WordsReveal text="Une offre de services à 360°" inView gap={0.05} />
              </h2>
              <Reveal delay={0.2}>
                <p className="m-0 text-lg text-slate-700">
                  Des solutions concrètes et opérationnelles pour répondre aux défis des acteurs publics et privés en RDC.
                </p>
              </Reveal>
            </div>
            <Reveal from="right">
              <Link to="/services" className="anapi-btn shrink-0">
                <ChevronRight className="h-4 w-4" aria-hidden />
                Tous nos services
              </Link>
            </Reveal>
          </div>

          <Stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2" gap={0.08}>
            {visibleServices.map((service) => (
              <StaggerItem key={service.slug} className="h-full">
                <TiltCard className="group h-full rounded-xl">
                  <Link to={`/services/${service.slug}`} className="anapi-card flex h-full flex-col bg-white sm:flex-row">
                    <div className="aspect-[3/2] shrink-0 overflow-hidden bg-mint sm:aspect-auto sm:w-2/5">
                      <img
                        src={service.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                      <h3 className="mb-3 text-xl font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
                        {service.title}
                      </h3>
                      <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-anapi">
                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                        En savoir plus
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Partenaires : bande de logos qui défile en continu (pause au survol) */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h2 className="anapi-title mb-10 text-center text-3xl md:text-4xl">
            <WordsReveal text="Ils nous font confiance" inView gap={0.06} />
          </h2>
          <Reveal>
            <Marquee speed={28} className="py-3">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex h-40 w-52 shrink-0 flex-col items-center justify-center gap-3 rounded-xl bg-white p-5 text-center shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(3,80,137,0.15)]"
                >
                  {partner.logo ? (
                    <img src={partner.logo} alt="" className="h-16 w-auto max-w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-mint text-blue-600" aria-hidden>
                      <Building2 className="h-8 w-8" />
                    </span>
                  )}
                  <span className="text-sm font-bold text-blue-600">{partner.name}</span>
                </div>
              ))}
            </Marquee>
          </Reveal>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="relative overflow-hidden bg-anapi py-16 text-center text-white md:py-20">
        <div className="container relative mx-auto px-6 md:px-10">
          <h2 className="mx-auto mb-5 max-w-3xl text-3xl font-semibold leading-tight text-gold-bright md:text-4xl">
            <WordsReveal text="Prêt à concrétiser vos ambitions ?" inView gap={0.06} />
          </h2>
          <Reveal delay={0.25}>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/90">
              Discutons de votre projet autour d'un café ou en visio. Notre équipe est prête à vous accompagner.
            </p>
          </Reveal>
          <Reveal delay={0.4} from="zoom">
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
          </Reveal>
        </div>
      </section>
    </div>
  );
}
