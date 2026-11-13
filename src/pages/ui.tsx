import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { OG_IMAGE, absoluteUrl } from '../seo/site'

/** Título e meta description da página (SEO). */
export function usePageMeta(title: string, description: string, extra: PageMetaExtra = {}) {
  const { keywords = '', image = '', imageAlt = '', noindex = false } = extra
  useEffect(() => {
    // extras dos artigos (aba SEO do painel); páginas sem extras voltam ao padrão
    setMeta('name', 'keywords', keywords, !keywords)
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    const img = image || OG_IMAGE
    const abs = /^https?:/i.test(img) ? img : absoluteUrl(img)
    setMeta('property', 'og:image', abs)
    setMeta('name', 'twitter:image', abs)
    setMeta('property', 'og:image:alt', imageAlt || 'Grupo Komvos – Tecnologia que transforma')
  }, [keywords, image, imageAlt, noindex])
  useEffect(() => {
    document.title = title
    const url = absoluteUrl(window.location.pathname.replace(/\/$/, '') || '/')
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
  }, [title, description])
}

export type PageMetaExtra = { keywords?: string; image?: string; imageAlt?: string; noindex?: boolean }

function setMeta(attr: 'name' | 'property', key: string, content: string, remove = false) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (remove) return void meta?.remove()
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    document.head.appendChild(meta)
  }
  meta.content = content
}

export type Crumb = { label: string; to?: string }

/**
 * Hero das páginas internas, em linguagem editorial inspirada na referência (shapeofintelligence.com):
 * linha de informações nos cantos, título gigante, palavra vazada ao fundo (opcional), área inferior
 * opcional (ex.: um controle interativo) e fundo opcional (ex.: um shader animado no lugar da grade).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  word,
  meta,
  visual,
  bottom,
  background,
  children,
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  crumbs?: Crumb[]
  word?: string
  meta?: [ReactNode, ReactNode]
  visual?: ReactNode
  bottom?: ReactNode
  /** Fundo animado do hero; quando presente, substitui a textura quadriculada. */
  background?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className={`pg-hero${visual ? ' has-visual' : ''}${background ? ' has-background' : ''}`}>
      {background ? (
        <div className="pg-hero-background" aria-hidden="true">
          {background}
        </div>
      ) : (
        <div className="pg-hero-grid" aria-hidden="true" />
      )}
      {visual && <div className="pg-hero-visual">{visual}</div>}
      {word && (
        <p className="pg-hero-word" aria-hidden="true">
          {word}
        </p>
      )}
      <div className="pg-wrap pg-hero-inner" data-hero="panel">
        {crumbs && (
          <nav className="pg-crumbs" aria-label="Você está em">
            <Link to="/">Início</Link>
            {crumbs.map((c) => (
              <span key={c.label}>
                <span aria-hidden="true">/</span>
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        {meta && (
          <div className="pg-hero-meta">
            <p>{meta[0]}</p>
            <p>{meta[1]}</p>
          </div>
        )}
        <p className="pg-eyebrow">{eyebrow}</p>
        <h1 className="pg-h1">{title}</h1>
        {lead && <p className="pg-lead">{lead}</p>}
        {children && <div className="pg-actions">{children}</div>}
        {bottom && <div className="pg-hero-bottom">{bottom}</div>}
      </div>
    </section>
  )
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
  dark = false,
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  center?: boolean
  dark?: boolean
}) {
  return (
    <div className={`pg-head${center ? ' is-center' : ''}${dark ? ' is-dark' : ''}`}>
      <p className="pg-eyebrow" data-anim="up">
        {eyebrow}
      </p>
      <h2 className="pg-h2" data-anim="up">
        {title}
      </h2>
      {lead && (
        <p className="pg-sublead" data-anim="up">
          {lead}
        </p>
      )}
    </div>
  )
}

/** Botão principal na linguagem do Figma: fundo verde-água com caixa escura e seta. */
export function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="pg-btn" to={to}>
      <span>{children}</span>
      <span className="pg-btn-box">
        <img src="/assets/v2/arrow-light.svg" alt="" width={27.2797} height={18.2624} />
      </span>
    </Link>
  )
}

export function GhostLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="pg-btn-ghost" to={to}>
      {children}
    </Link>
  )
}

