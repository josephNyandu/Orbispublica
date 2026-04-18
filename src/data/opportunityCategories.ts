/**
 * Identifiants alignés sur les segments d’URL des pages « Opportunités »
 * (menu public ↔ choix dans le dashboard).
 */
export const OPPORTUNITY_CATEGORY_IDS = [
  "opportunites",
  "appels-a-projets",
  "financements-subventions",
  "projets-ppp-investissement",
  "alertes-personnalisees",
] as const;

export type OpportunityCategoryId = (typeof OPPORTUNITY_CATEGORY_IDS)[number];

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategoryId, string> = {
  opportunites: "Appels d'offres",
  "appels-a-projets": "Appels à projets",
  "financements-subventions": "Financements & subventions",
  "projets-ppp-investissement": "Projets PPP / investissement",
  "alertes-personnalisees": "Autres opportunités stratégiques",
};

export const OPPORTUNITY_CATEGORY_PUBLIC_PATH: Record<OpportunityCategoryId, string> = {
  opportunites: "/opportunites",
  "appels-a-projets": "/appels-a-projets",
  "financements-subventions": "/financements-subventions",
  "projets-ppp-investissement": "/projets-ppp-investissement",
  "alertes-personnalisees": "/alertes-personnalisees",
};

export function isOpportunityCategoryId(v: string): v is OpportunityCategoryId {
  return (OPPORTUNITY_CATEGORY_IDS as readonly string[]).includes(v);
}

/** Libellé pour l’admin / l’historique (gère les anciennes valeurs en base). */
export function opportunityCategoryLabelForDisplay(cat: string): string {
  if (isOpportunityCategoryId(cat)) return OPPORTUNITY_CATEGORY_LABELS[cat];
  if (cat === "appels-offres") return OPPORTUNITY_CATEGORY_LABELS.opportunites;
  return cat.trim() ? cat : "—";
}

/** Lien public pour une catégorie (gère les anciennes valeurs en base). */
export function opportunityCategoryPathForDisplay(cat: string): string | null {
  if (isOpportunityCategoryId(cat)) return OPPORTUNITY_CATEGORY_PUBLIC_PATH[cat];
  if (cat === "appels-offres") return OPPORTUNITY_CATEGORY_PUBLIC_PATH.opportunites;
  return null;
}

/** Page suivante dans le menu Opportunités (ordre du site) ; après la dernière rubrique, lien vers Contact. */
export function getNextOpportunityNavigation(current: OpportunityCategoryId): {
  to: string;
  destinationLabel: string;
} {
  const idx = OPPORTUNITY_CATEGORY_IDS.indexOf(current);
  if (idx >= 0 && idx < OPPORTUNITY_CATEGORY_IDS.length - 1) {
    const nextId = OPPORTUNITY_CATEGORY_IDS[idx + 1];
    return {
      to: OPPORTUNITY_CATEGORY_PUBLIC_PATH[nextId],
      destinationLabel: OPPORTUNITY_CATEGORY_LABELS[nextId],
    };
  }
  return { to: "/contact", destinationLabel: "Contact" };
}

/** Page précédente dans le menu Opportunités ; depuis la première rubrique, retour à l’accueil. */
export function getPreviousOpportunityNavigation(current: OpportunityCategoryId): {
  to: string;
  destinationLabel: string;
} {
  const idx = OPPORTUNITY_CATEGORY_IDS.indexOf(current);
  if (idx > 0) {
    const prevId = OPPORTUNITY_CATEGORY_IDS[idx - 1];
    return {
      to: OPPORTUNITY_CATEGORY_PUBLIC_PATH[prevId],
      destinationLabel: OPPORTUNITY_CATEGORY_LABELS[prevId],
    };
  }
  return { to: "/", destinationLabel: "Accueil" };
}

const OPPORTUNITY_PUBLIC_PATHS = new Set(Object.values(OPPORTUNITY_CATEGORY_PUBLIC_PATH));

/** Rubrique « Opportunités » (pas Contact / accueil / etc.). */
export function isOpportunityRubriquePublicPath(path: string): boolean {
  return OPPORTUNITY_PUBLIC_PATHS.has(path);
}
