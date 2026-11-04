import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Feixes animados ligando nós (inspirado no "animated beam" do 21st.dev):
 * origem → núcleo → destinos. As curvas são calculadas a partir da posição real dos nós,
 * então o mesmo componente funciona no desktop (em linha) e no celular (empilhado).
 */
export function AnimatedBeams({
  source,
  hub,
  targets,
}: {
  source: ReactNode
  hub: ReactNode
  targets: ReactNode[]
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<{ d: string; key: string }[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = wrap.current!
    const calc = () => {
      const box = el.getBoundingClientRect()
      const c = (n: Element | null) => {
        const r = n!.getBoundingClientRect()
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, w: r.width, h: r.height }
      }
      const s = c(el.querySelector('.ab-source'))
      const h = c(el.querySelector('.ab-hub'))
      const ts = [...el.querySelectorAll('.ab-target')].map((t) => c(t))
      const vertical = Math.abs(ts[0].x - h.x) < Math.abs(ts[0].y - h.y) && ts.length > 0 && Math.abs(s.x - h.x) < 40
      const curve = (a: typeof s, b: typeof s) => {
        if (vertical) {
          const my = (a.y + b.y) / 2
          return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`
        }
        const mx = (a.x + b.x) / 2
        return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`
      }
      setSize({ w: box.width, h: box.height })
      setPaths([{ d: curve(s, h), key: 'in' }, ...ts.map((t, i) => ({ d: curve(h, t), key: `out${i}` }))])
    }
    calc()
    const ro = new ResizeObserver(calc)
    ro.observe(el)
    return () => ro.disconnect()
  }, [targets.length])

  return (
    <div className="ab" ref={wrap}>
      <svg className="ab-svg" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
        <defs>
          <linearGradient id="ab-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" />
            <stop offset="1" stopColor="#c9ced3" stopOpacity="0" />
          </linearGradient>
        </defs>
        {paths.map((p, i) => (
          <g key={p.key}>
            <path d={p.d} className="ab-line" />
            <path d={p.d} className="ab-pulse" pathLength={1} style={{ animationDelay: `${i === 0 ? 0 : 0.9 + (i - 1) * 0.35}s` }} />
          </g>
        ))}
      </svg>
      <div className="ab-col ab-col-source">
        <div className="ab-node ab-source">{source}</div>
      </div>
      <div className="ab-col ab-col-hub">
        <div className="ab-node ab-hub">{hub}</div>
      </div>
      <div className="ab-col ab-col-targets">
        {targets.map((t, i) => (
          <div key={i} className="ab-node ab-target">
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}
