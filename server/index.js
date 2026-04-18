import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { initDb, getDb, rowToApi, servicePublicationRowToApi } from "./db.js";
import {
  processDueScheduledPosts,
  parseOpportunityPostBody,
  isValidOpportunityCategory,
  logOpportunityHistory,
  opportunityPostRowToApi,
  opportunityHistoryRowToApi,
} from "./opportunityPosts.js";
import {
  getSiteContactMerged,
  parseSiteContactBody,
  saveSiteContactToDb,
} from "./siteContact.js";
import { searchPublicSite, SEARCH_MAX_QUERY_LEN } from "./siteSearch.js";
import { sanitizeServiceContent } from "./serviceContent.js";
import {
  authMiddleware,
  verifyAdminCredentials,
  signAuthToken,
  getCookieName,
  verifyAuthToken,
} from "./auth.js";
import { ensureUploadDirs, adminImageUpload, adminDocumentUpload, uploadsPublicRoot } from "./adminUpload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initDb();
ensureUploadDirs();

/** Active les publications planifiées dont l’heure est passée (également appelé sur les lectures API). */
function runScheduledOpportunityPublishing() {
  try {
    processDueScheduledPosts(getDb());
  } catch (e) {
    console.error("[opportunity_posts] processDueScheduledPosts:", e);
  }
}

setInterval(runScheduledOpportunityPublishing, 60_000);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadsPublicRoot));

const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
}

/** SameSite cookies with Secure only when the site is served over HTTPS (see COOKIE_SECURE). */
function cookieSecure() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

/** @param {boolean} remember Long-lived session vs shorter (ordinateur partagé). */
function cookieOpts(remember) {
  const maxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    maxAge,
    path: "/",
  };
}

function parseBody(body) {
  const title = String(body.title ?? "").trim();
  const desc = String(body.desc ?? body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const image = String(body.image ?? "").trim();
  const published = Boolean(body.published);
  const sort_order = Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0;
  return { title, desc, category, image, published, sort_order };
}

/** --- Public --- */
app.get("/api/realisations", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM realisations WHERE published = 1 ORDER BY sort_order ASC, id ASC`
    )
    .all();
  res.json(rows.map(rowToApi));
});

app.get("/api/service-publications", (req, res) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM service_publications ORDER BY sort_order ASC, slug ASC`).all();
  /** Toujours renvoyer `content_overrides` pour que le front fusionne comme en admin (listes masquent les brouillons). */
  res.json(rows.map((row) => servicePublicationRowToApi(row)));
});

app.get("/api/site-contact", (req, res) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  const db = getDb();
  res.json(getSiteContactMerged(db));
});

/** Publications « Opportunités » (pages publiques) — uniquement les billets publiés. */
/** Recherche globale (réalisations, opportunités publiées, expertises publiées). */
app.get("/api/search", (req, res) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  const db = getDb();
  runScheduledOpportunityPublishing();
  const q = String(req.query.q ?? req.query.query ?? "");
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  try {
    const payload = searchPublicSite(db, q, limit);
    res.json(payload);
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "QUERY_TOO_LONG") {
      return res.status(400).json({
        error: `La requête dépasse ${SEARCH_MAX_QUERY_LEN} caractères`,
      });
    }
    console.error("[api/search]", e);
    return res.status(500).json({ error: "Erreur de recherche" });
  }
});

app.get("/api/opportunity-posts", (req, res) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  const db = getDb();
  runScheduledOpportunityPublishing();
  const category = String(req.query.category ?? "").trim();
  if (!category || !isValidOpportunityCategory(category)) {
    return res.status(400).json({ error: "Paramètre category requis ou invalide" });
  }
  const rows = db
    .prepare(
      `SELECT * FROM opportunity_posts
       WHERE category = ? AND status = 'published'
       ORDER BY sort_order ASC, COALESCE(published_at, created_at) DESC, id DESC`
    )
    .all(category);
  res.json(rows.map(opportunityPostRowToApi));
});

function normalizeOpportunitySubscriberEmail(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
}

function isPlausibleEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Inscription veille e-mail — pour l’instant uniquement la rubrique « appels d’offres » (category opportunites). */
app.post("/api/opportunity-feed/subscribe", (req, res) => {
  try {
    const category = String(req.body?.category ?? "opportunites").trim();
    if (category !== "opportunites") {
      return res.status(400).json({
        error: "L’abonnement par e-mail n’est proposé que pour les appels d’offres.",
      });
    }
    const email = normalizeOpportunitySubscriberEmail(req.body?.email);
    if (!email || !isPlausibleEmail(email)) {
      return res.status(400).json({ error: "Adresse e-mail invalide." });
    }
    const nameRaw = String(req.body?.name ?? "").trim().slice(0, 200);
    const name = nameRaw || null;
    const now = new Date().toISOString();
    const db = getDb();
    try {
      const info = db
        .prepare(
          `INSERT INTO opportunity_feed_subscribers (category, email, name, created_at)
           VALUES (?, ?, ?, ?)`
        )
        .run(category, email, name, now);
      return res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
    } catch (e) {
      if (e && typeof e === "object" && "code" in e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(200).json({ ok: true, already: true });
      }
      throw e;
    }
  } catch (e) {
    console.error("[api/opportunity-feed/subscribe]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/api/opportunity-posts/:id", (req, res) => {
  try {
    res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
    const db = getDb();
    runScheduledOpportunityPublishing();
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Identifiant invalide" });
    }
    const row = db
      .prepare(`SELECT * FROM opportunity_posts WHERE id = ? AND status = 'published'`)
      .get(id);
    if (!row) {
      return res.status(404).json({ error: "Publication introuvable" });
    }
    const payload = opportunityPostRowToApi(row);
    if (!payload) {
      return res.status(500).json({ error: "Données invalides" });
    }
    res.json(payload);
  } catch (e) {
    console.error("[api/opportunity-posts/:id]", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/** --- Auth --- */
app.get("/api/auth/me", (req, res) => {
  const token = req.cookies?.[getCookieName()];
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  res.json({ ok: true, email: process.env.ADMIN_EMAIL || null });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password, remember } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail et mot de passe requis" });
  }
  if (!verifyAdminCredentials(email, password)) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }
  const stayLoggedIn = remember !== false;
  const token = signAuthToken({ remember: stayLoggedIn });
  res.cookie(getCookieName(), token, cookieOpts(stayLoggedIn));
  res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(getCookieName(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: cookieSecure(),
  });
  res.json({ ok: true });
});

/** --- Admin: realisations --- */
app.get("/api/admin/realisations", authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM realisations ORDER BY sort_order ASC, id ASC`)
    .all();
  res.json(rows.map(rowToApi));
});

app.post("/api/admin/realisations", authMiddleware, (req, res) => {
  const db = getDb();
  const b = parseBody(req.body);
  if (!b.title || !b.desc || !b.category || !b.image) {
    return res.status(400).json({ error: "Champs requis : title, desc, category, image" });
  }
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO realisations (title, description, category, image, published, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      b.title,
      b.desc,
      b.category,
      b.image,
      b.published ? 1 : 0,
      b.sort_order,
      now,
      now
    );
  const row = db.prepare("SELECT * FROM realisations WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(rowToApi(row));
});

app.patch("/api/admin/realisations/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }
  const db = getDb();
  const existing = db.prepare("SELECT * FROM realisations WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Non trouvé" });
  }
  const body = req.body || {};
  const merged = {
    title: body.title !== undefined ? String(body.title).trim() : existing.title,
    desc:
      body.desc !== undefined
        ? String(body.desc).trim()
        : body.description !== undefined
          ? String(body.description).trim()
          : existing.description,
    category: body.category !== undefined ? String(body.category).trim() : existing.category,
    image: body.image !== undefined ? String(body.image).trim() : existing.image,
    published: body.published !== undefined ? Boolean(body.published) : Boolean(existing.published),
    sort_order:
      body.sort_order !== undefined ? Number(body.sort_order) : existing.sort_order,
  };
  if (!merged.title || !merged.desc || !merged.category || !merged.image) {
    return res.status(400).json({ error: "Champs invalides" });
  }
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE realisations SET title = ?, description = ?, category = ?, image = ?, published = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    merged.title,
    merged.desc,
    merged.category,
    merged.image,
    merged.published ? 1 : 0,
    Number.isFinite(merged.sort_order) ? merged.sort_order : 0,
    now,
    id
  );
  const row = db.prepare("SELECT * FROM realisations WHERE id = ?").get(id);
  res.json(rowToApi(row));
});

app.delete("/api/admin/realisations/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }
  const db = getDb();
  const info = db.prepare("DELETE FROM realisations WHERE id = ?").run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: "Non trouvé" });
  }
  res.json({ ok: true });
});

app.post(
  "/api/admin/upload-image",
  authMiddleware,
  (req, res, next) => {
    adminImageUpload.single("image")(req, res, (err) => {
      if (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return res.status(400).json({ error: msg });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    res.json({ url: `/uploads/media/${req.file.filename}` });
  }
);

app.post(
  "/api/admin/upload-document",
  authMiddleware,
  (req, res, next) => {
    adminDocumentUpload.single("document")(req, res, (err) => {
      if (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return res.status(400).json({ error: msg });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    res.json({ url: `/uploads/media/${req.file.filename}` });
  }
);

/** --- Admin: expertises (publication) --- */
app.get("/api/admin/service-publications", authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM service_publications ORDER BY sort_order ASC, slug ASC`).all();
  res.json(rows.map(servicePublicationRowToApi));
});

app.patch("/api/admin/service-publications/:slug", authMiddleware, (req, res) => {
  const slug = String(req.params.slug ?? "").trim();
  if (!slug) {
    return res.status(400).json({ error: "Slug invalide" });
  }
  const db = getDb();
  const existing = db.prepare("SELECT * FROM service_publications WHERE slug = ?").get(slug);
  if (!existing) {
    return res.status(404).json({ error: "Expertise inconnue" });
  }
  const body = req.body || {};
  const published =
    body.published !== undefined ? Boolean(body.published) : Boolean(existing.published);
  const sort_order =
    body.sort_order !== undefined
      ? Number(body.sort_order)
      : existing.sort_order;
  let nextContentJson = existing.content_json;
  if (Object.prototype.hasOwnProperty.call(body, "content")) {
    try {
      const sanitized = sanitizeServiceContent(body.content);
      if (sanitized === undefined) {
        /* inchangé */
      } else if (sanitized === null) {
        nextContentJson = null;
      } else {
        nextContentJson = JSON.stringify(sanitized);
      }
    } catch (e) {
      return res.status(400).json({ error: String(e?.message || e) });
    }
  }
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE service_publications SET published = ?, sort_order = ?, content_json = ?, updated_at = ? WHERE slug = ?`
  ).run(
    published ? 1 : 0,
    Number.isFinite(sort_order) ? sort_order : 0,
    nextContentJson,
    now,
    slug
  );
  const row = db.prepare("SELECT * FROM service_publications WHERE slug = ?").get(slug);
  res.json(servicePublicationRowToApi(row));
});

app.get("/api/admin/site-contact", authMiddleware, (req, res) => {
  const db = getDb();
  res.json(getSiteContactMerged(db));
});

app.patch("/api/admin/site-contact", authMiddleware, (req, res) => {
  try {
    const parsed = parseSiteContactBody(req.body);
    const db = getDb();
    saveSiteContactToDb(db, parsed);
    res.json(parsed);
  } catch (e) {
    return res.status(400).json({ error: String(e?.message || e) });
  }
});

/** --- Admin: publications Opportunités --- */
app.get("/api/admin/opportunity-posts", authMiddleware, (req, res) => {
  const db = getDb();
  runScheduledOpportunityPublishing();
  const rows = db
    .prepare(
      `SELECT * FROM opportunity_posts
       ORDER BY datetime(updated_at) DESC, id DESC`
    )
    .all();
  res.json(rows.map(opportunityPostRowToApi));
});

app.get("/api/admin/opportunity-posts/history", authMiddleware, (req, res) => {
  const db = getDb();
  runScheduledOpportunityPublishing();
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
  const rows = db
    .prepare(
      `SELECT h.*, p.title AS post_title, p.category AS post_category
       FROM opportunity_post_history h
       LEFT JOIN opportunity_posts p ON p.id = h.post_id
       ORDER BY h.id DESC
       LIMIT ?`
    )
    .all(limit);
  res.json(
    rows.map((row) => {
      const base = opportunityHistoryRowToApi(row);
      return {
        ...base,
        post_title: row.post_title ?? null,
        post_category: row.post_category ?? null,
      };
    })
  );
});

app.post("/api/admin/opportunity-posts", authMiddleware, (req, res) => {
  const db = getDb();
  runScheduledOpportunityPublishing();
  const merged = parseOpportunityPostBody(req.body, null);
  if (!merged.title) {
    return res.status(400).json({ error: "Titre requis" });
  }
  if (!isValidOpportunityCategory(merged.category)) {
    return res.status(400).json({ error: "Catégorie invalide" });
  }

  let status = merged.status;
  if (req.body?.publish_mode === "immediate") status = "published";
  else if (req.body?.publish_mode === "draft") status = "draft";
  else if (req.body?.publish_mode === "scheduled") status = "scheduled";

  const now = new Date().toISOString();
  let scheduled_for = merged.scheduled_for;
  let published_at = null;

  if (status === "scheduled") {
    if (!scheduled_for) {
      return res.status(400).json({ error: "Indiquez la date et l'heure de publication planifiée" });
    }
    if (new Date(scheduled_for).getTime() <= Date.now()) {
      return res.status(400).json({ error: "La planification doit être dans le futur" });
    }
  } else if (status === "published") {
    scheduled_for = null;
    published_at = now;
  } else {
    status = "draft";
    scheduled_for = null;
  }

  const info = db
    .prepare(
      `INSERT INTO opportunity_posts
       (category, title, summary, body, link_url, image_url, attachments_json, consultation_deadline, organisme, lieu, status, scheduled_for, published_at, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      merged.category,
      merged.title,
      merged.summary,
      merged.body,
      merged.link_url,
      merged.image_url,
      merged.attachments_json,
      merged.consultation_deadline ?? null,
      merged.organisme ?? null,
      merged.lieu ?? null,
      status,
      scheduled_for,
      published_at,
      Number.isFinite(merged.sort_order) ? merged.sort_order : 0,
      now,
      now
    );
  const id = info.lastInsertRowid;
  logOpportunityHistory(db, id, "created", {
    title: merged.title,
    category: merged.category,
    status,
    scheduled_for,
  });
  const row = db.prepare("SELECT * FROM opportunity_posts WHERE id = ?").get(id);
  res.status(201).json(opportunityPostRowToApi(row));
});

app.patch("/api/admin/opportunity-posts/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }
  const db = getDb();
  runScheduledOpportunityPublishing();
  const existing = db.prepare("SELECT * FROM opportunity_posts WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Publication introuvable" });
  }

  const merged = parseOpportunityPostBody(req.body, {
    title: existing.title,
    summary: existing.summary,
    body: existing.body,
    link_url: existing.link_url,
    image_url: existing.image_url ?? null,
    attachments_json: existing.attachments_json ?? null,
    category: existing.category,
    sort_order: existing.sort_order,
    status: existing.status,
    scheduled_for: existing.scheduled_for,
    consultation_deadline: existing.consultation_deadline ?? null,
    organisme: existing.organisme ?? null,
    lieu: existing.lieu ?? null,
  });

  if (!merged.title) {
    return res.status(400).json({ error: "Titre requis" });
  }
  if (!isValidOpportunityCategory(merged.category)) {
    return res.status(400).json({ error: "Catégorie invalide" });
  }

  let status = merged.status;
  if (req.body?.publish_mode === "immediate") status = "published";
  else if (req.body?.publish_mode === "draft") status = "draft";
  else if (req.body?.publish_mode === "scheduled") status = "scheduled";

  const now = new Date().toISOString();
  let scheduled_for = merged.scheduled_for;
  let published_at = existing.published_at;

  if (status === "scheduled") {
    if (!scheduled_for) {
      return res.status(400).json({ error: "Indiquez la date et l'heure de publication planifiée" });
    }
    if (new Date(scheduled_for).getTime() <= Date.now()) {
      return res.status(400).json({ error: "La planification doit être dans le futur" });
    }
    published_at = null;
  } else if (status === "published") {
    scheduled_for = null;
    if (!published_at) published_at = now;
  } else {
    status = "draft";
    scheduled_for = null;
  }

  db.prepare(
    `UPDATE opportunity_posts SET
      category = ?, title = ?, summary = ?, body = ?, link_url = ?, image_url = ?, attachments_json = ?,
      consultation_deadline = ?, organisme = ?, lieu = ?, status = ?, scheduled_for = ?, published_at = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    merged.category,
    merged.title,
    merged.summary,
    merged.body,
    merged.link_url,
    merged.image_url,
    merged.attachments_json,
    merged.consultation_deadline ?? null,
    merged.organisme ?? null,
    merged.lieu ?? null,
    status,
    scheduled_for,
    published_at,
    Number.isFinite(merged.sort_order) ? merged.sort_order : 0,
    now,
    id
  );

  logOpportunityHistory(db, id, "updated", {
    title: merged.title,
    category: merged.category,
    status,
    scheduled_for,
  });

  const row = db.prepare("SELECT * FROM opportunity_posts WHERE id = ?").get(id);
  res.json(opportunityPostRowToApi(row));
});

app.delete("/api/admin/opportunity-posts/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "ID invalide" });
  }
  const db = getDb();
  const existing = db.prepare("SELECT * FROM opportunity_posts WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Publication introuvable" });
  }
  const now = new Date().toISOString();
  logOpportunityHistory(db, null, "deleted", {
    former_post_id: id,
    title: existing.title,
    category: existing.category,
    at: now,
  });
  db.prepare("DELETE FROM opportunity_posts WHERE id = ?").run(id);
  res.json({ ok: true });
});

/** Abonnés e-mail à la liste des appels d’offres (category opportunites). */
app.get("/api/admin/opportunity-feed-subscribers", authMiddleware, (req, res) => {
  try {
    const category = String(req.query.category ?? "opportunites").trim();
    if (!isValidOpportunityCategory(category)) {
      return res.status(400).json({ error: "Catégorie invalide" });
    }
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, category, email, name, created_at
         FROM opportunity_feed_subscribers
         WHERE category = ?
         ORDER BY datetime(created_at) DESC, id DESC`
      )
      .all(category);
    res.json(
      rows.map((row) => ({
        id: row.id,
        category: row.category,
        email: row.email,
        name: row.name || null,
        created_at: row.created_at,
      }))
    );
  } catch (e) {
    console.error("[api/admin/opportunity-feed-subscribers]", e);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/api/admin/opportunity-feed-subscribers/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Identifiant invalide" });
  }
  const db = getDb();
  const info = db.prepare("DELETE FROM opportunity_feed_subscribers WHERE id = ?").run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: "Abonné introuvable" });
  }
  res.json({ ok: true });
});

/** --- Production: static --- */
const buildDir = path.join(__dirname, "..", "build");
if (fs.existsSync(buildDir)) {
  app.use(express.static(buildDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(buildDir, "index.html"));
  });
}

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[serveur] Le port ${PORT} est déjà utilisé. Fermez l’autre terminal (node) ou changez PORT dans .env, puis relancez.`
    );
    process.exit(1);
    return;
  }
  throw err;
});
