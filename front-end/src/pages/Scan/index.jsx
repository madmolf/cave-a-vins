import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWineByBarcode } from "../../data/wines";
import "./Scan.scss";

/**
 * Scan de code-barre : décodage en direct via @zxing/browser (chargé à la
 * demande), avec saisie manuelle de secours. Code connu → fiche cuvée ;
 * code inconnu → proposition d'ajout (page admin).
 */
export default function Scan() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const controlsRef = useRef(null); // contrôles du scanner zxing (pour l'arrêt)
  const [status, setStatus] = useState("starting"); // starting | scanning | denied | result
  const [manual, setManual] = useState("");
  const [detected, setDetected] = useState(null); // { code, wine }

  // Démarre la caméra + le décodage en continu.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Lazy-load : la lib n'est chargée que sur cette page.
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (cancelled) return;
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result) handleCode(result.getText());
          }
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStatus("scanning");
      } catch {
        setStatus("denied");
      }
    })();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = () => controlsRef.current?.stop();

  const handleCode = (code) => {
    stopScanner();
    setDetected({ code, wine: getWineByBarcode(code) });
    setStatus("result");
  };

  const submitManual = (e) => {
    e.preventDefault();
    if (manual.trim()) handleCode(manual.trim());
  };

  return (
    <div className="scan">
      <div className="scan__viewfinder">
        <video ref={videoRef} className="scan__video" autoPlay playsInline muted />
        {status !== "result" && (
          <>
            <div className="scan__frame" />
            <p className="scan__hint">
              {status === "denied"
                ? "Caméra indisponible — utilisez la saisie manuelle."
                : "Alignez le code-barre dans le cadre"}
            </p>
          </>
        )}
      </div>

      <div className="container scan__panel">
        {status === "result" && detected ? (
          <div className="scan__result">
            <p className="scan__code">Code détecté : <strong>{detected.code}</strong></p>
            {detected.wine ? (
              <>
                <p>Cuvée reconnue : <strong>{detected.wine.nom}</strong></p>
                <button className="btn btn--primary btn--block" onClick={() => navigate(`/wine/${detected.wine.id}`)}>
                  Voir la fiche
                </button>
              </>
            ) : (
              <>
                <p className="muted">Ce vin ne figure pas encore dans notre base.</p>
                <button className="btn btn--primary btn--block" onClick={() => navigate("/admin/wine")}>
                  L'ajouter à la base
                </button>
              </>
            )}
            <button className="btn btn--ghost btn--block" onClick={() => window.location.reload()}>
              Scanner un autre code
            </button>
          </div>
        ) : (
          <form className="scan__manual" onSubmit={submitManual}>
            <p className="scan__manual-label muted">Saisie manuelle (code-barre)</p>
            <div className="scan__manual-row">
              <input
                inputMode="numeric"
                placeholder="ex. 3760040000019"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
              <button type="submit" className="btn btn--primary">Valider</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
