/** Champs éditables côté admin (aligné sur server/serviceContent.js). */
const ALLOWED_KEYS = [
  "title",
  "subtitle",
  "description",
  "fullDescription",
  "image",
  "details",
  "benefits",
] as const;

const MAX_TEXT = 24_000;
const MAX_LIST_ITEMS = 60;

/**
 * @returns Objet à sérialiser en JSON, `null` pour effacer les overrides, `undefined` si inchangé.
 */
export function sanitizeServiceContent(body: unknown): Record<string, unknown> | null | undefined {
  if (body === null) return null;
  if (body === undefined) return undefined;
  if (typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Contenu invalide");
  }
  const out: Record<string, unknown> = {};
  for (const key of ALLOWED_KEYS) {
    if (!(key in body)) continue;
    const v = (body as Record<string, unknown>)[key];
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
