
  # Site Web Professionnel ORBIS PUBLICA

  This is a code bundle for Site Web Professionnel ORBIS PUBLICA. The original project is available at https://www.figma.com/design/O470QHcrJq8b0g1I2b41IY/Site-Web-Professionnel-ORBIS-PUBLICA.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

## Comptes utilisés

- **Hébergement (Render) :** compte `basixnyandu@gmail.com`
- **Dépôt GitHub :** `josephNyandu/Orbispublica`, compte GitHub `joseph.nyandu@itmafrica.com`
- **Domaine orbispublica.com :** enregistré chez Hostinger

Mise en ligne : après un push sur `main`, ouvrir le service Orbis sur Render et lancer « Manual Deploy → Deploy latest commit » si le déploiement automatique ne s'est pas déclenché.

## Base de données (Neon)

Le serveur Express utilise Neon (Postgres). Définir `DATABASE_URL` (chaîne de connexion Neon) dans `.env` en local et dans les variables d'environnement du service Render. Les tables sont créées au démarrage.

Reprise des données de l'ancienne base SQLite : `npm run import:sqlite-to-neon -- --dry-run`, puis `npm run import:sqlite-to-neon`.
