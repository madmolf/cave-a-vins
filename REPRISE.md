# REPRISE.md — Cave à Vins

> **Fiche de reprise après gel du projet.**
> Dernière mise à jour : **24 août 2026** (dernier jour avant le départ en stage de l'équipe).
> Reprise du développement : **mardi 4 novembre 2026**.
> Rédigé par : Alexandre GAILLARD (chef de projet).

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
| Page **Home** | Codée et dynamique | Branche front (voir §7) |
| 9 autres écrans | **Maquette seulement**, pas de code | — |
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

1. **Intégration du scanner `@zxing/browser`** (REC-FRO-02) — l'interface est
   prête, le branchement caméra reste à faire.
2. **Cache et fallback de l'API GrapeMinds** (REC-BAC-04) — trop de logique
   métier, à traiter en Phase 1 post-stage.
3. **Traduction anglaise** (REC-DES-03) — non bloquant pour le MVP.

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
- Front : `<!-- À COMPLÉTER : port du serveur de dev Vite, 5173 par défaut -->`

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

- Types partagés : `<!-- chemin exact du fichier types.ts partagé -->`
- Collection Postman : `docs/`
- Format d'échange retenu : `<!-- JWT en header Authorization ou cookie httpOnly — trancher et noter ici -->`

Routes principales spécifiées : `/auth` (inscription, connexion) et `/wine`.

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

1. **`face-api.js` et `tesseract.js`** ont été isolés en *lazy-load* et
   temporairement désactivés côté front pour obtenir un build de production
   léger et sans erreur. Si tu les réactives, surveille immédiatement le poids
   du bundle.
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
