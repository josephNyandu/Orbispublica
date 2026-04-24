/** @typedef {import("better-sqlite3").Database} Database */

export const OPPORTUNITY_CATEGORIES = [
  "opportunites",
  "appels-a-projets",
  "financements-subventions",
  "alertes-personnalisees",
];

/**
 * @param {string} cat
 */
export function isValidOpportunityCategory(cat) {
  return OPPORTUNITY_CATEGORIES.includes(String(cat || "").trim());
}

/**
 * Passe en « published » les billets planifiés dont l’heure est atteinte.
 * @param {Database} db
 */
export function processDueScheduledPosts(db) {
  const now = new Date().toISOString();
  const due = db
    .prepare(
      `SELECT id FROM opportunity_posts
       WHERE status = 'scheduled'
         AND scheduled_for IS NOT NULL
         AND scheduled_for <= ?`
    )
    .all(now);
  if (due.length === 0) return 0;

  const upd = db.prepare(
    `UPDATE opportunity_posts
     SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ?
     WHERE id = ?`
  );
  const log = db.prepare(
    `INSERT INTO opportunity_post_history (post_id, event_type, detail_json, created_at)
     VALUES (?, 'auto_published', ?, ?)`
  );

  let n = 0;
  const tx = db.transaction(() => {
    for (const row of due) {
      upd.run(now, now, row.id);
      log.run(row.id, JSON.stringify({ at: now }), now);
      n += 1;
    }
  });
  tx();
  return n;
}

const MAX_OPPORTUNITY_ATTACHMENTS = 15;
const MAX_ATTACHMENT_URL_LEN = 2048;
const MAX_ATTACHMENT_NAME_LEN = 200;

/**
 * @param {unknown} attachments
 * @param {string | null | undefined} existingJson
 */
export function normalizeOpportunityAttachmentsJson(attachments, existingJson) {
  if (attachments === undefined) {
    if (existingJson != null && String(existingJson).trim() !== "") {
      return String(existingJson);
    }
    return "[]";
  }
  if (!Array.isArray(attachments)) {
    return "[]";
  }
  /** @type {{ url: string, name?: string }[]} */
  const out = [];
  for (const item of attachments.slice(0, MAX_OPPORTUNITY_ATTACHMENTS)) {
    if (!item || typeof item !== "object") continue;
    const url = String(/** @type {{ url?: unknown }} */ (item).url ?? "")
      .trim()
      .slice(0, MAX_ATTACHMENT_URL_LEN);
    if (!url) continue;
    const okLocal = url.startsWith("/uploads/media/");
    const okRemote = /^https:\/\//i.test(url);
    if (!okLocal && !okRemote) continue;
    const nameRaw = String(/** @type {{ name?: unknown }} */ (item).name ?? "").trim().slice(0, MAX_ATTACHMENT_NAME_LEN);
    if (nameRaw) {
      out.push({ url, name: nameRaw });
    } else {
      out.push({ url });
    }
  }
  return JSON.stringify(out);
}

/** @param {Record<string, unknown>} row */
export function opportunityPostRowToApi(row) {
  if (!row) return null;
  /** @type {{ url: string, name?: string }[]} */
  let attachments = [];
  if (row.attachments_json) {
    try {
      const p = JSON.parse(String(row.attachments_json));
      if (Array.isArray(p)) {
        attachments = p.filter(
          (x) => x && typeof x === "object" && typeof x.url === "string" && x.url.trim()
        );
      }
    } catch {
      attachments = [];
    }
  }
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    summary: row.summary ?? "",
    body: row.body ?? "",
    link_url: row.link_url || null,
    image_url: row.image_url ? String(row.image_url) : null,
    attachments,
    consultation_deadline: row.consultation_deadline ? String(row.consultation_deadline).trim() || null : null,
    organisme: row.organisme != null && String(row.organisme).trim() ? String(row.organisme).trim() : null,
    lieu: row.lieu != null && String(row.lieu).trim() ? String(row.lieu).trim() : null,
    status: row.status,
    scheduled_for: row.scheduled_for || null,
    published_at: row.published_at || null,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** @param {Record<string, unknown>} row */
export function opportunityHistoryRowToApi(row) {
  if (!row) return null;
  let detail = null;
  if (row.detail_json) {
    try {
      detail = JSON.parse(row.detail_json);
    } catch {
      detail = null;
    }
  }
  return {
    id: row.id,
    post_id: row.post_id,
    event_type: row.event_type,
    detail,
    created_at: row.created_at,
  };
}

/**
 * @param {Database} db
 * @param {number | null} postId
 * @param {string} eventType
 * @param {Record<string, unknown> | null} detail
 */
export function logOpportunityHistory(db, postId, eventType, detail) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO opportunity_post_history (post_id, event_type, detail_json, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(postId, eventType, detail ? JSON.stringify(detail) : null, now);
}

/**
 * @param {unknown} body
 * @param {{ title: string; summary: string; body: string; link_url: string | null; category: string; sort_order: number; status: string; scheduled_for: string | null; image_url?: string | null; attachments_json?: string | null; consultation_deadline?: string | null; organisme?: string | null; lieu?: string | null }} existing
 */
const MAX_ORG_LIEU_LEN = 400;

export function parseOpportunityPostBody(body, existing = null) {
  const title = String(body?.title ?? existing?.title ?? "").trim();
  const summary = String(body?.summary ?? existing?.summary ?? "").trim();
  const bodyText = String(body?.body ?? body?.content ?? existing?.body ?? "").trim();
  const linkRaw = body?.link_url !== undefined ? String(body.link_url ?? "").trim() : (existing?.link_url ?? "");
  const link_url = linkRaw ? linkRaw : null;
  const category = String(body?.category ?? existing?.category ?? "").trim();
  const sort_order = Number.isFinite(Number(body?.sort_order))
    ? Number(body.sort_order)
    : existing?.sort_order ?? 0;

  const image_url =
    body?.image_url !== undefined
      ? (String(body.image_url ?? "").trim() || null)
      : (existing?.image_url ?? null);

  const attachments_json = normalizeOpportunityAttachmentsJson(
    body?.attachments,
    existing?.attachments_json
  );

  let status = existing ? existing.status : "draft";
  let scheduled_for = existing?.scheduled_for ?? null;

  if (body?.status !== undefined) {
    const s = String(body.status).trim();
    if (s === "draft" || s === "scheduled" || s === "published") {
      status = s;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "scheduled_for")) {
    const sf = body.scheduled_for;
    if (sf === null || sf === "") {
      scheduled_for = null;
    } else {
      const t = String(sf).trim();
      scheduled_for = t || null;
    }
  }

  let consultation_deadline = null;
  if (existing?.consultation_deadline) {
    const e = String(existing.consultation_deadline).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(e)) consultation_deadline = e;
  }
  if (body && Object.prototype.hasOwnProperty.call(body, "consultation_deadline")) {
    const cd = body.consultation_deadline;
    if (cd === null || cd === "") {
      consultation_deadline = null;
    } else {
      const t = String(cd).trim();
      if (!t) {
        consultation_deadline = null;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
        consultation_deadline = t;
      } else {
        consultation_deadline = null;
      }
    }
  }

  let organisme =
    existing?.organisme != null && String(existing.organisme).trim()
      ? String(existing.organisme).trim().slice(0, MAX_ORG_LIEU_LEN)
      : null;
  if (body && Object.prototype.hasOwnProperty.call(body, "organisme")) {
    const t = String(body.organisme ?? "").trim().slice(0, MAX_ORG_LIEU_LEN);
    organisme = t || null;
  }

  let lieu =
    existing?.lieu != null && String(existing.lieu).trim()
      ? String(existing.lieu).trim().slice(0, MAX_ORG_LIEU_LEN)
      : null;
  if (body && Object.prototype.hasOwnProperty.call(body, "lieu")) {
    const t = String(body.lieu ?? "").trim().slice(0, MAX_ORG_LIEU_LEN);
    lieu = t || null;
  }

  return {
    title,
    summary,
    body: bodyText,
    link_url,
    image_url,
    attachments_json,
    category,
    sort_order,
    status,
    scheduled_for,
    consultation_deadline,
    organisme,
    lieu,
  };
}
