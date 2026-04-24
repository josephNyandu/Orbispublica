/** @typedef {import("better-sqlite3").Database} Database */

/**
 * @typedef {Object} SearchHit
 * @property {'realisation' | 'opportunity_post' | 'expertise'} type
 * @property {number | string} id
 * @property {string} title
 * @property {string} excerpt
 * @property {string} href
 * @property {string} [meta]
 */

export const SEARCH_MAX_QUERY_LEN = 200;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * Échappe % et _ pour LIKE … ESCAPE '\'
 * @param {string} s
 */
export function escapeLikeFragment(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/**
 * @param {string} text
 * @param {number} max
 */
function excerpt(text, max = 160) {
  const t = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * @param {string} category
 */
export function opportunityCategoryHref(category) {
  const c = String(category || "").trim();
  /** @type {Record<string, string>} */
  const map = {
    opportunites: "/opportunites",
    "appels-a-projets": "/appels-a-projets",
    "financements-subventions": "/financements-subventions",
    "projets-ppp-investissement": "/opportunites/ppp",
    "alertes-personnalisees": "/alertes-personnalisees",
    "appels-offres": "/opportunites",
  };
  return map[c] || "/opportunites";
}

/**
 * @param {string} slug
 * @param {string | null | undefined} contentJson
 */
function expertiseDisplayTitle(slug, contentJson) {
  if (contentJson) {
    try {
      const j = JSON.parse(contentJson);
      if (j && typeof j === "object" && typeof j.title === "string" && j.title.trim()) {
        return j.title.trim();
      }
    } catch {
      /* ignore */
    }
  }
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Recherche publique sur réalisations, publications opportunités et expertises (SQLite).
 * @param {Database} db
 * @param {string} rawQuery
 * @param {number} [limit]
 * @returns {{ query: string, results: SearchHit[] }}
 */
export function searchPublicSite(db, rawQuery, limit = DEFAULT_LIMIT) {
  const query = String(rawQuery ?? "").trim();
  if (!query) {
    return { query: "", results: [] };
  }
  if (query.length > SEARCH_MAX_QUERY_LEN) {
    const err = new Error("QUERY_TOO_LONG");
    /** @type {Error & { code?: string }} */
    const e = err;
    e.code = "QUERY_TOO_LONG";
    throw e;
  }

  const cap = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  const perBucket = Math.max(5, Math.ceil(cap / 2));

  const frag = escapeLikeFragment(query.toLowerCase());
  const pattern = `%${frag}%`;

  /** @type {SearchHit[]} */
  const results = [];

  const realRows = db
    .prepare(
      `SELECT id, title, description, category FROM realisations
       WHERE published = 1 AND (
         LOWER(title) LIKE ? ESCAPE '\\' OR
         LOWER(description) LIKE ? ESCAPE '\\' OR
         LOWER(category) LIKE ? ESCAPE '\\'
       )
       ORDER BY sort_order ASC, id ASC
       LIMIT ?`
    )
    .all(pattern, pattern, pattern, perBucket);

  for (const row of realRows) {
    results.push({
      type: "realisation",
      id: row.id,
      title: row.title,
      excerpt: excerpt(row.description),
      href: "/nos-realisations",
      meta: row.category,
    });
  }

  const oppRows = db
    .prepare(
      `SELECT id, category, title, summary, body FROM opportunity_posts
       WHERE status = 'published' AND (
         LOWER(title) LIKE ? ESCAPE '\\' OR
         LOWER(COALESCE(summary, '')) LIKE ? ESCAPE '\\' OR
         LOWER(COALESCE(body, '')) LIKE ? ESCAPE '\\' OR
         LOWER(COALESCE(organisme, '')) LIKE ? ESCAPE '\\' OR
         LOWER(COALESCE(lieu, '')) LIKE ? ESCAPE '\\'
       )
       ORDER BY datetime(COALESCE(published_at, updated_at)) DESC, id DESC
       LIMIT ?`
    )
    .all(pattern, pattern, pattern, pattern, pattern, perBucket);

  for (const row of oppRows) {
    const snippet = row.summary || row.body || "";
    results.push({
      type: "opportunity_post",
      id: row.id,
      title: row.title,
      excerpt: excerpt(snippet),
      href: `/opportunite/${row.id}`,
      meta: row.category.replace(/-/g, " "),
    });
  }

  const expRows = db
    .prepare(
      `SELECT slug, content_json FROM service_publications
       WHERE published = 1 AND (
         LOWER(slug) LIKE ? ESCAPE '\\' OR
         LOWER(COALESCE(content_json, '')) LIKE ? ESCAPE '\\'
       )
       ORDER BY sort_order ASC, slug ASC
       LIMIT ?`
    )
    .all(pattern, pattern, perBucket);

  for (const row of expRows) {
    const title = expertiseDisplayTitle(row.slug, row.content_json);
    let desc = "";
    try {
      const j = row.content_json ? JSON.parse(row.content_json) : null;
      if (j && typeof j === "object") {
        desc = String(j.subtitle || j.description || j.fullDescription || "").trim();
      }
    } catch {
      /* ignore */
    }
    results.push({
      type: "expertise",
      id: row.slug,
      title,
      excerpt: excerpt(desc || title),
      href: `/services/${encodeURIComponent(row.slug)}`,
      meta: "Expertise",
    });
  }

  return {
    query,
    results: results.slice(0, cap),
  };
}
