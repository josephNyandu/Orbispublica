import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "..", "data", "orbis.db");

export function getDb() {
  return dbSingleton;
}

let dbSingleton;

export function initDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbSingleton = new Database(dbPath);
  dbSingleton.pragma("journal_mode = WAL");

  dbSingleton.exec(`
    CREATE TABLE IF NOT EXISTS realisations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  dbSingleton.exec(`
    CREATE TABLE IF NOT EXISTS service_publications (
      slug TEXT PRIMARY KEY,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  const spCols = dbSingleton.prepare(`PRAGMA table_info(service_publications)`).all();
  const hasContentJson = spCols.some((c) => c.name === "content_json");
  if (!hasContentJson) {
    dbSingleton.exec(`ALTER TABLE service_publications ADD COLUMN content_json TEXT`);
  }

  dbSingleton.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  dbSingleton.exec(`
    CREATE TABLE IF NOT EXISTS opportunity_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      link_url TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_for TEXT,
      published_at TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  dbSingleton.exec(`
    CREATE TABLE IF NOT EXISTS opportunity_post_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      event_type TEXT NOT NULL,
      detail_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  dbSingleton.exec(
    `CREATE INDEX IF NOT EXISTS idx_opportunity_posts_category_status
     ON opportunity_posts (category, status, sort_order)`
  );
  dbSingleton.exec(
    `CREATE INDEX IF NOT EXISTS idx_opportunity_posts_scheduled
     ON opportunity_posts (status, scheduled_for)`
  );
  dbSingleton.exec(
    `CREATE INDEX IF NOT EXISTS idx_opportunity_history_created ON opportunity_post_history (created_at)`
  );

  dbSingleton.exec(`
    CREATE TABLE IF NOT EXISTS opportunity_feed_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      email TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(email, category)
    );
  `);
  dbSingleton.exec(
    `CREATE INDEX IF NOT EXISTS idx_opportunity_feed_subscribers_cat
     ON opportunity_feed_subscribers (category, datetime(created_at) DESC)`
  );

  /** Ancien identifiant « appels-offres » → segment d’URL /opportunites */
  try {
    dbSingleton
      .prepare(`UPDATE opportunity_posts SET category = 'opportunites' WHERE category = 'appels-offres'`)
      .run();
  } catch {
    /* ignore */
  }

  const oppPostCols = dbSingleton.prepare(`PRAGMA table_info(opportunity_posts)`).all();
  if (!oppPostCols.some((c) => c.name === "image_url")) {
    dbSingleton.exec(`ALTER TABLE opportunity_posts ADD COLUMN image_url TEXT`);
  }
  if (!oppPostCols.some((c) => c.name === "attachments_json")) {
    dbSingleton.exec(`ALTER TABLE opportunity_posts ADD COLUMN attachments_json TEXT`);
  }
  if (!oppPostCols.some((c) => c.name === "consultation_deadline")) {
    dbSingleton.exec(`ALTER TABLE opportunity_posts ADD COLUMN consultation_deadline TEXT`);
  }
  const hadOrganismeCol = oppPostCols.some((c) => c.name === "organisme");
  const hadLieuCol = oppPostCols.some((c) => c.name === "lieu");
  if (!hadOrganismeCol) {
    dbSingleton.exec(`ALTER TABLE opportunity_posts ADD COLUMN organisme TEXT`);
  }
  if (!hadLieuCol) {
    dbSingleton.exec(`ALTER TABLE opportunity_posts ADD COLUMN lieu TEXT`);
  }
  if (!hadOrganismeCol || !hadLieuCol) {
    dbSingleton
      .prepare(
        `UPDATE opportunity_posts
         SET organisme = COALESCE(NULLIF(TRIM(organisme), ''), 'Non précisé'),
             lieu = COALESCE(NULLIF(TRIM(lieu), ''), 'Non précisé')
         WHERE category IN ('opportunites', 'appels-offres')`
      )
      .run();
  }

  /** Ordre aligné sur src/data/services.ts — INSERT OR IGNORE pour les bases existantes */
  const servicePublicationSlugs = [
    "marches-publics",
    "projets",
    "financements-subventions",
    "gouvernance-structuration",
    "optimisation-fiscale",
    "audit-conformite",
    "contentieux-publics",
    "formation-recherche",
  ];
  const nowSp = new Date().toISOString();
  const insertSp = dbSingleton.prepare(
    `INSERT OR IGNORE INTO service_publications (slug, published, sort_order, updated_at) VALUES (?, 1, ?, ?)`
  );
  for (let i = 0; i < servicePublicationSlugs.length; i++) {
    insertSp.run(servicePublicationSlugs[i], i, nowSp);
  }

  const count = dbSingleton.prepare("SELECT COUNT(*) AS c FROM realisations").get().c;
  if (count === 0) {
    const now = new Date().toISOString();
    const seed = [
      {
        title: "Infrastructure Routière (Financement BAD)",
        description:
          "Gestion et suivi d’un projet d’infrastructure routière. Mise en place d’un dispositif rigoureux de contrôle de l’exécution, coordination des acteurs et reporting conforme aux standards internationaux.",
        category: "Infrastructures",
        image:
          "https://images.unsplash.com/photo-1600249194900-ab1df847da11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwZW5naW5lZXJpbmclMjBhZnJpY2F8ZW58MXx8fHwxNzYzOTIwMzcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        sort_order: 0,
      },
      {
        title: "Énergies Renouvelables (Privé)",
        description:
          "Accompagnement juridique et stratégique pour un opérateur privé. Conseil sur la contractualisation, accès aux marchés publics, et optimisation fiscale dans un environnement réglementaire complexe.",
        category: "Énergie",
        image:
          "https://images.unsplash.com/photo-1709136242320-cc582ad704c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhZnJpY2FuJTIwY2l0eSUyMGJ1c2luZXNzJTIwc2t5bGluZXxlbnwxfHx8fDE3NjM5MjAzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        sort_order: 1,
      },
      {
        title: "Appui PME Agricole (Financement FONER)",
        description:
          "Appui à la structuration et au renforcement des capacités d’une PME bénéficiaire. Élaboration de plans d’affaires, suivi financier et formation en gestion administrative.",
        category: "Agriculture",
        image:
          "https://images.unsplash.com/photo-1602516818688-715dfc1b77d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZSUyMGFncmljdWx0dXJlJTIwZmFybSUyMGFmcmljYXxlbnwxfHx8fDE3NjM5MjAzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        sort_order: 2,
      },
      {
        title: "Formation Gouvernance (Public-Privé)",
        description:
          "Organisation de sessions de formation en gouvernance et gestion des marchés publics pour des entités publiques-privées. Transfert de compétences et amélioration des pratiques.",
        category: "Formation",
        image:
          "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjB0ZWFtJTIwY2l0eSUyMGJ1c2luZXNzJTIwc2t5bGluZXxlbnwxfHx8fDE3NjM5MjAzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        sort_order: 3,
      },
    ];

    const insert = dbSingleton.prepare(
      `INSERT INTO realisations (title, description, category, image, published, sort_order, created_at, updated_at)
       VALUES (@title, @description, @category, @image, 1, @sort_order, @created_at, @updated_at)`
    );
    for (const row of seed) {
      insert.run({ ...row, created_at: now, updated_at: now });
    }
  }

  /** Modèles types d’appel d’offres (page Appels d’offres) — insertion unique si absent. */
  const seedAoMarkerTitle = "Modèle — Appel d'offres ouvert (travaux)";
  const aoAlready = dbSingleton
    .prepare(
      `SELECT 1 FROM opportunity_posts
       WHERE category IN ('opportunites', 'appels-offres') AND title = ? LIMIT 1`
    )
    .get(seedAoMarkerTitle);
  if (!aoAlready) {
    const nowAo = new Date().toISOString();
    const aoModels = [
      {
        title: seedAoMarkerTitle,
        organisme: "Entité publique acheteuse (exemple)",
        lieu: "Kinshasa",
        summary:
          "Structure type : procédure ouverte, lots travaux, CCAP/CCTP, critères prix et technique, garanties.",
        body: `OBJET
Marché de travaux — [préciser nature et localisation].

DOCUMENTS CONTRACTUELS
• Règlement de la consultation
• Acte d’engagement / CCAP
• CCTP et annexes techniques
• DQE / bordereau des prix

SECTIONS À RÉDIGER
1. Objet, décomposition en lots, délais d’exécution
2. Conditions de participation et capacités requises
3. Critères d’attribution (prix, valeur technique, délais) et pondération
4. Garanties, retenue de garantie, pénalités
5. Visites de site, variantes, sous-traitance

CONSEIL
Adapter aux seuils et codes applicables à votre acheteur public.`,
      },
      {
        title: "Modèle — Appel d'offres restreint (services intellectuels)",
        organisme: "Ministère ou institution (exemple)",
        lieu: "RDC — missions sur site",
        summary:
          "Prestations intellectuelles : références, méthodologie, équipe, critères pondérés, négociation éventuelle.",
        body: `OBJET
Prestations de services intellectuels — [objet précis].

CONTENU TYPE DU DOSSIER
• Lettre de consultation / RC
• Descriptif du besoin et livrables attendus
• Exigences sur le profil, références obligatoires, CV des intervenants
• Méthodologie, planning, organisation du projet

CRITÈRES FRÉQUENTS
Valeur technique (méthode, moyens), prix, délais, qualité de l’équipe.

MENTIONS
Propriété intellectuelle, confidentialité, sous-traitance intellectuelle.`,
      },
      {
        title: "Modèle — Procédure adaptée (fournitures courantes)",
        organisme: "Établissement public (exemple)",
        lieu: "Lubumbashi",
        summary:
          "Fournitures récurrentes : quantités, spécifications minimales, prix unitaires, options de reconduction.",
        body: `OBJET
Fourniture de [produits] — livraisons sur [période / sites].

DOSSIER
• Besoin et quantités estimatives
• Spécifications techniques minimales acceptées
• Modalités de livraison, emballage, étiquetage
• Prix unitaires, validité des offres, facturation

OPTIONS
Reconduction du marché, bons de commande, révision des prix si prévue.`,
      },
      {
        title: "Modèle — Dialogue compétitif (projet complexe)",
        organisme: "Régie ou projet structurant (exemple)",
        lieu: "Plusieurs provinces",
        summary:
          "Phases sélection / dialogue / offre finale ; calendrier des sessions ; évolution du cahier des charges.",
        body: `PRINCIPE
Procédure en plusieurs phases pour affiner la solution avant remise des offres finales.

À PRÉVOIR
1. Calendrier : sélection des candidats, sessions de dialogue, remise des offres
2. Règles de confidentialité et d’engagement des participants
3. Modalités de modification du CCTP entre phases
4. Critères d’évolution d’une phase à l’autre

ANNEXES
Compte-rendu de dialogue, questions-réponses consolidées.`,
      },
      {
        title: "Modèle — Concours (maîtrise d'œuvre / études)",
        organisme: "Ville ou province (exemple)",
        lieu: "Goma",
        summary:
          "Programme, livrables graphiques, jury, droits d’auteur, indemnisation éventuelle des concurrents.",
        body: `OBJET
Concours pour [mission MOE / étude / conception] sur [site].

DOSSIER DE CONCOURS
• Programme et contraintes réglementaires / urbaines
• Livrables attendus par phase
• Composition du jury et règles (anonymat ou non)

DROITS
Propriété des documents remis, droits d’auteur, cession de droits au lauréat.

INDEMNISATION
Prévoir ou non une indemnité de participation selon le règlement applicable.`,
      },
      {
        title: "Modèle — Conception-réalisation",
        organisme: "Office des routes (exemple)",
        lieu: "Kongo Central",
        summary:
          "Périmètre fonctionnel, performances, recette, répartition des risques entre maîtrise d’ouvrage et titulaire.",
        body: `OBJET
Marché global ou conception-réalisation pour [ouvrage / équipement].

POINTS CLÉS
• Cahier des charges fonctionnel et niveaux de performance
• Interfaces avec autres lots ou exploitants
• Essais, recette, garanties de résultat
• Répartition des risques (retards, aléas techniques, vices cachés)

LIVRABLES
Plans d’exécution, DOE, formations, maintenance si incluse.`,
      },
      {
        title: "Modèle — Accord-cadre multi-attributaires",
        organisme: "Agence nationale (exemple)",
        lieu: "RDC",
        summary:
          "Durée, montants mini/maxi, bons de commande, répartition entre titulaires, résiliation et sortie anticipée.",
        body: `OBJET
Accord-cadre avec plusieurs opérateurs pour [prestations / fournitures].

CLAUSES TYPE
• Durée, montants minimum et maximum par période
• Modalités de lancement des bons de commande (rotation, concurrence)
• Révision des prix ou indexation
• Résiliation, sortie anticipée, avenants

GOUVERNANCE
Point de contact acheteur, reporting, pénalités éventuelles.`,
      },
      {
        title: "Modèle — Prestataire informatique (SI / hébergement)",
        organisme: "Institution financière (exemple)",
        lieu: "Kinshasa — télétravail partiel",
        summary:
          "SLA, support, sécurité et RGPD, migration, licences, pénalités, propriété du code et composants open source.",
        body: `OBJET
[Hébergement / développement / maintenance / infogérance] — périmètre [décrire].

ANNEXES TECHNIQUES
• SLA : disponibilité, temps de réponse, astreinte
• Sécurité : authentification, journalisation, DRP, durée de conservation
• RGPD : sous-traitants, localisation des données, DPA

LIVRABLES
Migration, documentation, formation, code source si applicable.

LICENCES
Propriété, licences open source, redevances tierces.`,
      },
      {
        title: "Modèle — Prestations multiservices (nettoyage, sécurité, etc.)",
        organisme: "Hôpital ou campus (exemple)",
        lieu: "Kisangani",
        summary:
          "Planning, effectifs, habilitations, matériel, clauses sociales et environnementales, procédures d’urgence.",
        body: `OBJET
Prestations de [nettoyage / gardiennage / restauration / multiservices] sur [sites].

CONTENU
• Horaires, planning, effectifs et qualifications
• Fourniture ou non du matériel et des consommables
• Normes d’hygiène, audits, reporting

RESPONSABILITÉ
Consignes d’urgence, coordination avec le donneur d’ordre, clauses sociales si obligatoires.`,
      },
      {
        title: "Modèle — MAPA / petits marchés (synthèse)",
        organisme: "Commune ou établissement scolaire (exemple)",
        lieu: "Mbuji-Mayi",
        summary:
          "Besoin synthétique, prix global ou forfait, critère souvent le prix, délais courts — selon seuils applicables.",
        body: `OBJET
Prestation ponctuelle : [décrire en quelques lignes].

DOSSIER ALLÉGÉ
• Description du besoin et quantités
• Prix global ou décomposition minimale
• Délai de validité des offres et délai d’exécution

REMISE DES OFFRES
Date limite, support (papier / dématérialisé), langue.

RAPPEL
Vérifier les seuils et la procédure adaptée au regard du code des marchés publics applicable.`,
      },
    ];

    const insertAo = dbSingleton.prepare(
      `INSERT INTO opportunity_posts
       (category, title, summary, body, link_url, image_url, attachments_json, consultation_deadline, organisme, lieu, status, scheduled_for, published_at, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, NULL, ?, ?, 'published', NULL, ?, ?, ?, ?)`
    );
    for (let i = 0; i < aoModels.length; i++) {
      const m = aoModels[i];
      insertAo.run(
        "opportunites",
        m.title,
        m.summary,
        m.body,
        "[]",
        m.organisme,
        m.lieu,
        nowAo,
        i,
        nowAo,
        nowAo
      );
    }
  }

  /** Données fictives (démo) pour les rubriques Appels à projets, Financements, PPP, Alertes — une fois si absentes. */
  const insertOppDemo = dbSingleton.prepare(
    `INSERT INTO opportunity_posts
     (category, title, summary, body, link_url, image_url, attachments_json, consultation_deadline, organisme, lieu, status, scheduled_for, published_at, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, 'published', NULL, ?, ?, ?, ?)`
  );
  const ymdFromToday = (deltaDays) => {
    const x = new Date();
    x.setDate(x.getDate() + deltaDays);
    return x.toISOString().slice(0, 10);
  };
  const nowDemo = new Date().toISOString();
  /**
   * @param {string} category
   * @param {string} markerTitle
   * @param {{ title: string; summary: string; body: string; organisme: string; lieu: string; consultation_deadline: string | null }[]} rows
   */
  function seedOpportunityDemoCategory(category, markerTitle, rows) {
    const exists = dbSingleton
      .prepare(`SELECT 1 FROM opportunity_posts WHERE category = ? AND title = ? LIMIT 1`)
      .get(category, markerTitle);
    if (exists) return;
    rows.forEach((r, i) => {
      insertOppDemo.run(
        category,
        r.title,
        r.summary,
        r.body,
        "[]",
        r.consultation_deadline,
        r.organisme,
        r.lieu,
        nowDemo,
        i,
        nowDemo,
        nowDemo
      );
    });
  }

  seedOpportunityDemoCategory("appels-a-projets", "Démo — AMI infrastructures hydrauliques locales", [
    {
      title: "Démo — AMI infrastructures hydrauliques locales",
      summary:
        "Manifestation d'intérêt pour des études et travaux d'extension de réseaux (données fictives).",
      body: `OBJET (EXEMPLE)
Renforcer l'accès à l'eau potable dans plusieurs communes pilotes.

PÉRIMÈTRE
Diagnostics, dimensionnement, appui à la passation et suivi de chantier (illustration).`,
      organisme: "Programme multibailleurs (exemple)",
      lieu: "Kasaï-Central",
      consultation_deadline: ymdFromToday(38),
    },
    {
      title: "Démo — AAP santé communautaire et prévention",
      summary: "Appel à propositions pour des actions de sensibilisation et renforcement des ASC (fictif).",
      body: `INDICATEURS (EXEMPLE)
Couverture vaccinale, nutrition, WASH, rapportage trimestriel.

BUDGET
Fourchette indicative et cofinancement local requis.`,
      organisme: "Fonds santé ONG (exemple)",
      lieu: "Sud-Kivu",
      consultation_deadline: ymdFromToday(2),
    },
    {
      title: "Démo — Programme jeunesse & emploi vert",
      summary: "Coaching, incubation et subventions d'amorçage pour micro-projets (données de démonstration).",
      body: `PUBLIC CIBLE
Jeunes 18-35 ans, projets à impact environnemental mesurable.

LIVRABLES
Business plan, mentorat 6 mois, pitch final devant un jury.`,
      organisme: "Agence nationale (exemple)",
      lieu: "Kinshasa",
      consultation_deadline: null,
    },
    {
      title: "Démo — Appel à projets éducation numérique (clos)",
      summary: "Équipement de salles multimédia et formation des enseignants (exemple expiré).",
      body: `CONTENU
Matériel pédagogique, connectivité, maintenance sur 24 mois.

NOTE
Échéance passée : cas « expiré » pour tester les filtres.`,
      organisme: "Ministère de l'Éducation (exemple)",
      lieu: "Haut-Katanga",
      consultation_deadline: ymdFromToday(-12),
    },
  ]);

  seedOpportunityDemoCategory("financements-subventions", "Démo — Subvention PME agricoles", [
    {
      title: "Démo — Subvention PME agricoles",
      summary: "Aide à l'investissement matériel et à la certification (exemple fictif).",
      body: `ÉLIGIBILITÉ
PME enregistrées, chiffre d'affaires plafonné, plan de croissance sur 18 mois.`,
      organisme: "Fonds national développement (exemple)",
      lieu: "RDC",
      consultation_deadline: ymdFromToday(55),
    },
    {
      title: "Démo — Ligne garantie prêt investissement",
      summary: "Garantie partielle pour prêts bancaires aux PME exportatrices (illustration).",
      body: `TAUX
Garantie jusqu'à 50 % du principal, frais de dossier forfaitaires.`,
      organisme: "Institution financière partenaire (exemple)",
      lieu: "Lubumbashi",
      consultation_deadline: ymdFromToday(1),
    },
    {
      title: "Démo — Bourse mobilité professionnelle UE",
      summary: "Séjours courts en Europe pour cadres publics — données de démonstration.",
      body: `DURÉE
2 à 6 semaines, thématiques : marchés publics, finances publiques, climat.`,
      organisme: "Délégation UE (exemple)",
      lieu: "Bruxelles / Kinshasa",
      consultation_deadline: null,
    },
    {
      title: "Démo — Appel à candidatures fonds carbone forestier",
      summary: "Projets REDD+ communautaires — fenêtre fermée (test filtre expiré).",
      body: `CRITÈRES
Gouvernance locale, MRV, partage des bénéfices.`,
      organisme: "Fonds climat (exemple)",
      lieu: "Équateur",
      consultation_deadline: ymdFromToday(-30),
    },
  ]);

  seedOpportunityDemoCategory("projets-ppp-investissement", "Démo — PPP autoroute urbaine", [
    {
      title: "Démo — PPP autoroute urbaine et péages",
      summary: "Structuration DBFOM, partage de trafic et risques trafic/revenus (fictif).",
      body: `PHASES
Étude de trafic, modèle financier, dialogue concurrentiel, contrat de concession.`,
      organisme: "Office des routes (exemple)",
      lieu: "Kinshasa",
      consultation_deadline: ymdFromToday(90),
    },
    {
      title: "Démo — Concession aéroport régional",
      summary: "Exploitation, maintenance et extension terminal passagers (démonstration).",
      body: `INDICATEURS
Qualité de service passagers, sûreté, investissements programmés.`,
      organisme: "Régie aéroports (exemple)",
      lieu: "Goma",
      consultation_deadline: ymdFromToday(3),
    },
    {
      title: "Démo — Partenariat hydraulique industriel",
      summary: "Usine de traitement et distribution — phase expression d'intérêt (sans date limite).",
      body: `MODÈLE
Tarification régulée, redevance de disponibilité, clauses de performance.`,
      organisme: "Régie des eaux (exemple)",
      lieu: "Kongo Central",
      consultation_deadline: null,
    },
    {
      title: "Démo — Zone économique spéciale — investisseur retenu (archivé)",
      summary: "Consultation close : exemple de ligne « expirée » pour les filtres.",
      body: `CONTENU
Baux emphytéotiques, fiscalité dégressive, services one-stop-shop.`,
      organisme: "Agence ZES (exemple)",
      lieu: "Maluku",
      consultation_deadline: ymdFromToday(-5),
    },
  ]);

  seedOpportunityDemoCategory("alertes-personnalisees", "Démo — Alerte BTP & travaux lourds", [
    {
      title: "Démo — Alerte BTP & travaux lourds",
      summary: "Veille fictive : marchés > 500 kUSD, provinces ciblées, mots-clés « routes, ponts ».",
      body: `PARAMÈTRES (EXEMPLE)
Secteur BTP, seuil montant, provinces : Haut-Katanga, Lualaba.`,
      organisme: "Orbis Publica (exemple veille)",
      lieu: "Sud-est RDC",
      consultation_deadline: ymdFromToday(14),
    },
    {
      title: "Démo — Alerte santé & ONG internationales",
      summary: "Appels à projets santé, financements Fonds mondial, bailleurs bilatéraux (fictif).",
      body: `MOTS-CLÉS
Vaccination, chaîne du froid, renforcement laboratoires.`,
      organisme: "Cabinet — profil démo",
      lieu: "National",
      consultation_deadline: ymdFromToday(0),
    },
    {
      title: "Démo — Alerte PPP & concessions",
      summary: "Signaux sur concessions, délégations de service et investissements infrastructurels.",
      body: `SOURCES
Presse spécialisée, bulletins autorités contractantes (illustration).`,
      organisme: "Orbis Publica (exemple veille)",
      lieu: "RDC",
      consultation_deadline: null,
    },
    {
      title: "Démo — Alerte expirée (archivage)",
      summary: "Jeux de données clos pour valider le filtre « Expirée ».",
      body: `NOTE
Entrée purement technique de démonstration.`,
      organisme: "Système démo",
      lieu: "—",
      consultation_deadline: ymdFromToday(-20),
    },
  ]);

  /** Vingt appels d’offres fictifs (rubrique Opportunités / marchés) — une fois si absents. */
  seedOpportunityDemoCategory("opportunites", "Démo — Travaux voirie et assainissement Tshangu (fictif)", [
    {
      title: "Démo — Travaux voirie et assainissement Tshangu (fictif)",
      summary:
        "Procédure ouverte : chaussées, trottoirs, buses et évacuation pluviale — données de démonstration.",
      body: `LOT UNIQUE
Travaux sur environ 4,2 km de voirie urbaine. Visite de site obligatoire.

REMISE DES OFFRES
Plateforme dématérialisée ou dépôt physique selon RC (exemple).`,
      organisme: "Ville de Kinshasa — Direction des infrastructures (exemple)",
      lieu: "Kinshasa — Tshangu",
      consultation_deadline: ymdFromToday(22),
    },
    {
      title: "Démo — Fourniture réactifs et consommables laboratoire CH Bukavu (fictif)",
      summary: "Marché de fournitures avec bons de commande sur 18 mois — stocks critiques hôpital.",
      body: `PÉRIMÈTRE
Biochimie, hématologie, microbiologie — listes types en annexe technique.

CONDITIONS
Certificats d’analyse, traçabilité des lots, délais de livraison 48–72 h.`,
      organisme: "Ministère provincial de la Santé Sud-Kivu (exemple)",
      lieu: "Bukavu",
      consultation_deadline: ymdFromToday(9),
    },
    {
      title: "Démo — Prestations multiservices bâtiments administratifs Gombe (fictif)",
      summary: "Nettoyage, gardiennage et petit bricolage pour cinq immeubles — cadre démo.",
      body: `EFFECTIFS
Minimum indicatif : 40 ETP nettoyage, 25 agents de sécurité certifiés.

HORAIRES
Du lundi au samedi, astreinte week-end sur un site.`,
      organisme: "Secrétariat général à la Fonction publique (exemple)",
      lieu: "Kinshasa — Gombe",
      consultation_deadline: ymdFromToday(-4),
    },
    {
      title: "Démo — Études géotechniques et hydrologiques corridor Kasumbalesa (fictif)",
      summary: "Mission d’ingénierie d’avant-projet pour réhabilitation routière — rapport bilingue.",
      body: `LIVRABLES
Forages, essais in situ, modélisation pluie-débit, recommandations d’ouvrages.

DURÉE
Six mois à compter de l’ordre de service (illustration).`,
      organisme: "Office des routes — Projet corridor (exemple)",
      lieu: "Haut-Katanga",
      consultation_deadline: ymdFromToday(60),
    },
    {
      title: "Démo — Maintenance tierce parc informatique et impression (fictif)",
      summary: "Contrat annuel renouvelable : postes de travail, serveurs, copieurs — données fictives.",
      body: `SLA INDICATIFS
Tickets P1 sous 4 h ouvrées, P3 sous 48 h, inventaire trimestriel.

EXCLUSIONS
Remplacement de matériel > 5 kUSD sans bon de commande séparé.`,
      organisme: "Ministère des Finances (exemple)",
      lieu: "Kinshasa",
      consultation_deadline: null,
    },
    {
      title: "Démo — Construction hangar douanes et aire de visite Gbadolite (fictif)",
      summary: "Travaux clés en main : charpente métallique, quai, éclairage et clôture périmétrique.",
      body: `NORMES
Résistance au vent, protection foudre, accès poids lourds.

GARANTIES
Retenue de garantie et pénalités journalières selon CCAP type.`,
      organisme: "DGDA — Direction provinciale Nord-Ubangi (exemple)",
      lieu: "Gbadolite",
      consultation_deadline: ymdFromToday(35),
    },
    {
      title: "Démo — Achat groupé médicaments essentiels province Sud-Kivu (fictif)",
      summary: "Appel d’offres ouvert : livraisons paletteisées et chaîne du froid pour certains lots.",
      body: `AGRÉMENT
AMM ou équivalent requis pour les spécialités listées.

LOGISTIQUE
Hub Bukavu avec extensions Uvira et Idjwi (exemple).`,
      organisme: "Programme provincial santé (exemple)",
      lieu: "Sud-Kivu",
      consultation_deadline: ymdFromToday(14),
    },
    {
      title: "Démo — Audit financier et conformité bailleurs multi-projets (fictif)",
      summary: "Mission d’audit sur trois exercices, rapports IFAD/Banque mondiale — démo.",
      body: `LANGUES
Rapports en français avec résumé exécutif en anglais.

CONFIDENTIALITÉ
Accès données sous protocole signé.`,
      organisme: "Projet développement rural PRASER (exemple)",
      lieu: "Kinshasa / missions provinces",
      consultation_deadline: ymdFromToday(48),
    },
    {
      title: "Démo — Gardiennage sites EPST secondaire Lualaba (fictif)",
      summary: "Marché cadre : 32 établissements, astreinte nocturne et week-end — fictif.",
      body: `MATÉRIEL
Radio, registre incidents, coordination police locale.

DURÉE
24 mois avec reconduction tacite possible (illustration).`,
      organisme: "EPST — Division provinciale Lualaba (exemple)",
      lieu: "Kolwezi, Likasi, Fungurume",
      consultation_deadline: ymdFromToday(3),
    },
    {
      title: "Démo — Réhabilitation réseau moyenne tension quartiers Matadi-port (fictif)",
      summary: "Travaux électriques : postes, départs et branchements — données de test.",
      body: `SÉCURITÉ
Habilitations obligatoires, plan de circulation chantier.

ESSAIS
Mise sous tension progressive et levée de réserves.`,
      organisme: "SNEL — Agence Kongo Central (exemple)",
      lieu: "Matadi",
      consultation_deadline: ymdFromToday(-18),
    },
    {
      title: "Démo — Restauration collective campus universitaire Kisangani (fictif)",
      summary: "Service trois repas / jour pour 3 500 couverts moyenne — marché de services.",
      body: `HYGIÈNE
HACCP, contrôles sanitaires mensuels, traçabilité des approvisionnements.

VARIATION
Indexation matières premières selon formule en RC.`,
      organisme: "Université de Kisangani (exemple)",
      lieu: "Kisangani",
      consultation_deadline: ymdFromToday(27),
    },
    {
      title: "Démo — Travaux assainissement latrines écoles rurales Tshopo (fictif)",
      summary: "Lotissement de 18 écoles : latrines ventilées, points d’eau — appel fictif.",
      body: `APPROCHE
Participation communautaire, formation comités WASH.

INDICATEURS
Nombre de postes livrés, taux d’usage à M+6 (exemple).`,
      organisme: "Projet éducation-WASH UNICEF (exemple)",
      lieu: "Province Tshopo",
      consultation_deadline: ymdFromToday(70),
    },
    {
      title: "Démo — Fourniture mobilier scolaire 2 000 places (fictif)",
      summary: "Tables-bancs, armoires, tableaux — conformité normes ergonomiques démo.",
      body: `LIVRAISON
Échelonnée sur 90 jours, réception par district scolaire.

GARANTIE
Minimum 24 mois pièces et main-d’œuvre.`,
      organisme: "Ministère de l’Éducation nationale (exemple)",
      lieu: "Kasaï-Oriental",
      consultation_deadline: ymdFromToday(11),
    },
    {
      title: "Démo — Ingénierie de supervision pont Kwilu et accès (fictif)",
      summary: "MOE de contrôle : béton armé, géotechnique, suivi environnemental — fictif.",
      body: `ÉQUIPE
Chef de mission senior + 2 ingénieurs permanents sur site.

RAPPORTS
Hebdomadaires chantier, comités de pilotage mensuels.`,
      organisme: "Agence nationale des grands travaux (exemple)",
      lieu: "Bandundu / Kwilu",
      consultation_deadline: ymdFromToday(95),
    },
    {
      title: "Démo — Location engins terrassement et transport interne mine (fictif)",
      summary: "Pelles, tombereaux, niveleuses — 12 mois renouvelables — données démo.",
      body: `DISPONIBILITÉ
Engins avec opérateurs, carburant à la charge du titulaire.

PÉNALITÉS
Indisponibilité > 48 h consécutives (exemple CCAP).`,
      organisme: "Gécamines — site Lualaba (exemple)",
      lieu: "Lualaba",
      consultation_deadline: ymdFromToday(6),
    },
    {
      title: "Démo — Impression supports campagne vaccination TVAAC (fictif)",
      summary: "Affiches, dépliants, bannières roll-up — charte graphique fournie — fictif.",
      body: `QUANTITÉS
Indicatives en annexe ; épreuves validées avant tirage.

DÉLAIS
Campagne nationale : première vague sous 21 jours.`,
      organisme: "PNLT / Programme élargi vaccination (exemple)",
      lieu: "RDC — national",
      consultation_deadline: ymdFromToday(1),
    },
    {
      title: "Démo — Extension fibre optique bureaux régionaux REGIDESO (fictif)",
      summary: "Raccordement 14 sites, switches managés, tests OTDR — marché fictif.",
      body: `LIVRABLES
Schémas logiques, as-built, formation administrateurs locaux.

MAINTENANCE
Option 12 mois post réception.`,
      organisme: "REGIDESO (exemple)",
      lieu: "Kinshasa, Matadi, Boma, Muanda",
      consultation_deadline: ymdFromToday(40),
    },
    {
      title: "Démo — Désinfection et dératisation sites aéroportuaires (fictif)",
      summary: "Marché de services périodiques : terminaux, hangars, zones techniques — démo.",
      body: `FRÉQUENCE
Traitements mensuels + interventions d’urgence sous 6 h.

PRODUITS
Autorisés par autorité sanitaire aéronautique (exemple).`,
      organisme: "RVA — Aéroport de Goma (exemple)",
      lieu: "Goma",
      consultation_deadline: ymdFromToday(-9),
    },
    {
      title: "Démo — Formation marchés publics cadres provinciaux (fictif)",
      summary: "12 sessions de 3 jours, matériel pédagogique, évaluation — données fictives.",
      body: `PUBLIC
120 cadres des directions provinciales des finances.

LIEUX
Kinshasa, Lubumbashi, Kisangani (rotation).`,
      organisme: "ARMP — Programme renforcement capacités (exemple)",
      lieu: "RDC",
      consultation_deadline: ymdFromToday(16),
    },
    {
      title: "Démo — Accord-cadre consommables de bureau 24 mois (fictif)",
      summary: "Papeterie, cartouches, petit matériel — bons de commande sans montant minimum.",
      body: `LIVRAISONS
Sous 72 h sur site central ; 120 h sur sites extérieurs.

PRIX
Révision trimestrielle sur index indicatif (illustration).`,
      organisme: "Caisse nationale de péréquation (exemple)",
      lieu: "Kinshasa",
      consultation_deadline: ymdFromToday(52),
    },
  ]);

  return dbSingleton;
}

export function rowToApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    desc: row.description,
    category: row.category,
    image: row.image,
    published: Number(row.published) === 1,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function servicePublicationRowToApi(row) {
  if (!row) return null;
  let content_overrides = null;
  if (row.content_json) {
    try {
      const parsed = JSON.parse(row.content_json);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        content_overrides = parsed;
      }
    } catch {
      content_overrides = null;
    }
  }
  return {
    slug: row.slug,
    /** SQLite INTEGER 0/1 — éviter Boolean("0") === true sur chaînes rares. */
    published: Number(row.published) === 1,
    sort_order: row.sort_order,
    updated_at: row.updated_at,
    content_overrides,
  };
}
