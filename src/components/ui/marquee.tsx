import type { CSSProperties, ReactNode } from 'react'

/**
 * Faixa infinita (inspirada nos "marquee" do 21st.dev): o conteúdo é repetido e desliza sem fim,
 * com as bordas esmaecidas. Pausa no hover; parada para quem reduz movimento.
 */
export function Marquee({
  children,
  reverse = false,
  vertical = false,
  duration = 40,
  gap = 16,
  repeat = 2,
  className = '',
}: {
  children: ReactNode
  reverse?: boolean
  vertical?: boolean
  /** segundos para uma volta completa */
  duration?: number
  gap?: number
  /** quantas cópias do conteúdo (2 basta quando o conteúdo é maior que a área visível) */
  repeat?: number
  className?: string
}) {
  return (
    <div
      className={`mq${vertical ? ' mq-v' : ''}${reverse ? ' is-reverse' : ''} ${className}`}
      style={{ '--mq-dur': `${duration}s`, '--mq-gap': `${gap}px` } as CSSProperties}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div key={i} className="mq-track" aria-hidden={i > 0 || undefined}>
          {children}
        </div>
      ))}
    </div>
  )
}
