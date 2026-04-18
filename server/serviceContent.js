/** Champs éditables côté admin (pas d’icône — reste côté code). */
const ALLOWED_KEYS = [
  "title",
  "subtitle",
  "description",
  "fullDescription",
  "image",
  "details",
  "benefits",
];

const MAX_TEXT = 24_000;
const MAX_LIST_ITEMS = 60;

/**
 * @param {unknown} body
 * @returns {Record<string, unknown> | null} Objet à sérialiser en JSON, ou null pour effacer les overrides.
 */
export function sanitizeServiceContent(body) {
  if (body === null) return null;
  if (body === undefined) return undefined;
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Contenu invalide");
  }
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const key of ALLOWED_KEYS) {
    if (!(key in body)) continue;
    const v = body[key];
    if (key === "details" || key === "benefits") {
      if (!Array.isArray(v)) continue;
      const list = v
        .map((x) => String(x).trim())
        .filter(Boolean)
        .slice(0, MAX_LIST_ITEMS);
      if (list.length) out[key] = list;
      continue;
    }
    const s = String(v ?? "").trim();
    if (s) out[key] = s.slice(0, MAX_TEXT);
  }
  return Object.keys(out).length > 0 ? out : null;
}
