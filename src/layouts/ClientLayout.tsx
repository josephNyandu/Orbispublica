import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "sonner@2.0.3";
import {
  clientLogout,
  fetchClientMe,
  fetchClientNotifications,
  type ClientProfile,
} from "@/lib/clientApi";

export type ClientContext = { me: ClientProfile; refreshUnread: () => void };

export default function ClientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState<ClientProfile | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "unauth">("loading");
  const [unread, setUnread] = useState(0);

  const refreshUnread = () => {
    fetchClientNotifications()
      .then((n) => setUnread(n.filter((x) => !x.read).length))
      .catch(() => {});
  };

  useEffect(() => {
    fetchClientMe()
      .then((p) => {
        setMe(p);
        setState("ok");
        refreshUnread();
      })
      .catch(() => setState("unauth"));
  }, []);

  if (state === "loading") {
    return <div className="flex min-h-[60vh] items-center justify-center pt-36 text-slate-600">Chargement…</div>;
  }
  if (state === "unauth" || !me) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between border-l-2 px-4 py-2.5 text-[15px] ${
      isActive
        ? "border-blue-900 font-semibold text-blue-900"
        : "border-transparent text-slate-600 hover:text-slate-900"
    }`;

  return (
    <div className="container mx-auto px-6 pb-20 pt-40 md:px-10">
      <div className="grid gap-10 md:grid-cols-[220px_1fr]">
        <aside>
          <p className="mb-4 px-4 text-sm text-slate-500">{me.name}</p>
          <nav className="flex flex-col" aria-label="Espace client">
            <NavLink to="/espace-client" end className={link}>
              Mes dossiers
            </NavLink>
            <NavLink to="/espace-client/documents" className={link}>
              Mes documents
            </NavLink>
            <NavLink to="/espace-client/notifications" className={link}>
              Notifications
              {unread > 0 && (
                <span className="rounded bg-blue-900 px-1.5 text-xs font-medium text-white">{unread}</span>
              )}
            </NavLink>
            <NavLink to="/espace-client/messages" className={link}>
              Mon conseiller
            </NavLink>
            <NavLink to="/espace-client/compte" className={link}>
              Mon compte
            </NavLink>
          </nav>
          <button
            type="button"
            className="mt-6 px-4 text-sm text-slate-500 hover:text-slate-900"
            onClick={async () => {
              try {
                await clientLogout();
                navigate("/login", { replace: true });
              } catch {
                toast.error("Impossible de se déconnecter");
              }
            }}
          >
            Se déconnecter
          </button>
        </aside>
        <main className="min-w-0">
          <Outlet context={{ me, refreshUnread } satisfies ClientContext} />
        </main>
      </div>
    </div>
  );
}
