/**
 * Coordonnées par défaut — garder aligné avec `src/data/contact.ts`.
 */
export const DEFAULT_SITE_CONTACT = {
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

const CONTACT_SETTINGS_KEY = "contact";

function str(v, fallback = "") {
  if (v === undefined || v === null) return fallback;
  return String(v).trim();
}

/**
 * Valide et normalise le corps PATCH ; lève une erreur avec message lisible si invalide.
 * @param {unknown} body
 */
export function parseSiteContactBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Corps JSON invalide");
  }
  const addressLine = str(body.addressLine);
  if (!addressLine) throw new Error("L’adresse est obligatoire");

  const phonesRaw = body.phones;
  if (!Array.isArray(phonesRaw) || phonesRaw.length === 0) {
    throw new Error("Au moins un numéro de téléphone est requis");
  }
  const phones = phonesRaw.map((p, i) => {
    if (!p || typeof p !== "object") throw new Error(`Téléphone ${i + 1} : format invalide`);
    const label = str(p.label);
    const tel = str(p.tel).replace(/\s/g, "");
    if (!label) throw new Error(`Téléphone ${i + 1} : libellé requis`);
    if (!tel) throw new Error(`Téléphone ${i + 1} : numéro requis`);
    const wa = p.whatsappUrl != null && String(p.whatsappUrl).trim() !== "" ? str(p.whatsappUrl) : undefined;
    const out = { label, tel };
    if (wa) out.whatsappUrl = wa;
    return out;
  });

  const emailsRaw = body.emails;
  if (!Array.isArray(emailsRaw) || emailsRaw.length === 0) {
    throw new Error("Au moins une adresse e-mail est requise");
  }
  const emails = emailsRaw.map((e, i) => {
    const s = str(e);
    if (!s) throw new Error(`E-mail ${i + 1} : valeur vide`);
    if (!s.includes("@")) throw new Error(`E-mail ${i + 1} : format douteux`);
    return s;
  });

  const oh = body.openingHours;
  if (!oh || typeof oh !== "object" || Array.isArray(oh)) {
    throw new Error("Horaires d’ouverture invalides");
  }
  const weekdays = str(oh.weekdays);
  const saturday = str(oh.saturday);
  if (!weekdays) throw new Error("Horaires : ligne « semaine » requise");
  if (!saturday) throw new Error("Horaires : ligne « samedi » requise");

  const nav = body.navbar;
  if (!nav || typeof nav !== "object" || Array.isArray(nav)) {
    throw new Error("Bloc barre de navigation invalide");
  }
  const email = str(nav.email);
  const phoneDisplay = str(nav.phoneDisplay);
  const phoneTel = str(nav.phoneTel).replace(/\s/g, "");
  if (!email || !email.includes("@")) throw new Error("E-mail barre du haut invalide");
  if (!phoneDisplay) throw new Error("Téléphone affiché (barre du haut) requis");
  if (!phoneTel) throw new Error("Lien tel: (barre du haut) requis");

  return {
    addressLine,
    phones,
    emails,
    openingHours: { weekdays, saturday },
    navbar: { email, phoneDisplay, phoneTel },
  };
}

/**
 * @param {import("better-sqlite3").Database} db
 */
export function getSiteContactFromDb(db) {
  const row = db.prepare(`SELECT value_json FROM site_settings WHERE key = ?`).get(CONTACT_SETTINGS_KEY);
  if (!row?.value_json) return null;
  try {
    const parsed = JSON.parse(row.value_json);
    return parseSiteContactBody(parsed);
  } catch {
    return null;
  }
}

/**
 * @param {import("better-sqlite3").Database} db
 */
export function getSiteContactMerged(db) {
  const fromDb = getSiteContactFromDb(db);
  return fromDb ?? DEFAULT_SITE_CONTACT;
}

/**
 * @param {import("better-sqlite3").Database} db
 * @param {ReturnType<typeof parseSiteContactBody>} value
 */
export function saveSiteContactToDb(db, value) {
  const now = new Date().toISOString();
  const json = JSON.stringify(value);
  db.prepare(
    `INSERT INTO site_settings (key, value_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at`
  ).run(CONTACT_SETTINGS_KEY, json, now);
}
