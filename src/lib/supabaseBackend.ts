import type { SiteContact } from "@/data/contact";
import { siteContactDefaults } from "@/data/contact";
import { isOpportunityCategoryId } from "@/data/opportunityCategories";
import type {
  OpportunityFeedSubscribeResponse,
  OpportunityFeedSubscriber,
  OpportunityPost,
  OpportunityPostCreateBody,
  OpportunityPostHistoryEntry,
  OpportunityPostUpdateBody,
  OpportunityPostStatus,
  OpportunityAttachment,
  Realisation,
  ServiceContentOverrides,
  ServicePublication,
  SiteSearchResponse,
} from "./api";
import { getSupabase } from "./supabaseClient";
import {
  SUPABASE_ADMIN_MEDIA_BUCKET,
  assertAdminDocumentFile,
  assertAdminImageFile,
} from "./supabaseStorage";
import { parseOpportunityPostBody, type ParsedOpportunityPostBody } from "./opportunityPostBodyShared";
import { parseSiteContactBody } from "./siteContactValidation";
import { sanitizeServiceContent } from "./serviceContentSanitize";

const CONTACT_KEY = "contact";

// #region agent log
const DEBUG_SESSION_STORAGE_KEY = "orbis_debug_session_60a48c";

function dbgAgentLog(payload: {
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
  runId?: string;
}): void {
  const body = {
    sessionId: "60a48c",
    timestamp: Date.now(),
    runId: payload.runId ?? "pre-fix",
    hypothesisId: payload.hypothesisId,
    location: payload.location,
    message: payload.message,
    data: payload.data ?? {},
  };
  fetch("http://127.0.0.1:7791/ingest/67dc14b1-df55-42fa-917c-cba48eaf667f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "60a48c",
    },
    body: JSON.stringify(body),
  }).catch(() => {});
  try {
    const raw = sessionStorage.getItem(DEBUG_SESSION_STORAGE_KEY);
    const arr: unknown[] = raw ? (JSON.parse(raw) as unknown[]) : [];
    arr.push(body);
    sessionStorage.setItem(DEBUG_SESSION_STORAGE_KEY, JSON.stringify(arr.slice(-25)));
  } catch {
    /* ignore */
  }
}
// #endregion

async function processDueScheduled(): Promise<void> {
  const sb = getSupabase();
  await sb.rpc("process_due_scheduled_opportunity_posts");
}

function numId(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) return Number(v);
  return NaN;
}

function realisationFromRow(row: Record<string, unknown>): Realisation {
  return {
    id: numId(row.id),
    title: String(row.title),
    desc: String(row.description),
    category: String(row.category),
    image: String(row.image),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order) || 0,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function servicePublicationFromRow(row: Record<string, unknown>): ServicePublication {
  let content_overrides: ServiceContentOverrides | null = null;
  if (row.content_json) {
    try {
      const parsed = JSON.parse(String(row.content_json));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        content_overrides = parsed as ServiceContentOverrides;
      }
    } catch {
      content_overrides = null;
    }
  }
  return {
    slug: String(row.slug),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order) || 0,
    updated_at: String(row.updated_at),
    content_overrides,
  };
}

function opportunityPostFromRow(row: Record<string, unknown>): OpportunityPost {
  let attachments: OpportunityAttachment[] = [];
  if (row.attachments_json) {
    try {
      const p = JSON.parse(String(row.attachments_json));
      if (Array.isArray(p)) {
        attachments = p.filter(
          (x): x is OpportunityAttachment =>
            Boolean(x) && typeof x === "object" && typeof (x as { url?: unknown }).url === "string"
        ) as OpportunityAttachment[];
      }
    } catch {
      attachments = [];
    }
  }
  const cd = row.consultation_deadline;
  let consultation_deadline: string | null = null;
  if (cd != null && String(cd).trim()) {
    const s = String(cd).trim().slice(0, 10);
    consultation_deadline = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  }
  return {
    id: numId(row.id),
    category: String(row.category),
    title: String(row.title),
    summary: String(row.summary ?? ""),
    body: String(row.body ?? ""),
    link_url: row.link_url ? String(row.link_url) : null,
    image_url: row.image_url ? String(row.image_url) : null,
    attachments,
    consultation_deadline,
    organisme: row.organisme != null && String(row.organisme).trim() ? String(row.organisme).trim() : null,
    lieu: row.lieu != null && String(row.lieu).trim() ? String(row.lieu).trim() : null,
    status: row.status as OpportunityPostStatus,
    scheduled_for: row.scheduled_for ? String(row.scheduled_for) : null,
    published_at: row.published_at ? String(row.published_at) : null,
    sort_order: Number(row.sort_order) || 0,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function existingFromRow(row: Record<string, unknown>): Parameters<typeof parseOpportunityPostBody>[1] {
  return {
    title: String(row.title),
    summary: String(row.summary ?? ""),
    body: String(row.body ?? ""),
    link_url: row.link_url ? String(row.link_url) : null,
    category: String(row.category),
    sort_order: Number(row.sort_order) || 0,
    status: String(row.status),
    scheduled_for: row.scheduled_for ? String(row.scheduled_for) : null,
    image_url: row.image_url ? String(row.image_url) : null,
    attachments_json: row.attachments_json != null ? String(row.attachments_json) : null,
    consultation_deadline: row.consultation_deadline ? String(row.consultation_deadline).slice(0, 10) : null,
    organisme: row.organisme != null ? String(row.organisme) : null,
    lieu: row.lieu != null ? String(row.lieu) : null,
  };
}

async function logOpportunityHistory(
  postId: number | null,
  eventType: string,
  detail: Record<string, unknown> | null
): Promise<void> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const { error } = await sb.from("opportunity_post_history").insert({
    post_id: postId,
    event_type: eventType,
    detail_json: detail ? JSON.stringify(detail) : null,
    created_at: now,
  });
  if (error) throw new Error(error.message);
}

export async function fetchSiteContact(): Promise<SiteContact> {
  const sb = getSupabase();
  const { data, error } = await sb.from("site_settings").select("value_json").eq("key", CONTACT_KEY).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.value_json) return siteContactDefaults;
  try {
    return parseSiteContactBody(JSON.parse(String(data.value_json)));
  } catch {
    return siteContactDefaults;
  }
}

export async function fetchAdminSiteContact(): Promise<SiteContact> {
  return fetchSiteContact();
}

export async function updateAdminSiteContact(body: SiteContact): Promise<SiteContact> {
  const parsed = parseSiteContactBody(body);
  const sb = getSupabase();
  const now = new Date().toISOString();
  const { error } = await sb.from("site_settings").upsert(
    { key: CONTACT_KEY, value_json: JSON.stringify(parsed), updated_at: now },
    { onConflict: "key" }
  );
  if (error) throw new Error(error.message);
  return parsed;
}

export async function fetchPublicRealisations(): Promise<Realisation[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("realisations")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => realisationFromRow(r as Record<string, unknown>));
}

export async function authMe(): Promise<{ ok: boolean; email: string | null; isSiteAdmin: boolean }> {
  const sb = getSupabase();
  const { data, error } = await sb.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session?.user) {
    throw new Error("Non authentifié");
  }
  const uid = data.session.user.id;
  const { data: sa } = await sb.from("site_admins").select("user_id").eq("user_id", uid).maybeSingle();
  return { ok: true, email: data.session.user.email ?? null, isSiteAdmin: Boolean(sa) };
}

export async function login(email: string, password: string, _remember = true): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message === "Invalid login credentials" ? "Identifiants invalides" : error.message);
}

export async function logout(): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function subscribeOpportunityFeed(body: {
  email: string;
  name?: string;
  category?: "opportunites";
}): Promise<OpportunityFeedSubscribeResponse> {
  const category = body.category ?? "opportunites";
  if (category !== "opportunites") {
    throw new Error("L’abonnement par e-mail n’est proposé que pour les appels d’offres.");
  }
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Adresse e-mail invalide.");
  }
  const name = body.name?.trim().slice(0, 200) || null;
  const now = new Date().toISOString();
  const sb = getSupabase();
  const { data, error } = await sb
    .from("opportunity_feed_subscribers")
    .insert({ category, email, name, created_at: now })
    .select("id")
    .maybeSingle();
  if (error) {
    if (error.code === "23505") {
      return { ok: true, already: true };
    }
    throw new Error(error.message);
  }
  return { ok: true, id: data?.id != null ? numId(data.id) : undefined };
}

export async function fetchAdminOpportunityFeedSubscribers(category = "opportunites"): Promise<OpportunityFeedSubscriber[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("opportunity_feed_subscribers")
    .select("id, category, email, name, created_at")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: numId((r as Record<string, unknown>).id),
    category: String((r as Record<string, unknown>).category),
    email: String((r as Record<string, unknown>).email),
    name: (r as Record<string, unknown>).name != null ? String((r as Record<string, unknown>).name) : null,
    created_at: String((r as Record<string, unknown>).created_at),
  }));
}

export async function deleteAdminOpportunityFeedSubscriber(id: number): Promise<void> {
  const sb = getSupabase();
  const { data, error } = await sb.from("opportunity_feed_subscribers").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Abonné introuvable");
}

export async function fetchAdminRealisations(): Promise<Realisation[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("realisations").select("*").order("sort_order", { ascending: true }).order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => realisationFromRow(r as Record<string, unknown>));
}

export async function createRealisation(
  body: Omit<Realisation, "id" | "created_at" | "updated_at">
): Promise<Realisation> {
  const sb = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("realisations")
    .insert({
      title: body.title,
      description: body.desc,
      category: body.category,
      image: body.image,
      published: body.published,
      sort_order: body.sort_order,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      "Création refusée : compte sans droit administrateur (table site_admins) ou données rejetées par la politique de sécurité.",
    );
  }
  return realisationFromRow(data as Record<string, unknown>);
}

export async function updateRealisation(
  id: number,
  partial: Partial<Pick<Realisation, "title" | "desc" | "category" | "image" | "published" | "sort_order">>
): Promise<Realisation> {
  const sb = getSupabase();
  // #region agent log
  {
    const { data: sess } = await sb.auth.getSession();
    const uid = sess.session?.user?.id ?? null;
    let siteAdminRowFound = false;
    if (uid) {
      const { data: sa } = await sb.from("site_admins").select("user_id").eq("user_id", uid).maybeSingle();
      siteAdminRowFound = Boolean(sa);
    }
    dbgAgentLog({
      hypothesisId: "H2",
      location: "supabaseBackend.ts:updateRealisation(entry)",
      message: "session and site_admins",
      data: {
        realisationId: id,
        hasSession: Boolean(sess.session),
        siteAdminRowFound,
        partialKeys: Object.keys(partial),
      },
    });
  }
  // #endregion
  const { data: existing, error: e0 } = await sb.from("realisations").select("*").eq("id", id).maybeSingle();
  if (e0) throw new Error(e0.message);
  if (!existing) throw new Error("Non trouvé");
  const ex = existing as Record<string, unknown>;
  const merged = {
    title: partial.title !== undefined ? String(partial.title).trim() : String(ex.title),
    description:
      partial.desc !== undefined
        ? String(partial.desc).trim()
        : String(ex.description),
    category: partial.category !== undefined ? String(partial.category).trim() : String(ex.category),
    image: partial.image !== undefined ? String(partial.image).trim() : String(ex.image),
    published: partial.published !== undefined ? Boolean(partial.published) : Boolean(ex.published),
    sort_order: partial.sort_order !== undefined ? Number(partial.sort_order) : Number(ex.sort_order),
  };
  if (!merged.title || !merged.description || !merged.category || !merged.image) {
    throw new Error("Champs invalides");
  }
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("realisations")
    .update({
      title: merged.title,
      description: merged.description,
      category: merged.category,
      image: merged.image,
      published: merged.published,
      sort_order: Number.isFinite(merged.sort_order) ? merged.sort_order : 0,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  // #region agent log
  dbgAgentLog({
    hypothesisId: "H2",
    location: "supabaseBackend.ts:updateRealisation(after-update)",
    message: "update+select",
    data: {
      realisationId: id,
      hasError: Boolean(error),
      errCode: error?.code ?? null,
      errMessage: error?.message ?? null,
      returnedRow: data != null,
    },
  });
  // #endregion
  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      "Enregistrement refusé : compte sans droit administrateur (table site_admins) ou fiche introuvable.",
    );
  }
  return realisationFromRow(data as Record<string, unknown>);
}

export async function deleteRealisation(id: number): Promise<void> {
  const sb = getSupabase();
  const { data, error } = await sb.from("realisations").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Non trouvé");
}

export async function fetchServicePublications(): Promise<ServicePublication[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("service_publications").select("*").order("sort_order", { ascending: true }).order("slug", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => servicePublicationFromRow(r as Record<string, unknown>));
}

export async function fetchSiteSearch(q: string, limit?: number): Promise<SiteSearchResponse> {
  const query = String(q ?? "").trim();
  if (!query) return { query: "", results: [] };
  if (query.length > 200) {
    throw new Error("La requête dépasse 200 caractères");
  }
  const sb = getSupabase();
  const { data, error } = await sb.rpc("site_search_public", {
    p_query: query,
    p_limit: limit != null && Number.isFinite(limit) ? limit : 20,
  });
  if (error) {
    if (String(error.message).includes("QUERY_TOO_LONG")) {
      throw new Error("La requête dépasse 200 caractères");
    }
    throw new Error(error.message);
  }
  const payload = data as { query?: string; results?: unknown } | null;
  return {
    query: String(payload?.query ?? query),
    results: Array.isArray(payload?.results) ? (payload!.results as SiteSearchResponse["results"]) : [],
  };
}

export async function fetchAdminServicePublications(): Promise<ServicePublication[]> {
  return fetchServicePublications();
}

export async function updateServicePublication(
  slug: string,
  partial: Partial<Pick<ServicePublication, "published" | "sort_order">> & {
    content?: ServiceContentOverrides | null;
  }
): Promise<ServicePublication> {
  const sb = getSupabase();
  const { data: existing, error: e0 } = await sb.from("service_publications").select("*").eq("slug", slug).maybeSingle();
  if (e0) throw new Error(e0.message);
  if (!existing) throw new Error("Expertise inconnue");
  const ex = existing as Record<string, unknown>;
  const published = partial.published !== undefined ? Boolean(partial.published) : Boolean(ex.published);
  const sort_order =
    partial.sort_order !== undefined ? Number(partial.sort_order) : Number(ex.sort_order);
  let nextContentJson: string | null = ex.content_json != null ? String(ex.content_json) : null;
  if (Object.prototype.hasOwnProperty.call(partial, "content")) {
    try {
      const sanitized = sanitizeServiceContent(partial.content);
      if (sanitized === undefined) {
        /* inchangé */
      } else if (sanitized === null) {
        nextContentJson = null;
      } else {
        nextContentJson = JSON.stringify(sanitized);
      }
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("service_publications")
    .update({
      published,
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      content_json: nextContentJson,
      updated_at: now,
    })
    .eq("slug", slug)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return servicePublicationFromRow(data as Record<string, unknown>);
}

export async function fetchPublicOpportunityPosts(category: string): Promise<OpportunityPost[]> {
  if (!category.trim() || !isOpportunityCategoryId(category)) {
    throw new Error("Paramètre category requis ou invalide");
  }
  await processDueScheduled();
  const sb = getSupabase();
  const { data, error } = await sb
    .from("opportunity_posts")
    .select("*")
    .eq("category", category)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => opportunityPostFromRow(r as Record<string, unknown>));
}

export async function fetchPublicOpportunityPost(id: number): Promise<OpportunityPost> {
  await processDueScheduled();
  const sb = getSupabase();
  const { data, error } = await sb.from("opportunity_posts").select("*").eq("id", id).eq("status", "published").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Publication introuvable");
  return opportunityPostFromRow(data as Record<string, unknown>);
}

export async function fetchAdminOpportunityPosts(): Promise<OpportunityPost[]> {
  await processDueScheduled();
  const sb = getSupabase();
  const { data, error } = await sb.from("opportunity_posts").select("*").order("updated_at", { ascending: false }).order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => opportunityPostFromRow(r as Record<string, unknown>));
}

export async function fetchAdminOpportunityPostHistory(limit = 200): Promise<OpportunityPostHistoryEntry[]> {
  await processDueScheduled();
  const sb = getSupabase();
  const cap = Math.min(500, Math.max(1, limit));
  const { data: rows, error } = await sb
    .from("opportunity_post_history")
    .select("*")
    .order("id", { ascending: false })
    .limit(cap);
  if (error) throw new Error(error.message);
  const list = rows ?? [];
  const postIds = [...new Set(list.map((r) => (r as Record<string, unknown>).post_id).filter((x) => x != null).map((x) => numId(x)))];
  let postMap = new Map<number, { title: string; category: string }>();
  if (postIds.length) {
    const { data: posts } = await sb.from("opportunity_posts").select("id, title, category").in("id", postIds);
    postMap = new Map(
      (posts ?? []).map((p) => {
        const pr = p as Record<string, unknown>;
        return [numId(pr.id), { title: String(pr.title), category: String(pr.category) }] as const;
      })
    );
  }
  return list.map((row) => {
    const r = row as Record<string, unknown>;
    let detail: Record<string, unknown> | null = null;
    if (r.detail_json) {
      try {
        detail = JSON.parse(String(r.detail_json)) as Record<string, unknown>;
      } catch {
        detail = null;
      }
    }
    const pid = r.post_id != null ? numId(r.post_id) : null;
    const pm = pid != null ? postMap.get(pid) : undefined;
    return {
      id: numId(r.id),
      post_id: pid,
      event_type: String(r.event_type),
      detail,
      created_at: String(r.created_at),
      post_title: pm?.title ?? null,
      post_category: pm?.category ?? null,
    };
  });
}

function applyPublishMode(
  merged: ParsedOpportunityPostBody,
  publish_mode: "draft" | "immediate" | "scheduled" | undefined,
  existingPublishedAt: string | null
): { status: string; scheduled_for: string | null; published_at: string | null } {
  let status = merged.status;
  if (publish_mode === "immediate") status = "published";
  else if (publish_mode === "draft") status = "draft";
  else if (publish_mode === "scheduled") status = "scheduled";

  const now = new Date().toISOString();
  let scheduled_for = merged.scheduled_for;
  let published_at: string | null = existingPublishedAt;

  if (status === "scheduled") {
    if (!scheduled_for) {
      throw new Error("Indiquez la date et l'heure de publication planifiée");
    }
    if (new Date(scheduled_for).getTime() <= Date.now()) {
      throw new Error("La planification doit être dans le futur");
    }
    published_at = null;
  } else if (status === "published") {
    scheduled_for = null;
    if (!published_at) published_at = now;
  } else {
    status = "draft";
    scheduled_for = null;
  }
  return { status, scheduled_for, published_at };
}

export async function createOpportunityPost(body: OpportunityPostCreateBody): Promise<OpportunityPost> {
  await processDueScheduled();
  const merged = parseOpportunityPostBody(body, null);
  if (!merged.title) throw new Error("Titre requis");
  if (!isOpportunityCategoryId(merged.category)) throw new Error("Catégorie invalide");

  const { status, scheduled_for, published_at } = applyPublishMode(merged, body.publish_mode, null);
  const now = new Date().toISOString();
  const sb = getSupabase();
  const { data, error } = await sb
    .from("opportunity_posts")
    .insert({
      category: merged.category,
      title: merged.title,
      summary: merged.summary,
      body: merged.body,
      link_url: merged.link_url,
      image_url: merged.image_url,
      attachments_json: merged.attachments_json,
      consultation_deadline: merged.consultation_deadline,
      organisme: merged.organisme,
      lieu: merged.lieu,
      status,
      scheduled_for,
      published_at,
      sort_order: Number.isFinite(merged.sort_order) ? merged.sort_order : 0,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as Record<string, unknown>;
  const id = numId(row.id);
  await logOpportunityHistory(id, "created", {
    title: merged.title,
    category: merged.category,
    status,
    scheduled_for,
  });
  return opportunityPostFromRow(row);
}

export async function updateOpportunityPost(id: number, body: OpportunityPostUpdateBody): Promise<OpportunityPost> {
  await processDueScheduled();
  const sb = getSupabase();
  const { data: existingRow, error: e0 } = await sb.from("opportunity_posts").select("*").eq("id", id).maybeSingle();
  if (e0) throw new Error(e0.message);
  if (!existingRow) throw new Error("Publication introuvable");
  const existing = existingFromRow(existingRow as Record<string, unknown>);
  const merged = parseOpportunityPostBody(body, existing);
  if (!merged.title) throw new Error("Titre requis");
  if (!isOpportunityCategoryId(merged.category)) throw new Error("Catégorie invalide");

  const exPub = (existingRow as Record<string, unknown>).published_at
    ? String((existingRow as Record<string, unknown>).published_at)
    : null;
  const { status, scheduled_for, published_at } = applyPublishMode(
    merged,
    body.publish_mode,
    exPub
  );
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("opportunity_posts")
    .update({
      category: merged.category,
      title: merged.title,
      summary: merged.summary,
      body: merged.body,
      link_url: merged.link_url,
      image_url: merged.image_url,
      attachments_json: merged.attachments_json,
      consultation_deadline: merged.consultation_deadline,
      organisme: merged.organisme,
      lieu: merged.lieu,
      status,
      scheduled_for,
      published_at,
      sort_order: Number.isFinite(merged.sort_order) ? merged.sort_order : 0,
      updated_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await logOpportunityHistory(id, "updated", {
    title: merged.title,
    category: merged.category,
    status,
    scheduled_for,
  });
  return opportunityPostFromRow(data as Record<string, unknown>);
}

export async function deleteOpportunityPost(id: number): Promise<void> {
  const sb = getSupabase();
  const { data: existing, error: e0 } = await sb.from("opportunity_posts").select("*").eq("id", id).maybeSingle();
  if (e0) throw new Error(e0.message);
  if (!existing) throw new Error("Publication introuvable");
  const ex = existing as Record<string, unknown>;
  const now = new Date().toISOString();
  await logOpportunityHistory(null, "deleted", {
    former_post_id: id,
    title: ex.title,
    category: ex.category,
    at: now,
  });
  const { error } = await sb.from("opportunity_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function safeStorageName(name: string): string {
  const base = name.split(/[/\\]/).pop() || "file";
  return base.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "file";
}

export async function uploadAdminImage(file: File): Promise<string> {
  assertAdminImageFile(file);
  const sb = getSupabase();
  const path = `media/${crypto.randomUUID()}-${safeStorageName(file.name)}`;
  const rawType = (file.type || "").trim().toLowerCase();
  /** Certains navigateurs envoient image/pjpeg ; le bucket peut n’autoriser que image/jpeg → 400. */
  const uploadContentType = rawType === "image/pjpeg" ? "image/jpeg" : rawType || undefined;
  const { error } = await sb.storage.from(SUPABASE_ADMIN_MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: uploadContentType,
  });
  // #region agent log
  if (error) {
    const errRec = error as { message?: string; name?: string; statusCode?: string | number };
    dbgAgentLog({
      hypothesisId: "H1",
      location: "supabaseBackend.ts:uploadAdminImage",
      message: "storage upload failed",
      data: {
        bucket: SUPABASE_ADMIN_MEDIA_BUCKET,
        fileNameLen: file.name.length,
        contentType: file.type || "(empty)",
        statusCode: errRec.statusCode ?? null,
        errName: errRec.name ?? null,
        errMessage: errRec.message ?? String(error),
      },
    });
  }
  // #endregion
  if (error) throw new Error(error.message);
  const { data: pub } = sb.storage.from(SUPABASE_ADMIN_MEDIA_BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}

export async function uploadAdminDocument(file: File): Promise<string> {
  assertAdminDocumentFile(file);
  const sb = getSupabase();
  const path = `media/${crypto.randomUUID()}-${safeStorageName(file.name)}`;
  const { error } = await sb.storage.from(SUPABASE_ADMIN_MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  const { data: pub } = sb.storage.from(SUPABASE_ADMIN_MEDIA_BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}
