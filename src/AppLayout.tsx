import { useLocation, useOutlet } from 'react-router';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotLauncher } from './components/ChatbotLauncher';
import { EASE, ScrollProgress } from './components/motion/Motion';

/** Transition entre les pages : l'ancienne page s'efface vers le haut, la nouvelle monte en place. */
const pageVariants = {
  /* Pas de filtre ni de transform résiduels : ils casseraient les éléments en position fixe des pages. */
  initial: { opacity: 0, y: 24 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3, ease: EASE } },
};

export default function AppLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    // reducedMotion="user" : les animations se coupent si le visiteur a demandé moins de mouvement.
    <MotionConfig reducedMotion="user">
      <div className="site-public flex flex-col min-h-screen bg-white text-slate-900">
        <ScrollProgress />
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
            <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <ChatbotLauncher />
      </div>
    </MotionConfig>
  );
}
