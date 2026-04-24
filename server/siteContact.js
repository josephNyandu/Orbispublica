/**
 * Coordonnées par défaut — garder aligné avec `src/data/contact.ts`.
 */
export const DEFAULT_SITE_CONTACT = {
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

const CONTACT_SETTINGS_KEY = "contact";

function str(v, fallback = "") {
  if (v === undefined || v === null) return fallback;
  return String(v).trim();
}

/** E.164-friendly (chiffres + « + » en tête) — évite href tel: avec parenthèses. */
function normalizePhoneTel(s) {
  const cleaned = str(s).replace(/[^\d+]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return "+" + cleaned.slice(1).replace(/\D/g, "");
  }
  return cleaned.replace(/\D/g, "");
}

/** Même numéro saisi en double (ex. ligne tel + WhatsApp) → une seule entrée, WhatsApp conservé. */
function dedupePhonesByNumber(phones) {
  const byKey = new Map();
  for (const p of phones) {
    const key = normalizePhoneTel(p.tel);
    if (!key) continue;
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, { ...p, tel: key, whatsappUrlOpen: p.whatsappUrlOpen !== false });
      continue;
    }
    byKey.set(key, {
      label: p.whatsappUrl && !prev.whatsappUrl ? p.label : prev.label,
      tel: key,
      whatsappUrl: prev.whatsappUrl || p.whatsappUrl,
      whatsappUrlOpen: p.whatsappUrl && !prev.whatsappUrl
        ? p.whatsappUrlOpen !== false
        : prev.whatsappUrlOpen !== false,
    });
  }
  return [...byKey.values()];
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
  const phones = dedupePhonesByNumber(
    phonesRaw.map((p, i) => {
      if (!p || typeof p !== "object") throw new Error(`Téléphone ${i + 1} : format invalide`);
      const label = str(p.label);
      const rawTel = str(p.tel);
      const tel = normalizePhoneTel(rawTel);
      if (!label) throw new Error(`Téléphone ${i + 1} : libellé requis`);
      if (!tel) throw new Error(`Téléphone ${i + 1} : numéro requis`);
      const hasWa = p.whatsappUrl != null && String(p.whatsappUrl).trim() !== "";
      const wa = hasWa ? str(p.whatsappUrl) : undefined;
      const open = Object.prototype.hasOwnProperty.call(p, "whatsappUrlOpen")
        ? p.whatsappUrlOpen !== false
        : Boolean(wa);
      const out = { label, tel, whatsappUrlOpen: open };
      if (wa) out.whatsappUrl = wa;
      return out;
    })
  );
  if (phones.length === 0) throw new Error("Au moins un numéro de téléphone valide est requis");

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
  const saturdayOpen = oh.saturdayOpen !== false;
  let saturday = str(oh.saturday);
  if (!weekdays) throw new Error("Horaires : ligne « semaine » requise");
  if (!saturdayOpen) {
    saturday = "Samedi : fermé";
  } else if (!saturday) {
    throw new Error("Horaires : ligne « samedi » requise lorsque l’ouverture le samedi est activée");
  }

  const nav = body.navbar;
  if (!nav || typeof nav !== "object" || Array.isArray(nav)) {
    throw new Error("Bloc barre de navigation invalide");
  }
  const email = str(nav.email);
  const phoneDisplay = str(nav.phoneDisplay);
  const phoneTel = normalizePhoneTel(str(nav.phoneTel));
  if (!email || !email.includes("@")) throw new Error("E-mail barre du haut invalide");
  if (!phoneDisplay) throw new Error("Téléphone affiché (barre du haut) requis");
  if (!phoneTel) throw new Error("Lien tel: (barre du haut) requis");

  return {
    addressLine,
    phones,
    emails,
    openingHours: { weekdays, saturday, saturdayOpen },
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
