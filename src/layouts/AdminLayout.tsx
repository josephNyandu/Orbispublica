import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Bell, LogOut, Home, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { logout } from "@/lib/api";
import { toast } from "sonner@2.0.3";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const opportunitesNavActive = location.pathname.startsWith("/admin/opportunites");

  async function handleLogout() {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Impossible de se déconnecter");
    }
  }

  return (
    <TooltipProvider delayDuration={280} skipDelayDuration={120}>
      <div className="admin-shell flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-100 text-slate-900 antialiased">
        <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 px-4 py-3 shadow-[0_1px_0_rgba(0,75,135,0.06)] backdrop-blur-md md:px-6">
          <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2 md:px-10 max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto overflow-hidden">
              <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/admin"
                    className="admin-display text-lg font-semibold tracking-tight text-blue-900 transition hover:text-blue-700"
                  >
                    Administration
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">Raccourci vers le tableau de bord de la console.</TooltipContent>
              </Tooltip>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-slate-600 sm:inline">
                Orbis Publica
              </span>
              </div>
              <nav className="flex w-full overflow-x-auto whitespace-nowrap gap-1 pb-1 sm:pb-0 sm:w-auto sm:pl-3 sm:border-l sm:border-slate-200 scrollbar-hide">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <NavLink
                          to="/admin"
                          end
                          className={({ isActive }) =>
                            isActive ? "text-blue-700 font-semibold" : "text-slate-600"
                          }
                        >
                          Accueil
                        </NavLink>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Vue d’ensemble et accès rapide aux sections.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <NavLink
                          to="/admin/coordonnees"
                          className={({ isActive }) =>
                            isActive ? "text-blue-700 font-semibold" : "text-slate-600"
                          }
                        >
                          Coordonnées
                        </NavLink>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Adresse, téléphones, e-mails, horaires et liens de la barre du menu.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <NavLink
                          to="/admin/realisations"
                          className={({ isActive }) =>
                            isActive ? "text-blue-700 font-semibold" : "text-slate-600"
                          }
                        >
                          Réalisations
                        </NavLink>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Cartes du portfolio « Nos réalisations » (création, publication).</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                        <NavLink
                          to="/admin/expertises"
                          className={({ isActive }) =>
                            isActive ? "text-blue-700 font-semibold" : "text-slate-600"
                          }
                        >
                          Expertises
                        </NavLink>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Visibilité et contenu des fiches « Expertises » sur le site.</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
                        <NavLink
                          to="/admin/opportunites"
                          className={() =>
                            opportunitesNavActive ? "text-blue-700 font-semibold" : "text-slate-600"
                          }
                        >
                          <Megaphone className="size-3.5 opacity-70" aria-hidden />
                          Opportunités
                        </NavLink>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Publications des pages Opportunités (planification, brouillons, historique).
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
                        <NavLink
                          to="/admin/opportunites/abonnements"
                          className={({ isActive }) =>
                            isActive ? "text-blue-700 font-semibold" : "text-slate-600"
                          }
                        >
                          <Bell className="size-3.5 opacity-70" aria-hidden />
                          Abonnements
                        </NavLink>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Inscrits au Registre pour suivre les publications « Appels d'offres ».
                  </TooltipContent>
                </Tooltip>
              </nav>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/">
                        <Home className="size-4" />
                        Site public
                      </Link>
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">Ouvre le site vitrine dans le même onglet.</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button variant="secondary" size="sm" type="button" onClick={handleLogout}>
                      <LogOut className="size-4" />
                      Déconnexion
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">Ferme la session administrateur (vous devrez vous reconnecter).</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>
        <main className="admin-main-scroll container mx-auto min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="admin-main-pad">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
