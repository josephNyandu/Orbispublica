import { useEffect, useState } from "react";
import { authMe } from "@/lib/api";
import { OPPORTUNITY_NAV_UNLOCK_STORAGE_KEY, readOpportunityNavUnlocked } from "@/lib/opportunityNavUnlock";

/**
 * Accès à la navigation « Suivant » entre rubriques : administrateur connecté
 * ou visiteur ayant complété l’inscription au registre (drapeau localStorage).
 */
export function useOpportunityNavAccess() {
  const [hasAccess, setHasAccess] = useState(() => readOpportunityNavUnlocked());
  const [checking, setChecking] = useState(() => !readOpportunityNavUnlocked());

  useEffect(() => {
    if (readOpportunityNavUnlocked()) {
      setHasAccess(true);
      setChecking(false);
      return;
    }
    let cancelled = false;
    authMe()
      .then(() => {
        if (!cancelled) setHasAccess(true);
      })
      .catch(() => {
        /* visiteur */
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === OPPORTUNITY_NAV_UNLOCK_STORAGE_KEY) {
        setHasAccess(readOpportunityNavUnlocked());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { hasAccess, checking };
}
