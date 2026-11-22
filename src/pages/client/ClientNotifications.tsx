import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import {
  fetchClientNotifications,
  markClientNotificationsRead,
  type ClientNotification,
} from "@/lib/clientApi";
import type { ClientContext } from "@/layouts/ClientLayout";

export function ClientNotifications() {
  const { refreshUnread } = useOutletContext<ClientContext>();
  const [items, setItems] = useState<ClientNotification[] | null>(null);

  useEffect(() => {
    fetchClientNotifications()
      .then(async (n) => {
        setItems(n);
        if (n.some((x) => !x.read)) {
          await markClientNotificationsRead().catch(() => {});
          refreshUnread();
        }
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
      {!items && <p className="mt-6 text-slate-500">Chargement…</p>}
      {items && items.length === 0 && <p className="mt-6 text-slate-600">Aucune notification.</p>}
      {items && items.length > 0 && (
        <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {items.map((n) => (
            <li key={n.id} className="flex flex-wrap items-baseline gap-x-4 py-3">
              <span className={n.read ? "text-slate-600" : "font-semibold text-slate-900"}>{n.message}</span>
              <span className="ml-auto text-sm text-slate-500">
                {new Date(n.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
