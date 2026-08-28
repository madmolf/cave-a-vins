import { api } from "./client";
import type { Profile, UpdateProfilePayload, MessageResponse } from "../types";

/** GET /api/:user/profile — informations du profil. */
export function getProfile(user: string | number): Promise<Profile> {
  return api.get<Profile>(`/api/${user}/profile`);
}

/** PUT /api/:user/profile — modification du profil. */
export function updateProfile(
  user: string | number,
  data: UpdateProfilePayload
): Promise<MessageResponse> {
  return api.put<MessageResponse>(`/api/${user}/profile`, data);
}
