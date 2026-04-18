#!/usr/bin/env node
/**
 * Copie les données de data/orbis.db (SQLite) vers Supabase (Postgres).
 * Requiert la clé service_role (ne jamais la mettre dans le front ou VITE_*).
 *
 * Prérequis SQL : migrations appliquées, dont identity BY DEFAULT + RLS site_admins.
 * Après import, exécuter le SQL affiché en fin de script pour réaligner les séquences.
 *
 * Usage :
 *   node scripts/sqlite-to-supabase.mjs --dry-run
 *   node scripts/sqlite-to-supabase.mjs
 *   node scripts/sqlite-to-supabase.mjs --replace   # vide les tables de contenu puis réimporte
 *
 * Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ; optionnel SQLITE_PATH
 */
import "dotenv/config";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(root, "data", "orbis.db");
const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const dry = process.argv.includes("--dry-run");
const replace = process.argv.includes("--replace");

const CHUNK = 80;

function asBool(v) {
  return Number(v) === 1 || v === true;
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function main() {
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error("Fichier SQLite introuvable :", SQLITE_PATH);
    process.exit(1);
  }

  const sqlite = new Database(SQLITE_PATH, { readonly: true });

  const counts = {
    realisations: sqlite.prepare("SELECT COUNT(*) AS c FROM realisations").get().c,
    service_publications: sqlite.prepare("SELECT COUNT(*) AS c FROM service_publications").get().c,
    site_settings: sqlite.prepare("SELECT COUNT(*) AS c FROM site_settings").get().c,
    opportunity_posts: sqlite.prepare("SELECT COUNT(*) AS c FROM opportunity_posts").get().c,
    opportunity_post_history: sqlite.prepare("SELECT COUNT(*) AS c FROM opportunity_post_history").get().c,
    opportunity_feed_subscribers: sqlite.prepare("SELECT COUNT(*) AS c FROM opportunity_feed_subscribers").get().c,
  };
  console.log("Lignes à importer :", counts);

  if (dry) {
    console.log("--dry-run : aucune écriture Supabase.");
    sqlite.close();
    return;
  }

  if (!url || !serviceKey) {
    console.error("Pour l’import réel : définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY");
    sqlite.close();
    process.exit(1);
  }

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  if (replace) {
    console.log("Mode --replace : suppression des données existantes (contenu)…");
    const order = [
      ["opportunity_post_history", () => sb.from("opportunity_post_history").delete().not("id", "is", null)],
      ["opportunity_posts", () => sb.from("opportunity_posts").delete().not("id", "is", null)],
      ["opportunity_feed_subscribers", () => sb.from("opportunity_feed_subscribers").delete().not("id", "is", null)],
      ["realisations", () => sb.from("realisations").delete().not("id", "is", null)],
    ];
    for (const [name, fn] of order) {
      const { error } = await fn();
      if (error) {
        console.error("Erreur DELETE", name, error.message);
        process.exit(1);
      }
    }
  }

  const realRows = sqlite.prepare("SELECT * FROM realisations ORDER BY id").all();
  for (const part of chunk(realRows, CHUNK)) {
    const rows = part.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      image: r.image,
      published: asBool(r.published),
      sort_order: r.sort_order,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    const { error } = await sb.from("realisations").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`realisations: ${error.message}`);
  }
  console.log("realisations :", realRows.length);

  const spRows = sqlite.prepare("SELECT * FROM service_publications ORDER BY slug").all();
  for (const part of chunk(spRows, CHUNK)) {
    const rows = part.map((r) => ({
      slug: r.slug,
      published: asBool(r.published),
      sort_order: r.sort_order,
      updated_at: r.updated_at,
      content_json: r.content_json ?? null,
    }));
    const { error } = await sb.from("service_publications").upsert(rows, { onConflict: "slug" });
    if (error) throw new Error(`service_publications: ${error.message}`);
  }
  console.log("service_publications :", spRows.length);

  const ssRows = sqlite.prepare("SELECT * FROM site_settings ORDER BY key").all();
  for (const r of ssRows) {
    const { error } = await sb.from("site_settings").upsert(
      {
        key: r.key,
        value_json: r.value_json,
        updated_at: r.updated_at,
      },
      { onConflict: "key" }
    );
    if (error) throw new Error(`site_settings: ${error.message}`);
  }
  console.log("site_settings :", ssRows.length);

  const oppRows = sqlite.prepare("SELECT * FROM opportunity_posts ORDER BY id").all();
  for (const part of chunk(oppRows, CHUNK)) {
    const rows = part.map((r) => ({
      id: r.id,
      category: r.category === "appels-offres" ? "opportunites" : r.category,
      title: r.title,
      summary: r.summary ?? "",
      body: r.body ?? "",
      link_url: r.link_url ?? null,
      status: r.status,
      scheduled_for: r.scheduled_for ?? null,
      published_at: r.published_at ?? null,
      sort_order: r.sort_order,
      created_at: r.created_at,
      updated_at: r.updated_at,
      image_url: r.image_url ?? null,
      attachments_json: r.attachments_json ?? "[]",
      consultation_deadline: r.consultation_deadline ?? null,
      organisme: r.organisme ?? null,
      lieu: r.lieu ?? null,
    }));
    const { error } = await sb.from("opportunity_posts").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`opportunity_posts: ${error.message}`);
  }
  console.log("opportunity_posts :", oppRows.length);

  const histRows = sqlite.prepare("SELECT * FROM opportunity_post_history ORDER BY id").all();
  for (const part of chunk(histRows, CHUNK)) {
    const rows = part.map((r) => ({
      id: r.id,
      post_id: r.post_id ?? null,
      event_type: r.event_type,
      detail_json: r.detail_json ?? null,
      created_at: r.created_at,
    }));
    const { error } = await sb.from("opportunity_post_history").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`opportunity_post_history: ${error.message}`);
  }
  console.log("opportunity_post_history :", histRows.length);

  const subRows = sqlite.prepare("SELECT * FROM opportunity_feed_subscribers ORDER BY id").all();
  for (const part of chunk(subRows, CHUNK)) {
    const rows = part.map((r) => ({
      id: r.id,
      category: r.category,
      email: r.email,
      name: r.name ?? null,
      created_at: r.created_at,
    }));
    const { error } = await sb.from("opportunity_feed_subscribers").upsert(rows, { onConflict: "id" });
    if (error) throw new Error(`opportunity_feed_subscribers: ${error.message}`);
  }
  console.log("opportunity_feed_subscribers :", subRows.length);

  sqlite.close();

  console.log("\nTerminé. Exécuter dans le SQL Editor Supabase (pour les séquences d’identité) :\n");
  const tables = ["realisations", "opportunity_posts", "opportunity_post_history", "opportunity_feed_subscribers"];
  for (const t of tables) {
    console.log(
      `SELECT setval(pg_get_serial_sequence('public.${t}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM public.${t}), true);`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
