import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { KCore } from '../components/ui/orbit'

/*
 * Rede de conexões do hero da Home: o núcleo Komvos ligado às quatro frentes (cada uma na cor da empresa
 * responsável). Pulsos de luz percorrem as ligações e as tecnologias giram em volta do núcleo.
 * Geometria num quadrado de 600 × 600; os nós são HTML posicionados em %.
 */

const C = 300
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) }
}

const SOLS = [
  { slug: 'gestao-empresarial', label: 'Gestão Empresarial', color: 'var(--senior)', deg: -135 },
  { slug: 'pessoas-rh', label: 'Pessoas & RH', color: 'var(--trusth)', deg: -45 },
  { slug: 'cloud-tecnologia', label: 'Cloud & Tecnologia', color: 'var(--statum)', deg: 45 },
  { slug: 'dados-automacao-ia', label: 'Dados & IA', color: 'var(--statum)', deg: 135 },
].map((s) => ({ ...s, ...polar(200, s.deg) }))

const TECH = ['ERP', 'HCM', 'BPO', 'Cloud', 'Dados', 'IA']

const pct = (v: number) => `${(v / 600) * 100}%`

export function HeroNetwork() {
  return (
    <div className="hn" role="img" aria-label="Grupo Komvos conectando Gestão Empresarial, Pessoas & RH, Cloud & Tecnologia e Dados & IA">
      <svg className="hn-svg" viewBox="0 0 600 600" aria-hidden="true">
        <circle cx={C} cy={C} r="118" className="hn-ring" />
        <circle cx={C} cy={C} r="200" className="hn-ring" />
        <circle cx={C} cy={C} r="268" className="hn-ring is-outer" />

        {/* núcleo → frentes */}
        {SOLS.map((s, i) => {
          const d = `M${C},${C} L${s.x},${s.y}`
          return (
            <g key={s.slug}>
              <path d={d} className="hn-link" />
              <path d={d} className="hn-pulse" pathLength={1} style={{ stroke: s.color, animationDelay: `${i * 0.6}s` }} />
              <circle cx={s.x} cy={s.y} r="5" className="hn-dot" style={{ fill: s.color }} />
            </g>
          )
        })}
      </svg>

      {/* tecnologias girando em volta do núcleo */}
      <div className="hn-orbit" aria-hidden="true">
        {TECH.map((t, i) => (
          <span key={t} className="hn-tech" style={{ '--a': `${(360 / TECH.length) * i}deg` } as CSSProperties}>
            <span>{t}</span>
          </span>
        ))}
      </div>

      <KCore className="hn-core" />

      {SOLS.map((s) => (
        <Link
          key={s.slug}
          to={`/solucoes/${s.slug}`}
          className="hn-sol"
          style={{ left: pct(s.x), top: pct(s.y), '--c': s.color } as CSSProperties}
        >
          <span className="hn-sol-dot" aria-hidden="true" />
          {s.label}
        </Link>
      ))}

    </div>
  )
}
