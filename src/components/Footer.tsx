import { Link } from 'react-router';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import { useServicePublications } from '@/hooks/useServicePublications';
import { useSiteContact } from '@/hooks/useSiteContact';
import { BrandLogoLink } from '@/components/BrandLogo';

export function Footer() {
  const { visibleServices } = useServicePublications();
  const { contact: siteContact } = useSiteContact();

  return (
    <footer className="bg-slate-800 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <BrandLogoLink className="mb-6 inline-flex" imgClassName="h-20 w-auto max-h-28 object-contain sm:h-24 md:h-28" />
            <p className="text-sm leading-relaxed mb-6">
            ORBIS PUBLICA est un cabinet d’expertise basé à Kinshasa, spécialisé dans les partenariats public-privé (PPP), les marchés publics et les projets de développement. Il intervient également dans la mobilisation de financements et de subventions, ainsi que dans le renforcement des capacités institutionnelles.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Liens rapides
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link to="/notre-cabinet" className="hover:text-blue-500 transition-colors">Cabinet</Link></li>
              <li><Link to="/expertises" className="hover:text-blue-500 transition-colors">Expertises</Link></li>
              <li><Link to="/services" className="hover:text-blue-500 transition-colors">Services</Link></li>
              <li><Link to="/nos-realisations" className="hover:text-blue-500 transition-colors">Réalisations</Link></li>
              <li><Link to="/opportunites" className="hover:text-blue-500 transition-colors">Opportunités</Link></li>
              <li><Link to="/publications" className="hover:text-blue-500 transition-colors">Publications</Link></li>
              <li><Link to="/blog" className="hover:text-blue-500 transition-colors">Blog & ressources</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Nos services
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {visibleServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="hover:text-blue-500 transition-colors"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Contactez-nous
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-blue-500"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>{siteContact.addressLine}</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" aria-hidden />
                <div className="space-y-1">
                  <span className="block text-white font-semibold">Heures d&apos;ouverture</span>
                  <span className="block">{siteContact.openingHours.weekdays}</span>
                  <span className="block">{siteContact.openingHours.saturday}</span>
                </div>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  {siteContact.phones.map((p) =>
                    p.whatsappUrl ? (
                      <a
                        key={p.tel}
                        href={p.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        {p.label}
                      </a>
                    ) : (
                      <a key={p.tel} href={`tel:${p.tel}`} className="hover:text-white">
                        {p.label}
                      </a>
                    )
                  )}
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  {siteContact.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="hover:text-white">
                      {email}
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-600/60 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} ORBIS PUBLICA. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Mentions Légales</a>
            <a href="#" className="hover:text-white">Politique de Confidentialité</a>
            <a href="#" className="hover:text-white">Plan du Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
