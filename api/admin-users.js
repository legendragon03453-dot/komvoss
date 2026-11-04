/*
 * Usuários do painel (/painel → Usuários). Roda no servidor da Vercel com a chave secreta do Supabase
 * (variável SUPABASE_SECRET_KEY, nunca enviada ao navegador).
 *
 * Toda chamada precisa do token de quem está logado no painel; só "admin" (administrador geral) pode usar.
 * POST { action: 'list' | 'create' | 'update' | 'password' | 'delete', ... }
 */
export const config = { runtime: 'edge' }

const URL_ = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY || ''
const ROLES = ['admin', 'editor']

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
const fail = (message, status = 400) => json({ error: message }, status)

const sb = (path, init = {}) =>
  fetch(`${URL_}${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })

async function caller(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  const r = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: SECRET, Authorization: `Bearer ${token}` } })
  if (!r.ok) return null
  const user = await r.json()
  const email = String(user.email || '').toLowerCase()
  const rows = await (await sb(`/rest/v1/admin_users?select=role&email=eq.${encodeURIComponent(email)}`)).json()
  return { email, role: rows?.[0]?.role || null }
}

async function authUsers() {
  const out = []
  for (let page = 1; page < 20; page++) {
    const r = await sb(`/auth/v1/admin/users?page=${page}&per_page=200`)
    const { users = [] } = await r.json()
    out.push(...users)
    if (users.length < 200) break
  }
  return out
}

const findUser = async (email) => (await authUsers()).find((u) => String(u.email).toLowerCase() === email)

const validPassword = (p) => typeof p === 'string' && p.length >= 8

export default async function handler(req) {
  if (!URL_ || !SECRET) return fail('Servidor sem a chave do Supabase (SUPABASE_SECRET_KEY).', 500)
  if (req.method !== 'POST') return fail('Use POST.', 405)
  const me = await caller(req)
  if (!me) return fail('Sessão expirada. Entre de novo.', 401)
  if (me.role !== 'admin') return fail('Só administradores gerais podem gerenciar usuários.', 403)

  let body = {}
  try {
    body = await req.json()
  } catch {
    return fail('Pedido inválido.')
  }
  const email = String(body.email || '').trim().toLowerCase()

  if (body.action === 'list') {
    const [users, rows] = await Promise.all([authUsers(), sb('/rest/v1/admin_users?select=*').then((r) => r.json())])
    const byEmail = new Map(users.map((u) => [String(u.email).toLowerCase(), u]))
    return json({
      me: me.email,
      users: rows
        .map((r) => {
          const u = byEmail.get(r.email.toLowerCase())
          return {
            email: r.email,
            name: r.name,
            role: r.role,
            created_at: r.created_at,
            created_by: r.created_by,
            last_sign_in_at: u?.last_sign_in_at || null,
            has_login: Boolean(u),
          }
        })
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    })
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('E-mail inválido.')

  if (body.action === 'create') {
    const role = ROLES.includes(body.role) ? body.role : 'editor'
    if (!validPassword(body.password)) return fail('A senha precisa ter pelo menos 8 caracteres.')
    const existing = await findUser(email)
    if (existing) {
      const r = await sb(`/auth/v1/admin/users/${existing.id}`, { method: 'PUT', body: JSON.stringify({ password: body.password, email_confirm: true }) })
      if (!r.ok) return fail('Não foi possível atualizar o acesso desse e-mail.')
    } else {
      const r = await sb('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password: body.password, email_confirm: true, user_metadata: { name: body.name || '' } }),
      })
      if (!r.ok) return fail((await r.json()).msg || 'Não foi possível criar o acesso.')
    }
    const r = await sb('/rest/v1/admin_users', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ email, name: body.name || null, role, created_by: me.email }),
    })
    if (!r.ok) return fail('Acesso criado, mas não foi possível dar permissão no painel.')
    return json({ ok: true })
  }

  if (body.action === 'update') {
    const patch = {}
    if (body.role !== undefined) {
      if (!ROLES.includes(body.role)) return fail('Nível de acesso inválido.')
      if (email === me.email && body.role !== 'admin') return fail('Você não pode tirar o seu próprio acesso de administrador.')
      patch.role = body.role
    }
    if (body.name !== undefined) patch.name = body.name || null
    const r = await sb(`/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) })
    if (!r.ok) return fail('Não foi possível salvar.')
    return json({ ok: true })
  }

  if (body.action === 'password') {
    if (!validPassword(body.password)) return fail('A senha precisa ter pelo menos 8 caracteres.')
    const u = await findUser(email)
    if (!u) return fail('Esse e-mail ainda não tem login.')
    const r = await sb(`/auth/v1/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ password: body.password }) })
    if (!r.ok) return fail('Não foi possível trocar a senha.')
    return json({ ok: true })
  }

  if (body.action === 'delete') {
    if (email === me.email) return fail('Você não pode remover o seu próprio acesso.')
    const admins = await (await sb('/rest/v1/admin_users?select=email&role=eq.admin')).json()
    if (admins.length <= 1 && admins[0]?.email?.toLowerCase() === email) return fail('É o último administrador geral: não dá para remover.')
    await sb(`/rest/v1/admin_users?email=eq.${encodeURIComponent(email)}`, { method: 'DELETE' })
    const u = await findUser(email)
    if (u) await sb(`/auth/v1/admin/users/${u.id}`, { method: 'DELETE' })
    return json({ ok: true })
  }

  return fail('Ação desconhecida.')
}
