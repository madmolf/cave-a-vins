import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { isAdult } from "../../services/ageVerification";
import "./Login.scss";

// Vérif d'âge (OCR / IA) chargée à la demande, uniquement à l'inscription.
const CniVerify = lazy(() => import("../../components/verify/CniVerify"));
const WebcamVerify = lazy(() => import("../../components/verify/WebcamVerify"));

export default function Login() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState("form"); // form | method | cni | webcam (inscription)
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const submitLogin = (e) => {
    e.preventDefault();
    login(email || "demo@cave.fr"); // mock : à brancher sur le back-end
    navigate("/");
  };

  const submitRegisterForm = (e) => {
    e.preventDefault();
    setError("");
    if (!birthDate || !isAdult(birthDate)) {
      setError("Vous devez avoir 18 ans ou plus pour créer un compte.");
      return;
    }
    setStep("method"); // → vérification obligatoire (CNI ou webcam)
  };

  const completeRegister = () => {
    register(email || "demo@cave.fr"); // compte créé = vérifié majeur
    navigate("/");
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setStep("form");
    setError("");
  };

  // --- Étapes de vérification de l'inscription ---
  const fallback = <p className="verify__loading">⏳ Chargement du module…</p>;
  if (mode === "register" && step === "cni") {
    return (
      <div className="login container">
        <Suspense fallback={fallback}>
          <CniVerify
            expectedBirthDate={birthDate}
            onBack={() => setStep("method")}
            onSuccess={completeRegister}
          />
        </Suspense>
      </div>
    );
  }
  if (mode === "register" && step === "webcam") {
    return (
      <div className="login container">
        <Suspense fallback={fallback}>
          <WebcamVerify onBack={() => setStep("method")} onSuccess={completeRegister} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="login container">
      <div className="login__brand">
        <span className="login__mark">🍷</span>
        <h1>{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
        <p className="muted">Accédez à votre cave personnelle.</p>
      </div>

      {/* --- Connexion --- */}
      {mode === "login" && (
        <form className="login__form stack" onSubmit={submitLogin}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Mot de passe</span>
            <input type="password" placeholder="••••••••" autoComplete="current-password" />
          </label>
          <button type="submit" className="btn btn--primary btn--block">Se connecter</button>
        </form>
      )}

      {/* --- Inscription : formulaire --- */}
      {mode === "register" && step === "form" && (
        <form className="login__form stack" onSubmit={submitRegisterForm}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Mot de passe</span>
            <input type="password" placeholder="••••••••" autoComplete="new-password" />
          </label>
          <label className="field">
            <span>Date de naissance</span>
            <input
              type="date"
              max={today}
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setError("");
              }}
              required
            />
          </label>
          {error && <p className="verify__denied">{error}</p>}
          <button type="submit" className="btn btn--primary btn--block">Continuer</button>
          <p className="login__note muted">
            Une vérification (carte d'identité ou webcam) confirmera votre âge à l'étape suivante.
          </p>
        </form>
      )}

      {/* --- Inscription : choix de la méthode de vérification --- */}
      {mode === "register" && step === "method" && (
        <div className="login__verify">
          <p className="muted">Confirmez votre majorité pour finaliser l'inscription :</p>
          <div className="login__methods">
            <button className="method-card" onClick={() => setStep("cni")}>
              <span className="method-card__icon">🪪</span>
              <span className="method-card__label">Ma carte d'identité</span>
              <span className="method-card__desc muted">Doit correspondre à la date saisie</span>
            </button>
            <button className="method-card" onClick={() => setStep("webcam")}>
              <span className="method-card__icon">📷</span>
              <span className="method-card__label">Ma webcam</span>
              <span className="method-card__desc muted">Estimation d'âge par la caméra</span>
            </button>
          </div>
          <button className="login__toggle" onClick={() => setStep("form")}>← Revenir au formulaire</button>
        </div>
      )}

      <p className="login__switch muted">
        {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
        <button className="login__toggle" onClick={switchMode}>
          {mode === "login" ? "Créer un compte" : "Se connecter"}
        </button>
      </p>
    </div>
  );
}
