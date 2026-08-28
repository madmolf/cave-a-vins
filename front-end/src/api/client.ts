/**
 * Client HTTP de base pour l'API Rich Cellar.
 * - Envoie automatiquement le cookie JWT (HttpOnly) via `credentials: "include"`.
 * - Sérialise/désérialise le JSON et remonte une ApiError typée en cas d'échec.
 * URL de base : variable d'env VITE_API_URL (vide = même origine).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body != null;

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // cookie JWT HttpOnly transmis automatiquement
    ...options,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      /* réponse sans corps JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      body: body != null ? JSON.stringify(body) : undefined,
    }),
};
