import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteContact } from '@/hooks/useSiteContact';
import { BrandLogoLink } from '@/components/BrandLogo';
import { cabinetNavLinks } from '@/data/cabinetNav';
import { publicationsNavLinks } from '@/data/publicationsNav';
import { getLoginHref, isAbsoluteLoginHref } from '@/lib/loginUrl';

/** Page Facebook officielle ORBIS Publica (Kinshasa). */
const FACEBOOK_PAGE_URL =
  'https://www.facebook.com/share/1DqW29w8fH/?mibextid=wwXIfr';

/** Compte X (Twitter) officiel ORBIS Publica. */
const X_PROFILE_URL = 'https://x.com/orbispublica?s=21';

/**
 * Présence LinkedIn — remplacer par l’URL de page Entreprise si vous en publiez une.
 * (Profil public vérifié : fondateur d’ORBIS PUBLICA.)
 */
const LINKEDIN_PAGE_URL = 'https://www.linkedin.com/in/augustin-musole-63027a130';

const opportunitesSubLinks = [
  {
    name: "Appels d'offres",
    path: '/opportunites',
    nested: [
      { name: 'PPP', path: '/opportunites/ppp' },
      { name: 'Marchés publics', path: '/opportunites/marches-publics' },
    ],
  },
  { name: 'Appels à projets', path: '/appels-a-projets' },
  { name: 'Financements & subventions', path: '/financements-subventions' },
  { name: 'Autres opportunités stratégiques', path: '/alertes-personnalisees' },
] as const;

function isOpportuniteSubLinkActive(pathname: string, item: (typeof opportunitesSubLinks)[number]): boolean {
  if ('nested' in item) {
    return pathname === item.path || item.nested.some((n) => n.path === pathname);
  }
  return pathname === item.path;
}

export function Navbar() {
  const { contact: siteContact } = useSiteContact();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [opportunitesExpanded, setOpportunitesExpanded] = useState(false);
  const [publicationsExpanded, setPublicationsExpanded] = useState(false);
  const [cabinetExpanded, setCabinetExpanded] = useState(false);
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

  const endNavLinks = [{ name: 'Contact', path: '/contact' }];
  /** Accueil seul en premier ; Contact reste dans `slice(1)` pour le menu centré / mobile. */
  const links = [{ name: 'Accueil', path: '/' }, ...endNavLinks];

  const isCabinetNavActive = (pathname: string, itemPath: string) => {
    if (itemPath === '/expertises') {
      return pathname === '/expertises';
    }
    return pathname === itemPath;
  };

  const isCabinetSectionActive =
    location.pathname === '/expertises' ||
    location.pathname.startsWith('/notre-cabinet') ||
    location.pathname.startsWith('/nos-realisations');

  const isServicesActive =
    location.pathname === '/services' || location.pathname.startsWith('/services/');

  const isOpportunitesActive = opportunitesSubLinks.some((s) => isOpportuniteSubLinkActive(location.pathname, s));
  const isPublicationsActive = location.pathname.startsWith('/publications');
  const loginHref = getLoginHref();
  const isAuthPortal = location.pathname === '/login' || location.pathname === '/registre';

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  /** Survol sobre : texte + soulignement uniquement (pas de fond, pas d’ombre, pas de rounded). */
  const desktopNavLinkBase =
    'whitespace-nowrap text-base font-medium transition-colors duration-200 hover:text-blue-800 hover:underline underline-offset-[6px] decoration-2 decoration-blue-700/80';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex flex-col ${
        isScrolled ? 'bg-[#E2F0F2]/95 backdrop-blur-sm shadow-lg' : 'bg-[#E2F0F2]'
      }`}
    >
      {/* Top Bar */}
      <div className={`w-full bg-blue-600 text-slate-100 border-b border-blue-700 transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-14 py-3'}`}>
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
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="ORBIS Publica sur Facebook"
              >
                <Facebook className="h-4.5 w-4.5" />
              </a>
              <a
                href={X_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="ORBIS Publica sur X (Twitter)"
              >
                <Twitter className="h-4.5 w-4.5" />
              </a>
              <a
                href={LINKEDIN_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
                aria-label="ORBIS Publica sur LinkedIn"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </a>
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
              <Link
                to="/"
                className={`${desktopNavLinkBase} inline-block ${
                  isActive('/') ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                Accueil
              </Link>

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-400/70" aria-hidden />

              <div className="relative group">
                <Link
                  to="/notre-cabinet"
                  className={`${desktopNavLinkBase} inline-flex items-center gap-1 ${
                    isCabinetSectionActive ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  Cabinet
                  <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-180" aria-hidden />
                </Link>
                <div
                  className="absolute left-1/2 top-full z-50 min-w-[280px] -translate-x-1/2 pt-2 opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible xl:left-0 xl:translate-x-0"
                  role="menu"
                  aria-label="Sous-menu Cabinet"
                >
                  <div className="rounded-lg border border-slate-200 bg-white py-2">
                    {cabinetNavLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        role="menuitem"
                        className={`block px-4 py-2.5 text-sm transition-colors hover:bg-slate-100 hover:text-blue-700 ${
                          isCabinetNavActive(location.pathname, sublink.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-400/70" aria-hidden />

              <Link
                to="/services"
                className={`${desktopNavLinkBase} inline-block ${
                  isServicesActive ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                Services
              </Link>

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-400/70" aria-hidden />

              <div className="relative group">
                <Link
                  to="/opportunites"
                  className={`${desktopNavLinkBase} inline-flex items-center gap-1 ${
                    isOpportunitesActive ? 'text-blue-600' : 'text-slate-700'
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
                  <div className="overflow-visible rounded-lg border border-slate-200 bg-white py-2">
                    {opportunitesSubLinks.map((sublink) =>
                      'nested' in sublink ? (
                        (() => {
                          const selfActive = location.pathname === sublink.path;
                          const childActive = sublink.nested.some((n) => n.path === location.pathname);
                          const rowState = selfActive
                            ? 'bg-blue-50 text-blue-700'
                            : childActive
                              ? 'bg-slate-50 text-slate-800'
                              : 'text-slate-700';
                          return (
                        <div key={sublink.path} className="group/ao relative">
                          <Link
                            to={sublink.path}
                            role="menuitem"
                            className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-slate-100 hover:text-blue-700 ${rowState}`}
                          >
                            {sublink.name}
                            <ChevronRight
                              className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover/ao:translate-x-0.5"
                              aria-hidden
                            />
                          </Link>
                          <div
                            className="invisible absolute left-full top-0 z-[60] -ml-px opacity-0 transition-all duration-150 group-hover/ao:visible group-hover/ao:opacity-100 group-focus-within/ao:visible group-focus-within/ao:opacity-100"
                            role="menu"
                            aria-label="Sous-menu Appels d'offres"
                          >
                            <div className="min-w-[220px] rounded-r-lg border border-slate-200 border-l-0 bg-white py-2">
                              {sublink.nested.map((n) => (
                                <Link
                                  key={n.path}
                                  to={n.path}
                                  role="menuitem"
                                  className={`block px-4 py-2.5 text-sm transition-colors hover:bg-slate-100 hover:text-blue-700 ${
                                    location.pathname === n.path ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                                  }`}
                                >
                                  {n.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                          );
                        })()
                      ) : (
                        <Link
                          key={sublink.path}
                          to={sublink.path}
                          role="menuitem"
                          className={`block px-4 py-2.5 text-sm transition-colors hover:bg-slate-100 hover:text-blue-700 ${
                            location.pathname === sublink.path ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-400/70" aria-hidden />

              <div className="relative group">
                <Link
                  to="/publications"
                  className={`${desktopNavLinkBase} inline-flex items-center gap-1 ${
                    isPublicationsActive ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  Publications
                  <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:rotate-180" aria-hidden />
                </Link>
                <div
                  className="absolute left-1/2 top-full z-50 min-w-[260px] -translate-x-1/2 pt-2 opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible xl:left-0 xl:translate-x-0"
                  role="menu"
                  aria-label="Sous-menu Publications"
                >
                  <div className="rounded-lg border border-slate-200 bg-white py-2">
                    {publicationsNavLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        role="menuitem"
                        className={`block px-4 py-2.5 text-sm transition-colors hover:bg-slate-100 hover:text-blue-700 ${
                          location.pathname === sublink.path ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <span className="hidden xl:inline h-4 w-px shrink-0 bg-slate-400/70" aria-hidden />

              {links.slice(1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${desktopNavLinkBase} inline-block ${
                    isActive(link.path) ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative z-20 hidden shrink-0 items-center lg:flex">
            {isAbsoluteLoginHref(loginHref) ? (
              <a
                href={loginHref}
                title="Connexion ou inscription au registre"
                className={`inline-flex px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-md transition-colors ${
                  isAuthPortal ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#E2F0F2]' : ''
                }`}
              >
                Connexion
              </a>
            ) : (
              <Link
                to={loginHref}
                title="Connexion ou inscription au registre"
                className={`inline-flex px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-md transition-colors ${
                  isAuthPortal ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#E2F0F2]' : ''
                }`}
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-slate-800 z-50 focus:outline-none"
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
            className="absolute top-full left-0 right-0 bg-[#E2F0F2] shadow-xl border-t border-slate-300/80 lg:hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block border-b border-slate-300/80 py-2 text-base font-medium ${
                  isActive('/') ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                Accueil
              </Link>

              <div className="border-b border-slate-300/80 pb-2">
                <button
                  type="button"
                  onClick={() => setCabinetExpanded((v) => !v)}
                  className={`flex w-full items-center justify-between py-2 text-base font-medium ${
                    isCabinetSectionActive ? 'text-blue-600' : 'text-slate-700'
                  }`}
                  aria-expanded={cabinetExpanded}
                >
                  Cabinet
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${cabinetExpanded ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {cabinetExpanded && (
                  <div className="mt-2 flex flex-col gap-1 border-l-2 border-slate-400 pl-4">
                    {cabinetNavLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        onClick={() => {
                          setIsOpen(false);
                          setCabinetExpanded(false);
                        }}
                        className={`py-2 text-sm ${
                          isCabinetNavActive(location.pathname, sublink.path) ? 'text-blue-700' : 'text-slate-600'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/services"
                onClick={() => setIsOpen(false)}
                className={`block border-b border-slate-300/80 py-2 text-base font-medium ${
                  isServicesActive ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                Services
              </Link>

              <div className="border-b border-slate-300/80 pb-2">
                <button
                  type="button"
                  onClick={() => setOpportunitesExpanded((v) => !v)}
                  className={`flex w-full items-center justify-between py-2 text-base font-medium ${
                    isOpportunitesActive ? 'text-blue-600' : 'text-slate-700'
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
                  <div className="mt-2 flex flex-col gap-0 border-l-2 border-slate-400 pl-4">
                    {opportunitesSubLinks.map((sublink) => {
                      const closeMenu = () => {
                        setIsOpen(false);
                        setOpportunitesExpanded(false);
                      };
                      if ('nested' in sublink) {
                        return (
                          <div
                            key={sublink.path}
                            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                          >
                            <Link
                              to={sublink.path}
                              onClick={closeMenu}
                              className={`block border-b border-slate-100 px-3 py-2.5 text-sm font-medium ${
                                location.pathname === sublink.path ? 'text-blue-700' : 'text-slate-800'
                              }`}
                            >
                              {sublink.name}
                            </Link>
                            <div className="p-1.5" role="menu" aria-label="Sous-menu Appels d'offres">
                              {sublink.nested.map((n) => (
                                <Link
                                  key={n.path}
                                  to={n.path}
                                  onClick={closeMenu}
                                  className={`block rounded-md px-2.5 py-2 text-sm ${
                                    location.pathname === n.path ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {n.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={sublink.path}
                          to={sublink.path}
                          onClick={closeMenu}
                          className={`py-2 text-sm ${
                            location.pathname === sublink.path ? 'text-blue-700' : 'text-slate-600'
                          }`}
                        >
                          {sublink.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-b border-slate-300/80 pb-2">
                <button
                  type="button"
                  onClick={() => setPublicationsExpanded((v) => !v)}
                  className={`flex w-full items-center justify-between py-2 text-base font-medium ${
                    isPublicationsActive ? 'text-blue-600' : 'text-slate-700'
                  }`}
                  aria-expanded={publicationsExpanded}
                >
                  Publications
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${publicationsExpanded ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {publicationsExpanded && (
                  <div className="mt-2 flex flex-col gap-1 border-l-2 border-slate-400 pl-4">
                    {publicationsNavLinks.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        onClick={() => {
                          setIsOpen(false);
                          setPublicationsExpanded(false);
                        }}
                        className={`py-2 text-sm ${
                          location.pathname === sublink.path ? 'text-blue-700' : 'text-slate-600'
                        }`}
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {links.slice(1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-medium block py-2 border-b border-slate-300/80 ${
                    isActive(link.path) ? 'text-blue-600' : 'text-slate-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAbsoluteLoginHref(loginHref) ? (
                <a
                  href={loginHref}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold rounded-md mt-4"
                >
                  Connexion
                </a>
              ) : (
                <Link
                  to={loginHref}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 bg-blue-500 hover:bg-blue-600 transition-colors text-white font-bold rounded-md mt-4"
                >
                  Connexion
                </Link>
              )}
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-400 rounded-md transition-colors hover:bg-white/60"
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
