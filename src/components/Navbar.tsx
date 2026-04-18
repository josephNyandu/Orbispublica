import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect, Fragment } from 'react';
import { Menu, X, Globe, Mail, Phone, Facebook, Twitter, Linkedin, Youtube, Instagram, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteContact } from '@/hooks/useSiteContact';
import { BrandLogoLink } from '@/components/BrandLogo';

const opportunitesSubLinks = [
  { name: "Appels d'offres", path: '/opportunites' },
  { name: 'Appels à projets', path: '/appels-a-projets' },
  { name: 'Financements & subventions', path: '/financements-subventions' },
  { name: 'Projets PPP / investissement', path: '/projets-ppp-investissement' },
  { name: 'Autres opportunités stratégiques', path: '/alertes-personnalisees' },
] as const;

export function Navbar() {
  const { contact: siteContact } = useSiteContact();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [opportunitesExpanded, setOpportunitesExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Accueil', path: '/' },
    { name: 'Expertises', path: '/expertises' },
    { name: 'Réalisations', path: '/nos-realisations' },
    { name: 'Cabinet', path: '/notre-cabinet' },
    { name: 'Carrières', path: '/carrieres' },
    { name: 'Contact', path: '/contact' },
  ];

  const isOpportunitesActive = opportunitesSubLinks.some((s) => s.path === location.pathname);
  const isAuthPortal = location.pathname === '/login' || location.pathname === '/registre';

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex flex-col ${
        isScrolled ? 'bg-slate-800/95 backdrop-blur-sm shadow-lg' : 'bg-slate-800'
      }`}
    >
      {/* Top Bar */}
      <div className={`w-full bg-blue-600 text-slate-100 border-b border-blue-700 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-12 py-2'}`}>
        <div className="container mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-xs font-medium">
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <a href={`mailto:${siteContact.navbar.email}`} className="flex items-center hover:text-white transition-colors">
              <Mail className="h-3.5 w-3.5 mr-1.5" /> {siteContact.navbar.email}
            </a>
            <span className="hidden md:inline text-slate-600">|</span>
            <a href={`tel:${siteContact.navbar.phoneTel}`} className="flex items-center hover:text-white transition-colors">
              <Phone className="h-3.5 w-3.5 mr-1.5" /> {siteContact.navbar.phoneDisplay}
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-r border-slate-600 pr-4 mr-1">
              <a href="#" className="hover:text-white transition-colors"><Facebook className="h-3.5 w-3.5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-3.5 w-3.5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube className="h-3.5 w-3.5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="h-3.5 w-3.5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="h-3.5 w-3.5" /></a>
            </div>
            
            <div className="hidden lg:flex items-center relative">
              <input
                type="search"
                name="site-search"
                autoComplete="off"
                placeholder="Recherche..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  const q = headerSearch.trim();
                  if (!q) return;
                  navigate(`/recherche?${new URLSearchParams({ q }).toString()}`);
                }}
                className="bg-blue-700 border border-blue-500 text-slate-100 rounded px-2 py-1 pr-7 w-48 focus:outline-none focus:border-blue-400 text-xs placeholder:text-blue-300"
                aria-label="Recherche sur le site"
              />
              <Search className="h-3 w-3 absolute right-2 text-blue-300 pointer-events-none" aria-hidden />
            </div>

            <div className="flex items-center gap-1.5 hover:text-white cursor-pointer" title="Français">
              <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>FR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar — logo à gauche, liens centrés dans la barre, CTA à droite */}
      <div className={`container mx-auto px-6 md:px-10 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="relative flex min-h-[2.5rem] items-center justify-between gap-4">
          {/* Hauteur de barre fixe : le logo est agrandi via scale (hors flux), pas via une img plus haute */}
          <BrandLogoLink
            className="relative z-20 flex h-10 shrink-0 items-center overflow-visible sm:h-11"
            imgClassName="h-10 w-auto max-w-none origin-left scale-[1.62] object-contain sm:h-11 sm:scale-[1.72] md:scale-[1.82]"
          />

          {/* Desktop Menu — centré dans la largeur du header (évite l’effet « tout collé à droite ») */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 lg:flex items-center justify-center px-32 xl:px-40">
            <div className="pointer-events-auto flex items-center gap-x-5 xl:gap-x-7">
              {links.slice(0, 4).map((link, idx) => (
                <Fragment key={link.path}>
                  {idx === 1 ? (
                    <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-600/80" aria-hidden />
                  ) : null}
                  <Link
                    to={link.path}
                    className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-blue-400 ${
                      isActive(link.path) ? 'text-blue-500' : 'text-slate-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                </Fragment>
              ))}

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-600/80" aria-hidden />

              <div className="relative group">
                <Link
                  to="/opportunites"
                  className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-blue-400 inline-flex items-center gap-1 ${
                    isOpportunitesActive ? 'text-blue-500' : 'text-slate-300'
                  }`}
                >
                  Opportunités
                  <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform" aria-hidden />
                </Link>
                <div
                  className="absolute left-1/2 top-full z-50 min-w-[280px] -translate-x-1/2 pt-2 opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible xl:left-0 xl:translate-x-0"
                  role="menu"
                  aria-label="Sous-menu Opportunités"
                >
                  <div className="rounded-lg border border-slate-700 bg-slate-800 py-2 shadow-xl">
                    {opportunitesSubLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        role="menuitem"
                        className={`block px-4 py-2.5 text-sm transition-colors hover:bg-slate-700/80 hover:text-blue-400 ${
                          location.pathname === sublink.path ? 'text-blue-400 bg-slate-700/50' : 'text-slate-200'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-600/80" aria-hidden />

              {links.slice(4).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-blue-400 ${
                    isActive(link.path) ? 'text-blue-500' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative z-20 hidden shrink-0 items-center lg:flex">
            <Link
              to="/login"
              title="Connexion ou inscription au registre"
              className={`inline-flex px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-md transition-colors ${
                isAuthPortal ? 'ring-2 ring-blue-300 ring-offset-2 ring-offset-slate-800' : ''
              }`}
            >
              Connexion
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white z-50 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-slate-800 shadow-xl border-t border-slate-600/60 lg:hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {links.slice(0, 4).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium block py-2 border-b border-slate-600/60 ${
                    isActive(link.path) ? 'text-blue-500' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-b border-slate-600/60 pb-2">
                <button
                  type="button"
                  onClick={() => setOpportunitesExpanded((v) => !v)}
                  className={`flex w-full items-center justify-between py-2 text-base font-medium ${
                    isOpportunitesActive ? 'text-blue-500' : 'text-slate-300'
                  }`}
                  aria-expanded={opportunitesExpanded}
                >
                  Opportunités
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${opportunitesExpanded ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {opportunitesExpanded && (
                  <div className="mt-2 flex flex-col gap-1 border-l-2 border-slate-700 pl-4">
                    {opportunitesSubLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        onClick={() => {
                          setIsOpen(false);
                          setOpportunitesExpanded(false);
                        }}
                        className={`py-2 text-sm ${
                          location.pathname === sublink.path ? 'text-blue-400' : 'text-slate-400'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {links.slice(4).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium block py-2 border-b border-slate-600/60 ${
                    isActive(link.path) ? 'text-blue-500' : 'text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold rounded-md mt-4"
              >
                Connexion
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 rounded-md transition-colors"
              >
                Demander une offre
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
