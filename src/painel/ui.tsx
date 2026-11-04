import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Row } from './stats'
import { num } from './stats'

/* ---------- ícones (traço 1.6, 24×24) ---------- */
const P: Record<string, string> = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  leads: 'M4 5h16v14H4zM4 7l8 6 8-6',
  stats: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  blog: 'M5 4h11l3 3v13H5zM8 9h8M8 13h8M8 17h5',
  out: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
  eyeOff: 'M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.3 3.8M6.6 6.6C3.8 8.3 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.4-1',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5a1.5 1.5 0 1 1 0-.01',
  menu: 'M4 7h16M4 12h16M4 17h10',
  text: 'M5 6h14M12 6v13M8 19h8',
  undo: 'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  close: 'M6 6l12 12M18 6L6 18',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  alert: 'M12 3l10 18H2zM12 10v5M12 18v.01',
  globe: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  fire: 'M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-3 5-3 8a6 6 0 0 0 6 6z',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z',
  door: 'M5 21V4h10v17M15 6h4v15M11 12h.01M3 21h18',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18 14a6 6 0 0 1 4 6',
  help: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17v.01',
  key: 'M14 10a4 4 0 1 1-1.2-2.8L21 7v3h-2v2h-2v2l-3.2-1.2M7.5 12.5h.01',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  drag: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  alignLeft: 'M4 6h16M4 10h10M4 14h16M4 18h10',
  alignCenter: 'M4 6h16M7 10h10M4 14h16M7 18h10',
  alignRight: 'M4 6h16M10 10h10M4 14h16M10 18h10',
  heading: 'M6 4v16M18 4v16M6 12h12',
  paragraph: 'M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13',
  video: 'M3 6h13v12H3zM16 10l5-3v10l-5-3',
  button: 'M3 8h18v8H3zM8 12h8',
  quote: 'M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  divider: 'M3 12h18M8 6h8M8 18h8',
  author: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  phone: 'M7 2h10v20H7zM11 18h2',
  save: 'M5 3h11l3 3v15H5zM8 3v6h7V3M8 21v-7h8v7',
  copyBlock: 'M9 9h11v11H9zM5 15H4V4h11v1',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4',
}
export function Icon({ name, size = 18 }: { name: keyof typeof P | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] ?? ''} />
    </svg>
  )
}

/* ---------- avisos rápidos ---------- */
type Toast = { id: number; text: string; tone: 'ok' | 'error' }
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([])
  const show = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setList((l) => [...l, { id, text, tone }])
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), tone === 'error' ? 7000 : 3500)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`toast is-${t.tone}`}>
            <Icon name={t.tone === 'ok' ? 'star' : 'alert'} size={16} />
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- confirmação com a consequência explicada ---------- */
export type ConfirmOptions = {
  title: string
  /** o que vai acontecer, em linguagem simples */
  consequences: ReactNode[]
  confirm: string
  danger?: boolean
  /** exige digitar este texto para liberar o botão (ações sem volta) */
  typeToConfirm?: string
}
const ConfirmCtx = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false)
export const useConfirm = () => useContext(ConfirmCtx)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null)
  const [typed, setTyped] = useState('')
  const resolver = useRef<(v: boolean) => void>()
  const ask = useCallback((o: ConfirmOptions) => {
    setTyped('')
    setOpts(o)
    return new Promise<boolean>((res) => (resolver.current = res))
  }, [])
  const close = (v: boolean) => {
    resolver.current?.(v)
    setOpts(null)
  }
  const locked = Boolean(opts?.typeToConfirm && typed.trim().toLowerCase() !== opts.typeToConfirm.trim().toLowerCase())
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {opts && (
        <Modal onClose={() => close(false)} labelledBy="confirm-title" small>
          <div className={`confirm${opts.danger ? ' is-danger' : ''}`}>
            <span className="confirm-icon">
              <Icon name="alert" size={22} />
            </span>
            <h2 id="confirm-title">{opts.title}</h2>
            <p className="confirm-lead">Antes de continuar, veja o que vai acontecer:</p>
            <ul>
              {opts.consequences.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            {opts.typeToConfirm && (
              <label className="field">
                <span>
                  Para confirmar, digite <strong>{opts.typeToConfirm}</strong>
                </span>
                <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
              </label>
            )}
            <div className="confirm-actions">
              <button type="button" className="btn" onClick={() => close(false)} autoFocus={!opts.typeToConfirm}>
                Cancelar
              </button>
              <button type="button" className={`btn ${opts.danger ? 'is-danger' : 'is-primary'}`} disabled={locked} onClick={() => close(true)}>
                {opts.confirm}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmCtx.Provider>
  )
}

/* ---------- janela ---------- */
export function Modal({ children, onClose, labelledBy, small, wide }: { children: ReactNode; onClose: () => void; labelledBy?: string; small?: boolean; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${small ? ' is-small' : ''}${wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button type="button" className="modal-x" onClick={onClose} aria-label="Fechar">
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  )
}

/* ---------- blocos ---------- */
export function PageHead({ title, lead, actions }: { title: string; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

export function Card({ title, hint, children, className = '', action }: { title?: string; hint?: ReactNode; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {hint && <p>{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Kpi({ label, value, delta, hint }: { label: string; value: string; delta?: number | null; hint?: string }) {
  return (
    <div className="kpi">
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {delta != null && Number.isFinite(delta) && (
        <span className={`kpi-delta ${delta > 0.005 ? 'is-up' : delta < -0.005 ? 'is-down' : ''}`}>
          <Icon name={delta >= 0 ? 'up' : 'down'} size={13} />
          {Math.abs(delta * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% {hint ?? 'vs. período anterior'}
        </span>
      )}
    </div>
  )
}

/** Lista com barra horizontal: rótulo e valor sempre visíveis (a cor não carrega a informação sozinha). */
export function BarList({ rows, format = (r) => num(r.value), empty = 'Sem dados no período.', name = (k) => k }: { rows: Row[]; format?: (r: Row) => string; empty?: string; name?: (k: string) => ReactNode }) {
  if (!rows.length) return <p className="empty">{empty}</p>
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ol className="barlist">
      {rows.map((r) => (
        <li key={r.key}>
          <span className="barlist-bar" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden="true" />
          <span className="barlist-name">{name(r.key)}</span>
          <span className="barlist-val">
            {format(r)}
            <small>{(r.share * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%</small>
          </span>
        </li>
      ))}
    </ol>
  )
}

/** Gráfico de linha de uma série, com área suave e leitura do dia ao passar o mouse. */
export function LineChart({ points, label, height = 220 }: { points: { date: Date; value: number }[]; label: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(600)
  const [hover, setHover] = useState<number | null>(null)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  if (!points.length) return <p className="empty">Sem dados no período.</p>
  const pad = { l: 36, r: 12, t: 12, b: 26 }
  const max = Math.max(4, ...points.map((p) => p.value))
  const step = Math.pow(10, Math.floor(Math.log10(max)))
  const top = Math.ceil(max / step) * step
  const ticks = [0, top / 2, top]
  const x = (i: number) => pad.l + (points.length === 1 ? 0 : (i / (points.length - 1)) * (w - pad.l - pad.r))
  const y = (v: number) => pad.t + (1 - v / top) * (height - pad.t - pad.b)
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join('')
  const area = `${line}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  const every = Math.ceil(points.length / Math.max(2, Math.floor(w / 90)))
  const h = hover != null ? points[hover] : null
  return (
    <div className="chart" ref={ref}>
      <svg
        width={w}
        height={height}
        role="img"
        aria-label={`${label} por dia`}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const i = Math.round(((e.clientX - r.left - pad.l) / (w - pad.l - pad.r)) * (points.length - 1))
          setHover(Math.max(0, Math.min(points.length - 1, i)))
        }}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={pad.l - 8} y={y(t) + 4} className="chart-tick" textAnchor="end">
              {num(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % every === 0 ? (
            <text key={i} x={x(i)} y={height - 6} className="chart-tick" textAnchor="middle">
              {fmt(p.date)}
            </text>
          ) : null,
        )}
        <path d={area} className="chart-area" />
        <path d={line} className="chart-line" />
        {h && hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} className="chart-cross" />
            <circle cx={x(hover)} cy={y(h.value)} r={5} className="chart-dot" />
          </g>
        )}
      </svg>
      {h && hover != null && (
        <div className="chart-tip" style={{ left: Math.min(Math.max(x(hover), 70), w - 70) }}>
          <span>{h.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
          <strong>
            {num(h.value)} {label.toLowerCase()}
          </strong>
        </div>
      )}
    </div>
  )
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string; icon?: string }[] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} className={t.id === value ? 'is-on' : ''} onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size={16} />}
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Period({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="seg" role="group" aria-label="Período">
      {[7, 30, 90].map((d) => (
        <button key={d} type="button" className={d === value ? 'is-on' : ''} aria-pressed={d === value} onClick={() => onChange(d)}>
          {d} dias
        </button>
      ))}
    </div>
  )
}

export function Loading({ text = 'Carregando…' }: { text?: string }) {
  return (
    <div className="loading">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'blue' | 'pink' | 'amber' | 'red' | 'dark' }) {
  return <span className={`badge is-${tone}`}>{children}</span>
}

/** Carrega dados assíncronos com estado de carregando / erro e função para recarregar. */
export function useData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    setError('')
    load()
      .then((d) => alive && setData(d))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { data, error, reload: () => setTick((t) => t + 1), setData }
}

export const fmtDate = (iso: string, withTime = true) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) })
