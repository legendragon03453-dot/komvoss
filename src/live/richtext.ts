/**
 * Texto rico dos artigos (bloco "Texto" do editor de Insights): limpeza do HTML que vai ao ar,
 * limpeza do que a pessoa cola (Google Docs, Word, sites) e conversão de texto puro em títulos,
 * parágrafos e listas.
 *
 * Tudo o que entra passa por uma lista fechada de tags e estilos, então nada de script, iframe
 * ou atributo perigoso chega ao site.
 */

const TAGS = new Set(['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'sub', 'sup', 'hr'])
// tags trocadas por equivalentes
const RENAME: Record<string, string> = { b: 'strong', i: 'em', strike: 's', del: 's', ins: 'u', h6: 'h5', div: 'p', section: 'p', article: 'p', header: 'p', footer: 'p', font: 'span', tfoot: 'tbody', caption: 'p' }
// tags descartadas junto com o conteúdo
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math', 'head', 'title', 'meta', 'link', 'img', 'video', 'audio', 'canvas', 'form', 'input', 'button', 'select', 'textarea', 'colgroup', 'col'])
const BLOCKS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'ul', 'ol', 'blockquote', 'table', 'hr'])
const ALIGNABLE = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'li', 'td', 'th', 'blockquote'])

const SAFE_URL = /^(https?:\/\/|\/|mailto:|tel:|#)/i
const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|[a-z]+)$/i
const SIZE = /^\d{1,3}(\.\d+)?(px|pt|em|rem|%)$/
const FONT = /^[\w\s,'"-]{1,120}$/

type Mode = 'save' | 'paste'

/** Estilos permitidos. Ao colar, cor/fonte/tamanho do documento de origem saem (vale o padrão do blog). */
function cleanStyle(el: HTMLElement, tag: string, mode: Mode) {
  const st = el.style
  const out: string[] = []
  const align = st.textAlign
  if (ALIGNABLE.has(tag) && ['left', 'center', 'right', 'justify'].includes(align)) out.push(`text-align:${align}`)
  // cor do item de lista (o número/bolinha acompanha a cor do texto do item)
  if (mode === 'save' && tag === 'li' && st.color && COLOR.test(st.color.replace(/\s/g, ''))) out.push(`color:${st.color}`)
  if (mode === 'save' && tag === 'span') {
    if (st.color && COLOR.test(st.color.replace(/\s/g, ''))) out.push(`color:${st.color}`)
    if (st.backgroundColor && COLOR.test(st.backgroundColor.replace(/\s/g, '')) && !/transparent/.test(st.backgroundColor)) out.push(`background-color:${st.backgroundColor}`)
    if (st.fontSize && SIZE.test(st.fontSize)) out.push(`font-size:${st.fontSize}`)
    if (st.fontFamily && FONT.test(st.fontFamily)) out.push(`font-family:${st.fontFamily.replace(/"/g, "'")}`)
  }
  return out.join(';')
}

/** Google Docs / Word marcam negrito, itálico etc. com estilo em <span>: vira tag de verdade. */
function markTags(el: HTMLElement): string[] {
  const st = el.style
  const out: string[] = []
  const weight = st.fontWeight
  if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) out.push('strong')
  if (st.fontStyle === 'italic') out.push('em')
  const deco = st.textDecoration || st.textDecorationLine || ''
  if (/underline/.test(deco)) out.push('u')
  if (/line-through/.test(deco)) out.push('s')
  if (st.verticalAlign === 'super') out.push('sup')
  if (st.verticalAlign === 'sub') out.push('sub')
  return out
}

function clean(src: Element, out: Element, doc: Document, mode: Mode) {
  for (const child of [...src.childNodes]) {
    if (child.nodeType === 3) {
      out.appendChild(doc.createTextNode(child.textContent ?? ''))
      continue
    }
    if (!(child instanceof HTMLElement)) continue
    let tag = child.tagName.toLowerCase()
    if (DROP.has(tag)) continue
    // Word: marcadores de lista falsos
    if (/mso-list:\s*ignore/i.test(child.getAttribute('style') ?? '')) continue
    // Google Docs: <b style="font-weight:normal" id="docs-internal-guid…"> envolve tudo
    if (tag === 'b' && (child.style.fontWeight === 'normal' || child.id.startsWith('docs-internal'))) {
      clean(child, out, doc, mode)
      continue
    }
    tag = RENAME[tag] ?? tag
    if (!TAGS.has(tag)) {
      clean(child, out, doc, mode)
      continue
    }
    // títulos e células não ficam dentro de parágrafo
    if (tag === 'p' && out instanceof HTMLElement && /^(p|h\d|li|td|th)$/i.test(out.tagName)) {
      if (out.childNodes.length) out.appendChild(doc.createElement('br'))
      clean(child, out, doc, mode)
      continue
    }
    const el = doc.createElement(tag)
    if (tag === 'a') {
      const href = (child.getAttribute('href') ?? '').trim()
      if (SAFE_URL.test(href)) {
        el.setAttribute('href', href)
        if (/^https?:\/\//i.test(href)) {
          el.setAttribute('target', '_blank')
          el.setAttribute('rel', 'noopener noreferrer')
        }
      }
      if (mode === 'save' && child.style.color && COLOR.test(child.style.color.replace(/\s/g, ''))) el.setAttribute('style', `color:${child.style.color}`)
    } else {
      const style = cleanStyle(child, tag, mode)
      if (style) el.setAttribute('style', style)
    }
    if (tag === 'td' || tag === 'th')
      for (const a of ['colspan', 'rowspan']) {
        const v = child.getAttribute(a)
        if (v && /^\d{1,2}$/.test(v)) el.setAttribute(a, v)
      }
    clean(child, el, doc, mode)
    if (tag === 'span') {
      // negrito/itálico feitos por estilo viram tags; um span sem estilo que sobrar é só ruído
      let content: Node = el
      if (!el.getAttribute('style')) {
        const frag = doc.createDocumentFragment()
        while (el.firstChild) frag.appendChild(el.firstChild)
        content = frag
      }
      for (const m of markTags(child)) {
        const w = doc.createElement(m)
        w.appendChild(content)
        content = w
      }
      out.appendChild(content)
      continue
    }
    out.appendChild(el)
  }
}

/** Texto solto no nível de cima vira parágrafo; parágrafos vazios saem. */
function tidy(root: HTMLElement, doc: Document) {
  let p: HTMLElement | null = null
  for (const n of [...root.childNodes]) {
    const isBlock = n instanceof HTMLElement && BLOCKS.has(n.tagName.toLowerCase())
    if (isBlock) {
      p = null
      continue
    }
    if (n instanceof HTMLElement && n.tagName === 'BR') {
      // <br> entre blocos fecha o parágrafo
      p = null
      n.remove()
      continue
    }
    if (!p) {
      if (n.nodeType === 3 && !n.textContent?.trim()) {
        n.remove()
        continue
      }
      p = doc.createElement('p')
      root.insertBefore(p, n)
    }
    p.appendChild(n)
  }
  root.querySelectorAll('p, h1, h2, h3, h4, h5, li').forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector('br')) el.remove()
  })
  return root
}

function run(html: string, mode: Mode): string {
  if (typeof DOMParser === 'undefined') return ''
  const src = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  wordLists(src)
  const doc = document.implementation.createHTMLDocument('')
  const root = doc.createElement('div')
  clean(src.body, root, doc, mode)
  tidy(root, doc)
  return root.innerHTML
}

/** Word cola listas como parágrafos com "mso-list"; aqui viram <ul>/<ol>. */
function wordLists(doc: Document) {
  const items = [...doc.body.querySelectorAll<HTMLElement>('p')].filter((p) => /mso-list/i.test(p.getAttribute('style') ?? '') || /MsoListParagraph/i.test(p.className))
  let list: HTMLElement | null = null
  for (const p of items) {
    const marker = p.querySelector('[style*="mso-list"]')?.textContent?.trim() ?? ''
    const ordered = /^\d+[.)]/.test(marker)
    // parágrafos de lista seguidos formam uma lista só
    if (!list || p.previousElementSibling !== list) {
      list = doc.createElement(ordered ? 'ol' : 'ul')
      p.before(list)
    }
    const li = doc.createElement('li')
    li.innerHTML = p.innerHTML
    list.appendChild(li)
    p.remove()
  }
}

/** HTML que vai ao ar (e o que é mostrado no editor). */
export const sanitizeHtml = (html: string) => run(html, 'save')

/** HTML colado de outro lugar: mantém a estrutura (títulos, listas, tabelas, negrito, links) e tira cor/fonte de origem. */
export const cleanPasted = (html: string) => run(html, 'paste')

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** **negrito**, *itálico* e [link](url) do jeito antigo também funcionam ao colar. */
function inline(s: string) {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:)[^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${t}</a>`)
}

/**
 * Texto puro → HTML. Cada linha vira um parágrafo; linhas com "-", "•" ou "1." viram listas;
 * "# Título" vira título; e linhas curtas, sem ponto final, seguidas de texto viram subtítulo (H2).
 */
export function textToHtml(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+$/, ''))
  const out: string[] = []
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null
  const flush = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`)
    list = null
  }
  const nextText = (i: number) => {
    for (let j = i + 1; j < lines.length; j++) if (lines[j].trim()) return lines[j].trim()
    return ''
  }
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return flush()
    let m = line.match(/^(#{1,5})\s+(.+)$/)
    if (m) {
      flush()
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`)
      return
    }
    m = line.match(/^(?:[-•*–·▪●◦]|\d{1,2}[.)])\s+(.+)$/)
    if (m) {
      const tag = /^\d/.test(line) ? 'ol' : 'ul'
      if (!list || list.tag !== tag) {
        flush()
        list = { tag, items: [] }
      }
      list.items.push(m[1])
      return
    }
    flush()
    const next = nextText(i)
    const words = line.split(/\s+/).length
    const looksTitle = line.length <= 90 && words <= 14 && !/[.,;:!]$/.test(line) && /^[\p{Lu}\d"“]/u.test(line) && next.length > line.length
    out.push(looksTitle ? `<h2>${inline(line)}</h2>` : `<p>${inline(line)}</p>`)
  })
  flush()
  return out.join('')
}

/** Texto corrido (tempo de leitura, busca, SEO). */
export function htmlText(html: string) {
  return html
    .replace(/<\/(p|h\d|li|td|th|tr|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}
