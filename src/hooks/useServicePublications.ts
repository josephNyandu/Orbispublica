import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchServicePublications, type ServicePublication } from "@/lib/api";
import {
  mergeServiceDetailEntry,
  mergeServicesWithPublication,
} from "@/lib/servicePublication";
import { SERVICE_PUBLICATIONS_INVALIDATE } from "@/lib/servicePublicationsEvents";
import { servicesData, type ServiceDetailEntry } from "@/data/services";

export function useServicePublications() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ServicePublication[] | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchServicePublications();
      setRows(data);
      setFetchFailed(false);
    } catch {
      setRows(null);
      setFetchFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchServicePublications();
        if (!cancelled) {
          setRows(data);
          setFetchFailed(false);
        }
      } catch {
        if (!cancelled) {
          setRows(null);
          setFetchFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Toutes les instances du hook reçoivent le signal après une sauvegarde dans /admin/expertises. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onInvalidate = () => {
      void reload();
    };
    window.addEventListener(SERVICE_PUBLICATIONS_INVALIDATE, onInvalidate);
    return () => window.removeEventListener(SERVICE_PUBLICATIONS_INVALIDATE, onInvalidate);
  }, [reload]);

  /** Ne pas lier ça à `loading` : pendant un refetch, `rows` reste valide et doit continuer à fusionner les overrides (sinon retour brutal au texte statique). */
  const hasUsablePublicationRows =
    !fetchFailed && rows !== null && rows.length > 0;

  const visibleServices = useMemo(
    () => mergeServicesWithPublication(servicesData, rows, !hasUsablePublicationRows),
    [rows, hasUsablePublicationRows]
  );

  const getMergedService = useCallback(
    (slug: string | undefined): ServiceDetailEntry | undefined => {
      if (!slug) return undefined;
      const base = servicesData.find((s) => s.slug === slug);
      if (!base) return undefined;
      if (!hasUsablePublicationRows || !rows) return base;
      const row = rows.find((r) => r.slug === slug);
      return mergeServiceDetailEntry(base, row?.content_overrides ?? null);
    },
    [rows, hasUsablePublicationRows]
  );

  /** Après chargement réussi : rediriger si l’expertise est en brouillon. */
  const shouldRedirectUnpublished = useCallback(
    (slug: string | undefined) => {
      if (!slug || loading) return false;
      if (fetchFailed || !rows || rows.length === 0) return false;
      const row = rows.find((r) => r.slug === slug);
      const published = row ? row.published : true;
      return !published;
    },
    [loading, fetchFailed, rows]
  );

  return {
    loading,
    rows,
    fetchFailed,
    visibleServices,
    getMergedService,
    shouldRedirectUnpublished,
    reload,
  };
}
