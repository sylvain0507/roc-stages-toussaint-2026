# ROC — Stages de la Toussaint 2026

Application d’inscription aux stages du 19 au 31 octobre 2026. Interface adaptée au téléphone et au bureau.

## Fonctionnement

- Choix du groupe et inscription à plusieurs créneaux.
- Session au seuil de déclenchement dès **4 inscrits**, puis confirmation par le club.
- Vendredi 23 octobre, 14 h–15 h : session commune Tiny 1, 2 et 3, gratuite.
- Tarifs du planning : 4 €, don libre, ou 4 € pour Tiny 3 NTP et don libre pour NC. Aucun paiement en ligne.
- Les Citrons peuvent choisir les créneaux Marteaux marqués d’un astérisque.
- Capacités numériques du planning respectées. Les mentions « TOUS » ne définissent pas de plafond.
- Les nombres du tableau original représentent des capacités, jamais des inscriptions existantes.
- Espace club privé : noms, e-mails, export CSV et décision par session.
- Code personnel à 4 chiffres, associé à l’e-mail de contact, pour retrouver une inscription et annuler des créneaux. Les anciens codes longs restent utilisables.
- Aucun e-mail automatique n’est envoyé.

## Hébergement

GitHub Pages sert les fichiers du dossier `public`. Le service Sites/Cloudflare et sa base D1 conservent les inscriptions partagées. **Les données personnelles, clés privées et inscriptions ne doivent jamais être déposées sur GitHub.**

La clé privée du club est une variable secrète `ADMIN_KEY` sur le service. Elle ne figure dans aucun fichier publié. Elle doit être gardée privée et communiquée seulement aux responsables du club.

`public/config.js` indique l’URL du service. Pour GitHub Pages, publier les fichiers de `public` à la racine d’un dépôt public et activer Pages sur `main / (root)`.

## Planning

Source : onglet `vac LA TOUSSAINT` du fichier **Stages vacances Toussaint.xlsx**. Le seuil de 5 figurant dans cet onglet est remplacé par 4, conformément à la demande du club. Les dates sont reprises pour 2026. Les groupes du vendredi Tiny sont réunis. Le créneau « Centre Loisirs » est réservé à cette organisation et n’est pas proposé aux adhérents.

Les séances sont comptées par groupe et créneau, sauf la séance commune Tiny. Le club doit contacter les inscrits quand il confirme ou annule une séance.

## Développement et base

`worker.js` contient les contrôles serveur. `sessions.json` contient le planning public. `db/schema.ts` et les migrations `drizzle` définissent la base, les contraintes d’unicité et les protections transactionnelles contre le dépassement des capacités. Ne pas modifier une migration déjà publiée : ajouter une migration.

```sh
npm install
npm run db:generate
node guards.mjs
npm run build
```

Les réponses aux erreurs conservent les choix saisis. Les inscriptions multiples sont atomiques. Les exports protègent les cellules contre les formules injectées.

Le dépôt publie directement les fichiers de l’interface à sa racine. **source-complete.zip** contient le projet complet (interface, service et migrations) sans clé privée ni données d’adhérents.

Application : https://sylvain0507.github.io/roc-stages-toussaint-2026/
