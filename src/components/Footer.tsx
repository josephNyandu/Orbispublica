import { Link } from 'react-router';
import { Mail, Phone, MapPin, Clock, ChevronRight, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useServicePublications } from '@/hooks/useServicePublications';
import { useSiteContact } from '@/hooks/useSiteContact';
import { BrandLogoLink } from '@/components/BrandLogo';
import { FACEBOOK_PAGE_URL, LINKEDIN_PAGE_URL, X_PROFILE_URL } from '@/data/social';

const socialLinks = [
  { href: FACEBOOK_PAGE_URL, label: 'ORBIS Publica sur Facebook', Icon: Facebook },
  { href: X_PROFILE_URL, label: 'ORBIS Publica sur X (Twitter)', Icon: Twitter },
  { href: LINKEDIN_PAGE_URL, label: 'ORBIS Publica sur LinkedIn', Icon: Linkedin },
];

const quickLinks = [
  { to: '/notre-cabinet', label: 'Cabinet' },
  { to: '/expertises', label: 'Expertises' },
  { to: '/services', label: 'Services' },
  { to: '/nos-realisations', label: 'Réalisations' },
  { to: '/opportunites', label: 'Opportunités' },
  { to: '/publications', label: 'Publications' },
  { to: '/blog', label: 'Blog & ressources' },
  { to: '/contact', label: 'Contact' },
];

/** Lien de liste façon ANAPI : petit chevron blanc, survol jaune. */
const footerLink = 'inline-flex items-start gap-2 text-white/90 transition-colors hover:text-gold-bright';

export function Footer() {
  const { visibleServices } = useServicePublications();
  const { contact: siteContact } = useSiteContact();

  return (
    <footer className="bg-blue-600 text-white">
      <div className="container mx-auto px-6 md:px-10 pt-14 pb-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div>
            <BrandLogoLink className="mb-6 inline-flex" imgClassName="h-20 w-auto max-h-28 object-contain brightness-0 invert sm:h-24 md:h-28" />
            <p className="text-sm leading-relaxed text-white/85">
            ORBIS PUBLICA est un cabinet d’expertise basé à Kinshasa, spécialisé dans les partenariats public-privé (PPP), les marchés publics et les projets de développement. Il intervient également dans la mobilisation de financements et de subventions, ainsi que dans le renforcement des capacités institutionnelles.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-[17px] font-semibold text-white">
              Liens rapides
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={footerLink}>
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-[17px] font-semibold text-white">
              Nos services
            </h3>
            <ul className="space-y-2 text-sm">
              {visibleServices.map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`} className={footerLink}>
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-[17px] font-semibold text-white">
              Contactez-nous
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  {siteContact.phones.map((p) =>
                    p.whatsappUrl && p.whatsappUrlOpen !== false ? (
                      <a
                        key={p.tel}
                        href={p.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 transition-colors hover:text-gold-bright"
                      >
                        {p.label}
                      </a>
                    ) : (
                      <a key={p.tel} href={`tel:${p.tel}`} className="text-white/90 transition-colors hover:text-gold-bright">
                        {p.label}
                      </a>
                    )
                  )}
                </div>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-white mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  {siteContact.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className="text-white/90 transition-colors hover:text-gold-bright">
                      {email}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-white/90">{siteContact.addressLine}</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-white mr-3 mt-0.5 flex-shrink-0" aria-hidden />
                <div className="space-y-1">
                  <span className="block text-white font-semibold">Heures d&apos;ouverture</span>
                  <span className="block text-white/90">{siteContact.openingHours.weekdays}</span>
                  {siteContact.openingHours.saturdayOpen !== false ? (
                    <span className="block text-white/90">{siteContact.openingHours.saturday}</span>
                  ) : null}
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div className="bg-blue-700">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-4 text-xs text-white/85 md:flex-row md:px-10">
          <p className="m-0">&copy; {new Date().getFullYear()} ORBIS PUBLICA, Tous droits réservés</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#" className="transition-colors hover:text-gold-bright">Mentions Légales</a>
            <a href="#" className="transition-colors hover:text-gold-bright">Politique de Confidentialité</a>
            <a href="#" className="transition-colors hover:text-gold-bright">Plan du Site</a>
          </div>
          <ul className="m-0 flex list-none gap-2 p-0">
            {socialLinks.map(({ href, label, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-blue-500"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
