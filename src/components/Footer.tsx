import { Link } from 'react-router';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Linkedin } from 'lucide-react';
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

const footerLink = 'text-white/90 transition-colors hover:text-gold-bright';
const columnTitle = 'mb-5 border-b border-white/25 pb-3 text-[17px] font-semibold text-white';

export function Footer() {
  const { visibleServices } = useServicePublications();
  const { contact: siteContact } = useSiteContact();

  return (
    <footer className="bg-blue-600 text-white">
      <div className="container mx-auto px-6 pb-12 pt-16 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_1.2fr_1.4fr]">
          <div>
            <BrandLogoLink className="mb-6 inline-flex" imgClassName="h-24 w-auto max-h-28 object-contain brightness-0 invert sm:h-28" />
            <p className="max-w-sm text-sm leading-relaxed text-white/85">
              Cabinet de conseil et d’expertise basé à Kinshasa : conformité, commande publique et ingénierie de projets au service des acteurs publics et privés.
            </p>
            <ul className="m-0 mt-6 flex list-none gap-2 p-0">
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

          <div>
            <h3 className={columnTitle}>Navigation</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={footerLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={columnTitle}>Nos services</h3>
            <ul className="space-y-3 text-sm">
              {visibleServices.map((service) => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`} className={footerLink}>
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={columnTitle}>Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-white" aria-hidden />
                <div className="flex flex-col gap-1">
                  {siteContact.phones.map((p) =>
                    p.whatsappUrl && p.whatsappUrlOpen !== false ? (
                      <a key={p.tel} href={p.whatsappUrl} target="_blank" rel="noopener noreferrer" className={footerLink}>
                        {p.label}
                      </a>
                    ) : (
                      <a key={p.tel} href={`tel:${p.tel}`} className={footerLink}>
                        {p.label}
                      </a>
                    )
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-white" aria-hidden />
                <div className="flex flex-col gap-1">
                  {siteContact.emails.map((email) => (
                    <a key={email} href={`mailto:${email}`} className={footerLink}>
                      {email}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white" aria-hidden />
                <span className="text-white/90">{siteContact.addressLine}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-white" aria-hidden />
                <div className="space-y-1 text-white/90">
                  <span className="block font-semibold text-white">Heures d&apos;ouverture</span>
                  <span className="block">{siteContact.openingHours.weekdays}</span>
                  {siteContact.openingHours.saturdayOpen !== false ? (
                    <span className="block">{siteContact.openingHours.saturday}</span>
                  ) : null}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-700">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/85 md:flex-row md:px-10">
          <p className="m-0">&copy; {new Date().getFullYear()} ORBIS PUBLICA, Tous droits réservés</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#" className="transition-colors hover:text-gold-bright">Mentions Légales</a>
            <a href="#" className="transition-colors hover:text-gold-bright">Politique de Confidentialité</a>
            <a href="#" className="transition-colors hover:text-gold-bright">Plan du Site</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
