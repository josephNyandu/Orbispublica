import type { SiteContact } from "@/data/contact";
import { isSupabaseConfigured } from "./supabaseClient";
import * as sb from "./supabaseBackend";

export type Realisation = {
  id: number;
  title: string;
  desc: string;
  category: string;
  image: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Champs d’une fiche expertise modifiables depuis l’admin (fusion avec `servicesData`). */
export type ServiceContentOverrides = {
  title?: string;
  subtitle?: string;
  description?: string;
  fullDescription?: string;
  image?: string;
  details?: string[];
  benefits?: string[];
};

export type { SiteContact };

export type ServicePublication = {
  slug: string;
  published: boolean;
  sort_order: number;
  updated_at: string;
  /** Présent côté admin et sur l’API publique uniquement pour les fiches publiées. */
  content_overrides?: ServiceContentOverrides | null;
};

export type SiteSearchHit = {
  type: "realisation" | "opportunity_post" | "expertise";
  id: number | string;
  title: string;
  excerpt: string;
  href: string;
  meta?: string;
};

export type SiteSearchResponse = {
  query: string;
  results: SiteSearchHit[];
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const t = text.trim();
    const looksHtml = t.startsWith("<") || /<html[\s>]/i.test(text) || /<!doctype/i.test(text);
    if (looksHtml) {
      throw new Error(
        "L’API a renvoyé une page HTML au lieu de JSON (souvent : route /api/opportunity-posts/… absente, proxy incomplet, ou build statique sans serveur Node à jour). Les données listées fonctionnent encore si vous arrivez depuis la liste des annonces."
      );
    }
    const snippet = t.replace(/\s+/g, " ").slice(0, 100);
    throw new Error(snippet ? `Réponse invalide du serveur (${snippet}…)` : "Réponse invalide du serveur");
  }
  if (!res.ok) {
    const err = (data as { error?: string })?.error ?? res.statusText;
    throw new Error(err);
  }
  return data as T;
}

export async function fetchSiteContact(): Promise<SiteContact> {
  if (isSupabaseConfigured()) return sb.fetchSiteContact();
  const res = await fetch("/api/site-contact", { credentials: "include", cache: "no-store" });
  return parseJson<SiteContact>(res);
}

export async function fetchAdminSiteContact(): Promise<SiteContact> {
  if (isSupabaseConfigured()) return sb.fetchAdminSiteContact();
  const res = await fetch("/api/admin/site-contact", { credentials: "include", cache: "no-store" });
  return parseJson<SiteContact>(res);
}

export async function updateAdminSiteContact(body: SiteContact): Promise<SiteContact> {
  if (isSupabaseConfigured()) return sb.updateAdminSiteContact(body);
  const res = await fetch("/api/admin/site-contact", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return parseJson<SiteContact>(res);
}

export async function fetchPublicRealisations(): Promise<Realisation[]> {
  if (isSupabaseConfigured()) return sb.fetchPublicRealisations();
  const res = await fetch("/api/realisations", { credentials: "include" });
  return parseJson<Realisation[]>(res);
}

export async function authMe(): Promise<{ ok: boolean; email: string | null }> {
  if (isSupabaseConfigured()) return sb.authMe();
  const res = await fetch("/api/auth/me", { credentials: "include" });
  return parseJson(res);
}

export async function login(
  email: string,
  password: string,
  remember = true
): Promise<void> {
  if (isSupabaseConfigured()) return sb.login(email, password, remember);
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, remember }),
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) return sb.logout();
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  await parseJson<{ ok: boolean }>(res);
}

export type OpportunityFeedSubscribeResponse = { ok: boolean; id?: number; already?: boolean };

/** Inscription publique à la veille « appels d’offres » (sans compte administrateur). */
export async function subscribeOpportunityFeed(body: {
  email: string;
  name?: string;
  /** Réservé à la rubrique appels d’offres côté serveur. */
  category?: "opportunites";
}): Promise<OpportunityFeedSubscribeResponse> {
  if (isSupabaseConfigured()) return sb.subscribeOpportunityFeed(body);
  const res = await fetch("/api/opportunity-feed/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      name: body.name?.trim() || undefined,
      category: body.category ?? "opportunites",
    }),
  });
  return parseJson<OpportunityFeedSubscribeResponse>(res);
}

export type OpportunityFeedSubscriber = {
  id: number;
  category: string;
  email: string;
  name: string | null;
  created_at: string;
};

export async function fetchAdminOpportunityFeedSubscribers(
  category = "opportunites"
): Promise<OpportunityFeedSubscriber[]> {
  if (isSupabaseConfigured()) return sb.fetchAdminOpportunityFeedSubscribers(category);
  const q = encodeURIComponent(category);
  const res = await fetch(`/api/admin/opportunity-feed-subscribers?category=${q}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<OpportunityFeedSubscriber[]>(res);
}

export async function deleteAdminOpportunityFeedSubscriber(id: number): Promise<void> {
  if (isSupabaseConfigured()) return sb.deleteAdminOpportunityFeedSubscriber(id);
  const res = await fetch(`/api/admin/opportunity-feed-subscribers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function fetchAdminRealisations(): Promise<Realisation[]> {
  if (isSupabaseConfigured()) return sb.fetchAdminRealisations();
  const res = await fetch("/api/admin/realisations", { credentials: "include" });
  return parseJson<Realisation[]>(res);
}

export async function createRealisation(
  body: Omit<Realisation, "id" | "created_at" | "updated_at">
): Promise<Realisation> {
  if (isSupabaseConfigured()) return sb.createRealisation(body);
  const res = await fetch("/api/admin/realisations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return parseJson<Realisation>(res);
}

export async function updateRealisation(
  id: number,
  partial: Partial<Pick<Realisation, "title" | "desc" | "category" | "image" | "published" | "sort_order">>
): Promise<Realisation> {
  if (isSupabaseConfigured()) return sb.updateRealisation(id, partial);
  const res = await fetch(`/api/admin/realisations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(partial),
  });
  return parseJson<Realisation>(res);
}

export async function deleteRealisation(id: number): Promise<void> {
  if (isSupabaseConfigured()) return sb.deleteRealisation(id);
  const res = await fetch(`/api/admin/realisations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson<{ ok: boolean }>(res);
}

export async function fetchServicePublications(): Promise<ServicePublication[]> {
  if (isSupabaseConfigured()) return sb.fetchServicePublications();
  const res = await fetch("/api/service-publications", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<ServicePublication[]>(res);
}

export async function fetchSiteSearch(q: string, limit?: number): Promise<SiteSearchResponse> {
  if (isSupabaseConfigured()) return sb.fetchSiteSearch(q, limit);
  const params = new URLSearchParams();
  params.set("q", q.trim());
  if (limit != null && Number.isFinite(limit)) {
    params.set("limit", String(limit));
  }
  const res = await fetch(`/api/search?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<SiteSearchResponse>(res);
}

export async function fetchAdminServicePublications(): Promise<ServicePublication[]> {
  if (isSupabaseConfigured()) return sb.fetchAdminServicePublications();
  const res = await fetch("/api/admin/service-publications", {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<ServicePublication[]>(res);
}

export async function updateServicePublication(
  slug: string,
  partial: Partial<Pick<ServicePublication, "published" | "sort_order">> & {
    /** Remplace les textes personnalisés ; `null` rétablit les textes d’origine du site. */
    content?: ServiceContentOverrides | null;
  }
): Promise<ServicePublication> {
  if (isSupabaseConfigured()) return sb.updateServicePublication(slug, partial);
  const encoded = encodeURIComponent(slug);
  const res = await fetch(`/api/admin/service-publications/${encoded}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(partial),
  });
  return parseJson<ServicePublication>(res);
}

export type OpportunityPostStatus = "draft" | "scheduled" | "published";

export type OpportunityAttachment = {
  url: string;
  name?: string;
};

export type OpportunityPost = {
  id: number;
  category: string;
  title: string;
  summary: string;
  body: string;
  link_url: string | null;
  image_url: string | null;
  attachments: OpportunityAttachment[];
  /** Date limite de dépôt des offres (`YYYY-MM-DD`), pour le filtre par statut de consultation. */
  consultation_deadline: string | null;
  /** Donneur d’ordre ou entité porteuse de la consultation. */
  organisme: string | null;
  /** Zone géographique ou ville. */
  lieu: string | null;
  status: OpportunityPostStatus;
  scheduled_for: string | null;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** État de navigation vers `/opportunite/:id` (évite un 2ᵉ aller API si le GET par id est indisponible). */
export type OpportunityPostNavState = {
  opportunityPost: OpportunityPost;
};

export type OpportunityPostHistoryEntry = {
  id: number;
  post_id: number | null;
  event_type: string;
  detail: Record<string, unknown> | null;
  created_at: string;
  post_title: string | null;
  post_category: string | null;
};

export async function fetchPublicOpportunityPosts(category: string): Promise<OpportunityPost[]> {
  if (isSupabaseConfigured()) return sb.fetchPublicOpportunityPosts(category);
  const q = encodeURIComponent(category);
  const res = await fetch(`/api/opportunity-posts?category=${q}`, { credentials: "include", cache: "no-store" });
  return parseJson<OpportunityPost[]>(res);
}

export async function fetchPublicOpportunityPost(id: number): Promise<OpportunityPost> {
  if (isSupabaseConfigured()) return sb.fetchPublicOpportunityPost(id);
  const res = await fetch(`/api/opportunity-posts/${id}`, { credentials: "include", cache: "no-store" });
  return parseJson<OpportunityPost>(res);
}

export async function fetchAdminOpportunityPosts(): Promise<OpportunityPost[]> {
  if (isSupabaseConfigured()) return sb.fetchAdminOpportunityPosts();
  const res = await fetch("/api/admin/opportunity-posts", { credentials: "include", cache: "no-store" });
  return parseJson<OpportunityPost[]>(res);
}

export async function fetchAdminOpportunityPostHistory(limit = 200): Promise<OpportunityPostHistoryEntry[]> {
  if (isSupabaseConfigured()) return sb.fetchAdminOpportunityPostHistory(limit);
  const res = await fetch(`/api/admin/opportunity-posts/history?limit=${limit}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseJson<OpportunityPostHistoryEntry[]>(res);
}

export type OpportunityPostCreateBody = {
  category: string;
  title: string;
  summary?: string;
  body?: string;
  link_url?: string | null;
  image_url?: string | null;
  attachments?: OpportunityAttachment[];
  /** `YYYY-MM-DD` ou vide */
  consultation_deadline?: string | null;
  organisme?: string | null;
  lieu?: string | null;
  sort_order?: number;
  publish_mode: "draft" | "immediate" | "scheduled";
  scheduled_for?: string | null;
};

export async function createOpportunityPost(body: OpportunityPostCreateBody): Promise<OpportunityPost> {
  if (isSupabaseConfigured()) return sb.createOpportunityPost(body);
  const res = await fetch("/api/admin/opportunity-posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return parseJson<OpportunityPost>(res);
}

export type OpportunityPostUpdateBody = Partial<
  Pick<
    OpportunityPost,
    | "category"
    | "title"
    | "summary"
    | "body"
    | "link_url"
    | "image_url"
    | "attachments"
    | "sort_order"
    | "consultation_deadline"
    | "organisme"
    | "lieu"
  >
> & {
  publish_mode?: "draft" | "immediate" | "scheduled";
  scheduled_for?: string | null;
};

export async function updateOpportunityPost(id: number, body: OpportunityPostUpdateBody): Promise<OpportunityPost> {
  if (isSupabaseConfigured()) return sb.updateOpportunityPost(id, body);
  const res = await fetch(`/api/admin/opportunity-posts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return parseJson<OpportunityPost>(res);
}

export async function deleteOpportunityPost(id: number): Promise<void> {
  if (isSupabaseConfigured()) return sb.deleteOpportunityPost(id);
  const res = await fetch(`/api/admin/opportunity-posts/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJson<{ ok: boolean }>(res);
}

/** Envoie une image (JPEG, PNG, WebP, GIF, max ~5 Mo) ; renvoie un chemin du type `/uploads/media/…`. */
export async function uploadAdminImage(file: File): Promise<string> {
  if (isSupabaseConfigured()) return sb.uploadAdminImage(file);
  const body = new FormData();
  body.append("image", file);
  const res = await fetch("/api/admin/upload-image", {
    method: "POST",
    credentials: "include",
    body,
  });
  const data = await parseJson<{ url: string }>(res);
  return data.url;
}

/** PDF ou Word (.doc, .docx), max ~15 Mo ; renvoie un chemin du type `/uploads/media/…`. */
export async function uploadAdminDocument(file: File): Promise<string> {
  if (isSupabaseConfigured()) return sb.uploadAdminDocument(file);
  const body = new FormData();
  body.append("document", file);
  const res = await fetch("/api/admin/upload-document", {
    method: "POST",
    credentials: "include",
    body,
  });
  const data = await parseJson<{ url: string }>(res);
  return data.url;
}

