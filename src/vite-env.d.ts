/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_TBA_KEY: string;
  readonly VITE_FTC_USER: string;
  readonly VITE_FTC_PASS: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
