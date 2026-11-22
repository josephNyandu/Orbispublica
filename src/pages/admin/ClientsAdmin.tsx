import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner@2.0.3";
import {
  createAdminClient,
  deleteAdminClient,
  fetchAdminClients,
  formatDate,
  updateAdminClient,
  type AdminClient,
} from "@/lib/clientApi";
import { Button } from "@/components/ui/button";

const field =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

export function ClientsAdmin() {
  const [clients, setClients] = useState<AdminClient[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(() => {
    fetchAdminClients().then(setClients).catch((e) => toast.error(e.message));
  }, []);
  useEffect(load, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const c = await createAdminClient(form);
      setCredentials({ email: c.email, password: c.password });
      setForm({ name: "", email: "", phone: "" });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(c: AdminClient) {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${c.name} ?`)) return;
    try {
      const r = await updateAdminClient(c.id, { reset_password: true });
      if (r.password) setCredentials({ email: c.email, password: r.password });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    }
  }

  async function toggle(c: AdminClient) {
    try {
      await updateAdminClient(c.id, { active: !c.active });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    }
  }

  async function remove(c: AdminClient) {
    if (!window.confirm(`Supprimer ${c.name}, ses dossiers et ses documents ? Cette action est définitive.`)) return;
    try {
      await deleteAdminClient(c.id);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-slate-900">Clients</h1>

      {credentials && (
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-slate-900">
          <p className="font-semibold">Identifiants à transmettre au client (affichés une seule fois)</p>
          <p className="mt-2">
            E-mail : <span className="font-mono">{credentials.email}</span>
          </p>
          <p>
            Mot de passe : <span className="font-mono">{credentials.password}</span>
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setCredentials(null)}>
            Fermer
          </Button>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Nouveau client</h2>
        <form onSubmit={create} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <input required placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          <input required type="email" placeholder="Adresse e-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
          <Button type="submit" disabled={busy}>Créer le compte</Button>
        </form>
      </section>

      <section>
        {!clients && <p className="text-slate-500">Chargement…</p>}
        {clients && clients.length === 0 && <p className="text-slate-600">Aucun client.</p>}
        {clients && clients.length > 0 && (
          <div className="overflow-x-auto rounded border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Dossiers</th>
                  <th className="px-4 py-3 font-medium">Créé le</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <Link to={`/admin/clients/${c.id}`} className="font-semibold text-blue-800 hover:underline">
                        {c.name}
                      </Link>
                      {c.unread_messages > 0 && (
                        <span className="ml-2 rounded bg-blue-900 px-1.5 text-xs text-white">
                          {c.unread_messages} message{c.unread_messages > 1 ? "s" : ""}
                        </span>
                      )}
                      <div className="text-slate-500">{c.email}</div>
                    </td>
                    <td className="px-4 py-3">{c.dossiers_count}</td>
                    <td className="px-4 py-3">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">{c.active ? "Actif" : "Désactivé"}</td>
                    <td className="space-x-3 whitespace-nowrap px-4 py-3 text-right">
                      <button className="text-slate-600 hover:text-slate-900" onClick={() => resetPassword(c)}>Nouveau mot de passe</button>
                      <button className="text-slate-600 hover:text-slate-900" onClick={() => toggle(c)}>{c.active ? "Désactiver" : "Réactiver"}</button>
                      <button className="text-red-700 hover:underline" onClick={() => remove(c)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
