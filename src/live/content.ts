import { ARTICLES } from '../cms/insights'
import type { Article } from '../cms/insights'
import { MENU } from '../cms/menu'
import type { MenuItem } from '../cms/menu'
import { LIVE, demoRead, rest } from './config'
import { getPath, setPath } from './registry'
import { setImageMap } from './images'
import type { Author, Block } from './blocks'

/*
 * Edições feitas no painel, aplicadas por cima do conteúdo do CMS quando o site carrega.
 * Tabela site_content, uma linha por edição:
 *   "text:<caminho>"   → { v: "novo texto" }
 *   "image:<arquivo>"  → { url: "https://…" }            (troca a imagem em todo o site)
 *   "menu:<id>"        → { label?, hidden?, deleted? }
 *   "article:<slug>"   → { hidden?, featured?, title?, excerpt?, body?, cat?, date?, read?, cover? }
 * Tabela posts: artigos criados pelo painel (entram no blog junto com os do CMS).
 *
 * Para o visitante não esperar o banco, a última versão fica guardada no navegador e é aplicada antes
 * da primeira renderização; a versão nova chega logo depois e a página é atualizada se algo mudou.
 */

export type ContentRow = { key: string; value: Record<string, unknown> }
export type PostRow = {
  id?: string
  slug: string
  title: string
  cat: string
  date_label: string
  read_time: string
  excerpt: string
  body: string[]
  cover?: string | null
  blocks?: Block[] | null
  author?: Author | null
  status?: string
  hidden?: boolean
  featured?: boolean
  created_at?: string
}
type Snapshot = { rows: ContentRow[]; posts: PostRow[] }

const CACHE_KEY = 'komvos-content'

// estado original do CMS, para desfazer edições removidas
const originalTexts = new Map<string, unknown>()
const originalMenu: MenuItem[] = MENU.map((m) => ({ ...m }))
const originalArticles: Article[] = ARTICLES.map((a) => ({ ...a }))

export function postToArticle(p: PostRow): Article {
  return {
    slug: p.slug,
    cat: p.cat as Article['cat'],
    date: p.date_label,
    read: p.read_time,
    title: p.title,
    excerpt: p.excerpt,
    body: Array.isArray(p.body) ? p.body : [],
    cover: p.cover || undefined,
    featured: Boolean(p.featured),
    blocks: p.blocks?.length ? p.blocks : undefined,
    author: p.author?.name ? p.author : undefined,
  }
}

/** Aplica um conjunto de edições ao CMS (pode ser chamado de novo: desfaz o anterior antes). */
export function applyContent({ rows, posts }: Snapshot) {
  // textos
  for (const [path, v] of originalTexts) setPath(path, v)
  originalTexts.clear()
  const images: Record<string, string> = {}
  const menu = new Map<string, Record<string, unknown>>()
  const articles = new Map<string, Record<string, unknown>>()
  for (const { key, value } of rows) {
    const i = key.indexOf(':')
    const kind = key.slice(0, i)
    const id = key.slice(i + 1)
    if (kind === 'text' && typeof value?.v === 'string') {
      const before = getPath(id)
      if (typeof before === 'string' && setPath(id, value.v)) originalTexts.set(id, before)
    } else if (kind === 'image' && typeof value?.url === 'string') images[id] = value.url
    else if (kind === 'menu') menu.set(id, value)
    else if (kind === 'article') articles.set(id, value)
  }

  // menu: renomear, ocultar, excluir
  MENU.splice(0, MENU.length)
  for (const m of originalMenu) {
    const o = menu.get(m.id)
    if (o?.deleted) continue
    MENU.push({ ...m, ...(typeof o?.label === 'string' && o.label.trim() ? { label: o.label, short: o.label } : {}), hidden: Boolean(o?.hidden) })
  }

  // blog: artigos do painel (mais recentes primeiro) + artigos do CMS com os ajustes
  const created = posts
    .filter((p) => p.status !== 'draft' && !p.hidden)
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    .map(postToArticle)
  const fromCms = originalArticles
    .map((a) => {
      const o = articles.get(a.slug)
      if (!o) return { ...a }
      if (o.hidden) return null
      const pick = <K extends keyof Article>(k: K, src = k as string) => (o[src] !== undefined && o[src] !== '' ? { [k]: o[src] } : {})
      return { ...a, ...pick('title'), ...pick('excerpt'), ...pick('body'), ...pick('cat'), ...pick('date'), ...pick('read'), ...pick('cover'), ...pick('blocks'), ...pick('author'), featured: Boolean(o.featured) } as Article
    })
    .filter((a): a is Article => a !== null)
  const all = [...created, ...fromCms.filter((a) => !created.some((c) => c.slug === a.slug))]
  // o destaque vai para o início (é o primeiro da lista que a página Insights destaca)
  const fi = all.findIndex((a) => a.featured)
  if (fi > 0) all.unshift(...all.splice(fi, 1))
  ARTICLES.splice(0, ARTICLES.length, ...all)

  setImageMap(images)
}

const stamp = (s: Snapshot) => JSON.stringify(s)
let current = ''
let base: Snapshot = { rows: [], posts: [] }

// quem precisa redesenhar quando o conteúdo muda (o site inteiro, em main.tsx)
const listeners = new Set<() => void>()
export function onContentChange(fn: () => void) {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}

/**
 * Pré-visualização do painel: aplica um rascunho por cima do que já está publicado, sem salvar.
 * `rows` substituem as linhas de mesma chave; `removed` são edições desfeitas no rascunho.
 */
export function previewContent(rows: ContentRow[], removed: string[] = [], posts?: PostRow[]) {
  const keys = new Set([...rows.map((r) => r.key), ...removed])
  applyContent({ rows: [...base.rows.filter((r) => !keys.has(r.key)), ...rows], posts: posts ?? base.posts })
  current = ''
  listeners.forEach((fn) => fn())
}

/** Versão guardada no navegador (aplicada antes da primeira renderização). */
export function applyCached() {
  try {
    const raw = LIVE ? localStorage.getItem(CACHE_KEY) : null
    const snap: Snapshot | null = raw ? JSON.parse(raw) : LIVE ? null : demoSnapshot()
    if (snap) {
      applyContent(snap)
      current = stamp(snap)
      base = snap
    }
  } catch {
    /* sem cache: segue com o conteúdo do CMS */
  }
}

function demoSnapshot(): Snapshot {
  const db = demoRead()
  return { rows: (db.site_content ?? []) as ContentRow[], posts: (db.posts ?? []) as PostRow[] }
}

/** Busca a versão mais recente; devolve true se algo mudou (e já aplicou). */
export async function refreshContent(): Promise<boolean> {
  let snap: Snapshot
  if (LIVE) {
    const [rows, posts] = await Promise.all([
      rest<ContentRow[]>('site_content?select=key,value'),
      rest<PostRow[]>('posts?select=slug,title,cat,date_label,read_time,excerpt,body,cover,blocks,author,status,hidden,featured,created_at&status=eq.published&hidden=eq.false'),
    ])
    snap = { rows, posts }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(snap))
    } catch {
      /* ignora */
    }
  } else snap = demoSnapshot()
  base = snap
  const s = stamp(snap)
  if (s === current) return false
  applyContent(snap)
  current = s
  listeners.forEach((fn) => fn())
  return true
}
