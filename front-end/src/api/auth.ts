import { api } from "./client";
import type {
  AuthCredentials,
  RegisterResponse,
  LoginResponse,
  MessageResponse,
} from "../types";

/** POST /api/auth/register — création de compte (mot de passe haché côté back). */
export function register(data: AuthCredentials): Promise<RegisterResponse> {
  return api.post<RegisterResponse>("/api/auth/register", data);
}

/**
 * POST /api/auth/login — connexion.
 * Le back pose le JWT en cookie HttpOnly (`Set-Cookie`) ; le corps ne contient
 * que `userId`. Aucun token n'est stocké côté front.
 */
export function login(data: AuthCredentials): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/auth/login", data);
}

/**
 * POST /api/auth/logout — déconnexion.
 * Un cookie HttpOnly ne peut PAS être effacé en JS : c'est le back qui l'expire
 * (renvoie un `Set-Cookie` vide/expiré). Le cookie courant part via `credentials`.
 */
export function logout(): Promise<MessageResponse> {
  return api.post<MessageResponse>("/api/auth/logout", {});
}
