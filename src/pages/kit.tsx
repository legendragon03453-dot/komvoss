import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Action, Head, Hero, Title } from '../cms/pages/types'
import { GhostLink, PrimaryLink, SectionHead } from './ui'
import type { Crumb } from './ui'

/* Peças comuns das páginas montadas a partir do CMS (src/cms/pages). */

/** Título com o trecho `highlight` em gradiente prateado. */
export function T({ title }: { title: Title }) {
  const { text, highlight } = title
  const at = highlight ? text.lastIndexOf(highlight) : -1
  if (!highlight || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="teal">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  )
}

export function Actions({ items }: { items?: Action[] }) {
  if (!items?.length) return null
  return (
    <div className="pg-actions">
      {items.map((a) =>
        a.ghost ? (
          <GhostLink key={a.to} to={a.to}>
            {a.label}
          </GhostLink>
        ) : (
          <PrimaryLink key={a.to} to={a.to}>
            {a.label}
          </PrimaryLink>
        ),
      )}
    </div>
  )
}

export function H({ head, center = false }: { head: Head; center?: boolean }) {
  return <SectionHead eyebrow={head.eyebrow} title={<T title={head.title} />} lead={head.lead} center={center} />
}

/**
 * Hero das páginas do CMS: fundo animado, texto à esquerda e um visual opcional à direita
 * (mesmo desenho do hero das páginas de solução).
 */
export function CmsHero({
  hero,
  crumbs,
  background,
  aside,
  bottom,
  chapter,
}: {
  hero: Hero
  crumbs: Crumb[]
  background: ReactNode
  aside?: ReactNode
  bottom?: ReactNode
  chapter?: string
}) {
  return (
    <section className={`pg-hero has-background sp-hero${aside ? '' : ' is-solo'}`} data-chapter={chapter ?? hero.eyebrow}>
      <div className="pg-hero-background" aria-hidden="true">
        {background}
      </div>
      <div className="pg-wrap sp-hero-grid">
        <div className="sp-hero-copy" data-hero="panel">
          <nav className="pg-crumbs" aria-label="Você está em">
            <Link to="/">Início</Link>
            {crumbs.map((c) => (
              <span key={c.label}>
                <span aria-hidden="true">/</span>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
          <p className="pg-eyebrow">{hero.eyebrow}</p>
          <h1 className="pg-h1">
            <T title={hero.title} />
          </h1>
          <p className="pg-lead">{hero.lead}</p>
          <Actions items={hero.actions} />
        </div>
        {aside && (
          <div className="sp-hero-art" data-hero="panel">
            {aside}
          </div>
        )}
      </div>
      {bottom && <div className="pg-wrap">{bottom}</div>}
    </section>
  )
}

/** Brilho que segue o ponteiro (usar com a classe .spot). */
export function spotlight(e: ReactPointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export const pad = (n: number) => String(n).padStart(2, '0')
