#!/usr/bin/env node
/**
 * Crée l'utilisateur admin dans Supabase Auth et l'ajoute à la table site_admins.
 * 
 * Usage: node scripts/create-admin.mjs
 * 
 * Utilise ADMIN_EMAIL et ADMIN_PASSWORD du .env
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

if (!url || !serviceKey) {
  console.error("❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env");
  process.exit(1);
}

if (!adminEmail || !adminPassword) {
  console.error("❌ ADMIN_EMAIL et ADMIN_PASSWORD requis dans .env");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("🔗 Supabase URL :", url);
  console.log("📧 Admin email  :", adminEmail);
  console.log("");

  // Vérifier si l'utilisateur existe déjà
  console.log("🔍 Recherche de l'utilisateur existant…");
  const { data: existingUsers, error: listError } = await sb.auth.admin.listUsers();
  
  let userId = null;
  
  if (listError) {
    console.log("⚠️  Impossible de lister les utilisateurs:", listError.message);
  } else {
    const existing = existingUsers.users.find(
      (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
    );
    if (existing) {
      userId = existing.id;
      console.log(`✅ Utilisateur existant trouvé: ${userId}`);
    }
  }

  // Créer si absent
  if (!userId) {
    console.log("📝 Création de l'utilisateur admin dans Supabase Auth…");
    const { data: newUser, error: createError } = await sb.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message?.includes("already") || createError.message?.includes("existe")) {
        console.log("⚠️  L'utilisateur existe déjà (email déjà pris).");
        // Try to find by email again
        const { data: retryList } = await sb.auth.admin.listUsers();
        const found = retryList?.users?.find(
          (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
        );
        if (found) {
          userId = found.id;
          console.log(`   ID trouvé: ${userId}`);
        } else {
          console.error("❌ Impossible de trouver l'ID utilisateur.");
          process.exit(1);
        }
      } else {
        console.error("❌ Erreur création utilisateur:", createError.message);
        process.exit(1);
      }
    } else {
      userId = newUser.user.id;
      console.log(`✅ Utilisateur créé: ${userId}`);
    }
  }

  // Insérer dans site_admins
  console.log("\n📝 Insertion dans site_admins…");
  const { error: insertError } = await sb.from("site_admins").upsert(
    { user_id: userId, created_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );

  if (insertError) {
    if (insertError.message?.includes("does not exist") || insertError.code === "42P01") {
      console.log("⚠️  La table site_admins n'existe pas encore.");
      console.log("   → Exécutez d'abord la migration SQL (node scripts/apply-migration.mjs)");
      console.log("   → Puis relancez ce script.");
      console.log("");
      console.log("   Ou exécutez manuellement dans le SQL Editor Supabase :");
      console.log(`   INSERT INTO public.site_admins (user_id) VALUES ('${userId}') ON CONFLICT DO NOTHING;`);
    } else {
      console.error("⚠️  Erreur site_admins:", insertError.message);
      console.log("");
      console.log("   Exécutez manuellement dans le SQL Editor :");
      console.log(`   INSERT INTO public.site_admins (user_id) VALUES ('${userId}') ON CONFLICT DO NOTHING;`);
    }
  } else {
    console.log("✅ Admin ajouté à site_admins.");
  }

  console.log("\n" + "=".repeat(50));
  console.log("📋 Résumé :");
  console.log(`   Email    : ${adminEmail}`);
  console.log(`   User ID  : ${userId}`);
  console.log(`   Password : (celui dans .env ADMIN_PASSWORD)`);
  console.log("=".repeat(50));
  console.log("\n✅ Terminé !");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});
