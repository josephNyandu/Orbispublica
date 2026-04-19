import image_ea0b07bc72677584fad20b1d1df330c87fd242ce from 'figma:asset/ea0b07bc72677584fad20b1d1df330c87fd242ce.png';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2, Building2, Users, Trophy, Globe2, ChevronRight } from 'lucide-react';
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
    <div className="bg-blue-50">
      <SEO />
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-primary">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={currentImageIndex}
              src={backgroundImages[currentImageIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Background"
            />
          </AnimatePresence>
          
          {/* Overlay: lecture à gauche, photo respirante à droite, accord avec le dégradé du titre (bleu institutionnel → cyan) */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-800/90 from-[0%] via-primary/78 via-[42%] to-blue-500/18 to-[100%]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_0%_50%,rgba(30,41,59,0.5),transparent_62%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-800/45 via-transparent to-slate-800/25"
            aria-hidden
          />
          {/* Grain fin (au-dessus des dégradés) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"
            aria-hidden
          />
        </div>

        <div className="container mx-auto px-6 md:px-10 relative z-10 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              Projets,<br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Partenariats</span> <br/>
              & Financements
            </h1>
            
            <p className="text-sm md:text-base text-slate-300 mb-10 max-w-2xl leading-relaxed font-light border-l-4 border-blue-500 pl-6">
            Expertise en PPP, marchés publics et projets de développement, intégrant la mobilisation de financements, subventions et exonérations, au service de la mise en œuvre de projets en RDC et en Afrique.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link 
                to="/expertises" 
                className="group px-8 py-4 bg-primary hover:bg-primary/90 text-white text-base font-bold rounded-lg transition-all shadow-lg flex items-center justify-center"
              >
                NOS EXPERTISES 
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white text-base font-bold rounded-lg transition-all flex items-center justify-center"
              >
                NOUS CONTACTER
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-4">À Propos d'Orbis Publica</h4>
              <h2 className="text-3xl md:text-5xl font-bold text-primary mb-8 leading-tight">
                Un partenaire stratégique pour les projets de développement en rdc
              </h2>
              
              <div className="prose prose-lg text-slate-600 mb-8">
                <p>
                 Dans un contexte marqué par une exigence croissante de transparence et de performance, ORBIS PUBLICA accompagne les acteurs publics et privés dans la structuration, la sécurisation et la mise en œuvre efficace de projets en partenariats public-privé (ppp), marchés publics et projets de développement.
                </p>
                <p>
               Nous transformons les défis réglementaires et administratifs en opportunités stratégiques, dans une approche orientée conformité, performance et résultats.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {[
                  "Expertise locale éprouvée",
                  "Réseau institutionnel",
                  "Standards internationaux",
                  "Approche sur-mesure"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    
                    <span className="text-primary/90 font-semibold">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/notre-cabinet" className="inline-flex items-center text-primary font-bold hover:text-blue-600 transition-colors">
                  En savoir plus sur notre cabinet <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-2xl transform translate-x-4 translate-y-4"></div>
              <img 
                src={image_ea0b07bc72677584fad20b1d1df330c87fd242ce} 
                alt="Réunion stratégique" 
                className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              
              {/* Floating Stat Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-slate-100 max-w-xs"
              >
                <div className="flex items-center space-x-4 mb-2">
                  
                  <div>
                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Projets Accompagnés</p>
                    <p className="text-3xl font-bold text-primary">+50</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">"L'excellence au service du bien commun"</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-100/50 skew-x-12 transform translate-x-1/2"></div>
        
        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-3">Nos Expertises</h4>
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-6">Une offre de services à 360°</h2>
            <p className="text-slate-600 text-lg">
              Des solutions concrètes et opérationnelles pour répondre aux défis des acteurs publics et privés en RDC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleServices.map((service, idx) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Link 
                  to={`/expertises/${service.slug}`}
                  className="group block h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100"
                >
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/0 transition-colors z-10"></div>
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                       <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                         Service
                       </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:underline decoration-2 underline-offset-4">
                      Découvrir <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link 
              to="/expertises" 
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              VOIR TOUTES NOS EXPERTISES
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax Look */}
      <section className="relative py-20 md:py-32 bg-primary fixed-bg overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
             src="https://images.unsplash.com/photo-1761437855740-c894da924d79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
             alt="Background" 
             className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary via-transparent to-primary"></div>
        </div>

        <div className="container mx-auto px-6 md:px-10 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { icon: CheckCircle2, value: "100%", label: "Conformité" },
              { icon: Users, value: "+50", label: "Experts" },
              { icon: Trophy, value: "10+", label: "Années" },
              { icon: Globe2, value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className="flex flex-col items-center"
              >
                <div className="mb-6 p-4 bg-white/5 rounded-full border border-white/10 text-blue-500">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Partners Section (New) */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6 md:px-10 text-center">
          <h3 className="text-lg text-slate-400 font-semibold uppercase tracking-widest mb-12">Ils nous font confiance</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos - simplified for this demo */}
             {["Banque Mondiale", "Union Européenne", "BAD", "Gouvernement RDC", "Entreprises Privées"].map((partner, i) => (
               <div key={i} className="text-xl md:text-2xl font-bold text-slate-300 hover:text-primary/80 transition-colors cursor-default">
                 {partner}
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1671722294182-ed01cbe66bd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
            alt="Office" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-700/90 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-primary/40"></div>
        </div>

        <div className="container mx-auto px-6 md:px-10 relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8 max-w-4xl mx-auto leading-tight">
              Prêt à concrétiser vos ambitions ?
            </h2>
            <p className="text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discutons de votre projet autour d'un café ou en visio. Notre équipe est prête à vous accompagner.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link 
                to="/contact" 
                className="px-10 py-5 bg-white text-primary text-lg font-bold rounded-lg hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Démarrer une collaboration
              </Link>
              <Link 
                to="/nos-realisations" 
                className="px-10 py-5 bg-transparent border-2 border-white text-white text-lg font-bold rounded-lg hover:bg-white/10 transition-all hover:-translate-y-1"
              >
                Voir nos réalisations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}