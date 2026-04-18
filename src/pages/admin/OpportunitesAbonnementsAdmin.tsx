import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Bell, RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  deleteAdminOpportunityFeedSubscriber,
  fetchAdminOpportunityFeedSubscribers,
  type OpportunityFeedSubscriber,
} from "@/lib/api";
import { OPPORTUNITY_CATEGORY_LABELS } from "@/data/opportunityCategories";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR");
}

/** Liste des inscrits via la page Registre pour la rubrique appels d’offres. */
export function OpportunitesAbonnementsAdmin() {
  const [rows, setRows] = useState<OpportunityFeedSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OpportunityFeedSubscriber | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOpportunityFeedSubscribers("opportunites");
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAdminOpportunityFeedSubscriber(deleteTarget.id);
      toast.success("Abonné retiré de la liste");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  const rubrique = OPPORTUNITY_CATEGORY_LABELS.opportunites;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Abonnements — appels d&apos;offres</h1>
            <AdminInfoTooltip text="Personnes inscrites depuis la page Registre pour suivre les publications de cette rubrique." />
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            E-mails enregistrés pour la veille « {rubrique} ». Les visiteurs s&apos;inscrivent sur le site
            public (Registre), pas ici.
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

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Bell className="size-5 text-blue-600 shrink-0" aria-hidden />
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{rows.length}</span> abonné
          {rows.length > 1 ? "s" : ""} enregistré{rows.length > 1 ? "s" : ""}
        </p>
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
          <p className="p-8 text-center text-slate-600">
            Aucun abonné pour le moment. Les inscriptions apparaissent lorsque des visiteurs utilisent la page
            Registre du site public.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Inscrit le</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="hidden sm:table-cell">Nom / organisation</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="align-top text-xs text-slate-600 whitespace-nowrap">
                    {formatWhen(r.created_at)}
                  </TableCell>
                  <TableCell className="align-top text-sm font-medium text-slate-900 break-all">{r.email}</TableCell>
                  <TableCell className="align-top text-sm text-slate-700 hidden sm:table-cell">
                    {r.name?.trim() ? r.name : "—"}
                  </TableCell>
                  <TableCell className="align-top text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Retirer ${r.email}`}
                      onClick={() => setDeleteTarget(r)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer cet abonné ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  L’adresse <strong className="text-slate-800">{deleteTarget.email}</strong> ne recevra plus de
                  suivi côté liste (elle pourra se réinscrire depuis le Registre).
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
