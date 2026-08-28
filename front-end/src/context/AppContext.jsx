import { createContext, useContext, useEffect, useState } from "react";
import * as ageService from "../services/ageVerification";

/**
 * État global (léger, front-end uniquement pour l'instant).
 * - Vérification d'âge : déléguée au service `ageVerification` (API-ready).
 * - Auth : mock (sera branché sur le back-end plus tard).
 */

const AppContext = createContext(null);

const AUTH_KEY = "cave_user";

export function AppProvider({ children }) {
  // null = statut d'âge encore inconnu (évite un flash de la modale au chargement)
  const [ageConfirmed, setAgeConfirmed] = useState(null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  // Au montage : statut de l'accès invité (mock aujourd'hui, API demain).
  useEffect(() => {
    ageService.getAgeStatus().then(setAgeConfirmed);
  }, []);

  /** Accès invité : marque la session comme vérifiée (après CNI/webcam réussie). */
  const setAgeVerified = async () => {
    await ageService.setAgeVerified();
    setAgeConfirmed(true);
  };

  const saveUser = (email) => {
    const u = { email };
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  /** Connexion : le compte est déjà vérifié (majorité contrôlée à l'inscription). */
  const login = (email) => saveUser(email);

  /**
   * Inscription : appelée APRÈS la vérif d'âge réussie (CNI/webcam).
   * RGPD : on ne conserve que l'email. La date de naissance n'a servi qu'au
   * contrôle (en mémoire) et n'est PAS stockée. Au branchement back, n'envoyer
   * que { email, password, ageVerified: true } — jamais la date ni l'image.
   */
  const register = (email) => saveUser(email);

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    await ageService.resetAgeStatus();
    setAgeConfirmed(false);
  };

  /**
   * Photo de profil (MOCK) : conservée en local pour la démo.
   * À remplacer par l'upload vers le back (champ `photo`/`avatar_url`).
   * `photo` = dataURL, ou null pour retirer.
   */
  const updateAvatar = (photo) => {
    setUser((prev) => {
      if (!prev) return prev;
      const u = { ...prev, photo: photo ?? undefined };
      localStorage.setItem(AUTH_KEY, JSON.stringify(u));
      return u;
    });
  };

  return (
    <AppContext.Provider
      value={{
        ageConfirmed,
        setAgeVerified,
        user,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        updateAvatar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return ctx;
}
