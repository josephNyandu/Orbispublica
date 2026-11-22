/**
 * Import de l'ancienne base SQLite (data/orbis.db) vers Neon (Postgres).
 *
 *   npm run import:sqlite-to-neon -- --dry-run   (compte seulement)
 *   npm run import:sqlite-to-neon                (copie les lignes ; existantes ignorées)
 *
 * Option --replace : vide d'abord les tables Neon (utile juste après la première mise en route,
 * quand elles ne contiennent que les données d'exemple).
 * Lecture SQLite via le module intégré node:sqlite (Node 22.5+).
 * Variables : DATABASE_URL (Neon), SQLITE_PATH (défaut ./data/orbis.db).
 */
import "dotenv/config";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { initDb, getDb } from "../server/db.js";

const dryRun = process.argv.includes("--dry-run");
const replace = process.argv.includes("--replace");
const sqlitePath = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "orbis.db");

/** Tables avec identifiant auto-incrémenté : la séquence est recalée après import. */
const TABLES = [
  { name: "realisations", key: "id", serial: true },
  { name: "service_publications", key: "slug" },
  { name: "site_settings", key: "key" },
  { name: "opportunity_posts", key: "id", serial: true },
  { name: "opportunity_post_history", key: "id", serial: true },
  { name: "opportunity_feed_subscribers", key: "id", serial: true },
];

const src = new DatabaseSync(sqlitePath, { readOnly: true });
await initDb();
const db = getDb();

if (replace && !dryRun) {
  await db.exec(
    `TRUNCATE ${TABLES.map((t) => t.name).join(", ")} RESTART IDENTITY`
  );
  console.log("Tables Neon vidées avant import.");
}

for (const t of TABLES) {
  const rows = src.prepare(`SELECT * FROM ${t.name}`).all().map((r) => ({ ...r }));
  console.log(`${t.name} : ${rows.length} ligne(s) dans SQLite`);
  if (dryRun || rows.length === 0) continue;
  const cols = Object.keys(rows[0]);
  const sql = `INSERT INTO ${t.name} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) ON CONFLICT (${t.key}) DO NOTHING`;
  let inserted = 0;
  for (const row of rows) {
    const r = await db.prepare(sql).run(...cols.map((c) => row[c]));
    inserted += r.changes;
  }
  console.log(`  -> ${inserted} insérée(s)`);
  if (t.serial) {
    await db.exec(
      `SELECT setval(pg_get_serial_sequence('${t.name}', 'id'), COALESCE((SELECT MAX(id) FROM ${t.name}), 1))`
    );
  }
}

console.log(dryRun ? "Simulation terminée (rien n'a été écrit)." : "Import terminé.");
await db.pool.end();
