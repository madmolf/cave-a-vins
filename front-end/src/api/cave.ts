import { api } from "./client";
import type { Cave } from "../types";

/** GET /api/:user/cave — cave personnelle de l'utilisateur. */
export function getCave(user: string | number): Promise<Cave> {
  return api.get<Cave>(`/api/${user}/cave`);
}
