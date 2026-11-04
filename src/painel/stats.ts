import type { Event, Lead } from './db'
import { SOLUTIONS } from '../cms/solucoes'
import { ARTICLES } from '../cms/insights'

/* Contas das estatísticas, feitas no navegador a partir dos eventos do período. */

export type Row = { key: string; value: number; share: number }

export const DAY = 864e5

export function since(days: number, offset = 0) {
  const d = new Date(Date.now() - (days + offset) * DAY)
  d.setHours(0, 0, 0, 0)
  return d
}

const top = (m: Map<string, number>, total?: number, limit = 10): Row[] => {
  const sum = total ?? [...m.values()].reduce((a, b) => a + b, 0)
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value, share: sum ? value / sum : 0 }))
}

const inc = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by)

export const COUNTRY: Record<string, string> = {
  BR: 'Brasil',
  PT: 'Portugal',
  US: 'Estados Unidos',
  AR: 'Argentina',
  PY: 'Paraguai',
  UY: 'Uruguai',
  CL: 'Chile',
  ES: 'Espanha',
  DE: 'Alemanha',
  GB: 'Reino Unido',
}

export function summarize(events: Event[], leads: Lead[], from: Date, to: Date) {
  const views = events.filter((e) => e.type === 'pageview')
  const sessions = new Map<string, Event[]>()
  for (const e of views) {
    const list = sessions.get(e.session_id)
    if (list) list.push(e)
    else sessions.set(e.session_id, [e])
  }
  const visitors = new Set(views.map((e) => e.visitor_id ?? e.session_id))
  const firsts = [...sessions.values()].map((l) => l.find((e) => e.landing) ?? l[0])
  const bounces = [...sessions.values()].filter((l) => l.length === 1).length
  const periodLeads = leads.filter((l) => new Date(l.created_at) >= from && new Date(l.created_at) < to)

  // visitas por dia (todas as datas do período, inclusive as sem visita)
  const days: { date: Date; sessions: number; views: number; leads: number }[] = []
  for (let t = from.getTime(); t < to.getTime(); t += DAY) days.push({ date: new Date(t), sessions: 0, views: 0, leads: 0 })
  const dayIndex = (iso: string) => Math.floor((new Date(iso).getTime() - from.getTime()) / DAY)
  for (const f of firsts) {
    const i = dayIndex(f.created_at)
    if (days[i]) days[i].sessions++
  }
  for (const v of views) {
    const i = dayIndex(v.created_at)
    if (days[i]) days[i].views++
  }
  for (const l of periodLeads) {
    const i = dayIndex(l.created_at)
    if (days[i]) days[i].leads++
  }

  const sources = new Map<string, number>()
  const mediums = new Map<string, number>()
  const landing = new Map<string, number>()
  const devices = new Map<string, number>()
  const countries = new Map<string, number>()
  const regions = new Map<string, number>()
  const cities = new Map<string, number>()
  for (const f of firsts) {
    inc(sources, f.source || 'Direto')
    inc(mediums, f.medium || 'direto')
    inc(landing, f.path)
    inc(devices, f.device || 'desktop')
    inc(countries, f.country ? (COUNTRY[f.country] ?? f.country) : 'Não identificado')
    if (f.region) inc(regions, f.country === 'BR' ? f.region : `${f.region} (${f.country})`)
    if (f.city) inc(cities, `${f.city}${f.region ? ` · ${f.region}` : ''}`)
  }
  const pages = new Map<string, number>()
  for (const v of views) inc(pages, v.path)
  const leadSources = new Map<string, number>()
  for (const l of periodLeads) inc(leadSources, l.source || 'Não identificado')

  const n = sessions.size
  return {
    sessions: n,
    visitors: visitors.size,
    views: views.length,
    leads: periodLeads.length,
    conversion: n ? periodLeads.length / n : 0,
    bounce: n ? bounces / n : 0,
    pagesPerSession: n ? views.length / n : 0,
    days,
    sources: top(sources, n),
    mediums: top(mediums, n),
    landing: top(landing, n),
    pages: top(pages, views.length, 15),
    devices: top(devices, n),
    countries: top(countries, n),
    regions: top(regions, n),
    cities: top(cities, n, 15),
    leadSources: top(leadSources, periodLeads.length),
  }
}

export type Summary = ReturnType<typeof summarize>

export const pct = (v: number, digits = 0) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: digits })}%`
export const num = (v: number, digits = 0) => v.toLocaleString('pt-BR', { maximumFractionDigits: digits })

export const DEVICE: Record<string, string> = { desktop: 'Computador', mobile: 'Celular', tablet: 'Tablet' }

/** Nome amigável de uma página do site. */
export function pageName(path: string) {
  const NAMES: Record<string, string> = {
    '/': 'Home',
    '/solucoes': 'Soluções',
    '/erp-by-senior': 'ERP by Senior',
    '/komvos-os': 'Komvos OS',
    '/komvos-mind': 'Komvos Mind',
    '/ecossistema': 'Ecossistema',
    '/clientes': 'Clientes',
    '/insights': 'Insights',
    '/sobre': 'Sobre',
    '/contato': 'Entre em contato',
    '/seja-um-parceiro': 'Seja um parceiro',
    '/trabalhe-conosco': 'Trabalhe conosco',
  }
  if (NAMES[path]) return NAMES[path]
  if (path.startsWith('/solucoes/')) return `Solução: ${SOLUTIONS.find((x) => x.slug === path.slice(10))?.title ?? path.slice(10)}`
  if (path.startsWith('/insights/')) return `Artigo: ${ARTICLES.find((x) => x.slug === path.slice(10))?.title ?? path.slice(10).replace(/-/g, ' ')}`
  return path
}
