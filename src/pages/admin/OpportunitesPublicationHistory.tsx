import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, RotateCw } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { fetchAdminOpportunityPostHistory, type OpportunityPostHistoryEntry } from "@/lib/api";
import { opportunityCategoryLabelForDisplay } from "@/data/opportunityCategories";
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function eventLabel(type: string): string {
  const map: Record<string, string> = {
    created: "Création",
    updated: "Mise à jour",
    auto_published: "Publication automatique (planifiée)",
    deleted: "Suppression",
  };
  return map[type] ?? type;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR");
}

export function OpportunitesPublicationHistory() {
  const [rows, setRows] = useState<OpportunityPostHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOpportunityPostHistory(250);
      setRows(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chargement impossible";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Historique — opportunités</h1>
            <AdminInfoTooltip text="Journal des créations, modifications, publications planifiées automatiques et suppressions." />
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Consultez la trace des actions sur les publications des pages Opportunités.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="gap-2" asChild>
            <Link to="/admin/opportunites">
              <ArrowLeft className="size-4" />
              Publications
            </Link>
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => void load()}>
            <RotateCw className="size-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-600">Chargement…</p>
        ) : error ? (
          <div className="space-y-4 p-8 text-center">
            <p className="text-red-700">{error}</p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-slate-600">Aucun événement enregistré pour le moment.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Date</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Publication</TableHead>
                <TableHead className="hidden md:table-cell">Détail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const title =
                  r.post_title ||
                  (typeof r.detail?.title === "string" ? r.detail.title : null) ||
                  (r.event_type === "deleted" ? "—" : "—");
                const catRaw = r.post_category || (typeof r.detail?.category === "string" ? r.detail.category : "");
                const catLabel = catRaw ? opportunityCategoryLabelForDisplay(catRaw) : "—";
                return (
                  <TableRow key={r.id}>
                    <TableCell className="align-top text-xs text-slate-600 whitespace-nowrap">
                      {formatWhen(r.created_at)}
                    </TableCell>
                    <TableCell className="align-top text-sm font-medium text-slate-800">
                      {eventLabel(r.event_type)}
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      <div className="font-medium text-slate-900">{title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{catLabel}</div>
                    </TableCell>
                    <TableCell className="align-top hidden md:table-cell text-xs text-slate-600 max-w-md">
                      {r.detail ? (
                        <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed bg-slate-50 rounded-md p-2 border border-slate-100">
                          {JSON.stringify(r.detail, null, 2)}
                        </pre>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
