# Specifications techniques de l'API Cave a vin

Document base sur l'implementation actuelle du backend.

## Connexion

- Base URL locale : `http://localhost:3000`
- Format des donnees : `application/json`
- CORS : autorise avec credentials.
- Pour les requetes authentifiees, le frontend doit envoyer les cookies :
  `fetch(url, { credentials: 'include' })` ou `axios` avec `withCredentials: true`.
- Le cookie d'authentification s'appelle `token` et est HttpOnly.
- Les donnees sont actuellement stockees en memoire et sont perdues au redemarrage du serveur.

## Authentification

| Methode | Route                | Auth | Corps JSON                                | Reponse actuelle                                         |
| ------- | -------------------- | ---- | ----------------------------------------- | -------------------------------------------------------- |
| POST    | `/api/auth/register` | Non  | `{ "email": string, "password": string }` | `{ "message": "User created" }`                          |
| POST    | `/api/auth/login`    | Non  | `{ "email": string, "password": string }` | `{ "userId": number, "token": string }` + cookie `token` |

Notes :

- Un email deja utilise provoque une erreur `Email already exists`.
- Un identifiant inconnu ou un mauvais mot de passe provoque HTTP `401 Unauthorized`.
- Le cookie est configure `HttpOnly`, `Secure` et `SameSite=Strict`.

## Vins

### Modele `Vin`

| Champ        | Type   |        Obligatoire | Description / valeurs                      |
| ------------ | ------ | -----------------: | ------------------------------------------ |
| `id_vin`     | number | Reponse uniquement | Identifiant genere automatiquement         |
| `nom`        | string |  Oui a la creation | Nom du vin                                 |
| `id_domaine` | number |                Non | Identifiant du domaine                     |
| `id_region`  | number |                Non | Identifiant de la region                   |
| `millesime`  | number |                Non | Annee du millesime                         |
| `couleur`    | string |                Non | `rouge`, `blanc`, `rose` ou `effervescent` |
| `cepage`     | string |                Non | Cepage du vin                              |
| `prix_moyen` | number |                Non | Prix moyen                                 |

### Routes

| Methode | Route              | Auth          | Corps JSON                         | Reponse actuelle                                                                                                                            |
| ------- | ------------------ | ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| POST    | `/api/wine`        | Non           | Champs de creation du modele `Vin` | Objet vin cree, avec `id_vin`                                                                                                               |
| GET     | `/api/wine`        | Non           | Aucun                              | Tableau de vins                                                                                                                             |
| GET     | `/api/wine/:param` | Cookie requis | Aucun                              | Si `:param` est numerique : objet vin ou `undefined`. Sinon : tableau des vins dont le nom contient la recherche, sans distinction de casse |
| PUT     | `/api/wine/:id`    | Non           | Champs partiels du modele `Vin`    | Objet vin modifie, ou `null` si introuvable                                                                                                 |
| DELETE  | `/api/wine/:id`    | Non           | Aucun                              | Objet vin supprime, ou `null` si introuvable                                                                                                |

Attention : `GET /api/wine/:param` renvoie `{ "error": "Unauthorized" }` si le cookie manque ou est invalide.

## Tags / commentaires sur un vin

Modele de tag :

```json
{
  "id_tag": 1,
  "id_vin": 1,
  "id_utilisateur": 2,
  "content": "A boire avec une viande rouge"
}
```

| Methode | Route                | Auth          | Corps JSON                                                 | Reponse actuelle                                                               |
| ------- | -------------------- | ------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| GET     | `/api/wine/:id/tags` | Cookie requis | Aucun                                                      | Tableau de tags du vin                                                         |
| POST    | `/api/wine/:id/tags` | Cookie requis | `{ "userId": number, "content": string }`                  | `{ "message": "Tag added", "tag": Tag }`                                       |
| PUT     | `/api/wine/:id/tags` | Cookie requis | `{ "userId": number, "tagId": number, "content": string }` | `{ "message": "Tag updated", "tag": Tag }` ou `{ "message": "Tag not found" }` |
| DELETE  | `/api/wine/:id/tags` | Cookie requis | `{ "userId": number, "tagId": number }`                    | `{ "message": "Tag deleted" }` ou `{ "message": "Tag not found" }`             |

Si le cookie est absent ou invalide, les routes de tags renvoient `{ "error": "Unauthorized" }`.

## Profil utilisateur

L'utilisateur est determine a partir du cookie `token`; aucun identifiant n'est necessaire dans l'URL.

| Methode | Route               | Auth          | Corps JSON                                                | Reponse actuelle                      |
| ------- | ------------------- | ------------- | --------------------------------------------------------- | ------------------------------------- | -------------------------------------- | ------- |
| GET     | `/api/user/profile` | Cookie requis | Aucun                                                     | `{ "userId": number, "pseudo": string | null, "email": string, "photo": string | null }` |
| PUT     | `/api/user/profile` | Cookie requis | `{ "pseudo"?: string, "photo"?: string, "bio"?: string }` | `{ "message": "Profile updated" }`    |
| GET     | `/api/user/cave`    | Cookie requis | Aucun                                                     | `{ "PreferedWine": any[] }`           |

Erreurs profil : `{ "error": "Unauthorized" }`, `{ "error": "Forbidden" }` ou `{ "error": "Not found" }`.

## Routes utilisateur generiques

Ces routes sont presentes mais leur service renvoie actuellement des chaines de placeholder. Elles ne doivent pas etre considerees comme fonctionnelles.

| Methode | Route       | Corps JSON                                                | Reponse actuelle                     |
| ------- | ----------- | --------------------------------------------------------- | ------------------------------------ |
| POST    | `/user`     | `{ "name": string, "email": string, "password": string }` | `"This action adds a new user"`      |
| GET     | `/user`     | Aucun                                                     | `"This action returns all user"`     |
| GET     | `/user/:id` | Aucun                                                     | `"This action returns a #<id> user"` |
| PATCH   | `/user/:id` | Champs partiels du corps utilisateur                      | `"This action updates a #<id> user"` |
| DELETE  | `/user/:id` | Aucun                                                     | `"This action removes a #<id> user"` |

## Exemple frontend

```js
const response = await fetch("http://localhost:3000/api/wine", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nom: "Chateau Exemple",
    millesime: 2020,
    couleur: "rouge",
    cepage: "Merlot",
    prix_moyen: 18.5,
  }),
});

const data = await response.json();
```

## Points a clarifier avant integration frontend

- Ajouter une vraie validation des DTO (`nom`, email, types et valeurs autorisees).
- Retourner des codes HTTP explicites pour les erreurs des routes vins, tags et profil au lieu d'objets d'erreur HTTP 200.
- Desactiver `Secure` en developpement local ou utiliser HTTPS, sinon le cookie peut ne pas etre stocke sur `http://localhost`.
- Remplacer `any` et les reponses `undefined` par des contrats stables.
- Persister les utilisateurs, vins et tags dans une base de donnees.
- Harmoniser le nom `PreferedWine`, probablement a renommer en `preferredWines`.
