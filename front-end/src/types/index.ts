/**
 * Types du domaine — Rich Cellar.
 * Section 1 : entités calquées sur le schéma BDD (u838316096_Dwwm_Cave_*).
 * Section 2 : DTO des endpoints (contrat d'API).
 *
 * ⚠️ Plusieurs ÉCARTS contrat d'API ↔ schéma BDD sont annotés « MISMATCH » :
 * à trancher avec les équipes back / gestion de projet.
 */

/* =========================================================================
   1. ENTITÉS (schéma BDD)
   ========================================================================= */

/** Table `regions` */
export interface Region {
  id_region: number;
  nom: string;
  pays: string;
}

/** Table `domaines` */
export interface Domaine {
  id_domaine: number;
  nom: string;
  id_region: number;
  site_web: string;
}

/** Table `cepages` */
export interface Cepage {
  id_cepages: number;
  libelle: string;
}

/** Table `tags` — libellés PARTAGÉS (pas de contenu perso ni d'utilisateur ici). */
export interface Tag {
  id_tag: number;
  libelle: string;
}

/** couleur : enum('rouge','blanc','rose','effervescent') */
export type WineColor = "rouge" | "blanc" | "rose" | "effervescent";

/** Table `vins` */
export interface Wine {
  id_vin: number;
  nom: string;
  id_domaine: number;
  id_region: number;
  millesime: number; // smallint
  couleur: WineColor; // enum
  prix_moyen: number; // decimal(6,2)

  // Champs de jointure éventuels (si l'API enrichit la réponse) :
  domaine?: string; // domaines.nom
  region?: string; // regions.nom
  cepages?: string[]; // via vin_cepages
}

/** Table `utilisateurs` (le hash du mot de passe n'est jamais exposé au front). */
export interface User {
  id_utilisateur: number;
  pseudo: string;
  email: string;
  date_inscription: string; // datetime ISO
  bio: string;
}

/** Table `avis` (note + commentaire d'un utilisateur sur un vin). */
export interface Avis {
  id_avis: number;
  id_utilisateur: number;
  id_vin: number;
  note: number; // decimal(3,1)
  commentaire: string;
  date_avis: string; // datetime ISO
}

/** Table `photos_avis` */
export interface PhotoAvis {
  id_photo: number;
  id_avis: number;
  url: string;
}

/* =========================================================================
   2. DTO DES ENDPOINTS (contrat d'API)
   ========================================================================= */

// ---------- Authentification ----------
// FORMAT D'ÉCHANGE FIGÉ = JWT en cookie HttpOnly (pas de token en clair côté JS).
//  • login  → le back répond `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Lax`.
//             Le JWT n'est JAMAIS dans le corps ni lisible en JS (protège du XSS).
//  • requêtes authentifiées → le cookie repart tout seul via `credentials:"include"`
//             (voir api/client.ts). AUCUN header Authorization/Bearer côté front.
//  • logout → `POST /api/auth/logout` : seul le back peut effacer un cookie HttpOnly.
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

/**
 * Corps de la réponse /api/auth/login.
 * Le JWT est dans le cookie HttpOnly (voir ci-dessus), PAS ici : on ne renvoie
 * que de quoi identifier l'utilisateur côté front (routes `/api/:user/…`).
 */
export interface LoginResponse {
  userId: number; // = utilisateurs.id_utilisateur
}

// ---------- Tags ----------
// MISMATCH : le contrat manipule des tags PERSONNELS { userId, content }, or le
// schéma modélise `tags` comme des libellés partagés (id_tag, libelle) liés par
// `vin_tags`, sans utilisateur ni contenu. Le « commentaire perso » correspond
// plutôt à la table `avis`. → à réconcilier côté back.
export interface NewTagPayload {
  userId: number;
  content: string;
}
export interface UpdateTagPayload {
  userId: number;
  tagId: number;
  content: string;
}
export interface DeleteTagPayload {
  userId: number;
  tagId: number;
}

// ---------- Profil ----------
// MISMATCH : le contrat renvoie `photo`, absente de `utilisateurs` (qui a `bio`).
// Les photos n'existent que dans `photos_avis`. → champ à clarifier.
export interface Profile {
  userId: number;
  pseudo: string;
  email: string;
  photo: string;
}
export type UpdateProfilePayload = { userId: number } & Partial<
  Pick<Profile, "pseudo" | "email" | "photo">
>;

// ---------- Cave personnelle ----------
// MISMATCH : aucune table ne relie un utilisateur aux bouteilles qu'il possède
// (pas de table `cave`/`possession`). Source de /api/:user/cave à définir.
export interface Cave {
  preferedWine: Wine[];
}

// ---------- Générique ----------
export interface MessageResponse {
  message: string;
}
