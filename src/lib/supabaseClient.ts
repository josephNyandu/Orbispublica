import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Hôtes ou URL d’exemple qui ne sont pas de vrais projets (copiés depuis .env.example tel quel). */
const PLACEHOLDER_URL_PATTERN = /votre_ref|placeholder|remplacez|xxxxxx|yourproject|example\.com/i;

/**
 * Vérifie que l’URL et la clé ressemblent à un projet Supabase réel (évite ERR_NAME_NOT_RESOLVED si on a laissé un libellé d’exemple).
 */
function isValidSupabasePublicConfig(urlRaw: string, keyRaw: string): boolean {
  const url = urlRaw.trim();
  const key = keyRaw.trim();
  if (!url || !key) return false;
  if (PLACEHOLDER_URL_PATTERN.test(url)) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    if (!/\.supabase\.co$/i.test(u.hostname)) return false;
    if (PLACEHOLDER_URL_PATTERN.test(u.hostname)) return false;
  } catch {
    return false;
  }
  if (key.startsWith("eyJ")) {
    return key.length >= 120;
  }
  if (key.startsWith("sb_")) {
    return key.length >= 20;
  }
  return false;
}

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return false;
  if (!isValidSupabasePublicConfig(url, key)) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ne sont pas valides (souvent : URL d’exemple laissée telle quelle). " +
          "Ouvrez Supabase → Project Settings → API, copiez l’URL du projet et la clé « anon » dans .env, puis redémarrez Vite."
      );
    }
    return false;
  }
  return true;
}

export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error("Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requises.");
  }
  if (!isValidSupabasePublicConfig(url, key)) {
    throw new Error(
      "Configuration Supabase invalide : utilisez l’URL réelle https://<ref>.supabase.co (pas un texte d’exemple comme « votre_ref ») et la clé « anon » complète depuis Project Settings → API."
    );
  }
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}
