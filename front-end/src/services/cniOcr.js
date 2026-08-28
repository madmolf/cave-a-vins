/**
 * Lecture de la date de naissance sur une CNI via Tesseract.js (OCR), en local.
 * On n'extrait que la date de naissance (pas de stockage de la pièce).
 * Gratuit, aucune image envoyée à un serveur.
 */
import Tesseract from "tesseract.js";
import { extractMrzLines, parseTD1 } from "./mrz";
import { isAdult } from "./ageVerification";

/**
 * Effectue l'OCR d'une image de CNI et tente d'en extraire la date de naissance.
 * @param {File|Blob|string} image fichier image (ou dataURL)
 * @returns {Promise<{birthDate: string|null, rawText: string}>} date ISO AAAA-MM-JJ
 */
export async function readBirthDate(image) {
  const { data } = await Tesseract.recognize(image, "eng"); // chiffres : "eng" suffit
  return { birthDate: parseBirthDate(data.text), rawText: data.text };
}

/**
 * Cherche une date au format JJ MM AAAA (séparateurs . / - ou espace).
 * Sur une CNI française, la date de naissance est la 1re date plausible.
 */
/**
 * Contrôle complet d'une CNI : OCR → lecture MRZ → validation des checksums →
 * expiration → majorité. Retourne un verdict unifié.
 *
 * @param {File|Blob|string} image
 * @param {{ expectedBirthDate?: string }} [options] si `expectedBirthDate` est
 *        fourni (inscription), la date lue sur la carte doit correspondre.
 * @returns {Promise<{
 *   ok: boolean,
 *   reason?: "unreadable"|"invalid-mrz"|"expired"|"minor"|"mismatch",
 *   birthDate?: string,
 *   authenticity: "mrz-valid"|"unchecked",
 *   checks?: object
 * }>}
 */
export async function verifyCni(image, { expectedBirthDate } = {}) {
  const { data } = await Tesseract.recognize(image, "eng");

  // --- HOOK API-READY (prestataire certifié, à activer si compte dispo) ---
  // Ex. Ubble / Datakeen : envoi de l'image, contrôle hologramme/puce, retour verdict.
  // const providerResult = await fetch("/api/cni-verification", { method: "POST", ... });
  // if (providerResult) return providerResult;

  const lines = extractMrzLines(data.text);
  const mrz = lines ? parseTD1(lines) : null;

  let birthDate;
  let authenticity;
  let checks;

  if (mrz) {
    // MRZ lue : on contrôle les chiffres de contrôle (détecte falsifications/erreurs).
    if (!mrz.checks.all) {
      return { ok: false, reason: "invalid-mrz", authenticity: "unchecked", checks: mrz.checks };
    }
    if (new Date(mrz.expiryDate) < new Date()) {
      return { ok: false, reason: "expired", authenticity: "mrz-valid", checks: mrz.checks };
    }
    birthDate = mrz.birthDate;
    authenticity = "mrz-valid";
    checks = mrz.checks;
  } else {
    // Pas de MRZ exploitable → repli : simple lecture de date, sans contrôle d'authenticité.
    birthDate = parseBirthDate(data.text);
    if (!birthDate) return { ok: false, reason: "unreadable", authenticity: "unchecked" };
    authenticity = "unchecked";
  }

  if (!isAdult(birthDate)) {
    return { ok: false, reason: "minor", birthDate, authenticity, checks };
  }
  // Inscription : la date lue doit correspondre à celle saisie par l'utilisateur.
  if (expectedBirthDate && birthDate !== expectedBirthDate) {
    return { ok: false, reason: "mismatch", birthDate, authenticity, checks };
  }
  return { ok: true, birthDate, authenticity, checks };
}

export function parseBirthDate(text) {
  const re = /(\d{2})[.\/\- ](\d{2})[.\/\- ](\d{4})/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    const [, d, m, y] = match;
    const day = +d;
    const month = +m;
    const year = +y;
    const now = new Date().getFullYear();
    // Filtre les faux positifs (dates de délivrance, numéros…)
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= now) {
      return `${year}-${m}-${d}`; // ISO AAAA-MM-JJ (format CNI = JJ.MM.AAAA)
    }
  }
  return null;
}
