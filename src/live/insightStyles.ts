/**
 * Estilos padrão dos artigos (Insights): fonte, tamanho e cor de Parágrafo, H1…H5 e links.
 * Definidos no editor de artigos (botão "Estilos do blog") e gravados em site_content como
 * "style:insights". Valem para todos os artigos, no site e na pré-visualização do editor.
 * Campo vazio = estilo original do site.
 */

export type TextStyle = { font?: string; size?: number; color?: string; weight?: string }
export type InsightStyles = {
  p?: TextStyle
  h1?: TextStyle
  h2?: TextStyle
  h3?: TextStyle
  h4?: TextStyle
  h5?: TextStyle
  link?: { color?: string; underline?: boolean }
}

export const STYLE_KEYS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5'] as const
export const STYLE_LABELS: Record<(typeof STYLE_KEYS)[number], string> = {
  p: 'Parágrafo',
  h1: 'Título H1',
  h2: 'Título H2',
  h3: 'Título H3',
  h4: 'Título H4',
  h5: 'Título H5',
}

/** Fontes oferecidas (as do Google são carregadas só quando usadas). */
export const FONTS: { label: string; value: string; google?: string }[] = [
  { label: 'Padrão do site (Montserrat)', value: '' },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif", google: 'Inter:wght@300;400;500;600;700' },
  { label: 'Roboto', value: "'Roboto', sans-serif", google: 'Roboto:wght@300;400;500;700' },
  { label: 'Open Sans', value: "'Open Sans', sans-serif", google: 'Open+Sans:wght@300;400;600;700' },
  { label: 'Lato', value: "'Lato', sans-serif", google: 'Lato:wght@300;400;700' },
  { label: 'Poppins', value: "'Poppins', sans-serif", google: 'Poppins:wght@300;400;500;600;700' },
  { label: 'Merriweather (serifada)', value: "'Merriweather', serif", google: 'Merriweather:wght@300;400;700' },
  { label: 'Playfair Display (serifada)', value: "'Playfair Display', serif", google: 'Playfair+Display:wght@400;500;600;700' },
  { label: 'Georgia (serifada)', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
]

export const WEIGHTS = [
  { label: 'Padrão', value: '' },
  { label: 'Fina (300)', value: '300' },
  { label: 'Normal (400)', value: '400' },
  { label: 'Média (500)', value: '500' },
  { label: 'Semi-negrito (600)', value: '600' },
  { label: 'Negrito (700)', value: '700' },
]

const okColor = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : '')
const okFont = (f?: string) => (f && FONTS.some((x) => x.value === f) ? f : '')

// tamanhos grandes encolhem em telas pequenas (chegam ao valor cheio a partir de ~1440px)
const fluid = (px: number) => (px >= 24 ? `clamp(${Math.round(px * 0.75)}px, ${((px / 1440) * 100).toFixed(2)}vw, ${px}px)` : `${px}px`)

const SEL: Record<(typeof STYLE_KEYS)[number], string> = {
  p: '.kb-doc :is(.kb-p, .kb-rich p, .kb-rich li, .kb-rich td, .kb-list li)',
  h1: '.kb-doc :is(h1.kb-h, .kb-rich h1)',
  h2: '.kb-doc :is(h2.kb-h, .kb-rich h2)',
  h3: '.kb-doc :is(h3.kb-h, .kb-rich h3)',
  h4: '.kb-doc :is(h4.kb-h, .kb-rich h4)',
  h5: '.kb-doc :is(h5.kb-h, .kb-rich h5)',
}

export function stylesCss(s: InsightStyles | null | undefined): string {
  if (!s) return ''
  const rules: string[] = []
  for (const k of STYLE_KEYS) {
    const t = s[k]
    if (!t) continue
    const d: string[] = []
    if (okFont(t.font)) d.push(`font-family:${t.font}`)
    if (typeof t.size === 'number' && t.size >= 8 && t.size <= 120) d.push(`font-size:${fluid(t.size)}`)
    if (okColor(t.color)) d.push(`color:${t.color}`)
    if (t.weight && /^[3-9]00$/.test(t.weight)) d.push(`font-weight:${t.weight}`)
    if (d.length) rules.push(`${SEL[k]}{${d.join(';')}}`)
  }
  const link = s.link
  if (link) {
    const d: string[] = []
    if (okColor(link.color)) d.push(`color:${link.color}`, `text-decoration-color:${link.color}`)
    if (link.underline === false) d.push('text-decoration:none')
    if (d.length) rules.push(`.kb-doc :is(.kb-p, .kb-rich, .kb-list, .kb-quote) a{${d.join(';')}}`)
  }
  return rules.join('\n')
}

function googleFonts(s: InsightStyles) {
  const used = new Set(STYLE_KEYS.map((k) => s[k]?.font).filter(Boolean))
  return FONTS.filter((f) => f.google && used.has(f.value)).map((f) => f.google!)
}

/** Aplica (ou atualiza) os estilos na página. */
export function applyInsightStyles(s: InsightStyles | null | undefined) {
  if (typeof document === 'undefined') return
  let el = document.getElementById('kv-insight-styles') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'kv-insight-styles'
    document.head.appendChild(el)
  }
  el.textContent = stylesCss(s)
  const fams = s ? googleFonts(s) : []
  let link = document.getElementById('kv-insight-fonts') as HTMLLinkElement | null
  if (!fams.length) return link?.remove()
  const href = `https://fonts.googleapis.com/css2?${fams.map((f) => `family=${f}`).join('&')}&display=swap`
  if (!link) {
    link = document.createElement('link')
    link.id = 'kv-insight-fonts'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}
