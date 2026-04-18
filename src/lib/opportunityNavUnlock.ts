/** Après inscription sur /registre (veille publications), le visiteur peut utiliser « Suivant » entre rubriques. */
export const OPPORTUNITY_NAV_UNLOCK_STORAGE_KEY = "orbis_publica_opportunity_nav_unlocked";

export function readOpportunityNavUnlocked(): boolean {
  try {
    return localStorage.getItem(OPPORTUNITY_NAV_UNLOCK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setOpportunityNavUnlocked(): void {
  try {
    localStorage.setItem(OPPORTUNITY_NAV_UNLOCK_STORAGE_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}
