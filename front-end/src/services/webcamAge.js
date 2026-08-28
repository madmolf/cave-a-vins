/**
 * Estimation d'âge par webcam via face-api.js (TensorFlow.js), 100 % en local.
 * Aucune image n'est envoyée à un serveur (RGPD-friendly + gratuit).
 * Modèles chargés depuis /public/models (voir README modèles).
 */
import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "/models";
let modelsPromise = null;

/** Charge les modèles une seule fois (détection de visage + âge/genre). */
export function loadModels() {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
  }
  return modelsPromise;
}

/**
 * Estime l'âge de la personne visible dans l'élément <video>.
 * @param {HTMLVideoElement} video
 * @returns {Promise<number|null>} âge estimé, ou null si aucun visage détecté.
 */
export async function estimateAge(video) {
  await loadModels();
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withAgeAndGender();
  return detection ? Math.round(detection.age) : null;
}
