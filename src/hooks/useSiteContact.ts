import { useCallback, useEffect, useState } from "react";
import { fetchSiteContact } from "@/lib/api";
import { siteContactDefaults, type SiteContact } from "@/data/contact";

export function useSiteContact() {
  const [contact, setContact] = useState<SiteContact>(siteContactDefaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSiteContact();
      setContact(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chargement des coordonnées impossible";
      setError(msg);
      setContact(siteContactDefaults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { contact, loading, error, refetch: load };
}
