import { LIVE, SB_KEY, SB_URL, demoInsert } from './config'

/**
 * Estatísticas do site, sem cookies e sem dados pessoais: um identificador aleatório por visita
 * (sessionStorage) e por navegador (localStorage). Registra:
 *  - pageview: cada página vista, com a origem da visita (Google, Instagram, campanha…) e a página de entrada;
 *  - click: posição dos cliques, para o mapa de calor.
 * A localização (país / estado / cidade) vem da Vercel pelo IP, em /api/geo; o IP não é guardado.
 * Os eventos são enviados em lotes, e o envio pendente sai quando a pessoa fecha ou troca de aba.
 */

type Session = { id: string; source: string; medium: string; campaign: string; referrer: string; geo?: Geo; views: number }
type Geo = { country: string | null; region: string | null; city: string | null }
type Ev = Record<string, unknown>

const queue: Ev[] = []
let session: Session | null = null
let visitor = ''
let started = false
let lastClick = 0

const SOCIAL: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'],
  [/duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)instagram\.com$|^l\.instagram\.com$/, 'Instagram'],
  [/(^|\.)facebook\.com$|^l\.facebook\.com$|^m\.facebook\.com$/, 'Facebook'],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, 'LinkedIn'],
  [/(^|\.)youtube\.com$|^youtu\.be$/, 'YouTube'],
  [/whatsapp\.com$|^wa\.me$|^l\.wl\.co$/, 'WhatsApp'],
  [/chatgpt\.com$|openai\.com$/, 'ChatGPT'],
  [/(^|\.)t\.co$|(^|\.)x\.com$|twitter\.com$/, 'X (Twitter)'],
]
const SEARCH = new Set(['Google', 'Bing', 'DuckDuckGo'])

function classify(): Pick<Session, 'source' | 'medium' | 'campaign' | 'referrer'> {
  const q = new URLSearchParams(location.search)
  const ref = document.referrer
  let host = ''
  try {
    host = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''
  } catch {
    /* referrer inválido */
  }
  const internal = host === location.hostname.replace(/^www\./, '')
  const utm = q.get('utm_source')
  const campaign = q.get('utm_campaign') ?? ''
  if (utm) return { source: utm, medium: q.get('utm_medium') ?? 'campanha', campaign, referrer: internal ? '' : ref }
  if (q.get('gclid')) return { source: 'Google', medium: 'anúncio', campaign, referrer: ref }
  if (q.get('fbclid')) return { source: 'Facebook / Instagram', medium: 'social', campaign, referrer: ref }
  if (!host || internal) return { source: 'Direto', medium: 'direto', campaign, referrer: '' }
  const named = SOCIAL.find(([re]) => re.test(host))?.[1]
  if (named) return { source: named, medium: SEARCH.has(named) ? 'busca orgânica' : 'social', campaign, referrer: ref }
  return { source: host, medium: 'site externo', campaign, referrer: ref }
}

const device = () => (window.matchMedia('(max-width: 640px)').matches ? 'mobile' : window.matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop')

const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))

function load() {
  try {
    visitor = localStorage.getItem('kv-v') || ''
    if (!visitor) localStorage.setItem('kv-v', (visitor = rid()))
  } catch {
    visitor = rid()
  }
  try {
    session = JSON.parse(sessionStorage.getItem('kv-s') || 'null')
  } catch {
    session = null
  }
  if (!session) session = { id: rid(), views: 0, ...classify() }
  save()
  if (!session.geo && LIVE)
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((g: Geo | null) => {
        if (g && session) {
          session.geo = g
          save()
        }
      })
      .catch(() => {})
}

function save() {
  try {
    sessionStorage.setItem('kv-s', JSON.stringify(session))
  } catch {
    /* ignora */
  }
}

// todos os eventos do lote precisam das mesmas colunas (exigência do envio em lote do Supabase)
const BLANK = { landing: false, referrer: null, source: null, medium: null, campaign: null, x: null, y: null, page_h: null, label: null, fixed: false }

function push(e: Ev) {
  queue.push({ ...BLANK, ...e, session_id: session!.id, visitor_id: visitor, device: device(), vw: window.innerWidth })
  if (queue.length >= 20) flush()
}

/** Envia o que estiver na fila. */
export function flush() {
  if (!queue.length || !session) return
  const geo = session.geo ?? { country: null, region: null, city: null }
  const batch = queue.splice(0).map((e) => ({ ...e, ...geo }))
  if (!LIVE) {
    // demonstração: só guarda no navegador de quem já abriu o painel (os visitantes não acumulam nada)
    try {
      if (localStorage.getItem('komvos-painel-demo-seeded')) demoInsert('events', batch)
    } catch {
      /* ignora */
    }
    return
  }
  fetch(`${SB_URL}/rest/v1/events`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(batch),
  }).catch(() => {})
}

/** Registra a página vista (chamado a cada troca de rota). */
let lastView = { path: '', at: 0 }

export function trackPageview(path: string) {
  if (!started || path.startsWith('/painel')) return
  // o modo de desenvolvimento do React roda os efeitos duas vezes: ignora a repetição imediata
  if (lastView.path === path && Date.now() - lastView.at < 1000) return
  lastView = { path, at: Date.now() }
  const s = session!
  push({
    type: 'pageview',
    path,
    landing: s.views === 0,
    referrer: s.views === 0 ? s.referrer || null : null,
    source: s.source,
    medium: s.medium,
    campaign: s.campaign || null,
  })
  s.views++
  save()
}

/** Liga o registro (uma vez, ao abrir o site). */
export function startTracking() {
  // fora: robôs de teste e a pré-visualização do mapa de calor no painel (iframe)
  if (started || typeof window === 'undefined' || navigator.webdriver || window.top !== window) return
  started = true
  load()
  document.addEventListener(
    'click',
    (e) => {
      const now = Date.now()
      if (now - lastClick < 250) return
      lastClick = now
      const doc = document.documentElement
      const el = (e.target as Element | null)?.closest('a, button, [role="button"], input, label, summary')
      const label = (el?.getAttribute('aria-label') || el?.textContent || (e.target as Element | null)?.tagName || '').trim().replace(/\s+/g, ' ').slice(0, 60)
      // cliques no menu do topo e em outras partes fixas: guarda a posição na tela
      let fixed = false
      for (let n = e.target as Element | null, i = 0; n && n !== doc && i < 12; n = n.parentElement, i++)
        if (getComputedStyle(n).position === 'fixed') {
          fixed = true
          break
        }
      push({
        type: 'click',
        path: location.pathname,
        x: Math.round((e.pageX / doc.scrollWidth) * 10000) / 10000,
        y: Math.round(fixed ? e.clientY : e.pageY),
        fixed,
        page_h: doc.scrollHeight,
        label: label || null,
      })
    },
    { capture: true, passive: true },
  )
  window.setInterval(flush, 5000)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush())
  window.addEventListener('pagehide', flush)
}
