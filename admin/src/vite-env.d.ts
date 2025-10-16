/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_WS_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Window extensions
declare global {
  interface Window {
    $notify?: {
      [key: string]: (message: string, options?: any) => void
      success: (message: string, options?: any) => void
      error: (message: string, options?: any) => void
      warning: (message: string, options?: any) => void
      info: (message: string, options?: any) => void
    }
  }
}