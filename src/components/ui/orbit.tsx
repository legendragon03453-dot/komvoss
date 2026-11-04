import type { CSSProperties } from 'react'
import { A } from '../../content'

/** Símbolo Komvos dentro de um disco prateado (núcleo das órbitas e dos feixes). */
export function KCore({ className = '' }: { className?: string }) {
  return (
    <span className={`kcore ${className}`}>
      <span className="kcore-pulse" aria-hidden="true" />
      <span className="logo-crop kcore-logo">
        <img src={`${A}/logo.png`} alt="Grupo Komvos" />
      </span>
    </span>
  )
}

/**
 * Núcleo com agentes em órbita (inspirado nos "orbiting circles" do 21st.dev).
 * Os rótulos se distribuem em dois anéis que giram em sentidos opostos; cada rótulo fica sempre de pé.
 */
export function Orbit({ labels }: { labels: string[] }) {
  const inner = labels.filter((_, i) => i % 2 === 0)
  const outer = labels.filter((_, i) => i % 2 === 1)
  const ring = (items: string[], cls: string, offset: number) => (
    <div className={`orb-ring ${cls}`}>
      {items.map((l, i) => (
        <span key={l} className="orb-item" style={{ '--a': `${offset + (360 / items.length) * i}deg` } as CSSProperties}>
          <span className="orb-chip">
            <span className="orb-dot" aria-hidden="true" />
            {l}
          </span>
        </span>
      ))}
    </div>
  )
  return (
    <div className="orb" aria-label={`Agentes do Komvos Mind: ${labels.join(', ')}`} role="img">
      <span className="orb-track is-inner" aria-hidden="true" />
      <span className="orb-track is-outer" aria-hidden="true" />
      {ring(inner, 'is-inner', 0)}
      {ring(outer, 'is-outer', 60)}
      <KCore className="orb-core" />
    </div>
  )
}
