/// <reference types="vite/client" />

declare module 'china-area-data/data.json' {
  const areas: Record<string, Record<string, string>>
  export default areas
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
