import pg from "pg";

/**
 * Couche d'accès Postgres (Neon) qui reprend l'API de better-sqlite3 en version asynchrone :
 * db.prepare(sql).get/all/run(...params), db.exec(sql), db.transaction(fn).
 * Les requêtes gardent les marqueurs « ? » ; ils sont convertis en $1, $2…
 */

/** Tables dont la clé primaire « id » est générée : run() renvoie alors lastInsertRowid. */
const TABLES_WITH_ID = [
  "realisations",
  "opportunity_posts",
  "opportunity_post_history",
  "opportunity_feed_subscribers",
  "clients",
  "dossiers",
  "dossier_etapes",
  "dossier_documents",
  "client_notifications",
  "client_messages",
];

function toPg(sql) {
  let out = sql.trim().replace(/;+\s*$/, "");
  if (/^INSERT\s+OR\s+IGNORE\s+INTO/i.test(out)) {
    out = out.replace(/^INSERT\s+OR\s+IGNORE\s+INTO/i, "INSERT INTO") + " ON CONFLICT DO NOTHING";
  }
  out = out.replace(/\bdatetime\(/gi, "(");
  const table = out.match(/^INSERT\s+INTO\s+(\w+)/i)?.[1]?.toLowerCase();
  if (table && TABLES_WITH_ID.includes(table) && !/\bRETURNING\b/i.test(out)) {
    out += " RETURNING id";
  }
  let i = 0;
  return out.replace(/\?/g, () => `$${++i}`);
}

function wrap(runner) {
  return {
    async query(sql, params = []) {
      return runner.query(toPg(sql), params);
    },
    prepare(sql) {
      return {
        async get(...params) {
          const r = await runner.query(toPg(sql), params);
          return r.rows[0];
        },
        async all(...params) {
          const r = await runner.query(toPg(sql), params);
          return r.rows;
        },
        async run(...params) {
          const r = await runner.query(toPg(sql), params);
          return { changes: r.rowCount ?? 0, lastInsertRowid: r.rows?.[0]?.id };
        },
      };
    },
    async exec(sql) {
      await runner.query(sql);
    },
  };
}

/**
 * @param {import("pg").Pool} [existingPool] pool déjà créé (tests) ; sinon DATABASE_URL (Neon).
 */
export function createDb(existingPool) {
  let pool = existingPool;
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL manquant : renseignez l'URL de connexion Neon dans .env");
    }
    pool = new pg.Pool({ connectionString: url, max: 5 });
  }
  const db = wrap(pool);
  db.pool = pool;
  db.transaction = async (fn) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(wrap(client));
      await client.query("COMMIT");
      return result;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  };
  return db;
}
