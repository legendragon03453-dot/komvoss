/**
 * Códigos de monitoramento (RD Station, Google Tag Manager, Meta Pixel…), geridos no painel em
 * "Códigos de monitoramento" e gravados em site_content como "scripts:tracking".
 * Sem essa linha no banco, vale DEFAULT_SCRIPTS (abaixo).
 *
 * O código colado no painel é HTML (<script>, <noscript>, <img>…). Os <script> são recriados para
 * que o navegador os execute; o resto vai para o fim do <body>. Cada código entra uma vez por visita:
 * desligar/remover vale a partir do próximo carregamento da página.
 * Não roda dentro do painel (pré-visualização em iframe) nem para robôs de teste.
 */

export type TrackingScript = {
  id: string
  name: string
  code: string
  enabled: boolean
  /** onde entra: "head" (padrão, como pede a maioria das ferramentas) ou fim do "body" */
  place?: 'head' | 'body'
}

export const SCRIPTS_KEY = 'scripts:tracking'

export const DEFAULT_SCRIPTS: TrackingScript[] = [
  {
    id: 'rd-station',
    name: 'RD Station',
    code: '<script type="text/javascript" async src="https://d335luupugsy2.cloudfront.net/js/loader-scripts/033cc758-bb7a-469f-87b5-27577f3f2af3-loader.js" ></script>',
    enabled: true,
    place: 'head',
  },
]

/** Lê a lista gravada no painel (ou o padrão, se ainda não houver). */
export function scriptsFrom(value: Record<string, unknown> | null | undefined): TrackingScript[] {
  const items = value && Array.isArray(value.items) ? (value.items as TrackingScript[]) : null
  return (items ?? DEFAULT_SCRIPTS).filter((s) => s && typeof s.code === 'string' && typeof s.id === 'string')
}

const injected = new Set<string>()

function allowed() {
  return typeof window !== 'undefined' && window.top === window && !navigator.webdriver && !location.pathname.startsWith('/painel')
}

/** Insere no documento os códigos ligados que ainda não entraram nesta visita. */
export function applyScripts(list: TrackingScript[]) {
  if (!allowed()) return
  for (const s of list) {
    if (!s.enabled || !s.code.trim()) continue
    const sig = `${s.id}\n${s.code}`
    if (injected.has(sig)) continue
    injected.add(sig)
    const tpl = document.createElement('template')
    tpl.innerHTML = s.code
    const target = s.place === 'body' ? document.body : document.head
    for (const node of Array.from(tpl.content.childNodes)) {
      if (node instanceof HTMLScriptElement) {
        const el = document.createElement('script')
        for (const a of Array.from(node.attributes)) el.setAttribute(a.name, a.value)
        el.text = node.text
        el.dataset.kvScript = s.id
        target.appendChild(el)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // <noscript>, <img> de pixel, <iframe> do GTM… ficam no body
        ;(node as Element).setAttribute('data-kv-script', s.id)
        document.body.appendChild(node)
      }
    }
  }
}
