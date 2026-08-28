import { lazy, Suspense, useState } from "react";
import { useApp } from "../../context/AppContext";
import "./AgeGate.scss";

// Méthodes lourdes (OCR / IA) chargées à la demande → hors du bundle principal.
const CniVerify = lazy(() => import("../verify/CniVerify"));
const WebcamVerify = lazy(() => import("../verify/WebcamVerify"));

/**
 * Modale de vérification d'âge pour l'ACCÈS INVITÉ (sans compte).
 * Uniquement CNI ou webcam — pas de date de naissance seule (trop falsifiable).
 * Ne s'affiche jamais pour un utilisateur connecté (déjà vérifié à l'inscription).
 */
export default function AgeGate() {
  const { ageConfirmed, isLoggedIn, setAgeVerified } = useApp();
  const [method, setMethod] = useState(null); // null | "cni" | "webcam"

  // Connecté → jamais ; statut inconnu (null) ou déjà vérifié → rien.
  if (isLoggedIn || ageConfirmed !== false) return null;

  const fallback = <p className="verify__loading">⏳ Chargement du module…</p>;
  const onSuccess = () => setAgeVerified();

  return (
    <div className="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">
      <div className="agegate__box">
        {method === null && (
          <div className="agegate__choose">
            <h2 id="agegate-title" className="agegate__title">Vérification de l'âge</h2>
            <p className="muted">
              La vente d'alcool est interdite aux mineurs. Pour continuer sans compte,
              vérifiez votre majorité :
            </p>

            <div className="agegate__methods">
              <button className="method-card" onClick={() => setMethod("cni")}>
                <span className="method-card__icon">🪪</span>
                <span className="method-card__label">Ma carte d'identité</span>
                <span className="method-card__desc muted">Lecture + contrôle de la date</span>
              </button>
              <button className="method-card" onClick={() => setMethod("webcam")}>
                <span className="method-card__icon">📷</span>
                <span className="method-card__label">Ma webcam</span>
                <span className="method-card__desc muted">Estimation d'âge par la caméra</span>
              </button>
            </div>

            <p className="agegate__legal muted">
              Traitement 100 % local · aucune donnée envoyée · à consommer avec modération.
            </p>
          </div>
        )}

        {method === "cni" && (
          <Suspense fallback={fallback}>
            <CniVerify onBack={() => setMethod(null)} onSuccess={onSuccess} />
          </Suspense>
        )}
        {method === "webcam" && (
          <Suspense fallback={fallback}>
            <WebcamVerify onBack={() => setMethod(null)} onSuccess={onSuccess} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
