/**
 * Troca de imagens pelo painel: cada imagem original do site (ex. "/assets/sobre-time.webp") pode apontar
 * para um arquivo novo. Um observador corrige toda <img> que aparece na página, em qualquer componente,
 * sem precisar mexer em cada um deles.
 */

let map: Record<string, string> = {}
let observer: MutationObserver | null = null

// "/assets/x.webp", "https://site/assets/x.webp" e "/assets/x.webp?v=2" contam como a mesma imagem
const norm = (src: string) => {
  try {
    return decodeURI(new URL(src, location.origin).pathname)
  } catch {
    return src
  }
}

function fix(img: HTMLImageElement) {
  const cur = img.getAttribute('src')
  if (!cur) return
  // se o próprio site trocou a imagem (ex.: miniaturas que mudam), a nova vira a "original"
  let orig = img.dataset.origSrc
  if (!orig || cur !== map[norm(orig)]) orig = cur
  const next = map[norm(orig)]
  if (!next) {
    delete img.dataset.origSrc
    return
  }
  img.dataset.origSrc = orig
  if (cur !== next) {
    img.removeAttribute('srcset')
    img.setAttribute('src', next)
  }
}

const fixAll = (root: ParentNode = document) => root.querySelectorAll('img').forEach(fix)

export function setImageMap(next: Record<string, string>) {
  // devolve as originais antes de aplicar o novo mapa (uma troca pode ter sido desfeita)
  if (typeof document !== 'undefined')
    document.querySelectorAll<HTMLImageElement>('img[data-orig-src]').forEach((img) => {
      img.setAttribute('src', img.dataset.origSrc!)
      delete img.dataset.origSrc
    })
  map = Object.fromEntries(Object.entries(next).map(([k, v]) => [norm(k), v]))
  if (typeof document === 'undefined') return
  fixAll()
  if (observer || !Object.keys(map).length) return
  observer = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'attributes') fix(m.target as HTMLImageElement)
      else
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) fix(n)
          else if (n instanceof Element) fixAll(n)
        })
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })
}
