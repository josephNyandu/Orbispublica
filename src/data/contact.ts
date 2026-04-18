/**
 * Coordonnées — valeurs par défaut (avant chargement API) et repli si l’API échoue.
 * Les valeurs en production sont éditées depuis l’admin (Coordonnées) ; garder ce bloc
 * aligné avec `server/siteContact.js` (`DEFAULT_SITE_CONTACT`).
 */
export type SiteContactPhone = {
  label: string;
  tel: string;
  whatsappUrl?: string;
};

export type SiteContact = {
  addressLine: string;
  phones: SiteContactPhone[];
  emails: string[];
  openingHours: {
    weekdays: string;
    saturday: string;
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
    { label: "(+243) 974 955 359", tel: "+243974955359" },
    {
      label: "(+243) 824 421 886 (WhatsApp)",
      tel: "+243824421886",
      whatsappUrl: "https://wa.me/243824421886",
    },
  ],
  emails: ["contact@orbispublica.org", "info@orbispublica.org"],
  openingHours: {
    weekdays: "Lun - Ven : 08h30 – 16h30",
    saturday: "Samedi : 09h00 – 12h00",
  },
  navbar: {
    email: "contact@orbispublica.org",
    phoneDisplay: "+243 974 955 359",
    phoneTel: "+243974955359",
  },
};

/** @deprecated Préférer `siteContactDefaults` ou `useSiteContact().contact`. */
export const siteContact = siteContactDefaults;
