/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloudflare Web Analytics beacon token. Unset disables analytics. */
  readonly VITE_CF_BEACON_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
