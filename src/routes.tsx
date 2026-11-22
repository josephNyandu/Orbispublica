import { createBrowserRouter } from "react-router";
import AppLayout from "./AppLayout";
import { Home } from "./pages/Home";
import CabinetLayout from "./layouts/CabinetLayout";
import { CabinetAPropos } from "./pages/cabinet/CabinetAPropos";
import { CabinetQuiSommesNous } from "./pages/cabinet/CabinetQuiSommesNous";
import { CabinetVisionMission } from "./pages/cabinet/CabinetVisionMission";
import { CabinetPartenaires } from "./pages/cabinet/CabinetPartenaires";
import { Services } from "./pages/Services";
import { Expertises } from "./pages/Expertises";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Portfolio } from "./pages/Portfolio";
import { Partners } from "./pages/Partners";
import { OpportunitesSegmentPage } from "./pages/OpportunitesSegmentPage";
import { OpportunityPostPublic } from "./pages/OpportunityPostPublic";
import { AppelsProjets } from "./pages/AppelsProjets";
import { FinancementsSubventions } from "./pages/FinancementsSubventions";
import { AlertesPersonnalises } from "./pages/AlertesPersonnalises";
import { Blog } from "./pages/Blog";
import PublicationsLayout from "./layouts/PublicationsLayout";
import { PublicationsActualites } from "./pages/publications/PublicationsActualites";
import { PublicationsEvenements } from "./pages/publications/PublicationsEvenements";
import { PublicationsPotentialites } from "./pages/publications/PublicationsPotentialites";
import { Contact } from "./pages/Contact";
import { SearchResults } from "./pages/SearchResults";
import { Login } from "./pages/Login";
import { Registre } from "./pages/Registre";
import { Navigate } from "react-router";
import { RedirectExpertiseSlugToService } from "./components/RedirectExpertiseSlugToService";
import AdminLayout from "./layouts/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RealisationsAdmin } from "./pages/admin/RealisationsAdmin";
import { ExpertisesPublicationAdmin } from "./pages/admin/ExpertisesPublicationAdmin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ContactInfoAdmin } from "./pages/admin/ContactInfoAdmin";
import { OpportunitesPublicationAdmin } from "./pages/admin/OpportunitesPublicationAdmin";
import { OpportunitesPublicationHistory } from "./pages/admin/OpportunitesPublicationHistory";
import ClientLayout from "./layouts/ClientLayout";
import { ClientDossiers } from "./pages/client/ClientDossiers";
import { ClientDossierDetail } from "./pages/client/ClientDossierDetail";
import { ClientDocuments } from "./pages/client/ClientDocuments";
import { ClientNotifications } from "./pages/client/ClientNotifications";
import { ClientMessages } from "./pages/client/ClientMessages";
import { ClientAccount } from "./pages/client/ClientAccount";
import { ClientsAdmin } from "./pages/admin/ClientsAdmin";
import { ClientDetailAdmin } from "./pages/admin/ClientDetailAdmin";
import { DossierDetailAdmin } from "./pages/admin/DossierDetailAdmin";
import { OpportunitesAbonnementsAdmin } from "./pages/admin/OpportunitesAbonnementsAdmin";

function RealisationsAdminPage() {
  return (
    <ProtectedRoute>
      <RealisationsAdmin />
    </ProtectedRoute>
  );
}

function ExpertisesPublicationAdminPage() {
  return (
    <ProtectedRoute>
      <ExpertisesPublicationAdmin />
    </ProtectedRoute>
  );
}

function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

function ContactInfoAdminPage() {
  return (
    <ProtectedRoute>
      <ContactInfoAdmin />
    </ProtectedRoute>
  );
}

function OpportunitesPublicationAdminPage() {
  return (
    <ProtectedRoute>
      <OpportunitesPublicationAdmin />
    </ProtectedRoute>
  );
}

function OpportunitesPublicationHistoryPage() {
  return (
    <ProtectedRoute>
      <OpportunitesPublicationHistory />
    </ProtectedRoute>
  );
}

function ClientsAdminPage() {
  return (
    <ProtectedRoute>
      <ClientsAdmin />
    </ProtectedRoute>
  );
}

function ClientDetailAdminPage() {
  return (
    <ProtectedRoute>
      <ClientDetailAdmin />
    </ProtectedRoute>
  );
}

function DossierDetailAdminPage() {
  return (
    <ProtectedRoute>
      <DossierDetailAdmin />
    </ProtectedRoute>
  );
}

function OpportunitesAbonnementsAdminPage() {
  return (
    <ProtectedRoute>
      <OpportunitesAbonnementsAdmin />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Home },
      {
        path: "notre-cabinet",
        Component: CabinetLayout,
        children: [
          { index: true, element: <Navigate to="a-propos" replace /> },
          { path: "a-propos", Component: CabinetAPropos },
          { path: "qui-sommes-nous", Component: CabinetQuiSommesNous },
          { path: "vision-mission", Component: CabinetVisionMission },
          { path: "partenaires", Component: CabinetPartenaires },
        ],
      },
      { path: "expertises", Component: Expertises },
      { path: "expertises/:slug", Component: RedirectExpertiseSlugToService },
      { path: "services", Component: Services },
      { path: "services/:slug", Component: ServiceDetail },
      { path: "nos-realisations", Component: Portfolio },
      { path: "opportunite/:postId", Component: OpportunityPostPublic },
      { path: "opportunites", Component: Partners },
      { path: "opportunites/ppp", element: <OpportunitesSegmentPage segment="ppp" /> },
      { path: "opportunites/marches-publics", element: <OpportunitesSegmentPage segment="marches-publics" /> },
      { path: "appels-a-projets", Component: AppelsProjets },
      { path: "financements-subventions", Component: FinancementsSubventions },
      { path: "projets-ppp-investissement", element: <Navigate to="/opportunites/ppp" replace /> },
      { path: "alertes-personnalisees", Component: AlertesPersonnalises },
      { path: "nos-partenaires", element: <Navigate to="/opportunites" replace /> },
      { path: "blog", Component: Blog },
      {
        path: "publications",
        Component: PublicationsLayout,
        children: [
          { index: true, element: <Navigate to="actualites" replace /> },
          { path: "actualites", Component: PublicationsActualites },
          { path: "evenements", Component: PublicationsEvenements },
          { path: "potentialites", Component: PublicationsPotentialites },
        ],
      },
      { path: "carrieres", element: <Navigate to="/publications/actualites" replace /> },
      { path: "contact", Component: Contact },
      { path: "recherche", Component: SearchResults },
      { path: "login", Component: Login },
      { path: "registre", Component: Registre },
      {
        path: "espace-client",
        Component: ClientLayout,
        children: [
          { index: true, Component: ClientDossiers },
          { path: "dossiers/:id", Component: ClientDossierDetail },
          { path: "documents", Component: ClientDocuments },
          { path: "notifications", Component: ClientNotifications },
          { path: "messages", Component: ClientMessages },
          { path: "compte", Component: ClientAccount },
        ],
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: "coordonnees", Component: ContactInfoAdminPage },
      { path: "clients", Component: ClientsAdminPage },
      { path: "clients/:id", Component: ClientDetailAdminPage },
      { path: "dossiers/:id", Component: DossierDetailAdminPage },
      { path: "realisations", Component: RealisationsAdminPage },
      { path: "expertises", Component: ExpertisesPublicationAdminPage },
      { path: "opportunites/historique", Component: OpportunitesPublicationHistoryPage },
      { path: "opportunites/abonnements", Component: OpportunitesAbonnementsAdminPage },
      { path: "opportunites", Component: OpportunitesPublicationAdminPage },
    ],
  },
]);