import { useEffect, useState } from "react";
import { Link } from "react-router";
import { clientDocumentUrl, fetchClientDossiers, formatDate, formatSize, type Dossier } from "@/lib/clientApi";

export function ClientDocuments() {
  const [dossiers, setDossiers] = useState<Dossier[] | null>(null);
  useEffect(() => {
    fetchClientDossiers().then(setDossiers).catch(() => setDossiers([]));
  }, []);

  const withDocs = dossiers?.filter((d) => d.documents.length) ?? [];

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Mes documents</h1>
      {!dossiers && <p className="mt-6 text-slate-500">Chargement…</p>}
      {dossiers && withDocs.length === 0 && <p className="mt-6 text-slate-600">Aucun document pour le moment.</p>}
      {withDocs.map((d) => (
        <section key={d.id} className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">
            <Link to={`/espace-client/dossiers/${d.id}`} className="hover:underline">
              <span className="font-mono text-sm font-normal text-slate-500">{d.reference}</span> {d.title}
            </Link>
          </h2>
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {d.documents.map((doc) => (
              <li key={doc.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <a href={clientDocumentUrl(doc.id)} className="font-medium text-blue-800 hover:underline">
                  {doc.name}
                </a>
                <span className="text-sm text-slate-500">
                  {doc.uploaded_by === "admin" ? "ORBIS PUBLICA" : "Vous"} · {formatDate(doc.created_at)} ·{" "}
                  {formatSize(doc.size)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
