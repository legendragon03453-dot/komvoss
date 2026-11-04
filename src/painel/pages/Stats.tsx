import { useEffect, useMemo, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { listEvents, listLeads } from '../db'
import type { Event } from '../db'
import { DAY, DEVICE, num, pageName, pct, since, summarize } from '../stats'
import type { Row } from '../stats'
import { BarList, Card, Kpi, Loading, PageHead, Period, Tabs, useData } from '../ui'

type Tab = 'origem' | 'paginas' | 'localizacao' | 'mapa-de-calor'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'origem', label: 'Por onde entram', icon: 'door' },
  { id: 'paginas', label: 'Páginas', icon: 'blog' },
  { id: 'localizacao', label: 'Onde estão', icon: 'pin' },
  { id: 'mapa-de-calor', label: 'Mapa de calor', icon: 'fire' },
]

const MEDIUM: Record<string, string> = {
  'busca orgânica': 'Busca no Google e outros (grátis)',
  anúncio: 'Anúncios pagos',
  social: 'Redes sociais',
  direto: 'Digitou o endereço ou link salvo',
  'site externo': 'Links em outros sites',
  campanha: 'Campanhas com UTM',
}

export function Stats({ tab, go }: { tab: string; go: (s: string) => void }) {
  const current = (TABS.some((t) => t.id === tab) ? tab : 'origem') as Tab
  const [days, setDays] = useState(30)
  const { data, error } = useData(async () => {
    const from = since(days)
    const to = new Date(from.getTime() + (days + 1) * DAY)
    const [events, leads] = await Promise.all([listEvents(from.toISOString(), { type: 'pageview' }), listLeads()])
    return summarize(events, leads, from, to)
  }, [days])

  return (
    <>
      <PageHead title="Estatísticas do site" lead="Quem visita, de onde vem, onde entra e onde clica." actions={<Period value={days} onChange={setDays} />} />
      <Tabs value={current} onChange={(t) => go(`estatisticas/${t}`)} items={TABS} />
      {error && <p className="form-msg is-error">{error}</p>}
      {current === 'mapa-de-calor' ? (
        <Heatmap days={days} />
      ) : !data ? (
        <Loading />
      ) : current === 'origem' ? (
        <>
          <div className="kpis">
            <Kpi label="Visitas" value={num(data.sessions)} />
            <Kpi label="Saíram na primeira página" value={pct(data.bounce)} />
            <Kpi label="Páginas por visita" value={num(data.pagesPerSession, 1)} />
            <Kpi label="Visitas que viraram lead" value={pct(data.conversion, 1)} />
          </div>
          <div className="grid-2">
            <Card title="Origem das visitas" hint="Site, rede social ou campanha que trouxe cada pessoa">
              <BarList rows={data.sources} />
            </Card>
            <Card title="Tipo de canal" hint="Agrupado por tipo">
              <BarList rows={data.mediums} name={(k) => MEDIUM[k] ?? k} />
            </Card>
          </div>
          <div className="grid-2">
            <Card title="Onde as pessoas entram" hint="Primeira página que viram (página de entrada)">
              <BarList rows={data.landing} name={pageName} />
            </Card>
            <Card title="Leads por origem" hint="Que canais trazem contatos de verdade">
              <BarList rows={data.leadSources} empty="Nenhum lead no período." />
            </Card>
          </div>
          <Card title="Como medir campanhas" className="is-tip">
            <p>
              Para saber exatamente qual post ou anúncio trouxe a visita, use links com UTM. Exemplo:{' '}
              <code>komvoss.vercel.app/erp-by-senior?utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=erp-2026</code>. A origem
              aparece aqui com o nome que você colocar em <code>utm_source</code>.
            </p>
          </Card>
        </>
      ) : current === 'paginas' ? (
        <div className="grid-2">
          <Card title="Páginas mais vistas" hint="Todas as visualizações no período">
            <BarList rows={data.pages} name={pageName} />
          </Card>
          <Card title="Aparelhos" hint="Por visita">
            <BarList rows={data.devices} name={(k) => DEVICE[k] ?? k} />
          </Card>
        </div>
      ) : (
        <>
          <div className="grid-2">
            <Card title="Cidades" hint="Pela localização aproximada da internet (sem guardar o IP)">
              <BarList rows={data.cities} empty="A localização aparece depois que o site estiver publicado na Vercel com o Supabase." />
            </Card>
            <div className="stack">
              <Card title="Estados">
                <BarList rows={data.regions} name={ufName} empty="Sem localização no período." />
              </Card>
              <Card title="Países">
                <BarList rows={data.countries} />
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  )
}

const UF: Record<string, string> = {
  SP: 'São Paulo',
  MG: 'Minas Gerais',
  RJ: 'Rio de Janeiro',
  PR: 'Paraná',
  SC: 'Santa Catarina',
  RS: 'Rio Grande do Sul',
  GO: 'Goiás',
  MS: 'Mato Grosso do Sul',
  MT: 'Mato Grosso',
  DF: 'Distrito Federal',
  BA: 'Bahia',
  PE: 'Pernambuco',
  CE: 'Ceará',
  ES: 'Espírito Santo',
  TO: 'Tocantins',
}
const ufName = (k: string) => (UF[k] ? `${UF[k]} (${k})` : k)

/* ---------- mapa de calor ---------- */

const WIDTH: Record<string, number> = { desktop: 1440, mobile: 390 }

function Heatmap({ days }: { days: number }) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [path, setPath] = useState('/')
  const { data: clicks, error } = useData(() => listEvents(since(days).toISOString(), { type: 'click' }), [days])

  const pages: Row[] = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of clicks ?? []) m.set(c.path, (m.get(c.path) ?? 0) + 1)
    const total = clicks?.length ?? 0
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([key, value]) => ({ key, value, share: total ? value / total : 0 }))
  }, [clicks])

  const points = useMemo(
    () => (clicks ?? []).filter((c) => c.path === path && (device === 'mobile' ? c.device === 'mobile' : c.device !== 'mobile') && c.x != null && c.y != null),
    [clicks, path, device],
  )

  const labels: Row[] = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of points) if (c.label) m.set(c.label, (m.get(c.label) ?? 0) + 1)
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key, value]) => ({ key, value, share: points.length ? value / points.length : 0 }))
  }, [points])

  if (error) return <p className="form-msg is-error">{error}</p>
  if (!clicks) return <Loading />

  return (
    <>
      <div className="filters">
        <select value={path} onChange={(e) => setPath(e.target.value)} aria-label="Página">
          {(pages.some((p) => p.key === path) ? pages : [{ key: path, value: 0, share: 0 }, ...pages]).map((p) => (
            <option key={p.key} value={p.key}>
              {pageName(p.key)} ({num(p.value)} cliques)
            </option>
          ))}
        </select>
        <div className="seg" role="group" aria-label="Aparelho">
          {(['desktop', 'mobile'] as const).map((d) => (
            <button key={d} type="button" className={d === device ? 'is-on' : ''} aria-pressed={d === device} onClick={() => setDevice(d)}>
              {DEVICE[d]}
            </button>
          ))}
        </div>
        <span className="filters-note">{num(points.length)} cliques nesta página</span>
      </div>
      <div className="grid-heat">
        <Card title="Onde clicam" hint="Quanto mais quente, mais cliques. A página aparece como está hoje.">
          <HeatView path={path} width={WIDTH[device]} points={points} />
        </Card>
        <Card title="O que mais clicam" hint="Botões e links desta página">
          <BarList rows={labels} empty="Sem cliques nesta página no período." />
        </Card>
      </div>
    </>
  )
}

const VIEW_H: Record<number, number> = { 1440: 900, 390: 844 }

/**
 * A página real num iframe do tamanho de uma tela (desktop 1440×900 ou celular 390×844), reduzida para caber.
 * O calor cobre a página inteira e acompanha a rolagem do iframe. Cliques em partes fixas (menu do topo)
 * foram gravados na posição da tela e aparecem sempre no topo.
 */
function HeatView({ path, width, points }: { path: string; width: number; points: Event[] }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fixedRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const [boxW, setBoxW] = useState(800)
  const [docH, setDocH] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const viewH = VIEW_H[width] ?? 900
  const scale = Math.min(1, boxW / width)

  // altura de referência: a mais comum entre os cliques; depois, a da própria página carregada
  const clickH = useMemo(() => {
    const hs = points.map((p) => p.page_h ?? 0).filter(Boolean).sort((a, b) => a - b)
    return hs.length ? hs[Math.floor(hs.length / 2)] : 0
  }, [points])
  const height = docH || clickH || 4000

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width))
    if (boxRef.current) ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setLoaded(false)
    setDocH(0)
  }, [path, width])

  useEffect(() => {
    paint(canvasRef.current, width, height, points.filter((p) => !p.fixed), (p) => (p.page_h ? ((p.y ?? 0) / p.page_h) * height : (p.y ?? 0)))
    paint(fixedRef.current, width, viewH, points.filter((p) => p.fixed), (p) => p.y ?? 0)
  }, [points, width, height, viewH])

  function onLoad(e: SyntheticEvent<HTMLIFrameElement>) {
    setLoaded(true)
    try {
      const win = e.currentTarget.contentWindow!
      const doc = win.document.documentElement
      const sync = () => {
        if (layerRef.current) layerRef.current.style.transform = `translateY(${-win.scrollY}px)`
      }
      win.addEventListener('scroll', sync, { passive: true })
      // a altura muda enquanto imagens e seções carregam
      const measure = () => setDocH(doc.scrollHeight)
      measure()
      win.setTimeout(measure, 1500)
      win.setTimeout(measure, 4000)
    } catch {
      /* outra origem: o calor fica parado */
    }
  }

  return (
    <div className="heat" ref={boxRef}>
      <div className="heat-stage" style={{ width: width * scale, height: viewH * scale }}>
        <div className="heat-inner" style={{ width, height: viewH, transform: `scale(${scale})` }}>
          <iframe key={path + width} src={`${path}${path.includes('?') ? '&' : '?'}kv-preview=1`} title={`Página ${pageName(path)}`} width={width} height={viewH} onLoad={onLoad} />
          <div className="heat-layer" ref={layerRef} style={{ height }}>
            <canvas ref={canvasRef} style={{ width, height }} aria-hidden="true" />
          </div>
          <canvas ref={fixedRef} className="heat-fixed" style={{ width, height: viewH }} aria-hidden="true" />
        </div>
        {!loaded && <Loading text="Carregando a página…" />}
      </div>
      <div className="heat-legend" aria-hidden="true">
        <span>Poucos cliques</span>
        <i />
        <span>Muitos cliques</span>
      </div>
      <p className="heat-note">Role a página dentro do quadro para ver o calor de cada parte.</p>
    </div>
  )
}

/** Soma manchas suaves e pinta pela intensidade (uma cor só: magenta, claro no pouco e forte no muito). */
function paint(c: HTMLCanvasElement | null, width: number, height: number, points: Event[], yOf: (p: Event) => number) {
  if (!c) return
  const k = 0.5
  const W = Math.round(width * k)
  const H = Math.round(height * k)
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, W, H)
  const r = 22
  for (const p of points) {
    const x = (p.x ?? 0) * W
    const y = yOf(p) * k
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(0,0,0,0.22)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  if (!points.length) return
  const img = ctx.getImageData(0, 0, W, H)
  const d = img.data
  let max = 0
  for (let i = 3; i < d.length; i += 4) if (d[i] > max) max = d[i]
  if (!max) return
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / max
    if (!a) continue
    d[i] = Math.round(255 - a * 120)
    d[i + 1] = Math.round(120 - a * 120)
    d[i + 2] = Math.round(180 - a * 85)
    d[i + 3] = Math.round(Math.min(1, 0.25 + a) * 210)
  }
  ctx.putImageData(img, 0, 0)
}
