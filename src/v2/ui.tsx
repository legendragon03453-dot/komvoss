import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export const V2 = '/assets/v2'
export const INSTAGRAM_URL = 'https://www.instagram.com/komvostech/'
// TODO: número oficial de WhatsApp do Grupo Komvos. Enquanto não houver, o ícone leva ao formulário de contato.
export const WHATSAPP_URL = ''

/** Botão do Figma v2: contorno branco, texto em caixa alta e quadrado em gradiente com seta. */
export function OutlineButton({ to, children, small = false }: { to: string; children: ReactNode; small?: boolean }) {
  return (
    <Link to={to} className={`v2-btn${small ? ' v2-btn-sm' : ''}`}>
      <span className="v2-btn-label">{children}</span>
      <span className="v2-btn-box" aria-hidden="true">
        {small ? (
          <img src={`${V2}/arrow-dark.svg`} alt="" width={14.6953} height={9.83779} />
        ) : (
          <img src={`${V2}/arrow-light.svg`} alt="" width={27.2797} height={18.2624} />
        )}
      </span>
    </Link>
  )
}

/** Texto em gradiente azul (destaques dos títulos). */
export function Grad({ children, hero = false, strong = false }: { children: ReactNode; hero?: boolean; strong?: boolean }) {
  return <span className={`v2-grad${hero ? ' v2-grad-hero' : ''}${strong ? ' v2-strong' : ''}`}>{children}</span>
}
