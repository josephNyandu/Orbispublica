/**
 * Connexion interne : `/login`. Si `VITE_EXTERNAL_LOGIN_URL` est défini (URL absolue),
 * les liens et redirections pointent vers cette URL (ex. page d’auth sur un autre domaine).
 */
const external = import.meta.env.VITE_EXTERNAL_LOGIN_URL?.trim() ?? "";

export function isExternalLoginConfigured(): boolean {
  return Boolean(external);
}

export function getLoginHref(options?: { redirectPath?: string }): string {
  if (external) {
    try {
      const u = new URL(external);
      if (options?.redirectPath) {
        u.searchParams.set("redirect", options.redirectPath);
      }
      return u.toString();
    } catch {
      const sep = external.includes("?") ? "&" : "?";
      return options?.redirectPath
        ? `${external}${sep}redirect=${encodeURIComponent(options.redirectPath)}`
        : external;
    }
  }
  const r = options?.redirectPath;
  const q = r ? `?redirect=${encodeURIComponent(r)}` : "";
  return `/login${q}`;
}

export function isAbsoluteLoginHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}
