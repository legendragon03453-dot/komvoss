/* Blocos comuns às páginas do CMS (src/cms/pages). */

/** Título com destaque: `highlight` é o trecho de `text` que recebe o gradiente prateado. */
export type Title = { text: string; highlight?: string }

export type Action = { label: string; to: string; ghost?: boolean }

export type Seo = { title: string; description: string }

export type Hero = {
  eyebrow: string
  title: Title
  lead: string
  actions?: Action[]
}

/** Cabeçalho de seção. */
export type Head = { eyebrow: string; title: Title; lead?: string }

export type Item = { title: string; text: string }
