import { useState } from 'react'
import { listEvents, listLeads } from '../db'
import { DAY, num, pageName, pct, since, summarize } from '../stats'
import { BarList, Badge, Card, Kpi, LineChart, Loading, PageHead, Period, fmtDate, useData } from '../ui'
import { STATUS } from './Leads'

export function Overview({ go }: { go: (s: string) => void }) {
  const [days, setDays] = useState(30)
  const { data, error } = useData(async () => {
    const from = since(days)
    const prevFrom = since(days, days)
    const to = new Date(from.getTime() + (days + 1) * DAY)
    const [events, leads] = await Promise.all([listEvents(prevFrom.toISOString(), { type: 'pageview' }), listLeads()])
    const cur = summarize(
      events.filter((e) => e.created_at >= from.toISOString()),
      leads,
      from,
      to,
    )
    const prev = summarize(
      events.filter((e) => e.created_at < from.toISOString()),
      leads,
      prevFrom,
      from,
    )
    return { cur, prev, leads }
  }, [days])

  const delta = (a: number, b: number) => (b ? (a - b) / b : null)

  return (
    <>
      <PageHead title="Visão geral" lead="Como o site está indo: visitas, de onde vêm e quantas viram contato." actions={<Period value={days} onChange={setDays} />} />
      {error && <p className="form-msg is-error">{error}</p>}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="kpis">
            <Kpi label="Visitas" value={num(data.cur.sessions)} delta={delta(data.cur.sessions, data.prev.sessions)} />
            <Kpi label="Pessoas diferentes" value={num(data.cur.visitors)} delta={delta(data.cur.visitors, data.prev.visitors)} />
            <Kpi label="Páginas vistas" value={num(data.cur.views)} delta={delta(data.cur.views, data.prev.views)} />
            <Kpi label="Leads" value={num(data.cur.leads)} delta={delta(data.cur.leads, data.prev.leads)} />
            <Kpi label="Visitas que viraram lead" value={pct(data.cur.conversion, 1)} delta={delta(data.cur.conversion, data.prev.conversion)} />
          </div>

          <Card title="Visitas por dia" hint={`Últimos ${days} dias. Passe o mouse para ver cada dia.`}>
            <LineChart points={data.cur.days.map((d) => ({ date: d.date, value: d.sessions }))} label="Visitas" />
          </Card>

          <div className="grid-2">
            <Card
              title="Por onde as pessoas chegam"
              hint="Origem de cada visita"
              action={
                <button type="button" className="link-btn" onClick={() => go('estatisticas/origem')}>
                  Detalhes →
                </button>
              }
            >
              <BarList rows={data.cur.sources.slice(0, 6)} />
            </Card>
            <Card
              title="Onde as pessoas entram"
              hint="Primeira página da visita"
              action={
                <button type="button" className="link-btn" onClick={() => go('estatisticas/paginas')}>
                  Detalhes →
                </button>
              }
            >
              <BarList rows={data.cur.landing.slice(0, 6)} name={pageName} />
            </Card>
          </div>

          <div className="grid-2">
            <Card
              title="De onde são"
              hint="Cidades das visitas"
              action={
                <button type="button" className="link-btn" onClick={() => go('estatisticas/localizacao')}>
                  Detalhes →
                </button>
              }
            >
              <BarList rows={data.cur.cities.slice(0, 6)} empty="A localização aparece depois que o site estiver publicado na Vercel com o Supabase." />
            </Card>
            <Card
              title="Últimos leads"
              action={
                <button type="button" className="link-btn" onClick={() => go('leads')}>
                  Ver todos →
                </button>
              }
            >
              {data.leads.length ? (
                <ul className="mini-leads">
                  {data.leads.slice(0, 6).map((l) => (
                    <li key={l.id}>
                      <div>
                        <strong>{l.name || l.email || 'Sem nome'}</strong>
                        <span>
                          {l.form} · {fmtDate(l.created_at)}
                        </span>
                      </div>
                      <Badge tone={STATUS[l.status]?.tone}>{STATUS[l.status]?.label ?? l.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty">Nenhum lead ainda. Eles aparecem aqui assim que alguém enviar um formulário do site.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  )
}
