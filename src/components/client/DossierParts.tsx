import { Check } from "lucide-react";
import { DOSSIER_STATUS_LABEL, type DossierStatus, type Etape } from "@/lib/clientApi";

const STATUS_STYLE: Record<DossierStatus, string> = {
  en_attente: "bg-slate-100 text-slate-700",
  en_cours: "bg-blue-50 text-blue-800",
  termine: "bg-emerald-50 text-emerald-800",
};

export function StatusBadge({ status }: { status: DossierStatus }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {DOSSIER_STATUS_LABEL[status]}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-200">
        <div className="h-full bg-blue-700" style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-sm tabular-nums text-slate-700">{value} %</span>
    </div>
  );
}

export function EtapesList({ etapes }: { etapes: Etape[] }) {
  if (!etapes.length) return <p className="text-sm text-slate-500">Aucune étape renseignée pour le moment.</p>;
  return (
    <ol className="divide-y divide-slate-200 border-y border-slate-200">
      {etapes.map((e, i) => (
        <li key={e.id ?? i} className="flex items-center gap-3 py-3">
          <span className="flex size-5 shrink-0 items-center justify-center">
            {e.status === "fait" ? (
              <Check className="size-5 text-emerald-700" aria-label="Terminée" />
            ) : e.status === "en_cours" ? (
              <span className="size-3 rounded-full bg-blue-700" aria-label="En cours" />
            ) : (
              <span className="size-3 rounded-full border-2 border-slate-300" aria-label="À venir" />
            )}
          </span>
          <span
            className={
              e.status === "en_cours"
                ? "font-semibold text-slate-900"
                : e.status === "fait"
                  ? "text-slate-700"
                  : "text-slate-400"
            }
          >
            {e.label}
          </span>
          {e.status === "en_cours" && <span className="ml-auto text-sm text-blue-800">Étape en cours</span>}
        </li>
      ))}
    </ol>
  );
}
