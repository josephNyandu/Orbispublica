import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner@2.0.3";
import {
  clientDocumentUrl,
  fetchClientDossier,
  formatDate,
  formatSize,
  uploadClientDocument,
  type Dossier,
} from "@/lib/clientApi";
import { EtapesList, ProgressBar, StatusBadge } from "@/components/client/DossierParts";

export function ClientDossierDetail() {
  const { id } = useParams();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetchClientDossier(Number(id)).then(setDossier).catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  async function onFile(file: File | undefined) {
    if (!file || !dossier) return;
    setUploading(true);
    try {
      await uploadClientDocument(dossier.id, file);
      toast.success("Document envoyé");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!dossier) return <p className="text-slate-500">Chargement…</p>;

  return (
    <>
      <Link to="/espace-client" className="text-sm text-slate-600 hover:text-slate-900">
        Retour à mes dossiers
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-slate-500">{dossier.reference}</span>
        <StatusBadge status={dossier.status} />
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{dossier.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ouvert le {formatDate(dossier.created_at)} · Mis à jour le {formatDate(dossier.updated_at)}
      </p>

      <div className="mt-6 max-w-md">
        <ProgressBar value={dossier.progress} />
      </div>

      <h2 className="mb-3 mt-10 text-xl font-semibold text-slate-900">Avancement</h2>
      <EtapesList etapes={dossier.etapes} />

      <div className="mb-3 mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
        <button
          type="button"
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="rounded bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {uploading ? "Envoi…" : "Déposer un document"}
        </button>
        <input
          ref={input}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      {dossier.documents.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun document pour ce dossier.</p>
      ) : (
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {dossier.documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <a href={clientDocumentUrl(d.id)} className="font-medium text-blue-800 hover:underline">
                {d.name}
              </a>
              <span className="text-sm text-slate-500">
                {d.uploaded_by === "admin" ? "Déposé par ORBIS PUBLICA" : "Déposé par vous"} ·{" "}
                {formatDate(d.created_at)} · {formatSize(d.size)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
