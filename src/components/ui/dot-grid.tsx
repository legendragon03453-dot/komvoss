import { useEffect, useRef } from 'react'

/**
 * Fundo de pontos com uma lanterna que segue o ponteiro (inspirado nos "background boxes / spotlight"
 * do 21st.dev). Só CSS + uma variável de posição; um brilho lento passeia quando o ponteiro não está ali.
 */
export function DotGrid({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    const host = el.closest('section') ?? el.parentElement!
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--gx', `${e.clientX - r.left}px`)
      el.style.setProperty('--gy', `${e.clientY - r.top}px`)
      el.classList.add('is-pointer')
    }
    const leave = () => el.classList.remove('is-pointer')
    host.addEventListener('pointermove', move)
    host.addEventListener('pointerleave', leave)
    return () => {
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div ref={ref} className={`dg ${className}`}>
      <span className="dg-base" />
      <span className="dg-lit" />
      <span className="dg-glow" />
    </div>
  )
}
