/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

/** Lista de imagens de public/assets (gerada por site-images-plugin.ts) */
declare module 'virtual:site-images' {
  const images: { src: string; name: string; folder: string; bytes: number; uses: string[]; dynamic: boolean }[]
  export default images
}
