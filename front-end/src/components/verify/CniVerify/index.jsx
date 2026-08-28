import { useEffect, useRef, useState } from "react";
import { verifyCni } from "../../../services/cniOcr";

const MESSAGES = {
  unreadable: "Carte illisible. Reprenez la photo bien à plat, nette et sans reflet.",
  "invalid-mrz": "Contrôle de la carte échoué : la zone lisible (MRZ) est incohérente ou mal photographiée.",
  expired: "Cette carte d'identité est expirée.",
  minor: "Vous devez avoir 18 ans ou plus.",
  mismatch: "La date lue sur la carte ne correspond pas à la date de naissance saisie.",
};

/**
 * Vérification par CNI : image → OCR + contrôle MRZ (checksums ICAO) → expiration
 * → majorité (→ correspondance avec la date saisie si `expectedBirthDate`).
 *
 * Deux moyens d'obtenir l'image, disponibles sur PC ET mobile :
 *  - « Photographier » : caméra en direct via getUserMedia + capture (canvas).
 *  - « Depuis mes fichiers » : sélecteur de fichiers classique (sans `capture`).
 *
 * @param {object}   props
 * @param {Function} props.onBack
 * @param {(r: {birthDate: string}) => void} props.onSuccess  appelé en cas de succès.
 * @param {string}   [props.expectedBirthDate]  date à faire correspondre (inscription).
 */
export default function CniVerify({ onBack, onSuccess, expectedBirthDate }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [view, setView] = useState("choice"); // choice | camera
  const [status, setStatus] = useState("idle"); // idle | reading | error | denied
  const [message, setMessage] = useState("");

  // Ouvre la caméra en entrant dans la vue "camera", la coupe en sortant.
  useEffect(() => {
    if (view !== "camera") return;
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // caméra arrière sur mobile
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setStatus("error");
        setMessage("Impossible d'accéder à la caméra. Autorisez-la ou choisissez une image.");
        setView("choice");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [view]);

  // Contrôle commun (fichier OU photo capturée). RGPD : l'image n'est jamais conservée.
  const runVerify = async (image) => {
    setStatus("reading");
    setMessage("");
    try {
      const res = await verifyCni(image, { expectedBirthDate });
      if (res.ok) {
        onSuccess?.({ birthDate: res.birthDate });
        return;
      }
      const denied = res.reason === "minor" || res.reason === "expired" || res.reason === "mismatch";
      setStatus(denied ? "denied" : "error");
      setMessage(MESSAGES[res.reason] || "Vérification impossible.");
    } catch {
      setStatus("error");
      setMessage("Lecture impossible. Réessayez.");
    } finally {
      // Efface la photo choisie (aucune trace de la pièce d'identité).
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) runVerify(file);
  };

  // Photographie la vidéo → Blob JPEG → contrôle, puis coupe la caméra.
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    streamRef.current?.getTracks().forEach((t) => t.stop()); // libère la caméra
    setView("choice");
    canvas.toBlob((blob) => blob && runVerify(blob), "image/jpeg", 0.9);
  };

  return (
    <div className="verify">
      <button className="verify__back" onClick={onBack}>← Retour</button>
      <h2 className="verify__title">🪪 Vérifier ma CNI</h2>
      <p className="muted">
        Utilisez le <strong>recto</strong> de votre carte (nouvelle CNI, avec la
        bande de caractères en bas). Lecture et contrôle sur votre appareil ;
        l'image n'est ni envoyée ni conservée.
      </p>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />

      {status === "reading" ? (
        <p className="verify__loading">⏳ Lecture et contrôle de la carte…</p>
      ) : view === "camera" ? (
        <>
          <div className="verify__video-wrap">
            <video ref={videoRef} autoPlay playsInline muted className="verify__video verify__video--doc" />
          </div>
          <button className="btn btn--primary btn--block" onClick={capturePhoto}>📸 Prendre la photo</button>
          <button className="verify__back" onClick={() => setView("choice")}>Annuler</button>
        </>
      ) : (
        <div className="verify__methods">
          <button className="btn btn--primary btn--block" onClick={() => setView("camera")}>📷 Photographier</button>
          <button className="btn btn--ghost btn--block" onClick={() => fileRef.current?.click()}>📁 Depuis mes fichiers</button>
        </div>
      )}

      {message && (
        <p className={status === "denied" ? "verify__denied" : "verify__error"}>{message}</p>
      )}
    </div>
  );
}
