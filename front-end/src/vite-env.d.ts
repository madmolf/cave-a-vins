/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de l'API back-end (ex. http://localhost:3000). Vide = même origine. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
