export type EtapeStatus = "a_venir" | "en_cours" | "fait";
export type DossierStatus = "en_attente" | "en_cours" | "termine";

export type Etape = { id?: number; label: string; position?: number; status: EtapeStatus };

export type DossierDocument = {
  id: number;
  dossier_id: number;
  uploaded_by: "client" | "admin";
  name: string;
  size: number;
  created_at: string;
};

export type Dossier = {
  id: number;
  reference: string;
  client_id: number;
  client_name: string;
  client_email: string;
  title: string;
  service: string | null;
  status: DossierStatus;
  progress: number;
  etapes: Etape[];
  documents: DossierDocument[];
  created_at: string;
  updated_at: string;
};

export type ClientProfile = { id: number; email: string; name: string; phone: string | null };
export type ClientNotification = {
  id: number;
  dossier_id: number | null;
  message: string;
  read: boolean;
  created_at: string;
};
export type ClientMessage = {
  id: number;
  sender: "client" | "admin";
  body: string;
  read: boolean;
  created_at: string;
};
export type AdminClient = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
  dossiers_count: number;
  unread_messages: number;
};

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      ...(init.body && !isForm ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Réponse invalide du serveur");
  }
  if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
  return data as T;
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});

/** Connexion client ; renvoie false si les identifiants ne sont pas ceux d'un client. */
export async function clientLogin(email: string, password: string, remember: boolean): Promise<boolean> {
  const res = await fetch("/api/client/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, remember }),
  });
  if (res.ok) return true;
  if (res.status === 401) return false;
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(data.error ?? "Connexion impossible");
}

export const clientLogout = () => request<{ ok: boolean }>("/api/client/logout", json("POST"));
export const fetchClientMe = () => request<ClientProfile>("/api/client/me");
export const changeClientPassword = (current: string, next: string) =>
  request<{ ok: boolean }>("/api/client/password", json("POST", { current, next }));
export const fetchClientDossiers = () => request<Dossier[]>("/api/client/dossiers");
export const fetchClientDossier = (id: number) => request<Dossier>(`/api/client/dossiers/${id}`);
export const uploadClientDocument = (dossierId: number, file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return request<{ ok: boolean }>(`/api/client/dossiers/${dossierId}/documents`, { method: "POST", body: fd });
};
export const clientDocumentUrl = (id: number) => `/api/client/documents/${id}/download`;
export const fetchClientNotifications = () => request<ClientNotification[]>("/api/client/notifications");
export const markClientNotificationsRead = () =>
  request<{ ok: boolean }>("/api/client/notifications/read", json("POST"));
export const fetchClientMessages = () => request<ClientMessage[]>("/api/client/messages");
export const sendClientMessage = (body: string) =>
  request<{ ok: boolean }>("/api/client/messages", json("POST", { body }));

/** --- Admin --- */
export const fetchAdminClients = () => request<AdminClient[]>("/api/admin/clients");
export const createAdminClient = (b: { name: string; email: string; phone?: string; password?: string }) =>
  request<{ id: number; email: string; name: string; password: string }>("/api/admin/clients", json("POST", b));
export const updateAdminClient = (id: number, b: { name?: string; phone?: string; active?: boolean; reset_password?: boolean }) =>
  request<{ ok: boolean; password?: string }>(`/api/admin/clients/${id}`, json("PATCH", b));
export const deleteAdminClient = (id: number) => request<{ ok: boolean }>(`/api/admin/clients/${id}`, json("DELETE"));
export const fetchAdminDossiers = (clientId?: number) =>
  request<Dossier[]>(`/api/admin/dossiers${clientId ? `?client_id=${clientId}` : ""}`);
export const fetchAdminDossier = (id: number) => request<Dossier>(`/api/admin/dossiers/${id}`);
export const createAdminDossier = (b: { client_id: number; title: string; service?: string; etapes: Etape[] }) =>
  request<{ id: number; reference: string }>("/api/admin/dossiers", json("POST", b));
export const updateAdminDossier = (
  id: number,
  b: { title?: string; service?: string; status?: DossierStatus; etapes?: Etape[] }
) => request<{ ok: boolean }>(`/api/admin/dossiers/${id}`, json("PATCH", b));
export const deleteAdminDossier = (id: number) => request<{ ok: boolean }>(`/api/admin/dossiers/${id}`, json("DELETE"));
export const uploadAdminDocument = (dossierId: number, file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return request<{ ok: boolean }>(`/api/admin/dossiers/${dossierId}/documents`, { method: "POST", body: fd });
};
export const adminDocumentUrl = (id: number) => `/api/admin/documents/${id}/download`;
export const deleteAdminDocument = (id: number) => request<{ ok: boolean }>(`/api/admin/documents/${id}`, json("DELETE"));
export const fetchAdminClientMessages = (id: number) => request<ClientMessage[]>(`/api/admin/clients/${id}/messages`);
export const sendAdminClientMessage = (id: number, body: string) =>
  request<{ ok: boolean }>(`/api/admin/clients/${id}/messages`, json("POST", { body }));

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  en_attente: "En attente",
  en_cours: "En cours",
  termine: "Terminé",
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
