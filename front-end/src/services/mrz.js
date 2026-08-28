/**
 * Lecture et contrôle de la MRZ (Machine Readable Zone) d'une carte d'identité.
 * Format TD1 (ICAO 9303) = nouvelle CNI française 2021 + cartes d'identité UE :
 * 3 lignes de 30 caractères. On valide les chiffres de contrôle (checksums),
 * exactement comme le fait le premier étage d'une vérif d'identité professionnelle.
 *
 * 100 % local, aucune dépendance, aucun coût.
 */

/** Valeur d'un caractère MRZ : 0-9 → 0-9, A-Z → 10-35, '<' → 0. */
export function charValue(c) {
  if (c >= "0" && c <= "9") return c.charCodeAt(0) - 48;
  if (c >= "A" && c <= "Z") return c.charCodeAt(0) - 55; // A=10 … Z=35
  if (c === "<") return 0;
  return -1; // caractère invalide
}

/** Chiffre de contrôle ICAO (pondération 7-3-1 répétée). */
export function checkDigit(str) {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const v = charValue(str[i]);
    if (v < 0) return null;
    sum += v * weights[i % 3];
  }
  return sum % 10;
}

/** Convertit AAMMJJ en date ISO. isBirth : gère le siècle (naissance vs expiration). */
function yymmddToISO(s, isBirth) {
  const yy = parseInt(s.slice(0, 2), 10);
  const mm = s.slice(2, 4);
  const dd = s.slice(4, 6);
  const nowYY = new Date().getFullYear() % 100;
  const century = isBirth ? (yy > nowYY ? 1900 : 2000) : 2000;
  return `${century + yy}-${mm}-${dd}`;
}

/**
 * Parse et contrôle une MRZ TD1 (3 lignes de 30 caractères).
 * @param {string[]} lines
 * @returns {null | {
 *   documentNumber, sex, nationality, birthDate, expiryDate,
 *   checks: { documentNumber, birth, expiry, composite, all }
 * }}
 */
export function parseTD1(lines) {
  if (!Array.isArray(lines) || lines.length < 2) return null;
  const [l1, l2] = lines;
  if (!l1 || !l2 || l1.length !== 30 || l2.length !== 30) return null;

  const documentNumber = l1.slice(5, 14);
  const documentNumberCheck = l1[14];
  const birth = l2.slice(0, 6);
  const birthCheck = l2[6];
  const sex = l2[7];
  const expiry = l2.slice(8, 14);
  const expiryCheck = l2[14];
  const nationality = l2.slice(15, 18);
  const compositeCheck = l2[29];

  // Champs entrant dans le contrôle composite (ICAO 9303 TD1)
  const compositeInput =
    l1.slice(5, 30) + l2.slice(0, 7) + l2.slice(8, 15) + l2.slice(18, 29);

  const eq = (computed, expected) => computed !== null && String(computed) === expected;
  const checks = {
    documentNumber: eq(checkDigit(documentNumber), documentNumberCheck),
    birth: eq(checkDigit(birth), birthCheck),
    expiry: eq(checkDigit(expiry), expiryCheck),
    composite: eq(checkDigit(compositeInput), compositeCheck),
  };
  checks.all = checks.documentNumber && checks.birth && checks.expiry && checks.composite;

  return {
    documentNumber: documentNumber.replace(/</g, ""),
    sex,
    nationality,
    birthDate: yymmddToISO(birth, true),
    expiryDate: yymmddToISO(expiry, false),
    checks,
  };
}

/**
 * Extrait des lignes candidates de MRZ depuis un texte OCR bruité.
 * On nettoie (majuscules, charset MRZ), on garde les lignes de ~30 caractères.
 */
export function extractMrzLines(ocrText) {
  const candidates = ocrText
    .split(/\r?\n/)
    .map((line) => line.toUpperCase().replace(/\s/g, "").replace(/[^A-Z0-9<]/g, ""))
    .filter((line) => line.length >= 26 && line.length <= 34 && line.includes("<"));

  if (candidates.length < 2) return null;

  // On prend les 3 dernières lignes MRZ, normalisées à 30 caractères.
  return candidates
    .slice(-3)
    .map((line) => (line.length > 30 ? line.slice(0, 30) : line.padEnd(30, "<")));
}
