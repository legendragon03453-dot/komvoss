/*
 * E-mail de cada conversão nos formulários do site (o lead também fica salvo no painel → Captura de leads).
 * Destino: LEAD_MAIL_TO (padrão marketing@grupokomvos.com.br).
 *
 * Envio:
 *  - com RESEND_API_KEY (e LEAD_MAIL_FROM de um domínio verificado no Resend), envia pelo Resend;
 *  - sem chave, usa o FormSubmit (formsubmit.co), que não precisa de conta: no primeiro envio ele manda
 *    um e-mail de ativação para o destino, e alguém precisa clicar em "Activate Form" uma única vez.
 *
 * POST { form, page, data: { campo: valor }, labels: { campo: rótulo } }
 */
export const config = { runtime: 'edge' }

const TO = process.env.LEAD_MAIL_TO || 'marketing@grupokomvos.com.br'
const FROM = process.env.LEAD_MAIL_FROM || 'Site Grupo Komvos <onboarding@resend.dev>'
const RESEND = process.env.RESEND_API_KEY || ''
const SITE = 'https://komvoss.vercel.app'

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const clip = (s, n) => String(s ?? '').slice(0, n)

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'json' }, 400)
  }
  const form = clip(body?.form || 'formulário', 80)
  const page = clip(body?.page || '/', 200)
  const data = body?.data && typeof body.data === 'object' ? body.data : {}
  const labels = body?.labels && typeof body.labels === 'object' ? body.labels : {}
  const entries = Object.entries(data)
    .slice(0, 40)
    .map(([k, v]) => {
      const value = String(v)
      return [clip(labels[k] || k, 120), value.startsWith('arquivo') ? 'Arquivo enviado (abra o lead no painel para baixar)' : clip(value, 5000)]
    })
  if (!entries.length) return json({ error: 'vazio' }, 400)

  const who = entries.find(([k]) => /nome|name/i.test(k))?.[1]
  const subject = `Novo lead no site: ${form}${who ? ` · ${clip(who, 60)}` : ''}`
  const replyTo = Object.entries(data).find(([k, v]) => /e-?mail/i.test(k) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)))?.[1]

  try {
    if (RESEND) {
      const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
<h2 style="margin:0 0 4px">Novo lead: ${esc(form)}</h2>
<p style="margin:0 0 16px;color:#666">Página ${esc(SITE + page)}</p>
<table cellpadding="8" style="border-collapse:collapse">${entries
        .map(([k, v]) => `<tr><td style="border:1px solid #ddd;background:#f6f6f6;font-weight:bold;vertical-align:top">${esc(k)}</td><td style="border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`)
        .join('')}</table>
<p style="color:#666">Todos os leads ficam em ${SITE}/painel</p></div>`
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: TO.split(',').map((s) => s.trim()), subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      })
      if (!r.ok) return json({ error: `resend ${r.status}`, detail: await r.text() }, 502)
      return json({ ok: true, via: 'resend' })
    }

    const payload = { _subject: subject, _template: 'table', _captcha: 'false', Formulário: form, Página: SITE + page, ...Object.fromEntries(entries) }
    if (replyTo) payload._replyto = replyTo
    const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: SITE, Referer: `${SITE}${page}` },
      body: JSON.stringify(payload),
    })
    const out = await r.json().catch(() => ({}))
    return json({ ok: r.ok, via: 'formsubmit', detail: out }, r.ok ? 200 : 502)
  } catch (e) {
    return json({ error: String(e) }, 502)
  }
}
