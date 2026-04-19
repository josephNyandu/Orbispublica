import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const uploadsDir = path.join(root, "uploads", "media");

const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const bucketName = "admin-media";

if (!url || !serviceKey) {
  console.error("Erreur: Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    case '.doc': return 'application/msword';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default: return 'application/octet-stream';
  }
}

async function main() {
  if (!fs.existsSync(uploadsDir)) {
    console.error("Dossier introuvable :", uploadsDir);
    return;
  }

  // 1. Assurons-nous que le bucket existe
  const { data: buckets, error: listBucketsError } = await sb.storage.listBuckets();
  if (listBucketsError) {
    console.error("Erreur lecture buckets:", listBucketsError);
    process.exit(1);
  }
  
  const bucketExists = buckets.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.log(`Création du bucket public "${bucketName}"...`);
    const { error: createError } = await sb.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 15 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/svg+xml"]
    });
    if (createError) {
      console.error("Erreur création bucket:", createError.message);
      process.exit(1);
    }
  }

  // 2. Lire et uploader les fichiers
  const files = fs.readdirSync(uploadsDir);
  console.log(`Trouvé ${files.length} fichier(s) dans ${uploadsDir}`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    if (!fs.statSync(filePath).isFile()) continue;

    const fileData = fs.readFileSync(filePath);
    const contentType = getContentType(file);

    console.log(`Upload de "${file}"...`);
    const { data, error } = await sb.storage.from(bucketName).upload(file, fileData, {
      contentType,
      upsert: true
    });

    if (error) {
      console.error(`  -> Erreur: ${error.message}`);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log("\nMigration terminée !");
  console.log(`✅ ${successCount} uploade(s) avec succès`);
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} erreur(s)`);
  }
}

main().catch(console.error);
