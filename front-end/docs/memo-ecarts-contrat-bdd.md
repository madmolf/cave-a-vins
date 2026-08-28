# Mémo — Écarts contrat d'API ↔ schéma BDD

**De :** équipe Front-End (Thiziri, Salah, Loïc)
**À :** équipe Back-End (Le Z, Orian, Teddy) — cc Alexandre G.
**Objet :** 5 points à aligner entre la couche API, le schéma BDD et la vérif d'âge
**Projet :** Rich Cellar

---

En intégrant le contrat d'API et le schéma BDD (`u838316096_Dwwm_Cave_*`) côté front (TypeScript),
on a relevé **5 points** à trancher. Ils bloquent un branchement propre de la **cave**, des
**tags** et de l'**inscription**. On liste ci-dessous chaque point avec une proposition, pour décision de votre côté.

---

## 1. Tags : personnels (contrat) vs partagés (schéma)

- **Contrat d'API** : `POST/PUT/DELETE /api/wine/:id/tags` avec `{ userId, content }` → un tag
  **personnel** avec du texte libre, rattaché à un utilisateur.
- **Schéma BDD** : `tags (id_tag, libelle)` = libellés **partagés**, reliés aux vins par `vin_tags (id_vin, id_tag)`.
  → **pas de `userId`, pas de champ `content`.**
- **Impact** : impossible d'implémenter la création/édition d'un tag personnel telle que décrite dans le contrat.
- **Piste** : le « commentaire perso » du contrat correspond en réalité à la table **`avis`**
  (`id_utilisateur`, `id_vin`, `note`, `commentaire`).

> **Décision attendue :** clarifier la distinction **tags partagés** (labels) vs **avis** (note + commentaire perso).
> Faut-il deux jeux d'endpoints distincts (`/tags` pour les labels, `/avis` pour les commentaires) ?

---

## 2. Cave personnelle : aucune table de possession

- **Contrat d'API** : `GET /api/:user/cave` renvoie les bouteilles de la cave de l'utilisateur.
- **Schéma BDD** : **aucune table ne relie un utilisateur aux bouteilles qu'il possède**
  (pas de table `cave` / `possession` / `user_vins` avec quantité, date d'ajout, statut « à l'échange », notes).
- **Impact** : la fonctionnalité **cœur** de l'app (« ma cave ») n'a pas de source de données.
- **Rappel** : le point d'étape mentionnait explicitement une table de liaison Cave ↔ Utilisateur
  avec quantités, statut d'échange, date d'ajout et notes.

> **Décision attendue :** ajouter une table de liaison, p. ex.
> `caves (id_utilisateur, id_vin, quantite, statut_echange, date_ajout, note_perso)`.
> Sans elle, `/api/:user/cave` ne peut pas être implémenté.

---

## 3. Profil : champ `photo` absent de `utilisateurs`

- **Contrat d'API** : `GET /api/:user/profile` renvoie `{ userId, pseudo, email, photo }`.
- **Schéma BDD** : `utilisateurs (id_utilisateur, pseudo, email, mot_de_passe_hash, date_inscription, bio)`
  → **pas de champ `photo`** (il y a `bio`). Les photos n'existent que dans `photos_avis`.
- **Impact** : le front ne peut pas afficher d'avatar de profil ; et `bio` n'est pas dans le contrat.

> **Décision attendue :** ajouter `photo` (ou `avatar_url`) à `utilisateurs`, **ou** retirer `photo` du contrat.
> Exposer `bio` dans la réponse profil ?

---

## 4. Couleur du vin : valeurs de l'enum

- **Schéma BDD** : `vins.couleur ENUM('rouge','blanc','rose','effervescent')`.
- **Front (mock actuel)** : utilise `rosé` et `pétillant`.
- **Impact** : mineur, mais nécessite d'harmoniser les valeurs (et l'affichage : `rose` → « Rosé »,
  `effervescent` → « Pétillant/Effervescent »).

> **Décision attendue :** on s'aligne sur l'enum du schéma (`rose`, `effervescent`) côté front — **OK pour vous ?**

---

## 5. Vérification d'âge : booléen `ageVerified` manquant

- **Contexte** : la vérif d'âge se fait désormais **à l'inscription**, côté client (CNI ou webcam).
  Pour respecter le **RGPD**, le front ne stocke ni la date de naissance, ni la photo de la CNI, ni
  l'image webcam — **uniquement le fait que la personne a été vérifiée majeure** (un booléen).
- **Manque côté back** :
  - `POST /api/auth/register` ne prévoit que `{ email, password }` → il faut accepter en plus
    **`ageVerified: true`**.
  - La table `utilisateurs` n'a **aucune colonne** pour mémoriser ce fait.
- **Impact** : sans ça, impossible de savoir qu'un compte est vérifié → la vérif serait redemandée
  ou contournable.

> **Décision attendue :** accepter `ageVerified` (booléen) à l'inscription et ajouter une colonne
> à `utilisateurs`, p. ex. `age_verifie TINYINT(1) NOT NULL DEFAULT 0`. **On n'envoie jamais la date
> ni l'image**, seulement ce booléen.

---

## Récapitulatif des décisions à prendre

| # | Sujet | Décision attendue |
|---|-------|-------------------|
| 1 | Tags vs Avis | Séparer labels partagés (`/tags`) et commentaires perso (`/avis`) ? |
| 2 | Cave | Créer la table de liaison utilisateur ↔ bouteilles (bloquant) |
| 3 | Profil | Ajouter `photo` à `utilisateurs` ou retirer du contrat ; exposer `bio` ? |
| 4 | Couleur | Front s'aligne sur `rouge/blanc/rose/effervescent` — à confirmer |
| 5 | Vérif d'âge | Accepter `ageVerified` (booléen) à l'inscription + colonne dans `utilisateurs` |

Côté front, la couche API typée est déjà prête ; dès que ces points sont tranchés, on ajuste les types
et on branche les écrans. Merci !
