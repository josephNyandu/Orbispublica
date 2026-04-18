/** Émis après toute mutation admin sur les publications d’expertises (tous les hooks refetchent). */
export const SERVICE_PUBLICATIONS_INVALIDATE = "orbis:service-publications-invalidate";

export function invalidateServicePublicationsCache(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SERVICE_PUBLICATIONS_INVALIDATE));
}
