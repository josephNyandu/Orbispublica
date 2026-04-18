import type { SiteContact } from "@/data/contact";

function str(v: unknown, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v).trim();
}

/**
 * Valide et normalise le corps PATCH ; lève une erreur avec message lisible si invalide.
 */
export function parseSiteContactBody(body: unknown): SiteContact {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Corps JSON invalide");
  }
  const b = body as Record<string, unknown>;
  const addressLine = str(b.addressLine);
  if (!addressLine) throw new Error("L’adresse est obligatoire");

  const phonesRaw = b.phones;
  if (!Array.isArray(phonesRaw) || phonesRaw.length === 0) {
    throw new Error("Au moins un numéro de téléphone est requis");
  }
  const phones = phonesRaw.map((p, i) => {
    if (!p || typeof p !== "object") throw new Error(`Téléphone ${i + 1} : format invalide`);
    const pr = p as Record<string, unknown>;
    const label = str(pr.label);
    const tel = str(pr.tel).replace(/\s/g, "");
    if (!label) throw new Error(`Téléphone ${i + 1} : libellé requis`);
    if (!tel) throw new Error(`Téléphone ${i + 1} : numéro requis`);
    const wa = pr.whatsappUrl != null && String(pr.whatsappUrl).trim() !== "" ? str(pr.whatsappUrl) : undefined;
    const out: { label: string; tel: string; whatsappUrl?: string } = { label, tel };
    if (wa) out.whatsappUrl = wa;
    return out;
  });

  const emailsRaw = b.emails;
  if (!Array.isArray(emailsRaw) || emailsRaw.length === 0) {
    throw new Error("Au moins une adresse e-mail est requise");
  }
  const emails = emailsRaw.map((e, i) => {
    const s = str(e);
    if (!s) throw new Error(`E-mail ${i + 1} : valeur vide`);
    if (!s.includes("@")) throw new Error(`E-mail ${i + 1} : format douteux`);
    return s;
  });

  const oh = b.openingHours;
  if (!oh || typeof oh !== "object" || Array.isArray(oh)) {
    throw new Error("Horaires d’ouverture invalides");
  }
  const ohr = oh as Record<string, unknown>;
  const weekdays = str(ohr.weekdays);
  const saturday = str(ohr.saturday);
  if (!weekdays) throw new Error("Horaires : ligne « semaine » requise");
  if (!saturday) throw new Error("Horaires : ligne « samedi » requise");

  const nav = b.navbar;
  if (!nav || typeof nav !== "object" || Array.isArray(nav)) {
    throw new Error("Bloc barre de navigation invalide");
  }
  const navr = nav as Record<string, unknown>;
  const email = str(navr.email);
  const phoneDisplay = str(navr.phoneDisplay);
  const phoneTel = str(navr.phoneTel).replace(/\s/g, "");
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
