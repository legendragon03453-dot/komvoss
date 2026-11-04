import { LIVE, demoInsert, rest, upload } from './config'

/**
 * Envio dos formulários do site para a tabela "leads" (aparecem no painel em Captura de leads).
 * Todos os campos vão em `data`; os mais comuns (nome, e-mail, telefone…) também vão em colunas próprias
 * para facilitar a lista e a busca. Arquivos (currículo) vão para o Storage privado "lead-files".
 */

const PICK: [string, RegExp][] = [
  ['name', /^(nome|name|nome_completo|responsavel)$/i],
  ['email', /e-?mail/i],
  ['phone', /(telefone|phone|whatsapp|celular)/i],
  ['company', /(empresa|company|razao)/i],
  ['role', /(cargo|role|funcao|area)/i],
  ['message', /(desafio|mensagem|message|sobre|observa|conte)/i],
]

function session() {
  try {
    return JSON.parse(sessionStorage.getItem('kv-s') || 'null') as { id: string; source: string; medium: string; campaign: string } | null
  } catch {
    return null
  }
}

export async function submitLead(form: string, el: HTMLFormElement) {
  const fd = new FormData(el)
  const data: Record<string, string> = {}
  for (const [k, v] of fd.entries()) {
    if (v instanceof File) {
      if (!v.size) continue
      if (v.size > 10 * 1024 * 1024) throw new Error('Arquivo maior que 10 MB.')
      data[k] = LIVE ? `arquivo:${await upload('lead-files', v)}` : `arquivo (demonstração): ${v.name}`
    } else if (String(v).trim()) data[k] = String(v).trim()
  }
  const row: Record<string, unknown> = { form, data, page: location.pathname }
  for (const [col, re] of PICK) {
    const k = Object.keys(data).find((key) => re.test(key) && !data[key].startsWith('arquivo'))
    if (k && row[col] === undefined) row[col] = data[k]
  }
  const s = session()
  row.source = s?.source ?? null
  row.session_id = s?.id ?? null
  row.utm = s?.campaign ? { medium: s.medium, campaign: s.campaign } : null

  if (!LIVE) {
    demoInsert('leads', [{ status: 'novo', ...row }])
    return
  }
  await rest('leads', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) })
}
