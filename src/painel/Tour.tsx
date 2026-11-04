import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './ui'

/**
 * Tutorial de boas-vindas (estilo SaaS): na primeira entrada, apresenta cada área do painel com uma
 * janelinha ao lado do item, iluminando o que está sendo explicado. Avançar, voltar, pular; setas do teclado.
 */

export type TourStep = {
  /** elemento destacado: [data-tour="…"] (sem alvo = janela no centro) */
  target?: string
  /** seção do painel que abre junto com o passo */
  route?: string
  title: string
  body: ReactNode
  icon?: string
}

type Rect = { top: number; left: number; width: number; height: number }

export function Tour({ steps, onClose, onRoute }: { steps: TourStep[]; onClose: (finished: boolean) => void; onRoute: (r: string) => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const step = steps[i]
  const last = i === steps.length - 1

  const measure = useCallback(() => {
    if (!step.target) return setRect(null)
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    const r = el?.getBoundingClientRect()
    if (!el || !r || r.width === 0) return setRect(null)
    el.scrollIntoView({ block: 'nearest' })
    const pad = 8
    setRect({ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 })
  }, [step])

  useEffect(() => {
    if (step.route) onRoute(step.route)
  }, [step, onRoute])

  useLayoutEffect(() => {
    measure()
    // a seção nova leva um instante para aparecer
    const t = window.setTimeout(measure, 250)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false)
      if (e.key === 'ArrowRight') setI((v) => Math.min(steps.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, steps.length])

  // janela ao lado do alvo (à direita; se não couber, embaixo), sempre dentro da tela
  const W = 360
  let pos: React.CSSProperties = {}
  if (rect) {
    const right = rect.left + rect.width + 16
    if (right + W < window.innerWidth - 12) pos = { top: Math.max(12, Math.min(rect.top, window.innerHeight - 320)), left: right }
    else pos = { top: Math.min(rect.top + rect.height + 14, window.innerHeight - 320), left: Math.max(12, Math.min(rect.left, window.innerWidth - W - 12)) }
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect ? (
        <div className="tour-spot" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      ) : (
        <div className="tour-dim" />
      )}
      <div className={`tour-pop${rect ? '' : ' is-center'}`} style={pos} key={i}>
        {step.icon && (
          <span className="tour-icon">
            <Icon name={step.icon} size={22} />
          </span>
        )}
        <span className="tour-count">
          Passo {i + 1} de {steps.length}
        </span>
        <h2 id="tour-title">{step.title}</h2>
        <div className="tour-body">{step.body}</div>
        <div className="tour-dots" aria-hidden="true">
          {steps.map((_, k) => (
            <span key={k} className={k === i ? 'is-on' : k < i ? 'is-done' : ''} />
          ))}
        </div>
        <div className="tour-actions">
          <button type="button" className="link-btn is-muted" onClick={() => onClose(false)}>
            Pular tutorial
          </button>
          <span className="spacer" />
          {i > 0 && (
            <button type="button" className="btn is-small" onClick={() => setI(i - 1)}>
              Voltar
            </button>
          )}
          <button type="button" className="btn is-small is-primary" onClick={() => (last ? onClose(true) : setI(i + 1))} autoFocus>
            {last ? 'Começar a usar' : 'Avançar →'}
          </button>
        </div>
      </div>
    </div>
  )
}
