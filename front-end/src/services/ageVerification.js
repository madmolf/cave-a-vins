/**
 * Service de vérification d'âge (front-end, gratuit, local).
 * -----------------------------------------------------------------------------
 * Depuis la refonte : la vérif d'âge est liée au COMPTE (contrôlée à l'inscription
 * via CNI/webcam). Ce service ne gère plus que :
 *  - l'état « accès invité vérifié » (session sans compte),
 *  - les helpers de contrôle d'âge (majorité, âge estimé webcam).
 * `isAdult` et `isEstimatedAdult` sont réutilisés à l'inscription ET dans la modale invité.
 */

const CACHE_KEY = "cave_age_ok";
const AGE_LEGAL = 18;
// Marge de sécurité pour l'estimation webcam (approche « Challenge 25 » de Yoti :
// l'estimation est imprécise, on relève le seuil pour limiter les faux positifs).
export const AGE_WEBCAM_MIN = 20;

/** Un invité (sans compte) a-t-il déjà passé la vérif d'âge sur cette session ? */
export async function getAgeStatus() {
  return localStorage.getItem(CACHE_KEY) === "1";
}

/**
 * Marque l'accès invité comme vérifié (après CNI/webcam réussie).
 * RGPD : on ne stocke QUE ce booléen « vérifié ». Jamais la date de naissance,
 * ni la photo de la CNI, ni l'image de la webcam.
 */
export async function setAgeVerified() {
  localStorage.setItem(CACHE_KEY, "1");
}

/** Efface le statut invité (appelé au logout). */
export async function resetAgeStatus() {
  localStorage.removeItem(CACHE_KEY);
}

/** Vrai si la date de naissance correspond à une personne majeure (>= 18 ans). */
export function isAdult(birthDate) {
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= AGE_LEGAL;
}

/** Vrai si l'âge ESTIMÉ par webcam dépasse le seuil de sécurité. */
export function isEstimatedAdult(estimatedAge) {
  return estimatedAge != null && estimatedAge >= AGE_WEBCAM_MIN;
}
