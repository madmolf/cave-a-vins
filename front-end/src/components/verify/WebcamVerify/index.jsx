import { useEffect, useRef, useState } from "react";
import { estimateAge, loadModels } from "../../../services/webcamAge";
import { isEstimatedAdult } from "../../../services/ageVerification";

/**
 * Vérification par webcam : estimation d'âge (face-api.js, en local). Confirme la
 * MAJORITÉ uniquement (ne peut pas lire une date de naissance précise).
 *
 * @param {object}   props
 * @param {Function} props.onBack
 * @param {(r: {estimatedAge: number}) => void} props.onSuccess  appelé si majeur.
 */
export default function WebcamVerify({ onBack, onSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("init"); // init | ready | analyzing | error | retry
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        loadModels(); // précharge les modèles pendant l'ouverture caméra
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus("ready");
      } catch {
        setStatus("error");
        setMessage("Impossible d'accéder à la caméra. Autorisez-la ou utilisez la CNI.");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const analyze = async () => {
    setStatus("analyzing");
    setMessage("");
    try {
      const age = await estimateAge(videoRef.current);
      if (isEstimatedAdult(age)) {
        onSuccess?.({ estimatedAge: age });
        return;
      }
      setMessage(
        age == null
          ? "Aucun visage détecté. Placez-vous bien face à la caméra."
          : `Âge estimé trop bas (~${age} ans). Essayez la CNI.`
      );
      setStatus("retry");
    } catch {
      setStatus("error");
      setMessage("Analyse impossible. Réessayez ou utilisez la CNI.");
    }
  };

  return (
    <div className="verify">
      <button className="verify__back" onClick={onBack}>← Retour</button>
      <h2 className="verify__title">📷 Vérifier par webcam</h2>
      <p className="muted">
        Placez-vous face à la caméra. L'estimation d'âge se fait sur votre
        appareil ; aucune image n'est envoyée ni conservée.
      </p>

      <div className="verify__video-wrap">
        <video ref={videoRef} autoPlay playsInline muted className="verify__video" />
      </div>

      {status === "error" ? (
        <p className="verify__error">{message}</p>
      ) : (
        <>
          <button
            className="btn btn--primary btn--block"
            onClick={analyze}
            disabled={status === "init" || status === "analyzing"}
          >
            {status === "analyzing" ? "⏳ Analyse…" : status === "init" ? "Démarrage caméra…" : "Analyser mon âge"}
          </button>
          {message && <p className="verify__denied">{message}</p>}
        </>
      )}
    </div>
  );
}
