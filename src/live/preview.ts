import { previewContent } from './content'
import type { ContentRow, PostRow } from './content'
import { scrollToElement } from '../motion'

/*
 * Pré-visualização ao vivo do painel. Quando o site abre dentro do painel (iframe com ?kv-preview=1),
 * ele aceita mensagens do painel (mesma origem):
 *   { type: 'kv-preview', rows, removed?, posts? }  → mostra o rascunho, sem salvar
 *   { type: 'kv-focus', text?, src? }              → rola até o trecho e o destaca
 * e avisa o painel quando está pronto: { type: 'kv-ready', path }.
 */

const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()

function findText(text: string): HTMLElement | null {
  const needle = norm(text).slice(0, 60)
  if (needle.length < 2) return null
  const walker = document.createTreeWalker(document.querySelector('.site') ?? document.body, NodeFilter.SHOW_TEXT)
  let best: HTMLElement | null = null
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement
    if (!el || el.closest('.mn, script, style')) continue
    // sobe até o elemento cujo texto completo contém o trecho (títulos quebram em vários nós)
    let cur: HTMLElement | null = el
    for (let i = 0; cur && i < 4; i++, cur = cur.parentElement) {
      if (norm(cur.textContent ?? '').includes(needle)) {
        const r = cur.getBoundingClientRect()
        if (r.width > 0 && r.height > 0) {
          best = cur
          break
        }
      }
    }
    if (best) break
  }
  return best
}

let lastMark: HTMLElement | null = null
function mark(el: HTMLElement) {
  lastMark?.classList.remove('kv-hl')
  // garante que o trecho apareça mesmo se a animação de entrada ainda não rodou
  el.style.opacity = ''
  el.closest<HTMLElement>('[data-anim]')?.style.setProperty('opacity', '1')
  el.closest<HTMLElement>('[data-anim]')?.style.setProperty('transform', 'none')
  scrollToElement(el)
  el.classList.add('kv-hl')
  lastMark = el
  window.setTimeout(() => el.classList.remove('kv-hl'), 2600)
}

export function startPreview() {
  if (window.top === window || !new URLSearchParams(location.search).has('kv-preview')) return
  document.documentElement.classList.add('kv-preview')
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || typeof e.data !== 'object') return
    const d = e.data as { type: string; rows?: ContentRow[]; removed?: string[]; posts?: PostRow[]; text?: string; src?: string }
    if (d.type === 'kv-preview') previewContent(d.rows ?? [], d.removed ?? [], d.posts)
    if (d.type === 'kv-focus') {
      // espera o React redesenhar com o texto novo
      window.setTimeout(() => {
        const el = d.src ? document.querySelector<HTMLElement>(`img[src="${CSS.escape(d.src)}"], img[data-orig-src="${CSS.escape(d.src)}"]`) : findText(d.text ?? '')
        if (el) mark(el)
      }, 120)
    }
  })
  const ready = () => window.parent.postMessage({ type: 'kv-ready', path: location.pathname }, location.origin)
  if (document.readyState === 'complete') ready()
  else window.addEventListener('load', ready)
}
