import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { fetchClientDossiers, formatDate, type Dossier } from "@/lib/clientApi";
import { ProgressBar, StatusBadge } from "@/components/client/DossierParts";
import { SEO } from "@/components/SEO";
import type { ClientContext } from "@/layouts/ClientLayout";

export function ClientDossiers() {
  const { me } = useOutletContext<ClientContext>();
  const [dossiers, setDossiers] = useState<Dossier[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClientDossiers().then(setDossiers).catch((e) => setError(e.message));
  }, []);

  const enCours = dossiers?.filter((d) => d.status !== "termine").length ?? 0;
  const termines = dossiers?.filter((d) => d.status === "termine").length ?? 0;

  return (
    <>
      <SEO title="Mes dossiers" description="Suivi de vos dossiers ORBIS PUBLICA" />
      <h1 className="text-3xl font-bold text-slate-900">Bonjour, {me.name}</h1>

      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!dossiers && !error && <p className="mt-6 text-slate-500">Chargement…</p>}

      {dossiers && (
        <>
          <dl className="mt-8 flex gap-12 border-y border-slate-200 py-5">
            <div>
              <dd className="text-3xl font-bold text-slate-900">{enCours}</dd>
              <dt className="text-sm text-slate-600">Dossiers en cours</dt>
            </div>
            <div>
              <dd className="text-3xl font-bold text-slate-900">{termines}</dd>
              <dt className="text-sm text-slate-600">Dossiers terminés</dt>
            </div>
          </dl>

          {dossiers.length === 0 ? (
            <p className="mt-8 text-slate-600">Aucun dossier ouvert pour le moment.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-200">
              {dossiers.map((d) => (
                <li key={d.id} className="py-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm text-slate-500">{d.reference}</span>
                    <StatusBadge status={d.status} />
                    <span className="ml-auto text-sm text-slate-500">Ouvert le {formatDate(d.created_at)}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">{d.title}</h2>
                  {d.status !== "termine" && (
                    <div className="mt-3 max-w-md">
                      <ProgressBar value={d.progress} />
                      {d.etapes.find((e) => e.status === "en_cours") && (
                        <p className="mt-2 text-sm text-slate-600">
                          Étape en cours : {d.etapes.find((e) => e.status === "en_cours")!.label}
                        </p>
                      )}
                    </div>
                  )}
                  <Link
                    to={`/espace-client/dossiers/${d.id}`}
                    className="mt-4 inline-block text-sm font-semibold text-blue-800 hover:underline"
                  >
                    Consulter le dossier
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
