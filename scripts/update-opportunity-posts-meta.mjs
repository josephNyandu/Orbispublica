#!/usr/bin/env node
/**
 * Appels d’offres / opportunités — compléter Organisme, Lieu et Date limite (SQLite, table opportunity_posts).
 *
 * Usage typique :
 *   1) Lister ce qui manque : npm run opportunity:meta:dry-run
 *   2) Exporter un JSON à compléter : npm run opportunity:meta:export
 *   3) Éditer le fichier puis appliquer : npm run opportunity:meta:apply
 *
 * Ou en direct :
 *   node scripts/update-opportunity-posts-meta.mjs --dry-run [--include-drafts]
 *   node scripts/update-opportunity-posts-meta.mjs --export-template ./meta-a-remplir.json [--include-drafts]
 *   node scripts/update-opportunity-posts-meta.mjs --file scripts/opportunity-posts-meta.json
 *   node scripts/update-opportunity-posts-meta.mjs --file data.json --force
 *
 * Fichier JSON : tableau { "id": number, "organisme"?, "lieu"?, "consultation_deadline"? }.
 * Date limite = consultation_deadline au format YYYY-MM-DD.
 * Par défaut, seules les valeurs manquantes en base sont remplies (sauf --force).
 * SQLITE_PATH : comme le serveur (défaut data/orbis.db).
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { initDb, getDb } from "../server/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseArgs(argv) {
  const out = {
    dryRun: false,
    file: null,
    force: false,
    fillMissingOnly: true,
    category: "opportunites",
    includeDrafts: false,
    exportTemplate: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--force") {
      out.force = true;
      out.fillMissingOnly = false;
    } else if (a === "--fill-missing-only") out.fillMissingOnly = true;
    else if (a === "--include-drafts") out.includeDrafts = true;
    else if (a === "--file" && argv[i + 1]) {
      out.file = argv[++i];
    } else if (a === "--export-template" && argv[i + 1]) {
      out.exportTemplate = argv[++i];
    } else if (a === "--category" && argv[i + 1]) {
      out.category = argv[++i];
    } else if (a === "--help" || a === "-h") {
      out.help = true;
    }
  }
  return out;
}

function isBlank(v) {
  return v == null || String(v).trim() === "";
}

function normStr(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function validateDeadline(s) {
  const t = String(s).trim();
  if (!DATE_RE.test(t)) return { ok: false, error: `date limite invalide (attendu YYYY-MM-DD) : ${JSON.stringify(s)}` };
  const d = new Date(`${t}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { ok: false, error: `date limite incohérente : ${t}` };
  return { ok: true, value: t };
}

function loadJsonRecords(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Fichier introuvable : ${abs}`);
  }
  const raw = fs.readFileSync(abs, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("Le JSON doit être un tableau d'objets { id, organisme?, lieu?, consultation_deadline? }");
  }
  return data;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`Usage:
  node scripts/update-opportunity-posts-meta.mjs --dry-run [--include-drafts] [--category opportunites]
  node scripts/update-opportunity-posts-meta.mjs --export-template <sortie.json> [--include-drafts]
  node scripts/update-opportunity-posts-meta.mjs --file <chemin.json> [--force]

Options:
  --dry-run              Liste les annonces avec au moins un champ manquant (défaut : publiées seulement).
  --export-template      Écrit un JSON à compléter (préremplit les champs déjà connus).
  --include-drafts       Inclut brouillons et planifiés dans --dry-run / --export-template.
  --file <json>          Applique les mises à jour depuis le tableau JSON.
  --force                Écrase les valeurs déjà renseignées (sinon : remplit seulement les vides).
  --category <id>        Filtre catégorie (défaut : opportunites). "" = toutes les catégories.
`);
    process.exit(0);
  }

  initDb();
  const db = getDb();
  const now = new Date().toISOString();

  const categoryFilter =
    args.category === "" || args.category == null
      ? null
      : String(args.category);

  const statusClause = args.includeDrafts ? "" : `AND status = 'published'`;

  function missingMetaWhere() {
    const miss = `(
            TRIM(COALESCE(organisme,'')) = '' OR TRIM(COALESCE(lieu,'')) = '' OR consultation_deadline IS NULL OR TRIM(COALESCE(consultation_deadline,'')) = ''
          )`;
    if (categoryFilter == null) {
      return `WHERE 1=1 ${statusClause} AND ${miss}`;
    }
    return `WHERE category = ? ${statusClause} AND ${miss}`;
  }

  if (args.exportTemplate) {
    const where = missingMetaWhere();
    const sql = `SELECT id, category, title, status, organisme, lieu, consultation_deadline FROM opportunity_posts ${where} ORDER BY id`;
    const rows =
      categoryFilter == null ? db.prepare(sql).all() : db.prepare(sql).all(categoryFilter);
    const template = rows.map((r) => ({
      id: r.id,
      _titre: String(r.title || "").slice(0, 200),
      organisme: isBlank(r.organisme) ? "" : String(r.organisme).trim(),
      lieu: isBlank(r.lieu) ? "" : String(r.lieu).trim(),
      consultation_deadline: isBlank(r.consultation_deadline) ? "" : String(r.consultation_deadline).trim(),
    }));
    const abs = path.isAbsolute(args.exportTemplate)
      ? args.exportTemplate
      : path.join(process.cwd(), args.exportTemplate);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, `${JSON.stringify(template, null, 2)}\n`, "utf8");
    console.log(
      `Modèle exporté (${template.length} ligne(s)) : ${abs}\nComplétez les chaînes vides, supprimez la clé _titre si vous voulez, puis : node scripts/update-opportunity-posts-meta.mjs --file ${JSON.stringify(abs)}`
    );
    process.exit(0);
  }

  if (args.dryRun || !args.file) {
    const where = missingMetaWhere();
    const sql = `SELECT id, category, title, organisme, lieu, consultation_deadline FROM opportunity_posts ${where} ORDER BY id`;
    const rows =
      categoryFilter == null ? db.prepare(sql).all() : db.prepare(sql).all(categoryFilter);

    console.log(
      `Annonces avec au moins un champ manquant (organisme / lieu / date limite)${categoryFilter != null ? `, catégorie « ${categoryFilter} »` : ""}${args.includeDrafts ? ", tous statuts" : ", statut publié seulement"} : ${rows.length}\n`
    );
    for (const r of rows) {
      const miss = [];
      if (isBlank(r.organisme)) miss.push("organisme");
      if (isBlank(r.lieu)) miss.push("lieu");
      if (isBlank(r.consultation_deadline)) miss.push("consultation_deadline");
      const t = String(r.title ?? "");
      console.log(`  id=${r.id}  [${r.category}]  manque: ${miss.join(", ")}`);
      console.log(`      titre: ${t.slice(0, 100)}${t.length > 100 ? "…" : ""}`);
    }
    if (!args.file && !args.dryRun) {
      console.log("\nIndiquez --file <fichier.json> pour appliquer des corrections, ou --dry-run explicitement.");
    }
    process.exit(0);
  }

  const records = loadJsonRecords(args.file);
  const select = db.prepare(
    "SELECT id, category, organisme, lieu, consultation_deadline FROM opportunity_posts WHERE id = ?"
  );
  const update = db.prepare(
    `UPDATE opportunity_posts SET organisme = ?, lieu = ?, consultation_deadline = ?, updated_at = ? WHERE id = ?`
  );

  let applied = 0;
  let skipped = 0;

  const tx = db.transaction((items) => {
    for (const item of items) {
      const id = Number(item?.id);
      if (!Number.isInteger(id) || id < 1) {
        console.warn("Entrée ignorée (id invalide) :", item);
        skipped++;
        continue;
      }

      const row = select.get(id);
      if (!row) {
        console.warn(`id=${id} : aucune ligne en base, ignoré.`);
        skipped++;
        continue;
      }

      if (categoryFilter != null && row.category !== categoryFilter) {
        console.warn(`id=${id} : catégorie « ${row.category} » ≠ « ${categoryFilter} », ignoré.`);
        skipped++;
        continue;
      }

      let nextOrg = row.organisme;
      let nextLieu = row.lieu;
      let nextDeadline = row.consultation_deadline;

      if (item.organisme !== undefined) {
        const inc = normStr(item.organisme);
        if (inc != null) {
          if (args.fillMissingOnly && !isBlank(row.organisme)) {
            /* garde */
          } else {
            nextOrg = inc;
          }
        }
      }

      if (item.lieu !== undefined) {
        const inc = normStr(item.lieu);
        if (inc != null) {
          if (args.fillMissingOnly && !isBlank(row.lieu)) {
            /* garde */
          } else {
            nextLieu = inc;
          }
        }
      }

      if (item.consultation_deadline !== undefined) {
        const raw = item.consultation_deadline;
        if (raw == null || String(raw).trim() === "") {
          if (!args.fillMissingOnly) {
            nextDeadline = null;
          }
        } else {
          const v = validateDeadline(raw);
          if (!v.ok) {
            throw new Error(`id=${id} : ${v.error}`);
          }
          if (args.fillMissingOnly && !isBlank(row.consultation_deadline)) {
            /* garde */
          } else {
            nextDeadline = v.value;
          }
        }
      }

      const unchanged =
        (row.organisme ?? null) === (nextOrg ?? null) &&
        (row.lieu ?? null) === (nextLieu ?? null) &&
        (row.consultation_deadline ?? null) === (nextDeadline ?? null);

      if (unchanged) {
        skipped++;
        continue;
      }

      update.run(nextOrg ?? null, nextLieu ?? null, nextDeadline ?? null, now, id);
      applied++;
      console.log(`id=${id} : mis à jour (organisme, lieu, date limite selon fichier).`);
    }
  });

  tx(records);
  console.log(`\nTerminé : ${applied} ligne(s) modifiée(s), ${skipped} ignorée(s) ou sans changement.`);
}

try {
  main();
} catch (e) {
  console.error(e?.message || e);
  process.exit(1);
}
