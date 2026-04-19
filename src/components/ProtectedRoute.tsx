import { useEffect, useLayoutEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { authMe, logout } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getLoginHref, isAbsoluteLoginHref } from "@/lib/loginUrl";

function ExternalLoginRedirect({ href }: { href: string }) {
  useLayoutEffect(() => {
    window.location.replace(href);
  }, [href]);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
      Redirection vers la connexion…
    </div>
  );
}

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "unauth" | "forbidden">("loading");

  useEffect(() => {
    let cancelled = false;
    authMe()
      .then((me) => {
        if (cancelled) return;
        if (!me.isSiteAdmin) {
          setStatus("forbidden");
          return;
        }
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauth");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
        Vérification de la session…
      </div>
    );
  }

  if (status === "unauth") {
    const redirectPath = location.pathname + location.search;
    const href = getLoginHref({ redirectPath });
    if (isAbsoluteLoginHref(href)) {
      return <ExternalLoginRedirect href={href} />;
    }
    return <Navigate to={href} replace />;
  }

  if (status === "forbidden") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-slate-900">Accès administration refusé</h1>
          <p className="text-sm leading-relaxed text-slate-600">
            Vous êtes connecté, mais ce compte n’est pas enregistré comme administrateur du site. Ajoutez
            son identifiant utilisateur (UUID) dans la table{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">site_admins</code>{" "}
            dans Supabase (SQL ou script fourni avec le projet), puis reconnectez-vous.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/">Retour à l’accueil</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void logout().finally(() => {
                window.location.assign(getLoginHref());
              });
            }}
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
