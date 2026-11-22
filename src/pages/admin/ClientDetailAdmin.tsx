import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner@2.0.3";
import {
  createAdminDossier,
  fetchAdminClientMessages,
  fetchAdminClients,
  fetchAdminDossiers,
  formatDate,
  sendAdminClientMessage,
  type AdminClient,
  type Dossier,
} from "@/lib/clientApi";
import { StatusBadge } from "@/components/client/DossierParts";
import { MessageThread } from "@/components/client/MessageThread";
import { Button } from "@/components/ui/button";

const field =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

export function ClientDetailAdmin() {
  const clientId = Number(useParams().id);
  const navigate = useNavigate();
  const [client, setClient] = useState<AdminClient | null>(null);
  const [dossiers, setDossiers] = useState<Dossier[] | null>(null);
  const [title, setTitle] = useState("");
  const [etapesText, setEtapesText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchAdminClients().then((l) => setClient(l.find((c) => c.id === clientId) ?? null));
    fetchAdminDossiers(clientId).then(setDossiers);
  }, [clientId]);
  useEffect(load, [load]);

  const loadMessages = useCallback(() => fetchAdminClientMessages(clientId), [clientId]);
  const sendMessage = useCallback((b: string) => sendAdminClientMessage(clientId, b), [clientId]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const etapes = etapesText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((label, i) => ({ label, status: i === 0 ? ("en_cours" as const) : ("a_venir" as const) }));
      const r = await createAdminDossier({ client_id: clientId, title, etapes });
      toast.success(`Dossier ${r.reference} créé`);
      navigate(`/admin/dossiers/${r.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  }

  if (client === null && dossiers) return <p>Client introuvable.</p>;

  return (
    <div className="space-y-10">
      <div>
        <Link to="/admin/clients" className="text-sm text-slate-600 hover:text-slate-900">Retour aux clients</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{client?.name ?? "…"}</h1>
        {client && <p className="text-slate-600">{client.email}{client.phone ? ` · ${client.phone}` : ""}</p>}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Dossiers</h2>
        {!dossiers && <p className="text-slate-500">Chargement…</p>}
        {dossiers?.length === 0 && <p className="text-slate-600">Aucun dossier.</p>}
        {dossiers && dossiers.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
            {dossiers.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="font-mono text-sm text-slate-500">{d.reference}</span>
                <Link to={`/admin/dossiers/${d.id}`} className="font-semibold text-blue-800 hover:underline">{d.title}</Link>
                <StatusBadge status={d.status} />
                <span className="ml-auto text-sm text-slate-500">{d.progress} % · {formatDate(d.updated_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Nouveau dossier</h2>
        <form onSubmit={create} className="max-w-xl space-y-3">
          <input required placeholder="Intitulé (ex. Création et formalisation d'entreprise)" value={title}
            onChange={(e) => setTitle(e.target.value)} className={field} />
          <textarea rows={5} placeholder={"Étapes, une par ligne\nRéception de la demande\nAnalyse et préparation des documents\nDépôt et traitement administratif\nRemise des documents définitifs"}
            value={etapesText} onChange={(e) => setEtapesText(e.target.value)} className={field} />
          <Button type="submit" disabled={busy}>Créer le dossier</Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Messages</h2>
        <MessageThread load={loadMessages} send={sendMessage} me="admin" otherLabel={client?.name ?? "Client"} />
      </section>
    </div>
  );
}
