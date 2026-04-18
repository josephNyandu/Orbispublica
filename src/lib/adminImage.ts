/**
 * Valeur image côté admin : URL absolue (https…) ou fichier envoyé sur le serveur (`/uploads/…`).
 */
export function normalizeAdminImageValue(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("/uploads/")) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function isValidAdminImageValue(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (t.startsWith("/uploads/")) return true;
  const n = normalizeAdminImageValue(t);
  try {
    // eslint-disable-next-line no-new -- validation URL
    new URL(n);
    return true;
  } catch {
    return false;
  }
}

/** `src` pour balise <img> (chemins relatifs inchangés). */
export function adminImagePreviewSrc(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (t.startsWith("/")) return t;
  return normalizeAdminImageValue(t);
}
