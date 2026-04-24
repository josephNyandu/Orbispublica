/**
 * Coordonnées — valeurs par défaut (avant chargement API) et repli si l’API échoue.
 * Les valeurs en production sont éditées depuis l’admin (Coordonnées) ; garder ce bloc
 * aligné avec `server/siteContact.js` (`DEFAULT_SITE_CONTACT`).
 */
export type SiteContactPhone = {
  label: string;
  tel: string;
  /**
   * Si `false`, le site public utilise le lien `tel:` même si `whatsappUrl` est mémorisé
   * (l’URL reste éditable dans l’admin quand l’utilisateur réactive l’option).
   */
  whatsappUrlOpen?: boolean;
  whatsappUrl?: string;
};

export type SiteContact = {
  addressLine: string;
  phones: SiteContactPhone[];
  emails: string[];
  openingHours: {
    weekdays: string;
    /** Texte des horaires samedi (ignoré côté affichage public si `saturdayOpen` est false). */
    saturday: string;
    /** Si false, pas d’ouverture le samedi : la ligne samedi est masquée (footer) et l’input admin est désactivé. */
    saturdayOpen: boolean;
  };
  navbar: {
    email: string;
    phoneDisplay: string;
    phoneTel: string;
  };
};

export const siteContactDefaults: SiteContact = {
  addressLine:
    "N.24, Avenue Kisangani, C.Ngaliema, Ville province de Kinshasa/RDC",
  phones: [
    {
      label: "(+243) 824 421 886 (WhatsApp)",
      tel: "+243824421886",
      whatsappUrlOpen: true,
      whatsappUrl: "https://wa.me/243824421886",
    },
  ],
  emails: ["contact@orbispublica.com", "info@orbispublica.com"],
  openingHours: {
    weekdays: "Lun - Ven : 08h30 – 16h30",
    saturday: "Samedi : 09h00 – 12h00",
    saturdayOpen: true,
  },
  navbar: {
    email: "contact@orbispublica.com",
    phoneDisplay: "(+243) 824421886",
    phoneTel: "+243824421886",
  },
};

/** @deprecated Préférer `siteContactDefaults` ou `useSiteContact().contact`. */
export const siteContact = siteContactDefaults;
