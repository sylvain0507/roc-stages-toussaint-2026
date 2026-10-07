# ROC — Stages de la Toussaint 2026

Application d’inscription aux stages du 19 au 31 octobre 2026. Interface adaptée au téléphone et au bureau.

## Fonctionnement

- Choix du groupe et inscription à plusieurs créneaux.
- Session au seuil de déclenchement dès **5 inscrits**, puis confirmation par le club.
- Vendredi 23 octobre, 14 h–15 h : session commune Tiny 1, 2 et 3, gratuite.
- Tarifs du planning : 4 €, don libre, ou 4 € pour Tiny 3 NTP et don libre pour NC. Aucun paiement en ligne.
- Groupes proposés : Tiny 1, Tiny 2, Tiny 3, Mégalodons et Pèlerins.
- Capacités numériques du planning respectées. Les mentions « TOUS » ne définissent pas de plafond.
- Les nombres du tableau original représentent des capacités, jamais des inscriptions existantes.
- Espace club privé : noms, e-mails, export CSV et décision par session.
- Code personnel à 4 chiffres, associé à l’e-mail de contact, pour retrouver une inscription et annuler des créneaux. Les anciens codes longs restent utilisables. Les tentatives de consultation sont limitées côté serveur.
- Aucun e-mail automatique n’est envoyé.

## Hébergement

GitHub Pages sert les fichiers du dossier `public`. Le service Sites/Cloudflare et sa base D1 conservent les inscriptions partagées. **Les données personnelles, clés privées et inscriptions ne doivent jamais être déposées sur GitHub.**

La clé privée du club est une variable secrète `ADMIN_KEY` sur le service. Elle ne figure dans aucun fichier publié. Elle doit être gardée privée et communiquée seulement aux responsables du club.

`public/config.js` indique l’URL du service. Pour GitHub Pages, publier les fichiers de `public` à la racine d’un dépôt public et activer Pages sur `main / (root)`.

## Planning

Source : onglet `vac LA TOUSSAINT` du fichier **Stages vacances Toussaint (2).xlsx**. Le seuil de déclenchement est de 5 inscrits, conformément à la demande du club. Les dates sont reprises pour 2026. Les groupes du vendredi Tiny sont réunis. Les autres groupes et le créneau « Centre Loisirs » ne sont pas proposés. Les identifiants des créneaux conservés restent inchangés pour préserver les inscriptions existantes.

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

Le club peut supprimer une inscription à un créneau depuis sa liste, après confirmation. Les autres créneaux du nageur restent conservés. Les effectifs et le seuil de cinq sont actualisés ; la suppression ne peut pas être annulée.

Export Excel local avec deux onglets : Totaux par adhérent et Inscriptions. Regroupement par nom normalisé et e-mail (jamais par e-mail seul). Le total prévu exclut les créneaux annulés ou retirés et les dons libres ; le montant confirmé concerne uniquement les sessions confirmées avec au moins cinq inscrits. Les dons libres sont signalés séparément. L’export actualise les inscriptions avant le téléchargement, protège les textes contre les formules injectées et inclut des formules de somme avec valeurs calculées.
