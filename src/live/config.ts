/**
 * Conexão do site com o Supabase (painel, leads e estatísticas).
 * As chaves vêm das variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (.env / Vercel).
 * Sem elas, tudo funciona em "modo demonstração": os dados ficam só neste navegador (localStorage),
 * o que permite testar o painel e ver as edições no site antes de conectar o banco.
 *
 * Importante: este arquivo vai para o site público, então usa fetch direto (sem a biblioteca do Supabase)
 * para manter o site leve. A chave "anon" é pública por natureza; quem protege os dados são as regras (RLS)
 * de supabase/schema.sql.
 */

export const SB_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
export const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const LIVE = Boolean(SB_URL && SB_KEY)

const headers = () => ({ apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' })

/** Chamada à API REST do Supabase com a chave pública. */
export async function rest<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { ...headers(), ...(init.headers as Record<string, string>) } })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return (res.status === 204 || res.headers.get('content-length') === '0' ? null : await res.json()) as T
}

/** Envia um arquivo para um bucket do Storage (ex.: currículos em "lead-files"). Retorna o caminho salvo. */
export async function upload(bucket: string, file: File): Promise<string> {
  const safe = file.name.normalize('NFD').replace(/[^\w.-]+/g, '-').slice(-80)
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`
  const res = await fetch(`${SB_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { apikey: SB_KEY!, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!res.ok) throw new Error(`Upload ${res.status}`)
  return path
}

/* ---------- modo demonstração: "banco" no localStorage, compartilhado com o painel ---------- */

export const DEMO_KEY = 'komvos-painel-demo'
export type DemoTable = 'leads' | 'events' | 'site_content' | 'posts'
type DemoDb = Partial<Record<DemoTable, Record<string, unknown>[]>>

export function demoRead(): DemoDb {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY) || '{}') as DemoDb
  } catch {
    return {}
  }
}

export function demoWrite(db: DemoDb) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(db))
  } catch {
    /* armazenamento cheio ou bloqueado: ignora */
  }
}

/** Acrescenta linhas a uma tabela do modo demonstração (eventos limitados aos 6.000 mais recentes). */
export function demoInsert(table: DemoTable, rows: Record<string, unknown>[]) {
  const db = demoRead()
  const now = new Date().toISOString()
  const list = [...(db[table] ?? []), ...rows.map((r) => ({ id: crypto.randomUUID(), created_at: now, ...r }))]
  db[table] = table === 'events' ? list.slice(-6000) : list
  demoWrite(db)
}
