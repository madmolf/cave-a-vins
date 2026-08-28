import { api } from "./client";
import type {
  Wine,
  Tag,
  NewTagPayload,
  UpdateTagPayload,
  DeleteTagPayload,
  MessageResponse,
} from "../types";

/**
 * GET /api/wine/:name — recherche de vins par nom.
 * NOTE : le contrat expose aussi GET /api/wine/:id ci-dessous ; les deux routes
 * partagent le même motif (à lever d'ambiguïté côté back : ex. /api/wine/search?q=).
 */
export function searchWines(name: string): Promise<Wine[]> {
  return api.get<Wine[]>(`/api/wine/${encodeURIComponent(name)}`);
}

/** GET /api/wine/:id — détail d'un vin. */
export function getWine(id: number): Promise<Wine> {
  return api.get<Wine>(`/api/wine/${id}`);
}

/** GET /api/wine/:id/tags — tags liés à un vin. */
export function getWineTags(id: number): Promise<Tag[]> {
  return api.get<Tag[]>(`/api/wine/${id}/tags`);
}

/** POST /api/wine/:id/tags — crée un tag sur le vin. */
export function addWineTag(id: number, data: NewTagPayload): Promise<MessageResponse> {
  return api.post<MessageResponse>(`/api/wine/${id}/tags`, data);
}

/** PUT /api/wine/:id/tags — modifie un tag personnel. */
export function updateWineTag(id: number, data: UpdateTagPayload): Promise<MessageResponse> {
  return api.put<MessageResponse>(`/api/wine/${id}/tags`, data);
}

/** DELETE /api/wine/:id/tags — supprime un tag personnel. */
export function deleteWineTag(id: number, data: DeleteTagPayload): Promise<MessageResponse> {
  return api.delete<MessageResponse>(`/api/wine/${id}/tags`, data);
}
