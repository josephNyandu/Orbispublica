import { Link } from 'react-router';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useServicePublications } from '@/hooks/useServicePublications';
import { useSiteContact } from '@/hooks/useSiteContact';
import { BrandLogoLink } from '@/components/BrandLogo';

export function Footer() {
  const { visibleServices } = useServicePublications();
  const { contact: siteContact } = useSiteContact();

  return (
    <footer className="bg-blue-600 text-slate-100 border-t border-blue-500/50 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div>
            <BrandLogoLink className="mb-6 inline-flex" imgClassName="h-20 w-auto max-h-28 object-contain sm:h-24 md:h-28" />
            <p className="text-sm leading-relaxed text-blue-100">
            ORBIS PUBLICA est un cabinet d’expertise basé à Kinshasa, spécialisé dans les partenariats public-privé (PPP), les marchés publics et les projets de développement. Il intervient également dans la mobilisation de financements et de subventions, ainsi que dans le renforcement des capacités institutionnelles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Liens rapides
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/80"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link to="/notre-cabinet" className="text-blue-100 hover:text-white transition-colors">Cabinet</Link></li>
              <li><Link to="/expertises" className="text-blue-100 hover:text-white transition-colors">Expertises</Link></li>
              <li><Link to="/services" className="text-blue-100 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/nos-realisations" className="text-blue-100 hover:text-white transition-colors">Réalisations</Link></li>
              <li><Link to="/opportunites" className="text-blue-100 hover:text-white transition-colors">Opportunités</Link></li>
              <li><Link to="/publications" className="text-blue-100 hover:text-white transition-colors">Publications</Link></li>
              <li><Link to="/blog" className="text-blue-100 hover:text-white transition-colors">Blog & ressources</Link></li>
              <li><Link to="/contact" className="text-blue-100 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
              Nos services
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/80"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {visibleServices.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="text-blue-100 hover:text-white transition-colors"
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
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-white/80"></span>
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-200 mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  {siteContact.phones.map((p) =>
                    p.whatsappUrl && p.whatsappUrlOpen !== false ? (
                      <a
                        key={p.tel}
                        href={p.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-100 hover:text-white transition-colors"
                      >
                        {p.label}
                      </a>
                    ) : (
                      <a key={p.tel} href={`tel:${p.tel}`} className="text-blue-100 hover:text-white transition-colors">
                        {p.label}
                      </a>
                    )
                  )}
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-200 mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  {siteContact.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="text-blue-100 hover:text-white transition-colors">
                      {email}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-200 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-blue-100">{siteContact.addressLine}</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-blue-200 mr-3 mt-0.5 flex-shrink-0" aria-hidden />
                <div className="space-y-1">
                  <span className="block text-white font-semibold">Heures d&apos;ouverture</span>
                  <span className="block text-blue-100">{siteContact.openingHours.weekdays}</span>
                  {siteContact.openingHours.saturdayOpen !== false ? (
                    <span className="block text-blue-100">{siteContact.openingHours.saturday}</span>
                  ) : null}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-500/40 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-200">
          <p>&copy; {new Date().getFullYear()} ORBIS PUBLICA. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-blue-100 hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="text-blue-100 hover:text-white transition-colors">Politique de Confidentialité</a>
            <a href="#" className="text-blue-100 hover:text-white transition-colors">Plan du Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
