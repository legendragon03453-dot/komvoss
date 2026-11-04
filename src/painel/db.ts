import { createClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'
import { LIVE, SB_KEY, SB_URL, demoRead, demoWrite } from '../live/config'
import type { DemoTable } from '../live/config'
import type { ContentRow, PostRow } from '../live/content'
import { seedDemo } from './seed'

/**
 * Acesso a dados do painel. Com o Supabase configurado, usa o banco de verdade (login obrigatório);
 * sem ele, usa o "banco" de demonstração do navegador, com dados de exemplo.
 */

export const DEMO = !LIVE
export const sb = LIVE ? createClient(SB_URL!, SB_KEY!, { auth: { persistSession: true, storageKey: 'komvos-painel-auth' } }) : null

export type LeadStatus = 'novo' | 'em_contato' | 'qualificado' | 'ganho' | 'perdido'
export type Lead = {
  id: string
  created_at: string
  form: string
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  message: string | null
  data: Record<string, string>
  page: string | null
  source: string | null
  status: LeadStatus
  notes: string | null
}

export type Event = {
  id?: string | number
  created_at: string
  type: 'pageview' | 'click'
  session_id: string
  visitor_id: string | null
  path: string
  landing: boolean
  referrer: string | null
  source: string | null
  medium: string | null
  campaign: string | null
  device: string | null
  country: string | null
  region: string | null
  city: string | null
  x: number | null
  y: number | null
  page_h: number | null
  vw: number | null
  label: string | null
  /** clique em parte fixa da tela (menu do topo): y é a posição na tela, não na página */
  fixed?: boolean | null
}

export type Post = PostRow & { id: string; status: 'draft' | 'published'; hidden: boolean; featured: boolean; created_at: string; updated_at?: string }

/* ---------- autenticação ---------- */

export async function getSession(): Promise<Session | null> {
  if (!sb) return null
  return (await sb.auth.getSession()).data.session
}

export async function signIn(email: string, password: string) {
  const { error } = await sb!.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
}

export async function signOut() {
  await sb?.auth.signOut()
}

export type Role = 'admin' | 'editor'
export type Me = { email: string; name: string | null; role: Role; tour_done: boolean }

/** Quem está logado e o que pode fazer (null = logou, mas não tem acesso ao painel). */
export async function getMe(): Promise<Me | null> {
  if (!sb) {
    let tour = false
    try {
      tour = localStorage.getItem('komvos-painel-tour') === '1'
    } catch {
      /* ignora */
    }
    return { email: 'demonstração', name: 'Demonstração', role: 'admin', tour_done: tour }
  }
  const email = (await sb.auth.getUser()).data.user?.email
  if (!email) return null
  const { data, error } = await sb.from('admin_users').select('email,name,role,tour_done').ilike('email', email).maybeSingle()
  if (error) throw new Error(error.message.includes('admin_users') ? 'O banco ainda não foi preparado: rode o arquivo supabase/schema.sql no SQL Editor da Supabase.' : error.message)
  return (data as Me | null) ?? null
}

/** Marca o tutorial como visto (para não abrir sozinho de novo). */
export async function finishTour() {
  try {
    localStorage.setItem('komvos-painel-tour', '1')
  } catch {
    /* ignora */
  }
  if (sb) await sb.rpc('finish_tour')
}

/* ---------- usuários do painel (via /api/admin-users, no servidor) ---------- */

export type PanelUser = { email: string; name: string | null; role: Role; created_at: string; created_by: string | null; last_sign_in_at: string | null; has_login: boolean }

export async function usersApi<T = { ok: true }>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  if (!sb) throw new Error('Gerenciar usuários precisa do Supabase conectado.')
  const token = (await sb.auth.getSession()).data.session?.access_token
  const r = await fetch('/api/admin-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await r.json().catch(() => ({ error: 'Resposta inválida do servidor.' }))
  if (!r.ok || data.error) throw new Error(data.error || `Erro ${r.status}`)
  return data as T
}

export async function resetPassword(email: string) {
  const { error } = await sb!.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/painel` })
  if (error) throw new Error(error.message)
}

/* ---------- demonstração ---------- */

function demo<T>(table: DemoTable): T[] {
  seedDemo()
  return (demoRead()[table] ?? []) as T[]
}

function demoSave(table: DemoTable, rows: unknown[]) {
  const db = demoRead()
  db[table] = rows as Record<string, unknown>[]
  demoWrite(db)
}

const fail = (e: { message: string } | null) => {
  if (e) throw new Error(e.message)
}

/* ---------- leads ---------- */

export async function listLeads(): Promise<Lead[]> {
  if (!sb) return demo<Lead>('leads').sort((a, b) => b.created_at.localeCompare(a.created_at))
  const { data, error } = await sb.from('leads').select('*').order('created_at', { ascending: false }).limit(2000)
  fail(error)
  return data as Lead[]
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  if (!sb) return demoSave('leads', demo<Lead>('leads').map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const { error } = await sb.from('leads').update(patch).eq('id', id)
  fail(error)
}

export async function deleteLead(id: string) {
  if (!sb) return demoSave('leads', demo<Lead>('leads').filter((l) => l.id !== id))
  const { error } = await sb.from('leads').delete().eq('id', id)
  fail(error)
}

/** Link temporário (10 min) para baixar um arquivo enviado num formulário. */
export async function leadFileUrl(path: string): Promise<string | null> {
  if (!sb) return null
  const { data } = await sb.storage.from('lead-files').createSignedUrl(path, 600)
  return data?.signedUrl ?? null
}

/* ---------- estatísticas ---------- */

/** Eventos desde `since` (ISO). Busca em páginas de 1.000 até `max`. */
export async function listEvents(since: string, opts: { type?: 'pageview' | 'click'; path?: string; max?: number } = {}): Promise<Event[]> {
  if (!sb)
    return demo<Event>('events').filter(
      (e) => e.created_at >= since && (!opts.type || e.type === opts.type) && (!opts.path || e.path === opts.path),
    )
  const max = opts.max ?? 50000
  const out: Event[] = []
  for (let from = 0; from < max; from += 1000) {
    let q = sb.from('events').select('*').gte('created_at', since).order('created_at', { ascending: true }).range(from, from + 999)
    if (opts.type) q = q.eq('type', opts.type)
    if (opts.path) q = q.eq('path', opts.path)
    const { data, error } = await q
    fail(error)
    out.push(...(data as Event[]))
    if (!data || data.length < 1000) break
  }
  return out
}

export async function clearEvents(before: string) {
  if (!sb) return demoSave('events', demo<Event>('events').filter((e) => e.created_at >= before))
  const { error } = await sb.from('events').delete().lt('created_at', before)
  fail(error)
}

/* ---------- conteúdo do site ---------- */

export async function listContent(): Promise<ContentRow[]> {
  if (!sb) return demo<ContentRow>('site_content')
  const { data, error } = await sb.from('site_content').select('key,value,updated_at,updated_by')
  fail(error)
  return data as ContentRow[]
}

async function who() {
  return sb ? ((await sb.auth.getUser()).data.user?.email ?? null) : 'demonstração'
}

export async function saveContent(rows: ContentRow[]) {
  if (!rows.length) return
  const by = await who()
  const stamped = rows.map((r) => ({ ...r, updated_at: new Date().toISOString(), updated_by: by }))
  if (!sb) {
    const keys = new Set(rows.map((r) => r.key))
    return demoSave('site_content', [...demo<ContentRow>('site_content').filter((r) => !keys.has(r.key)), ...stamped])
  }
  const { error } = await sb.from('site_content').upsert(stamped)
  fail(error)
}

export async function deleteContent(keys: string[]) {
  if (!keys.length) return
  if (!sb) return demoSave('site_content', demo<ContentRow>('site_content').filter((r) => !keys.includes(r.key)))
  const { error } = await sb.from('site_content').delete().in('key', keys)
  fail(error)
}

/** Envia uma imagem para o Storage público e devolve o endereço dela. */
export async function uploadMedia(file: File, folder = 'site'): Promise<string> {
  if (!sb) {
    // demonstração: a imagem fica embutida (data URL), só neste navegador
    if (file.size > 1.5 * 1024 * 1024) throw new Error('No modo demonstração, use imagens de até 1,5 MB.')
    return await new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(String(r.result))
      r.onerror = () => rej(new Error('Não foi possível ler o arquivo.'))
      r.readAsDataURL(file)
    })
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const { error } = await sb.storage.from('site-media').upload(path, file, { cacheControl: '31536000', contentType: file.type })
  fail(error)
  return sb.storage.from('site-media').getPublicUrl(path).data.publicUrl
}

/* ---------- blog ---------- */

export async function listPosts(): Promise<Post[]> {
  if (!sb) return demo<Post>('posts')
  const { data, error } = await sb.from('posts').select('*').order('created_at', { ascending: false })
  fail(error)
  return data as Post[]
}

export async function savePost(p: Partial<Post> & { slug: string }): Promise<void> {
  const now = new Date().toISOString()
  if (!sb) {
    const list = demo<Post>('posts')
    const i = p.id ? list.findIndex((x) => x.id === p.id) : -1
    if (i >= 0) list[i] = { ...list[i], ...p, updated_at: now } as Post
    else list.unshift({ status: 'draft', hidden: false, featured: false, ...p, id: crypto.randomUUID(), created_at: now, updated_at: now } as Post)
    return demoSave('posts', list)
  }
  const { id, ...rest } = p
  const { error } = id ? await sb.from('posts').update({ ...rest, updated_at: now }).eq('id', id) : await sb.from('posts').insert(rest)
  if (error?.code === '23505') throw new Error('Já existe um artigo com esse endereço. Troque o endereço (slug).')
  fail(error)
}

export async function deletePost(id: string) {
  if (!sb) return demoSave('posts', demo<Post>('posts').filter((p) => p.id !== id))
  const { error } = await sb.from('posts').delete().eq('id', id)
  fail(error)
}

/** Só um destaque por vez: desmarca os outros artigos do painel. */
export async function clearPostFeatured(exceptId?: string) {
  if (!sb) return demoSave('posts', demo<Post>('posts').map((p) => (p.id === exceptId ? p : { ...p, featured: false })))
  let q = sb.from('posts').update({ featured: false }).eq('featured', true)
  if (exceptId) q = q.neq('id', exceptId)
  const { error } = await q
  fail(error)
}
