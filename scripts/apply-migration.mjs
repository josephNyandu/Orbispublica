#!/usr/bin/env node
/**
 * Applique la migration SQL sur Supabase en utilisant le endpoint SQL connect.
 * Si l'API n'est pas disponible, affiche les instructions pour le SQL Editor.
 * 
 * Usage: node scripts/apply-migration.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env");
  process.exit(1);
}

const migrationFile = path.join(root, "supabase", "migrations", "20260417130000_orbis_publica.sql");
if (!fs.existsSync(migrationFile)) {
  console.error("❌ Fichier migration introuvable :", migrationFile);
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, "utf-8");
const projectRef = url.replace("https://", "").replace(".supabase.co", "");
const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function tryExecuteSQL(sqlText) {
  // Méthode 1: Supabase SQL API (query endpoint)
  const endpoints = [
    `https://${projectRef}.supabase.co/pg/query`,
    `https://${projectRef}.supabase.co/rest/v1/rpc/`,
  ];

  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
          "apikey": serviceKey,
        },
        body: JSON.stringify({ query: sqlText }),
      });
      if (resp.ok) {
        return { ok: true, method: endpoint };
      }
    } catch {
      // Try next
    }
  }
  return { ok: false };
}

async function createStorageBucket() {
  console.log("\n📦 Création du bucket Storage « admin-media »…");
  try {
    const { error } = await sb.storage.createBucket("admin-media", {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });
    if (error) {
      if (error.message?.includes("already exists")) {
        console.log("   ✅ Bucket admin-media existe déjà.");
      } else {
        console.log("   ⚠️  Bucket:", error.message);
      }
    } else {
      console.log("   ✅ Bucket admin-media créé avec succès.");
    }
  } catch (e) {
    console.log("   ⚠️  Bucket:", e.message);
  }
}

async function main() {
  console.log("🔗 Projet Supabase :", projectRef);
  console.log("📄 Migration :", migrationFile);
  console.log("");

  // Tentative d'exécution automatique
  console.log("🚀 Tentative d'exécution automatique du SQL…");
  const result = await tryExecuteSQL(sql);

  if (result.ok) {
    console.log("✅ Migration SQL appliquée avec succès !");
  } else {
    console.log("⚠️  L'exécution automatique n'est pas disponible.");
    console.log("");
    console.log("=".repeat(60));
    console.log("📋 ACTION REQUISE : Exécutez le SQL manuellement");
    console.log("=".repeat(60));
    console.log("");
    console.log("1. Ouvrez le SQL Editor Supabase :");
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    console.log("");
    console.log("2. Copiez TOUT le contenu du fichier :");
    console.log(`   ${migrationFile}`);
    console.log("");
    console.log("3. Collez dans l'éditeur SQL et cliquez « Run »");
    console.log("");
    console.log("=".repeat(60));
  }

  // Créer le bucket storage dans tous les cas
  await createStorageBucket();

  console.log("\n✅ Script terminé.");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
