import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { getJwtSecret } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Documents des dossiers : jamais servis en statique, uniquement via les routes authentifiées. */
export const privateDocsRoot = path.join(__dirname, "..", "private-uploads", "dossiers");

const CLIENT_COOKIE = "client_token";
const DOC_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"];
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

export const clientDdl = [
  `CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dossiers (
    id SERIAL PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    service TEXT,
    status TEXT NOT NULL DEFAULT 'en_cours',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dossier_etapes (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'a_venir'
  )`,
  `CREATE TABLE IF NOT EXISTS dossier_documents (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    uploaded_by TEXT NOT NULL,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS client_notifications (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    dossier_id INTEGER,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS client_messages (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    body TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_dossiers_client ON dossiers (client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_etapes_dossier ON dossier_etapes (dossier_id, position)`,
  `CREATE INDEX IF NOT EXISTS idx_docs_dossier ON dossier_documents (dossier_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifs_client ON client_notifications (client_id, read)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_client ON client_messages (client_id, id)`,
];

const DOSSIER_STATUSES = ["en_attente", "en_cours", "termine"];
const ETAPE_STATUSES = ["a_venir", "en_cours", "fait"];

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function now() {
  return new Date().toISOString();
}

function signClientToken(clientId, remember) {
  return jwt.sign({ sub: String(clientId), role: "client" }, getJwtSecret(), {
    expiresIn: remember ? "30d" : "8h",
  });
}

function readClientToken(req) {
  const token = req.cookies?.[CLIENT_COOKIE];
  if (!token) return null;
  try {
    const p = jwt.verify(token, getJwtSecret());
    return p && p.role === "client" ? p : null;
  } catch {
    return null;
  }
}

/** Limite les essais de connexion : 8 échecs / 15 min par e-mail + IP. */
const failures = new Map();
function tooManyFailures(key) {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > 15 * 60 * 1000) {
    failures.delete(key);
    return false;
  }
  return entry.count >= 8;
}
function recordFailure(key) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > 15 * 60 * 1000) {
    failures.set(key, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

const docStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdirSync(privateDocsRoot, { recursive: true });
    cb(null, privateDocsRoot);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "").slice(0, 12).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(10).toString("hex")}${ext}`);
  },
});

const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (DOC_EXTENSIONS.includes(ext)) return cb(null, true);
    cb(new Error("Formats acceptés : PDF, Word, Excel, JPEG, PNG."));
  },
}).single("file");

function handleUpload(req, res, next) {
  docUpload(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE" ? "Fichier trop volumineux (15 Mo maximum)." : err.message;
      return res.status(400).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });
    next();
  });
}

function toApiNotification(r) {
  return {
    id: r.id,
    dossier_id: r.dossier_id,
    message: r.message,
    read: Boolean(r.read),
    created_at: r.created_at,
  };
}

function toApiDocument(r) {
  return {
    id: r.id,
    dossier_id: r.dossier_id,
    uploaded_by: r.uploaded_by,
    name: r.original_name,
    size: Number(r.size),
    created_at: r.created_at,
  };
}

function toApiMessage(r) {
  return { id: r.id, sender: r.sender, body: r.body, read: Boolean(r.read), created_at: r.created_at };
}

function computeProgress(etapes) {
  if (!etapes.length) return 0;
  const done = etapes.filter((e) => e.status === "fait").length;
  return Math.round((done / etapes.length) * 100);
}

async function loadDossiers(db, where, params) {
  const rows = await db
    .prepare(
      `SELECT d.*, c.name AS client_name, c.email AS client_email
       FROM dossiers d JOIN clients c ON c.id = d.client_id
       ${where} ORDER BY d.id DESC`
    )
    .all(...params);
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const marks = ids.map(() => "?").join(",");
  const etapes = await db
    .prepare(
      `SELECT id, dossier_id, label, position, status FROM dossier_etapes
       WHERE dossier_id IN (${marks}) ORDER BY position, id`
    )
    .all(...ids);
  const docs = await db
    .prepare(
      `SELECT * FROM dossier_documents WHERE dossier_id IN (${marks}) ORDER BY id DESC`
    )
    .all(...ids);
  return rows.map((r) => {
    const et = etapes
      .filter((e) => e.dossier_id === r.id)
      .map((e) => ({ id: e.id, label: e.label, position: e.position, status: e.status }));
    return {
      id: r.id,
      reference: r.reference,
      client_id: r.client_id,
      client_name: r.client_name,
      client_email: r.client_email,
      title: r.title,
      service: r.service || null,
      status: r.status,
      progress: computeProgress(et),
      etapes: et,
      documents: docs.filter((d) => d.dossier_id === r.id).map(toApiDocument),
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  });
}

async function nextReference(db) {
  const year = new Date().getFullYear();
  const prefix = `OP-${year}-`;
  const row = await db
    .prepare("SELECT reference FROM dossiers WHERE reference LIKE ? ORDER BY reference DESC LIMIT 1")
    .get(`${prefix}%`);
  const last = row ? Number(row.reference.slice(prefix.length)) : 0;
  return `${prefix}${String(last + 1).padStart(3, "0")}`;
}

function parseEtapes(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const item of raw) {
    const label = String(item?.label ?? "").trim().slice(0, 200);
    if (!label) continue;
    const status = ETAPE_STATUSES.includes(item?.status) ? item.status : "a_venir";
    out.push({ label, status });
  }
  return out;
}

function currentStep(etapes) {
  return etapes.find((e) => e.status === "en_cours")?.label ?? null;
}

async function notify(db, clientId, dossierId, message) {
  await db
    .prepare(
      "INSERT INTO client_notifications (client_id, dossier_id, message, read, created_at) VALUES (?, ?, ?, 0, ?)"
    )
    .run(clientId, dossierId, message, now());
}

async function sendStoredFile(res, db, doc) {
  const file = path.join(privateDocsRoot, path.basename(doc.stored_name));
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: "Fichier introuvable sur le serveur" });
  }
  res.download(file, doc.original_name);
}

/**
 * @param {import("express").Express} app
 * @param {{ getDb: () => any, authMiddleware: Function, cookieOpts: (r: boolean) => object, cookieSecure: () => boolean }} deps
 */
export function registerClientRoutes(app, { getDb, authMiddleware, cookieOpts, cookieSecure }) {
  function clientAuth(req, res, next) {
    const p = readClientToken(req);
    if (!p) return res.status(401).json({ error: "Non authentifié" });
    req.clientId = Number(p.sub);
    next();
  }

  async function activeClient(req, res, next) {
    const c = await getDb()
      .prepare("SELECT id, email, name, phone, active FROM clients WHERE id = ?")
      .get(req.clientId);
    if (!c || !c.active) return res.status(401).json({ error: "Compte désactivé ou introuvable" });
    req.client = c;
    next();
  }

  const clientGuard = [clientAuth, activeClient];

  /** --- Authentification client --- */
  app.post("/api/client/login", async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const remember = req.body?.remember !== false;
    if (!email || !password) return res.status(400).json({ error: "E-mail et mot de passe requis" });
    const key = `${email}|${req.ip}`;
    if (tooManyFailures(key)) {
      return res.status(429).json({ error: "Trop de tentatives. Réessayez dans quelques minutes." });
    }
    const c = await getDb().prepare("SELECT * FROM clients WHERE email = ?").get(email);
    const ok = bcrypt.compareSync(password, c?.password_hash ?? DUMMY_HASH) && c && c.active;
    if (!ok) {
      recordFailure(key);
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    failures.delete(key);
    res.cookie(CLIENT_COOKIE, signClientToken(c.id, remember), cookieOpts(remember));
    res.json({ ok: true });
  });

  app.post("/api/client/logout", async (_req, res) => {
    res.clearCookie(CLIENT_COOKIE, { path: "/", httpOnly: true, sameSite: "lax", secure: cookieSecure() });
    res.json({ ok: true });
  });

  app.get("/api/client/me", ...clientGuard, async (req, res) => {
    const { id, email, name, phone } = req.client;
    res.json({ id, email, name, phone });
  });

  app.post("/api/client/password", ...clientGuard, async (req, res) => {
    const current = String(req.body?.current ?? "");
    const next = String(req.body?.next ?? "");
    if (next.length < 8) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
    }
    const c = await getDb().prepare("SELECT password_hash FROM clients WHERE id = ?").get(req.client.id);
    if (!bcrypt.compareSync(current, c.password_hash)) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect" });
    }
    await getDb()
      .prepare("UPDATE clients SET password_hash = ?, updated_at = ? WHERE id = ?")
      .run(bcrypt.hashSync(next, 10), now(), req.client.id);
    res.json({ ok: true });
  });

  /** --- Dossiers du client --- */
  app.get("/api/client/dossiers", ...clientGuard, async (req, res) => {
    res.json(await loadDossiers(getDb(), "WHERE d.client_id = ?", [req.client.id]));
  });

  app.get("/api/client/dossiers/:id", ...clientGuard, async (req, res) => {
    const list = await loadDossiers(getDb(), "WHERE d.client_id = ? AND d.id = ?", [
      req.client.id,
      Number(req.params.id) || 0,
    ]);
    if (!list[0]) return res.status(404).json({ error: "Dossier introuvable" });
    res.json(list[0]);
  });

  app.post("/api/client/dossiers/:id/documents", ...clientGuard, async (req, res, next) => {
    const db = getDb();
    const d = await db
      .prepare("SELECT id FROM dossiers WHERE id = ? AND client_id = ?")
      .get(Number(req.params.id) || 0, req.client.id);
    if (!d) return res.status(404).json({ error: "Dossier introuvable" });
    next();
  }, handleUpload, async (req, res) => {
    const f = req.file;
    const info = await getDb()
      .prepare(
        "INSERT INTO dossier_documents (dossier_id, uploaded_by, original_name, stored_name, size, created_at) VALUES (?, 'client', ?, ?, ?, ?)"
      )
      .run(Number(req.params.id), Buffer.from(f.originalname, "latin1").toString("utf8"), f.filename, f.size, now());
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  });

  app.get("/api/client/documents/:id/download", ...clientGuard, async (req, res) => {
    const db = getDb();
    const doc = await db
      .prepare(
        `SELECT dd.* FROM dossier_documents dd JOIN dossiers d ON d.id = dd.dossier_id
         WHERE dd.id = ? AND d.client_id = ?`
      )
      .get(Number(req.params.id) || 0, req.client.id);
    if (!doc) return res.status(404).json({ error: "Document introuvable" });
    await sendStoredFile(res, db, doc);
  });

  /** --- Notifications et messages du client --- */
  app.get("/api/client/notifications", ...clientGuard, async (req, res) => {
    const rows = await getDb()
      .prepare("SELECT * FROM client_notifications WHERE client_id = ? ORDER BY id DESC LIMIT 100")
      .all(req.client.id);
    res.json(rows.map(toApiNotification));
  });

  app.post("/api/client/notifications/read", ...clientGuard, async (req, res) => {
    await getDb().prepare("UPDATE client_notifications SET read = 1 WHERE client_id = ?").run(req.client.id);
    res.json({ ok: true });
  });

  app.get("/api/client/messages", ...clientGuard, async (req, res) => {
    const db = getDb();
    const rows = await db
      .prepare("SELECT * FROM client_messages WHERE client_id = ? ORDER BY id ASC")
      .all(req.client.id);
    await db
      .prepare("UPDATE client_messages SET read = 1 WHERE client_id = ? AND sender = 'admin'")
      .run(req.client.id);
    res.json(rows.map(toApiMessage));
  });

  app.post("/api/client/messages", ...clientGuard, async (req, res) => {
    const body = String(req.body?.body ?? "").trim().slice(0, 4000);
    if (!body) return res.status(400).json({ error: "Message vide" });
    await getDb()
      .prepare("INSERT INTO client_messages (client_id, sender, body, read, created_at) VALUES (?, 'client', ?, 0, ?)")
      .run(req.client.id, body, now());
    res.status(201).json({ ok: true });
  });

  /** --- Admin : clients --- */
  app.get("/api/admin/clients", authMiddleware, async (_req, res) => {
    const rows = await getDb()
      .prepare(
        `SELECT c.id, c.email, c.name, c.phone, c.active, c.created_at,
           (SELECT COUNT(*) FROM dossiers d WHERE d.client_id = c.id) AS dossiers_count,
           (SELECT COUNT(*) FROM client_messages m WHERE m.client_id = c.id AND m.sender = 'client' AND m.read = 0) AS unread_messages
         FROM clients c ORDER BY c.id DESC`
      )
      .all();
    res.json(
      rows.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        phone: r.phone || null,
        active: Boolean(r.active),
        created_at: r.created_at,
        dossiers_count: Number(r.dossiers_count),
        unread_messages: Number(r.unread_messages),
      }))
    );
  });

  app.post("/api/admin/clients", authMiddleware, async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const name = String(req.body?.name ?? "").trim().slice(0, 200);
    const phone = String(req.body?.phone ?? "").trim().slice(0, 50) || null;
    if (!name) return res.status(400).json({ error: "Nom requis" });
    if (!isEmail(email)) return res.status(400).json({ error: "Adresse e-mail invalide" });
    const db = getDb();
    if (await db.prepare("SELECT 1 FROM clients WHERE email = ?").get(email)) {
      return res.status(409).json({ error: "Un client utilise déjà cette adresse e-mail" });
    }
    const supplied = String(req.body?.password ?? "");
    if (supplied && supplied.length < 8) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    }
    const password = supplied || crypto.randomBytes(9).toString("base64url");
    const t = now();
    const info = await db
      .prepare(
        "INSERT INTO clients (email, name, phone, password_hash, active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)"
      )
      .run(email, name, phone, bcrypt.hashSync(password, 10), t, t);
    res.status(201).json({ id: info.lastInsertRowid, email, name, password });
  });

  app.patch("/api/admin/clients/:id", authMiddleware, async (req, res) => {
    const id = Number(req.params.id) || 0;
    const db = getDb();
    const c = await db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
    if (!c) return res.status(404).json({ error: "Client introuvable" });
    const name = req.body?.name !== undefined ? String(req.body.name).trim().slice(0, 200) : c.name;
    const phone = req.body?.phone !== undefined ? String(req.body.phone).trim().slice(0, 50) || null : c.phone;
    const active = req.body?.active !== undefined ? (req.body.active ? 1 : 0) : c.active;
    if (!name) return res.status(400).json({ error: "Nom requis" });
    let hash = c.password_hash;
    let newPassword;
    if (req.body?.reset_password) {
      newPassword = crypto.randomBytes(9).toString("base64url");
      hash = bcrypt.hashSync(newPassword, 10);
    }
    await db
      .prepare("UPDATE clients SET name = ?, phone = ?, active = ?, password_hash = ?, updated_at = ? WHERE id = ?")
      .run(name, phone, active, hash, now(), id);
    res.json({ ok: true, ...(newPassword ? { password: newPassword } : {}) });
  });

  app.delete("/api/admin/clients/:id", authMiddleware, async (req, res) => {
    const db = getDb();
    const id = Number(req.params.id) || 0;
    const docs = await db
      .prepare(
        "SELECT dd.stored_name FROM dossier_documents dd JOIN dossiers d ON d.id = dd.dossier_id WHERE d.client_id = ?"
      )
      .all(id);
    const info = await db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    if (!info.changes) return res.status(404).json({ error: "Client introuvable" });
    for (const d of docs) fs.rm(path.join(privateDocsRoot, path.basename(d.stored_name)), () => {});
    res.json({ ok: true });
  });

  /** --- Admin : dossiers --- */
  app.get("/api/admin/dossiers", authMiddleware, async (req, res) => {
    const clientId = Number(req.query.client_id);
    if (Number.isInteger(clientId) && clientId > 0) {
      return res.json(await loadDossiers(getDb(), "WHERE d.client_id = ?", [clientId]));
    }
    res.json(await loadDossiers(getDb(), "", []));
  });

  app.post("/api/admin/dossiers", authMiddleware, async (req, res) => {
    const db = getDb();
    const clientId = Number(req.body?.client_id) || 0;
    const title = String(req.body?.title ?? "").trim().slice(0, 300);
    const service = String(req.body?.service ?? "").trim().slice(0, 200) || null;
    const etapes = parseEtapes(req.body?.etapes) ?? [];
    if (!title) return res.status(400).json({ error: "Intitulé requis" });
    const client = await db.prepare("SELECT id, name FROM clients WHERE id = ?").get(clientId);
    if (!client) return res.status(400).json({ error: "Client introuvable" });
    const t = now();
    let dossierId = null;
    let reference = "";
    for (let attempt = 0; attempt < 5 && !dossierId; attempt++) {
      reference = await nextReference(db);
      try {
        const info = await db
          .prepare(
            "INSERT INTO dossiers (reference, client_id, title, service, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'en_cours', ?, ?)"
          )
          .run(reference, clientId, title, service, t, t);
        dossierId = info.lastInsertRowid;
      } catch (e) {
        if (e?.code !== "23505") throw e;
      }
    }
    if (!dossierId) return res.status(500).json({ error: "Impossible de générer la référence" });
    for (let i = 0; i < etapes.length; i++) {
      await db
        .prepare("INSERT INTO dossier_etapes (dossier_id, label, position, status) VALUES (?, ?, ?, ?)")
        .run(dossierId, etapes[i].label, i, etapes[i].status);
    }
    await notify(db, clientId, dossierId, `Votre dossier ${reference} a été ouvert : ${title}.`);
    res.status(201).json({ id: dossierId, reference });
  });

  app.get("/api/admin/dossiers/:id", authMiddleware, async (req, res) => {
    const list = await loadDossiers(getDb(), "WHERE d.id = ?", [Number(req.params.id) || 0]);
    if (!list[0]) return res.status(404).json({ error: "Dossier introuvable" });
    res.json(list[0]);
  });

  app.patch("/api/admin/dossiers/:id", authMiddleware, async (req, res) => {
    const db = getDb();
    const id = Number(req.params.id) || 0;
    const before = (await loadDossiers(db, "WHERE d.id = ?", [id]))[0];
    if (!before) return res.status(404).json({ error: "Dossier introuvable" });
    const title = req.body?.title !== undefined ? String(req.body.title).trim().slice(0, 300) : before.title;
    const service = req.body?.service !== undefined ? String(req.body.service).trim().slice(0, 200) || null : before.service;
    let status = req.body?.status !== undefined ? String(req.body.status) : before.status;
    if (!title) return res.status(400).json({ error: "Intitulé requis" });
    if (!DOSSIER_STATUSES.includes(status)) return res.status(400).json({ error: "Statut invalide" });

    let etapes = parseEtapes(req.body?.etapes);
    if (etapes) {
      await db.prepare("DELETE FROM dossier_etapes WHERE dossier_id = ?").run(id);
      for (let i = 0; i < etapes.length; i++) {
        await db
          .prepare("INSERT INTO dossier_etapes (dossier_id, label, position, status) VALUES (?, ?, ?, ?)")
          .run(id, etapes[i].label, i, etapes[i].status);
      }
    } else {
      etapes = before.etapes;
    }
    await db
      .prepare("UPDATE dossiers SET title = ?, service = ?, status = ?, updated_at = ? WHERE id = ?")
      .run(title, service, status, now(), id);

    if (status !== before.status && status === "termine") {
      await notify(db, before.client_id, id, `Votre dossier ${before.reference} est terminé.`);
    } else {
      const step = currentStep(etapes);
      if (step && step !== currentStep(before.etapes)) {
        await notify(db, before.client_id, id, `Dossier ${before.reference} : étape « ${step} » en cours.`);
      }
    }
    res.json({ ok: true });
  });

  app.delete("/api/admin/dossiers/:id", authMiddleware, async (req, res) => {
    const db = getDb();
    const id = Number(req.params.id) || 0;
    const docs = await db.prepare("SELECT stored_name FROM dossier_documents WHERE dossier_id = ?").all(id);
    const info = await db.prepare("DELETE FROM dossiers WHERE id = ?").run(id);
    if (!info.changes) return res.status(404).json({ error: "Dossier introuvable" });
    for (const d of docs) fs.rm(path.join(privateDocsRoot, path.basename(d.stored_name)), () => {});
    res.json({ ok: true });
  });

  app.post("/api/admin/dossiers/:id/documents", authMiddleware, async (req, res, next) => {
    const d = await getDb().prepare("SELECT id FROM dossiers WHERE id = ?").get(Number(req.params.id) || 0);
    if (!d) return res.status(404).json({ error: "Dossier introuvable" });
    next();
  }, handleUpload, async (req, res) => {
    const db = getDb();
    const id = Number(req.params.id);
    const f = req.file;
    const name = Buffer.from(f.originalname, "latin1").toString("utf8");
    const info = await db
      .prepare(
        "INSERT INTO dossier_documents (dossier_id, uploaded_by, original_name, stored_name, size, created_at) VALUES (?, 'admin', ?, ?, ?, ?)"
      )
      .run(id, name, f.filename, f.size, now());
    const d = await db.prepare("SELECT client_id, reference FROM dossiers WHERE id = ?").get(id);
    await notify(db, d.client_id, id, `Nouveau document dans le dossier ${d.reference} : ${name}.`);
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  });

  app.get("/api/admin/documents/:id/download", authMiddleware, async (req, res) => {
    const db = getDb();
    const doc = await db.prepare("SELECT * FROM dossier_documents WHERE id = ?").get(Number(req.params.id) || 0);
    if (!doc) return res.status(404).json({ error: "Document introuvable" });
    await sendStoredFile(res, db, doc);
  });

  app.delete("/api/admin/documents/:id", authMiddleware, async (req, res) => {
    const db = getDb();
    const doc = await db.prepare("SELECT * FROM dossier_documents WHERE id = ?").get(Number(req.params.id) || 0);
    if (!doc) return res.status(404).json({ error: "Document introuvable" });
    await db.prepare("DELETE FROM dossier_documents WHERE id = ?").run(doc.id);
    fs.rm(path.join(privateDocsRoot, path.basename(doc.stored_name)), () => {});
    res.json({ ok: true });
  });

  /** --- Admin : messagerie --- */
  app.get("/api/admin/clients/:id/messages", authMiddleware, async (req, res) => {
    const db = getDb();
    const id = Number(req.params.id) || 0;
    const rows = await db.prepare("SELECT * FROM client_messages WHERE client_id = ? ORDER BY id ASC").all(id);
    await db.prepare("UPDATE client_messages SET read = 1 WHERE client_id = ? AND sender = 'client'").run(id);
    res.json(rows.map(toApiMessage));
  });

  app.post("/api/admin/clients/:id/messages", authMiddleware, async (req, res) => {
    const db = getDb();
    const id = Number(req.params.id) || 0;
    const body = String(req.body?.body ?? "").trim().slice(0, 4000);
    if (!body) return res.status(400).json({ error: "Message vide" });
    if (!(await db.prepare("SELECT 1 FROM clients WHERE id = ?").get(id))) {
      return res.status(404).json({ error: "Client introuvable" });
    }
    await db
      .prepare("INSERT INTO client_messages (client_id, sender, body, read, created_at) VALUES (?, 'admin', ?, 0, ?)")
      .run(id, body, now());
    await notify(db, id, null, "Vous avez un nouveau message de votre conseiller.");
    res.status(201).json({ ok: true });
  });
}
