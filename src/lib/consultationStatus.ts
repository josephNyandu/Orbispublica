/** Statut dérivé de la date limite de dépôt des offres. */
export type ConsultationStatusKey = "en_cours" | "moins_3_jours" | "expiree" | "non_precise";

export type ConsultationStatusFilterKey = ConsultationStatusKey | "";

export const CONSULTATION_STATUS_FILTER_OPTIONS: {
  key: ConsultationStatusFilterKey;
  label: string;
}[] = [
  { key: "", label: "Tous" },
  { key: "en_cours", label: "En cours" },
  { key: "moins_3_jours", label: "Moins de 3 jours" },
  { key: "expiree", label: "Expirée" },
  { key: "non_precise", label: "Non précisé" },
];

/** Date limite de dépôt au format `YYYY-MM-DD`, ou vide. */
export function consultationStatusFromDeadline(
  deadline: string | null | undefined
): ConsultationStatusKey {
  const raw = deadline?.trim();
  if (!raw) return "non_precise";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!m) return "non_precise";
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const deadlineDay = new Date(y, mo, day);
  if (Number.isNaN(deadlineDay.getTime())) return "non_precise";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round(
    (deadlineDay.getTime() - startToday.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays < 0) return "expiree";
  if (diffDays <= 2) return "moins_3_jours";
  return "en_cours";
}

/** Vert : en cours — jaune : bientôt expirée — rouge : expirée — gris : date non précisée. */
export function statusDotClass(key: ConsultationStatusKey): string {
  switch (key) {
    case "en_cours":
      return "bg-green-600";
    case "moins_3_jours":
      return "bg-yellow-400";
    case "expiree":
      return "bg-red-600";
    case "non_precise":
      return "bg-slate-400";
  }
}

export function statusAccentBorder(key: ConsultationStatusKey): string {
  switch (key) {
    case "en_cours":
      return "border-l-green-600";
    case "moins_3_jours":
      return "border-l-yellow-400";
    case "expiree":
      return "border-l-red-600";
    case "non_precise":
      return "border-l-slate-400";
  }
}

export function statusTextClass(key: ConsultationStatusKey): string {
  switch (key) {
    case "en_cours":
      return "text-green-700";
    case "moins_3_jours":
      return "text-yellow-700";
    case "expiree":
      return "text-red-700";
    case "non_precise":
      return "text-slate-600";
  }
}

export function statusLabelFor(key: ConsultationStatusKey): string {
  return CONSULTATION_STATUS_FILTER_OPTIONS.find((s) => s.key === key)?.label ?? key;
}

export function formatDeadlineFr(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return isoDate.trim();
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return isoDate.trim();
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
