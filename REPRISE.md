# REPRISE.md — Cave à Vins

> **Fiche de reprise après gel du projet.**
> Dernière mise à jour : **24 août 2026** (dernier jour avant le départ en stage de l'équipe).
> Reprise du développement : **mardi 4 novembre 2026**.
> Rédigé par : Alexandre GAILLARD (chef de projet).

> **🔄 Révision du 28 août 2026 — audit de la branche `front`.**
> Le front-end React/Vite a été poussé sur la branche **`front`** (dossier
> `front-end/`) après la rédaction initiale de cette fiche. Plusieurs points
> ci-dessous ont donc été **corrigés à partir du code réel** : ils sont marqués
> « *(MAJ 28/08)* ». Le nom interne du produit est **« Rich Cellar »**. Les
> parties non vérifiables depuis le front (back-end, schéma BDD réel) ont été
> **annotées**, pas réécrites. Voir aussi le mémo
> `front-end/docs/memo-ecarts-contrat-bdd.md` et l'**Annexe** en fin de fiche.

**Lis ce fichier en entier avant de lancer la moindre commande.** Il a été écrit
pour toi, dix semaines plus tard, quand tu auras oublié comment tout ça marche.

---

## 1. Le projet en deux lignes

Application de gestion de cave à vin : un utilisateur inventorie ses bouteilles
(scan de l'étiquette ou saisie manuelle), suit son stock, et peut proposer
certaines bouteilles à l'échange avec d'autres utilisateurs.

Projet d'équipe (9 personnes : design, front-end, back-end) réalisé dans le
cadre du titre professionnel DWWM.

---

## 2. État réel au moment du gel

### Ce qui existe

| Élément | État | Où |
|---|---|---|
| Maquettes des 10 écrans | Terminées | Drive design partagé |
| **Les 10 écrans** *(MAJ 28/08)* | **Tous codés** (React/Vite) et navigables, mais alimentés par des **données mock** (`front-end/src/data/wines.js`) — **pas encore branchés sur l'API** | Branche `front`, dossier `front-end/src/pages/` |
| Vérification d'âge à l'inscription *(MAJ 28/08)* | **Implémentée** côté client (CNI + webcam) ; RGPD : seul un booléen `ageVerified` est conservé | Branche `front` (voir §12) |
| Couche API typée (auth, wine, cave, profile) *(MAJ 28/08)* | **Écrite**, format d'auth tranché (cookie JWT `HttpOnly`), mais non appelée par les écrans | `front-end/src/api/` (voir §9) |
| Schéma de base de données | Corrigé le 24/08, table `utilisateur_cave` ajoutée | `docs/` (voir §6) |
| Contrat d'API | Figé le 24/08 (types partagés) | `shared/types/` (voir §9) |
| Package graphique (icônes, logos, tokens) | Livré | Drive design partagé |
| Serveur Hostinger | Configuré, accès FTP | Voir §11 |

### Ce qui n'existe PAS encore — ne cherche pas, ce n'est pas perdu

- Aucune entité TypeORM n'était écrite au moment du gel. Les entités ont été
  créées le 24/08 en urgence à partir du schéma corrigé : **vérifie leur
  contenu avant de te fier à la base générée**.
- Pas d'authentification fonctionnelle : elle est **spécifiée**, pas
  implémentée.
- Pas de tests automatisés.
- Pas de CI/CD. Les déploiements sont manuels par FTP.

### Ce qui a été volontairement exclu du gel (décision du 24/08)

Ces trois chantiers ont été reportés **exprès**. Ce n'est pas un oubli, ne les
attaque pas en priorité :

1. ~~**Intégration du scanner `@zxing/browser`** (REC-FRO-02)~~ — **Fait depuis,
   sur la branche `front`** *(MAJ 28/08)* : le scan de code-barre est décodé en
   direct via `@zxing/browser` (chargé à la demande) dans
   `front-end/src/pages/Scan/`. Reste à le brancher sur une vraie recherche API.
2. **Cache et fallback de l'API GrapeMinds** (REC-BAC-04) — trop de logique
   métier, à traiter en Phase 1 post-stage. *(Toujours d'actualité.)*
3. **Traduction anglaise** (REC-DES-03) — non bloquant pour le MVP.
   *(Toujours d'actualité.)*

---

## 3. Stack technique

| Couche | Technologie |
|---|---|
| Back-end | NestJS + TypeORM (TypeScript) |
| Front-end | React + TypeScript (Vite) |
| Base de données | MariaDB (via le serveur local type WAMP/XAMPP/Laragon) |
| Hébergement | Hostinger, accès **FTP** uniquement — **rien n'est déployé à ce jour** |
| API tierce (données vins) | GrapeMinds — `https://grapeminds.fr/` |
| Gestionnaire de paquets | npm |
| Dépôt | Mono-repo — <https://github.com/madmolf/cave-a-vins> |

> **Attention au vocabulaire :** aucun code PHP ne tourne dans ce projet. PHP
> n'est présent que parce que le serveur local (WAMP/XAMPP/Laragon) l'embarque
> avec MariaDB. Seule la base de données nous sert.

### Comment circulent les données

```
  React (front)
       │
       ▼
  API NestJS  ──────────────►  API GrapeMinds  (référentiel des vins, lecture seule)
   (la nôtre)                   https://grapeminds.fr/
       │
       ▼
   MariaDB (la nôtre)
   comptes utilisateurs, caves, bouteilles possédées
```

Deux choses à ne pas confondre :

- **GrapeMinds** est une dépendance **externe**. On y lit des fiches de vins,
  on n'y écrit jamais rien. Si elle tombe, l'application doit continuer à
  afficher les caves déjà enregistrées (d'où le chantier « cache & fallback »
  reporté à novembre).
- **L'API NestJS est la nôtre.** C'est elle qui interroge GrapeMinds, elle qui
  écrit en base, elle qui porte l'authentification. Le front ne parle jamais
  directement ni à GrapeMinds ni à MariaDB.

---

## 4. Arborescence du mono-repo

```
cave-a-vins/
├── backend/          # API NestJS + TypeORM
├── front/            # Application React + TypeScript
├── docs/             # Schéma BDD, export .sql, collection Postman
├── .gitignore
├── README.md
└── REPRISE.md        # ce fichier
```

> **⚠️ État réel du dépôt au 28/08 *(MAJ 28/08)* — l'arborescence ci-dessus est
> la cible, pas encore la réalité.**
> - Branche **`main`** : ne contient que `LICENSE`, `README.md` et `REPRISE.md`.
> - Branche **`front`** : contient tout le front-end dans **`front-end/`** (et
>   **non** `front/`), avec son propre `front-end/docs/`.
> - Le dossier **`backend/`** n'existe encore **nulle part** : aucune ligne de
>   NestJS n'est versionnée à ce jour.
> - Quand tu suis le §6, remplace donc les `cd front` par `cd front-end`, et
>   saute les étapes back tant que le dossier n'est pas créé.

---

## 5. Prérequis à réinstaller

- **Node.js** version **24.15.0** — c'est le piège n°1 après dix semaines : une
  version de Node différente casse des dépendances sans message clair. Utilise
  `nvm` si tu jongles entre plusieurs projets :

```bash
nvm install 24.15.0   # installe la version exacte utilisée par l'équipe
nvm use 24.15.0       # bascule le terminal courant dessus
node -v               # doit afficher v24.15.0 avant tout npm install
```

Un fichier `.nvmrc` contenant `24.15.0` est présent à la racine : un simple
`nvm use` dans le dossier du projet suffit alors.
- **npm** (fourni avec Node).
- **Un serveur local MariaDB** : WAMP, XAMPP ou Laragon.
- **Git**.
- **Un client FTP** (FileZilla) pour le déploiement.

---

## 6. Installation locale, pas à pas

```bash
# 1. Récupérer le projet
git clone https://github.com/madmolf/cave-a-vins.git
cd cave-a-vins

# 2. Installer les dépendances du back-end
#    (node_modules n'est pas versionné : cette étape est obligatoire)
cd backend
npm install

# 3. Installer les dépendances du front-end
cd ../front
npm install
```

Ensuite, la base de données :

```bash
# 4. Démarrer MariaDB depuis le panneau de WAMP/XAMPP/Laragon,
#    puis créer la base vide attendue par l'application.
#    Le nom doit correspondre EXACTEMENT à DB_NAME dans le .env (voir §8).
mysql -u root -p -e "CREATE DATABASE dwwm_cave CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Puis les fichiers d'environnement :

```bash
# 5. Créer ton .env local à partir du modèle versionné (voir §8)
cd ../backend
cp .env.example .env
# Ouvre ensuite .env et renseigne tes identifiants MariaDB locaux.
```

Et enfin, le lancement :

```bash
# 6. Démarrer l'API NestJS (port 3000)
#    --watch relance automatiquement à chaque modification de fichier
cd backend
npm run start:dev

# 7. Dans un SECOND terminal, démarrer le front React
cd front
npm run dev
```

- API : <http://localhost:3000>
- Front : <http://localhost:5173> — port Vite par défaut *(MAJ 28/08)*. Le
  front est dans **`front-end/`** sur la branche `front` : `cd front-end && npm
  install && npm run dev`. Scripts utiles : `npm run build`, `npm run lint`
  (oxlint), `npm run typecheck` (tsc).

---

## 7. Base de données — à lire avant de coder

La configuration TypeORM est en **`synchronize: true`**. Concrètement :

- TypeORM lit les entités dans `backend/src/**/*.entity.ts` et **crée ou
  modifie automatiquement les tables** au démarrage de l'API.
- La source de vérité du schéma, c'est donc **le code des entités**, pas un
  fichier SQL. Un export `.sql` a été déposé dans `docs/` le 24/08 à titre de
  référence, mais il peut diverger : fie-toi aux entités.
- Pour repartir d'une base propre : supprime la base, recrée-la vide (étape 4
  ci-dessus), relance l'API.

> **Chantier prioritaire de novembre :** passer en **migrations TypeORM** et
> mettre `synchronize: false`. En production, `synchronize: true` peut
> supprimer des colonnes et les données qu'elles contiennent, sans
> confirmation. C'est acceptable en développement, jamais en ligne.

La table centrale ajoutée le 24/08 est **`utilisateur_cave`** : elle associe un
utilisateur aux bouteilles qu'il possède (`id_utilisateur`, `id_vin`,
`quantite`, `date_ajout`, `ouvert_echange`). Sans elle, rien du stock ni de
l'échange ne peut fonctionner.

> **⚠️ Divergence à réconcilier en priorité *(MAJ 28/08)*.** Le mémo
> d'intégration front (`front-end/docs/memo-ecarts-contrat-bdd.md`, point 2)
> signale qu'**aucune table de possession n'existe** dans le schéma
> (`u838316096_Dwwm_Cave_*`) que l'équipe front a reçu — ni `utilisateur_cave`,
> ni équivalent. Deux lectures possibles : soit le schéma partagé au front n'est
> pas à jour, soit la table `utilisateur_cave` n'a jamais été committée. **À
> trancher avant la Tâche 3 du sprint (CRUD « ma cave »)**, qui en dépend
> entièrement. Note aussi que le préfixe réel de la base côté Hostinger est
> `u838316096_Dwwm_Cave_*`, et non `dwwm_cave` (nom local du §8).

---

## 8. Variables d'environnement

Le fichier `.env` **n'est jamais commité** (le dépôt est public). Un modèle
`.env.example` est versionné dans `backend/` :

```bash
# ---- Base de données locale (MariaDB) ----
DB_HOST=localhost          # serveur local, ne change pas en développement
DB_PORT=3306               # port MariaDB par défaut
DB_USER=root               # utilisateur local ; sur WAMP/XAMPP, root sans mot de passe
DB_PASSWORD=               # vide en local par défaut ; à renseigner sur Hostinger
DB_NAME=dwwm_cave          # doit correspondre à la base créée à l'étape 4 du §6

# ---- Authentification ----
JWT_SECRET=                # chaîne aléatoire longue ; DIFFÉRENTE en local et en production
JWT_EXPIRES_IN=1d          # durée de validité du token

# ---- API tierce des données vins ----
GRAPEMINDS_API_URL=https://grapeminds.fr/
GRAPEMINDS_API_KEY=        # clé fournie par le chef de projet, ne jamais commiter

# ---- Front ----
VITE_API_URL=http://localhost:3000   # à changer en production vers l'URL Hostinger
```

**Les vraies valeurs ne sont pas dans ce dépôt.** Demande-les au chef de projet
(voir §14). Si un secret se retrouve un jour commité sur le dépôt public,
considère-le comme compromis : il faut le régénérer, pas simplement le
supprimer au commit suivant.

---

## 9. Contrat d'API et authentification

Les types TypeScript partagés entre le front et le back ont été figés le 24/08.
C'est le document de référence quand front et back ne sont pas d'accord.

- Types partagés (côté front) : `front-end/src/types/index.ts` *(MAJ 28/08)*.
- Collection Postman : `docs/`
- Format d'échange retenu : **JWT en cookie `HttpOnly`** *(MAJ 28/08)* — tranché
  côté front. Le client HTTP `front-end/src/api/client.ts` envoie
  `credentials: "include"` sur chaque requête. Le back devra donc **poser le
  cookie** à la connexion et configurer le **CORS avec `credentials`** (origine
  explicite, pas `*`). **À confirmer explicitement côté back.**

Routes principales spécifiées : `/auth` (inscription, connexion) et `/wine`.

> **État du branchement *(MAJ 28/08)*.** La couche API typée du front
> (`front-end/src/api/`) couvre déjà `auth`, `wine`, `cave` et `profile`, mais
> **aucun écran ne l'appelle encore** : tous tournent sur les données mock
> (`front-end/src/data/wines.js`). Le branchement réel est bloqué par **5
> arbitrages contrat ↔ BDD** détaillés dans
> `front-end/docs/memo-ecarts-contrat-bdd.md` (tags vs avis, table cave
> manquante, champ `photo`, valeurs de l'enum couleur, booléen `ageVerified`).
> C'est le premier sujet à trancher en réunion (§15).

**Règle de travail pour novembre :** toute modification d'un type partagé se
décide à deux (front + back) et se commite avant d'être utilisée. C'est
exactement le désalignement qui nous a coûté la journée du 24 août.

---

## 10. Git — conventions

- Branche principale : `main`.
- Une branche par fonctionnalité : `feature/nom-de-la-fonctionnalite`.
- Passage par **Pull Request** avant merge sur `main`, avec au moins une
  relecture.
- Le dépôt est **public** : jamais de secret, jamais de `node_modules`, jamais
  de `.env` (le `.gitignore` à la racine s'en charge).

```bash
# Démarrer une nouvelle fonctionnalité proprement
git checkout main            # se placer sur la branche principale
git pull origin main         # récupérer le travail des autres AVANT de brancher
git checkout -b feature/ma-fonctionnalite
```

---

## 11. Déploiement (Hostinger)

**État au gel : rien n'est déployé.** Le serveur Hostinger est configuré et
accessible, mais aucune version de l'application n'y tourne. Il n'existe donc
pas encore d'URL de production, ni pour le front, ni pour l'API.

- Déploiement **manuel par FTP**, pas de pipeline automatisé.
- Accès FTP (hôte, utilisateur, mot de passe) : détenus par le chef de projet,
  transmis hors dépôt.
- Point à vérifier en novembre : Hostinger doit pouvoir **faire tourner un
  processus Node** pour héberger l'API NestJS. Un hébergement mutualisé
  classique ne sert que des fichiers statiques et du PHP — dans ce cas, le
  front s'y déploie sans problème, mais l'API devra aller ailleurs (VPS, ou
  offre Node dédiée). **À trancher avant la tâche 2 du sprint**, sinon la mise
  en ligne bloquera en fin de projet.

À faire avant tout déploiement : build de production, puis envoi du dossier
généré par FTP.

```bash
# Build du front (génère le dossier front/dist)
cd front
npm run build

# Build du back (génère le dossier backend/dist)
cd ../backend
npm run build
```

---

## 12. Pièges connus — lis avant de perdre une demi-journée

1. **`face-api.js` (`@vladmandic/face-api`), `tesseract.js` et `@zxing/browser`**
   sont désormais **actifs** sur la branche `front` *(MAJ 28/08)*, au service de
   la **vérification d'âge à l'inscription** : `face-api` pour l'estimation d'âge
   par webcam (`src/services/webcamAge.js`), `tesseract.js` pour l'OCR de la CNI
   (`src/services/cniOcr.js`), `@zxing/browser` pour le scan de code-barre
   (chargé à la demande dans `src/pages/Scan/`). Ces trois libs sont **lourdes** :
   surveille le poids du bundle à **chaque** build de prod et garde le chargement
   paresseux partout où c'est possible. Les modèles face-api sont versionnés dans
   `front-end/public/models/` (fichiers `.bin`).
2. **Version de Node** : si `npm install` échoue avec des erreurs
   incompréhensibles, vérifie ta version de Node avant toute autre chose.
3. **`synchronize: true`** : voir §7. Ne déploie pas la configuration
   actuelle en production telle quelle.
4. **Base vide au clone** : l'application ne fournit aucun jeu de données de
   démonstration. Il faut créer un compte et saisir des bouteilles à la main
   pour tester — sauf si quelqu'un ajoute un script de *seed* (bonne idée pour
   novembre).

---

## 13. Sprint du 4 novembre 2026 — les 3 premières tâches

L'ordre compte. La logique est d'obtenir **une boucle complète et vivante**,
même minuscule, avant d'ajouter quoi que ce soit. Tout le reste (scan, API
GrapeMinds, échanges entre utilisateurs) viendra se brancher dessus.

### Tâche 1 — Remonter l'environnement et matérialiser le schéma

Chaque membre clone le mono-repo, suit le §6, lance l'API et vérifie que les
tables se créent bien en base. Le back-end contrôle et complète les entités
TypeORM issues du schéma d'août, `utilisateur_cave` en tête.

**Critère de fin :** tous les postes démarrent le projet et voient les mêmes
tables en base.

### Tâche 2 — Authentification fonctionnelle de bout en bout

Implémenter l'inscription et la connexion côté NestJS, conformément au contrat
figé (§9), puis brancher l'écran de connexion du front sur la vraie route.

**Critère de fin :** un utilisateur créé depuis l'interface se connecte et
atteint une page protégée.

### Tâche 3 — CRUD « ma cave » en saisie manuelle

Routes d'ajout, de listage et de suppression d'une bouteille dans la cave d'un
utilisateur, branchées sur le formulaire d'ajout manuel et l'écran de liste.
**Sans scan, sans appel à GrapeMinds.**

**Critère de fin :** un utilisateur connecté ajoute une bouteille et la
retrouve dans sa cave après rechargement de la page.

---

## 14. Liens et contacts

| Ressource | Lien |
|---|---|
| Dépôt GitHub | <https://github.com/madmolf/cave-a-vins> |
| Kanban / backlog (Google Docs) | <https://docs.google.com/document/d/13HwVxXBTDOuMGc_NFUlwqpu7jy4VaB_gMywz8g5oFMg/edit> |
| Drive design (maquettes, icônes, tokens) | `<!-- lien -->` |
| API tierce GrapeMinds (référentiel des vins) | <https://grapeminds.fr/> |
| API du projet en production | Aucune — pas encore déployée (voir §11) |
| Chef de projet | Alexandre GAILLARD |

---

## 15. Checklist du premier jour

- [ ] Lire ce fichier en entier.
- [ ] Vérifier sa version de Node (§5).
- [ ] Cloner le dépôt et installer les dépendances (§6).
- [ ] Créer la base MariaDB vide et le fichier `.env` (§6, §8).
- [ ] Démarrer l'API et le front, vérifier que la page Home s'affiche.
- [ ] Ouvrir le kanban et relire les tâches du sprint (§13).
- [ ] Réunion d'équipe : trancher les points laissés ouverts au §9.

---

## Annexe — Audit de la branche `front` (28 août 2026)

Cette annexe consigne ce qui a été **vérifié dans le code** de la branche
`front` après la rédaction initiale de la fiche. Elle prime sur les mentions
antérieures en cas de contradiction.

### Ce qui est réellement en place (vérifié)

- **Front-end React 19 + Vite** complet dans `front-end/`, routé avec
  `react-router-dom` (voir `src/App.jsx`). Nom interne : **« Rich Cellar »**.
- **10 écrans codés et navigables** : `Home`, `Login`, `Cave`, `WineDetail`,
  `SearchResults`, `Wishlist`, `Account`, `Scan`, plus l'admin
  (`admin/AddWine`, `admin/AddKeyword`). Ils tournent tous sur des **données
  mock** (`src/data/wines.js`) — **aucun appel API réel** pour l'instant.
- **Couche API typée** (`src/api/` : `auth`, `wine`, `cave`, `profile`) avec un
  client `fetch` (`client.ts`) qui envoie le **cookie JWT `HttpOnly`**
  (`credentials: "include"`).
- **Vérification d'âge à l'inscription, 100 % côté client** : `AgeGate`,
  OCR CNI (`tesseract.js`), estimation par webcam (`face-api`), scan de
  code-barre (`@zxing/browser`). RGPD : **seul un booléen `ageVerified` est
  conservé**, jamais la date de naissance ni les images.
- Styles SCSS avec design tokens (`src/styles/tokens.scss`, `global.scss`).
- Outillage : `oxlint` (lint), `tsc --noEmit` (typecheck), build Vite.

### Points bloquants à trancher (issus de `front-end/docs/memo-ecarts-contrat-bdd.md`)

| # | Sujet | À décider |
|---|-------|-----------|
| 1 | Tags vs Avis | Séparer labels partagés (`/tags`) et commentaires perso (`/avis`) ? |
| 2 | **Cave** | **Créer la table de liaison utilisateur ↔ bouteilles — bloquant, et en contradiction avec le §7** |
| 3 | Profil | Ajouter `photo` à `utilisateurs` ou le retirer du contrat ; exposer `bio` ? |
| 4 | Couleur | Front s'aligne sur l'enum `rouge/blanc/rose/effervescent` — à confirmer |
| 5 | Vérif d'âge | Accepter `ageVerified` (booléen) à l'inscription + colonne dédiée |

### Équipe (d'après le mémo)

- **Front-end** : Thiziri, Salah, Loïc.
- **Back-end** : Le Z, Orian, Teddy.
- **Chef de projet** : Alexandre GAILLARD.

### Reste à faire côté front (non bloquant immédiat)

- Brancher les écrans sur la vraie API une fois les 5 points ci-dessus tranchés.
- Relier le scan `@zxing` à une recherche API réelle (aujourd'hui : mock).
- Décider du sort de l'ancien `index.html` racine (supprimé sur `main`).
