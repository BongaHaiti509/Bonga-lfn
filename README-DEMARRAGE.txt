HAÏTI LA FLEUR NOIR — KIT DE DÉMARRAGE

CONTENU
- index.html : structure du site
- styles.css : apparence mobile et ordinateur
- app.js : connexion, profils, réactions, commentaires et sondage
- supabase-schema.sql : tables et règles de sécurité de base

IMPORTANT
Ce kit est un prototype de départ. Il n'est pas encore publié et ne contient aucune donnée réelle.
Les réactions et sondages sont des opinions citoyennes, pas des votes officiels.
Avant ouverture publique, ajoutez une modération, une politique de confidentialité, des règles anti-spam et vérifiez les paramètres de sécurité.

ÉTAPES
1. Dans Supabase, créez un projet.
2. Ouvrez SQL Editor, collez le contenu de supabase-schema.sql et exécutez-le.
3. Dans Supabase > Project Settings > API, copiez Project URL et la clé Publishable (ou anon).
4. Dans app.js, remplacez COLLEZ_ICI_URL_SUPABASE et COLLEZ_ICI_CLE_PUBLISHABLE par vos valeurs.
   N'utilisez JAMAIS la clé service_role dans app.js.
5. Ajoutez des candidats dans la table candidates. Mettez published à true pour les afficher.
6. Déployez les fichiers sur un hébergeur statique comme Cloudflare Pages ou GitHub Pages.

GITHUB (téléphone)
- Ouvrez votre dépôt GitHub.
- Add file > Upload files.
- Téléversez les 4 fichiers du site (index.html, styles.css, app.js, supabase-schema.sql).
- Commit changes.
- Pour publier, configurez ensuite GitHub Pages dans Settings > Pages (Deploy from a branch, main, /(root)).

AUTHENTIFICATION
Dans Supabase > Authentication > URL Configuration, ajoutez l'URL de votre site publié dans Site URL et Redirect URLs.
Pour tester localement, ouvrez le site avec un serveur local; ne vous attendez pas à ce que tous les liens magiques fonctionnent depuis un fichier file://.

ADMINISTRATION
La gestion des profils et l'approbation des commentaires se font pour l'instant depuis Supabase Dashboard. Le kit ne comprend pas encore de panneau administrateur dédié.
