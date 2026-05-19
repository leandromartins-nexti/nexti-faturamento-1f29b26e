/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NEXTI_API_URL: string;
  readonly VITE_NEXTI_ANON_KEY: string;
  readonly VITE_NEXTI_SCHEMA: string;
  /** CSV de origens permitidas no postMessage do parent (Nexti.Apps) */
  readonly VITE_NEXTI_APPS_ORIGINS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
