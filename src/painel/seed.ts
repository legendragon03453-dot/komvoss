import { demoRead, demoWrite } from '../live/config'

/*
 * Dados de EXEMPLO para o modo demonstração (sem Supabase): 60 dias de visitas, cliques e alguns leads,
 * só para o painel não abrir vazio. Somem ao conectar o banco ou ao clicar em "Limpar demonstração".
 */

const FLAG = 'komvos-painel-demo-seeded'

let s = 7
const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
const pick = <T,>(list: [T, number][]): T => {
  const total = list.reduce((a, [, w]) => a + w, 0)
  let r = rnd() * total
  for (const [v, w] of list) if ((r -= w) <= 0) return v
  return list[0][0]
}

const SOURCES: [[string, string], number][] = [
  [['Google', 'busca orgânica'], 38],
  [['Direto', 'direto'], 24],
  [['Instagram', 'social'], 16],
  [['LinkedIn', 'social'], 11],
  [['WhatsApp', 'social'], 5],
  [['Google', 'anúncio'], 4],
  [['ChatGPT', 'site externo'], 2],
]
const LANDING: [string, number][] = [
  ['/', 46],
  ['/solucoes/gestao-empresarial', 10],
  ['/erp-by-senior', 9],
  ['/insights/agentes-de-ia-na-operacao', 8],
  ['/solucoes', 7],
  ['/komvos-mind', 6],
  ['/trabalhe-conosco', 6],
  ['/contato', 4],
  ['/sobre', 4],
]
const NEXT: [string, number][] = [
  ['/solucoes', 18],
  ['/contato', 14],
  ['/sobre', 10],
  ['/ecossistema', 9],
  ['/erp-by-senior', 8],
  ['/komvos-os', 6],
  ['/komvos-mind', 7],
  ['/clientes', 6],
  ['/insights', 6],
  ['/seja-um-parceiro', 4],
  ['/solucoes/pessoas-rh', 5],
  ['/solucoes/cloud-tecnologia', 4],
]
const GEO: [[string, string, string], number][] = [
  [['BR', 'SP', 'Ribeirão Preto'], 30],
  [['BR', 'SP', 'São Paulo'], 22],
  [['BR', 'SP', 'Campinas'], 8],
  [['BR', 'SP', 'São José do Rio Preto'], 7],
  [['BR', 'MG', 'Uberlândia'], 6],
  [['BR', 'MG', 'Belo Horizonte'], 5],
  [['BR', 'PR', 'Curitiba'], 5],
  [['BR', 'GO', 'Goiânia'], 4],
  [['BR', 'RJ', 'Rio de Janeiro'], 5],
  [['BR', 'SC', 'Florianópolis'], 3],
  [['PT', '11', 'Lisboa'], 1],
  [['US', 'FL', 'Miami'], 1],
]
// pontos de clique típicos da Home (x de 0 a 1, y em px numa tela de 1440)
const HOT: [[number, number, string], number][] = [
  [[0.88, 50, 'Entre em contato'], 16],
  [[0.17, 52, 'Soluções'], 10],
  [[0.23, 52, 'Arquitetura'], 7],
  [[0.29, 470, 'Entre em contato'], 14],
  [[0.42, 470, 'Conheça as soluções'], 9],
  [[0.62, 330, 'Gestão Empresarial'], 6],
  [[0.75, 520, 'Pessoas & RH'], 4],
  [[0.5, 1500, 'Conectar'], 5],
  [[0.3, 2400, 'Gestão Empresarial'], 5],
  [[0.5, 3300, 'Reel'], 4],
  [[0.7, 4700, 'Falar com um especialista'], 8],
]

export function seedDemo() {
  try {
    if (localStorage.getItem(FLAG)) return
    localStorage.setItem(FLAG, '1')
  } catch {
    return
  }
  const db = demoRead()
  const events: Record<string, unknown>[] = []
  const leads: Record<string, unknown>[] = []
  const now = Date.now()
  const DAY = 864e5
  for (let d = 59; d >= 0; d--) {
    const date = new Date(now - d * DAY)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    const sessions = Math.round((weekend ? 14 : 30) * (0.75 + (60 - d) / 120) * (0.8 + rnd() * 0.4))
    for (let i = 0; i < sessions; i++) {
      const sid = `demo-${d}-${i}`
      const [source, medium] = pick(SOURCES)
      const [country, region, city] = pick(GEO)
      const device = rnd() < 0.58 ? 'mobile' : rnd() < 0.9 ? 'desktop' : 'tablet'
      const t0 = date.getTime() - (8 + rnd() * 12) * 36e5 + rnd() * 36e5
      const base = { session_id: sid, visitor_id: `v-${Math.floor(rnd() * sessions * 40)}`, source, medium, campaign: medium === 'anúncio' ? 'erp-2026' : null, device, country, region, city, vw: device === 'mobile' ? 390 : 1440 }
      const pages = [pick(LANDING)]
      const depth = rnd() < 0.42 ? 1 : 1 + Math.ceil(rnd() * 4)
      while (pages.length < depth) pages.push(pick(NEXT))
      pages.forEach((path, k) => {
        const at = new Date(Math.min(now, t0 + k * 70e3)).toISOString()
        events.push({ ...base, id: `${sid}-${k}`, created_at: at, type: 'pageview', path, landing: k === 0, referrer: null, x: null, y: null, page_h: null, label: null })
        if (path === '/' && rnd() < 0.8)
          for (let c = 0, n = 1 + Math.floor(rnd() * 2); c < n; c++) {
            const [x, y, label] = pick(HOT)
            const scale = device === 'mobile' ? 1.6 : 1
            events.push({ ...base, id: `${sid}-${k}-c${c}`, created_at: at, type: 'click', path, landing: false, referrer: null, x: Math.min(0.98, Math.max(0.02, x + (rnd() - 0.5) * 0.06)), y: y < 100 ? Math.round(y + (rnd() - 0.5) * 16) : Math.round(y * scale + (rnd() - 0.5) * 40), page_h: device === 'mobile' ? 9800 : 6200, label, fixed: y < 100 })
          }
      })
      if (rnd() < 0.035) {
        const form = pick<string>([['contato', 6], ['trabalhe conosco', 2], ['parceiro: Revenda', 1]])
        const n = leads.length
        leads.push({
          id: `lead-${sid}`,
          created_at: new Date(Math.min(now, t0 + 5 * 60e3)).toISOString(),
          form,
          name: ['Mariana Costa', 'Rafael Lima', 'Juliana Prado', 'Carlos Menezes', 'Ana Ribeiro', 'Pedro Alves', 'Fernanda Rocha', 'Lucas Martins'][n % 8] + ' (exemplo)',
          email: `contato${n + 1}@empresa-exemplo.com.br`,
          phone: form === 'contato' ? null : '(16) 99999-0000',
          company: form === 'trabalhe conosco' ? null : ['Agro Norte', 'Usina Vale', 'Grupo Horizonte', 'Transportes Sul', 'Clínica Vida'][n % 5],
          role: form === 'contato' ? ['Diretor financeiro', 'Gerente de TI', 'CEO', 'Coordenadora de RH'][n % 4] : null,
          message: form === 'contato' ? 'Queremos integrar o ERP com o RH e reduzir retrabalho na folha.' : null,
          data: {},
          page: form === 'contato' ? '/contato' : form === 'trabalhe conosco' ? '/trabalhe-conosco' : '/seja-um-parceiro',
          source,
          status: d > 20 ? pick([['ganho', 2], ['perdido', 2], ['qualificado', 3], ['em_contato', 3]]) : d > 5 ? pick([['em_contato', 3], ['qualificado', 1], ['novo', 2]]) : 'novo',
          notes: null,
        })
      }
    }
  }
  db.events = [...events, ...(db.events ?? [])]
  db.leads = [...leads, ...(db.leads ?? [])]
  demoWrite(db)
}

/** Apaga tudo do modo demonstração (e os exemplos voltam na próxima abertura, se `reseed`). */
export function clearDemo(reseed = false) {
  try {
    localStorage.removeItem('komvos-painel-demo')
    if (reseed) localStorage.removeItem(FLAG)
    else localStorage.setItem(FLAG, '1')
  } catch {
    /* ignora */
  }
}
