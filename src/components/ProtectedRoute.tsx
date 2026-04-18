import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { authMe } from "@/lib/api";

type Props = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "unauth">("loading");

  useEffect(() => {
    let cancelled = false;
    authMe()
      .then(() => {
        if (!cancelled) setStatus("ok");
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
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
