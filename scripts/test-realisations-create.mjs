/**
 * Test d'intégration : même flux que le formulaire admin (login + POST /api/admin/realisations).
 * Usage : démarrer l'API (ex. npm run dev:api), puis : node scripts/test-realisations-create.mjs
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PORT = Number(process.env.PORT) || 3001;
const BASE = `http://127.0.0.1:${PORT}`;

function cookieHeaderFromResponse(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  if (!raw.length && res.headers.get("set-cookie")) {
    return res.headers.get("set-cookie").split(/,(?=[^;]+?=)/).map((c) => c.trim().split(";")[0]).join("; ");
  }
  return raw.map((c) => c.split(";")[0]).join("; ");
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Échec : ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env");
    process.exit(1);
  }

  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    const t = await loginRes.text();
    console.error(`Login HTTP ${loginRes.status}:`, t);
    process.exit(1);
  }

  const cookie = cookieHeaderFromResponse(loginRes);
  if (!cookie) {
    console.error("Échec : aucun cookie défini après login");
    process.exit(1);
  }

  const payload = {
    title: `[Test auto] ${new Date().toISOString()}`,
    desc: "Création via script de test.",
    category: "Test",
    image: "https://example.com/image.jpg",
    published: false,
    sort_order: 9999,
  };

  const createRes = await fetch(`${BASE}/api/admin/realisations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await createRes.text();
  let data;
  try {
    data = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    console.error("Réponse non-JSON:", bodyText.slice(0, 500));
    process.exit(1);
  }

  if (!createRes.ok) {
    console.error(`POST réalisations HTTP ${createRes.status}:`, data);
    process.exit(1);
  }

  if (!data.id || data.title !== payload.title) {
    console.error("Réponse inattendue:", data);
    process.exit(1);
  }

  const delRes = await fetch(`${BASE}/api/admin/realisations/${data.id}`, {
    method: "DELETE",
    headers: { Cookie: cookie },
  });
  if (!delRes.ok) {
    console.warn("Création OK mais suppression de nettoyage échouée (id=", data.id, ")");
  }

  console.log("OK — création d’une réalisation (même API que le formulaire) : succès.");
  console.log("   Id créé puis supprimé :", data.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
