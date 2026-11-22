import { useState } from "react";
import { useOutletContext } from "react-router";
import { toast } from "sonner@2.0.3";
import { changeClientPassword } from "@/lib/clientApi";
import type { ClientContext } from "@/layouts/ClientLayout";

const field =
  "w-full rounded border border-slate-300 px-3 py-2 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700";

export function ClientAccount() {
  const { me } = useOutletContext<ClientContext>();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await changeClientPassword(current, next);
      toast.success("Mot de passe modifié");
      setCurrent("");
      setNext("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Modification impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Mon compte</h1>
      <p className="mt-2 text-slate-600">{me.email}</p>
      <h2 className="mb-4 mt-10 text-xl font-semibold text-slate-900">Changer de mot de passe</h2>
      <form onSubmit={submit} className="max-w-sm space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Mot de passe actuel
          <input type="password" autoComplete="current-password" required value={current}
            onChange={(e) => setCurrent(e.target.value)} className={`${field} mt-1`} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Nouveau mot de passe (8 caractères minimum)
          <input type="password" autoComplete="new-password" required minLength={8} value={next}
            onChange={(e) => setNext(e.target.value)} className={`${field} mt-1`} />
        </label>
        <button type="submit" disabled={busy}
          className="rounded bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          Enregistrer
        </button>
      </form>
    </>
  );
}
