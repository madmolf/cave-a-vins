/**
 * Point d'entrée de la couche API — Rich Cellar.
 * Usage : import { login, searchWines, getCave } from "../api";
 */
export { api, ApiError } from "./client";
export * as authApi from "./auth";
export * as wineApi from "./wine";
export * as profileApi from "./profile";
export * as caveApi from "./cave";

// Accès direct aux fonctions (import nommé)
export { register, login, logout } from "./auth";
export {
  searchWines,
  getWine,
  getWineTags,
  addWineTag,
  updateWineTag,
  deleteWineTag,
} from "./wine";
export { getProfile, updateProfile } from "./profile";
export { getCave } from "./cave";
