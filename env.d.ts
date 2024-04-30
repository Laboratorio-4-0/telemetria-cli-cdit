/// <reference types="vite/client" />

import type { readonly } from 'vue'

interface ImportMetaEnv {
  readonly VITE_TELEMETRIA_API_BASE_DEV: string
  readonly VITE_TELEMETRIA_API_BASE_PROD: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_TELEMETERIA_API_BASE_SOCKET_DEV: string
  readonly VITE_TELEMETERIA_API_BASE_SOCKET_PROD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
