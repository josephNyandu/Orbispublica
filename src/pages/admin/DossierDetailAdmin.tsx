import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner@2.0.3";
import {
  adminDocumentUrl,
  deleteAdminDocument,
  deleteAdminDossier,
  DOSSIER_STATUS_LABEL,
  fetchAdminDossier,
  formatDate,
  formatSize,
  updateAdminDossier,
  uploadAdminDocument,
  type Dossier,
  type DossierStatus,
  type Etape,
  type EtapeStatus,
} from "@/lib/clientApi";
import { Button } from "@/components/ui/button";

const field =
  "rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

const ETAPE_LABEL: Record<EtapeStatus, string> = { a_venir: "À venir", en_cours: "En cours", fait: "Terminée" };

export function DossierDetailAdmin() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<DossierStatus>("en_cours");
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetchAdminDossier(id)
      .then((d) => {
        setDossier(d);
        setTitle(d.title);
        setStatus(d.status);
        setEtapes(d.etapes.map((e) => ({ label: e.label, status: e.status })));
      })
      .catch((e) => toast.error(e.message));
  }, [id]);
  useEffect(load, [load]);

  async function save() {
    setSaving(true);
    try {
      await updateAdminDossier(id, { title, status, etapes: etapes.filter((e) => e.label.trim()) });
      toast.success("Dossier mis à jour, le client est notifié");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      await uploadAdminDocument(id, file);
      toast.success("Document ajouté");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  const setEtape = (i: number, patch: Partial<Etape>) =>
    setEtapes((list) => list.map((e, k) => (k === i ? { ...e, ...patch } : e)));
  const move = (i: number, d: number) =>
    setEtapes((list) => {
      const j = i + d;
      if (j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  if (!dossier) return <p className="text-slate-500">Chargement…</p>;

  return (
    <div className="space-y-10">
      <div>
        <Link to={`/admin/clients/${dossier.client_id}`} className="text-sm text-slate-600 hover:text-slate-900">
          Retour à {dossier.client_name}
        </Link>
        <p className="mt-2 font-mono text-sm text-slate-500">{dossier.reference}</p>
        <h1 className="text-2xl font-bold text-slate-900">{dossier.title}</h1>
      </div>

      <section className="max-w-2xl space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Intitulé
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${field} mt-1 w-full`} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Statut
          <select value={status} onChange={(e) => setStatus(e.target.value as DossierStatus)} className={`${field} mt-1 w-full`}>
            {(Object.keys(DOSSIER_STATUS_LABEL) as DossierStatus[]).map((s) => (
              <option key={s} value={s}>{DOSSIER_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Étapes</p>
          <ul className="space-y-2">
            {etapes.map((e, i) => (
              <li key={i} className="flex gap-2">
                <input value={e.label} onChange={(ev) => setEtape(i, { label: ev.target.value })} className={`${field} min-w-0 flex-1`} />
                <select value={e.status} onChange={(ev) => setEtape(i, { status: ev.target.value as EtapeStatus })} className={field}>
                  {(Object.keys(ETAPE_LABEL) as EtapeStatus[]).map((s) => (
                    <option key={s} value={s}>{ETAPE_LABEL[s]}</option>
                  ))}
                </select>
                <button type="button" className="px-1 text-slate-500 hover:text-slate-900" onClick={() => move(i, -1)} aria-label="Monter">↑</button>
                <button type="button" className="px-1 text-slate-500 hover:text-slate-900" onClick={() => move(i, 1)} aria-label="Descendre">↓</button>
                <button type="button" className="px-1 text-red-700" onClick={() => setEtapes((l) => l.filter((_, k) => k !== i))} aria-label="Retirer">✕</button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" size="sm" className="mt-3"
            onClick={() => setEtapes((l) => [...l, { label: "", status: "a_venir" }])}>
            Ajouter une étape
          </Button>
        </div>

        <div className="flex gap-3">
          <Button onClick={save} disabled={saving}>Enregistrer</Button>
          <Button
            variant="outline"
            onClick={async () => {
              if (!window.confirm(`Supprimer le dossier ${dossier.reference} et ses documents ?`)) return;
              await deleteAdminDossier(id);
              navigate(`/admin/clients/${dossier.client_id}`, { replace: true });
            }}
          >
            Supprimer le dossier
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
          <Button variant="outline" size="sm" onClick={() => input.current?.click()}>Ajouter un document</Button>
          <input ref={input} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={(e) => upload(e.target.files?.[0])} />
        </div>
        {dossier.documents.length === 0 ? (
          <p className="text-slate-600">Aucun document.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
            {dossier.documents.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <a href={adminDocumentUrl(d.id)} className="font-medium text-blue-800 hover:underline">{d.name}</a>
                <span className="text-sm text-slate-500">
                  {d.uploaded_by === "admin" ? "ORBIS PUBLICA" : "Client"} · {formatDate(d.created_at)} · {formatSize(d.size)}
                </span>
                <button className="ml-auto text-sm text-red-700 hover:underline"
                  onClick={async () => {
                    if (!window.confirm(`Supprimer ${d.name} ?`)) return;
                    await deleteAdminDocument(d.id);
                    load();
                  }}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
