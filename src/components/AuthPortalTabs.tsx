import { NavLink } from "react-router";

/** Bascule Connexion (admin) / Registre (abonnement publications appels d’offres). */
export function AuthPortalTabs() {
  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
      isActive ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <div
      className="mb-8 flex rounded-xl border border-slate-200 bg-slate-50 p-1"
      role="tablist"
      aria-label="Connexion ou registre"
    >
      <NavLink to="/login" end className={tabClass}>
        Connexion
      </NavLink>
      <NavLink to="/registre" className={tabClass}>
        Registre
      </NavLink>
    </div>
  );
}
