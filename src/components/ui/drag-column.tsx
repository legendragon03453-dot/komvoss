import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { prefersReducedMotion } from '../../motion'

/**
 * Coluna que rola sozinha (em loop) e pode ser arrastada para cima ou para baixo.
 * Pausa enquanto o ponteiro está em cima; o conteúdo é duplicado para o loop não ter emenda.
 */
export function DragColumn({
  children,
  speed = 22,
  reverse = false,
  className = '',
}: {
  children: ReactNode
  /** pixels por segundo */
  speed?: number
  reverse?: boolean
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current!
    const tr = track.current!
    const auto = !prefersReducedMotion()
    let y = 0
    let half = 0
    let hover = false
    let drag: { start: number; from: number } | null = null
    let last = performance.now()
    let raf = 0

    // metade do conteúdo (inclui o espaço entre a última e a primeira cópia)
    const measure = () => (half = (tr.scrollHeight + parseFloat(getComputedStyle(tr).rowGap || '0')) / 2)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(tr)

    const render = () => {
      if (half > 0) y = ((y % half) + half) % half
      tr.style.transform = `translate3d(0, ${-y}px, 0)`
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (auto && !hover && !drag && !document.hidden) y += (reverse ? -1 : 1) * speed * dt
      render()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      drag = { start: e.clientY, from: y }
      el.setPointerCapture(e.pointerId)
      el.classList.add('is-dragging')
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      y = drag.from - (e.clientY - drag.start)
      render()
    }
    const up = () => {
      drag = null
      el.classList.remove('is-dragging')
    }
    const enter = () => (hover = true)
    const leave = () => {
      hover = false
      up()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointerleave', leave)
    }
  }, [speed, reverse])

  return (
    <div ref={wrap} className={`dc ${className}`}>
      <div ref={track} className="dc-track">
        {children}
        <div className="dc-copy" aria-hidden="true" style={{ display: 'contents' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
