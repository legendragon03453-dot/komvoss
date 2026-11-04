import { useEffect, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { A } from '../content'
import { lockScroll } from '../motion'
import { CONTACT, CONTACT_LINKS, SOLUTIONS } from '../pages/data'
import { SOLUTION_ART } from '../pages/SolutionsBento'
import { MENU, MENU_ARCH_LABEL } from '../cms/menu'
import { INSTAGRAM_URL, OutlineButton, V2, WHATSAPP_URL } from './ui'

/** Links fixos na barra do topo (telas largas); "Entre em contato" já é o botão da direita. */
type BarItem = { id: string; label: string; to?: string; children?: { label: string; to: string; num: string }[] }
const pad = (n: number) => String(n).padStart(2, '0')

// montado a cada render: o painel pode renomear ou ocultar itens (src/cms/menu.ts)
function buildBar(): BarItem[] {
  const out: BarItem[] = []
  for (const m of MENU) {
    if (m.hidden || m.bar === false) continue
    if (m.group === 'arch') {
      let g = out.find((o) => o.id === 'arch')
      if (!g) out.push((g = { id: 'arch', label: MENU_ARCH_LABEL, children: [] }))
      g.children!.push({ label: m.label, to: m.to, num: pad(g.children!.length + 1) })
    } else if (m.id === 'solucoes') {
      out.push({ id: m.id, label: m.label, to: m.to, children: SOLUTIONS.map((s) => ({ label: s.title, to: `/solucoes/${s.slug}`, num: s.num })) })
    } else {
      out.push({ id: m.id, label: m.short ?? m.label, to: m.to })
    }
  }
  return out
}

/**
 * Cabeçalho: em telas largas, os links ficam enfileirados na barra e o logo vai para a direita,
 * junto das redes e do "Entre em contato". Em telas menores, MENU abre o menu em tela cheia.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  // o conteúdo do menu em tela cheia só é montado quando a pessoa chega perto do botão (deixa a entrada do site mais leve)
  const [menuReady, setMenuReady] = useState(false)
  const prepareMenu = () => setMenuReady(true)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const unlock = lockScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // ao escolher uma página no submenu, ele fecha na hora (sem esperar o mouse sair)
  const closeDrop = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.closest('.hd-drop')?.classList.add('is-closed')
    ;(document.activeElement as HTMLElement | null)?.blur()
  }
  const reopenDrop = (e: MouseEvent<HTMLElement>) => e.currentTarget.classList.remove('is-closed')

  const whatsapp = WHATSAPP_URL || '/contato'
  const bar = buildBar()
  const menu = MENU.filter((m) => !m.hidden)

  return (
    <>
      <header className={`v2-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-menu' : ''}`} data-hero="nav">
        <button
          type="button"
          className="v2-menu-btn"
          aria-expanded={open}
          aria-controls="v2-menu"
          onPointerEnter={prepareMenu}
          onPointerDown={prepareMenu}
          onFocus={prepareMenu}
          onClick={() => {
            prepareMenu()
            setOpen((v) => !v)
          }}
        >
          <span className={`v2-menu-icon${open ? ' is-open' : ''}`} aria-hidden="true">
            <img src={`${V2}/menu-icon.svg`} alt="" width={39.6891} height={20.6078} />
            <span className="v2-menu-x" />
          </span>
          <span className="v2-menu-word">
            <span className={open ? '' : 'is-on'}>MENU</span>
            <span className={open ? 'is-on' : ''}>FECHAR</span>
          </span>
        </button>

        {/* telas largas: links fixos na barra (o menu em tela cheia fica para telas menores) */}
        <nav className="hd-nav" aria-label="Navegação principal">
          {bar.map((m) =>
            m.children ? (
              <div key={m.id} className="hd-drop" onMouseLeave={reopenDrop}>
                {m.to ? (
                  <NavLink to={m.to} end className="hd-link">
                    {m.label}
                    <span className="hd-caret" aria-hidden="true" />
                  </NavLink>
                ) : (
                  <button type="button" className={`hd-link${m.children.some((c) => c.to === pathname) ? ' active' : ''}`}>
                    {m.label}
                    <span className="hd-caret" aria-hidden="true" />
                  </button>
                )}
                <div className="hd-drop-panel">
                  {m.children.map((c) => (
                    <NavLink key={c.to} to={c.to} className="hd-drop-link" onClick={closeDrop}>
                      <span>{c.num}</span>
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={m.id} to={m.to!} className="hd-link">
                {m.label}
              </NavLink>
            ),
          )}
        </nav>

        <Link to="/" className="v2-header-logo" aria-label="Grupo Komvos – início">
          <img className="v2-header-wordmark" src={`${A}/logo-komvos-branco.webp`} alt="" width={440} height={102} />
        </Link>

        <div className="v2-header-right">
          <div className="v2-social">
            <img src={`${V2}/social.svg`} alt="" width={63.2146} height={19.3877} />
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram do Grupo Komvos" />
            {WHATSAPP_URL ? (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp do Grupo Komvos" />
            ) : (
              <Link to="/contato" aria-label="Fale com o Grupo Komvos" />
            )}
          </div>
          <OutlineButton to="/contato" small>
            Entre em contato
          </OutlineButton>
        </div>
      </header>

      <div id="v2-menu" className={`mn${open ? ' is-open' : ''}`} aria-hidden={!open} data-lenis-prevent>
        <div className="mn-glow" aria-hidden="true" />
        {menuReady && (
        <div className="mn-body">
          <nav className="mn-nav" aria-label="Menu principal">
            {menu.map((m, i) => (
              <NavLink key={m.id} to={m.to} end={m.to === '/'} className="mn-link" style={{ '--i': i } as CSSProperties}>
                <span className="mn-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mn-label">{m.label}</span>
                <span className="mn-arrow" aria-hidden="true">→</span>
              </NavLink>
            ))}
          </nav>

          <div className="mn-side">
            <p className="mn-kicker">Soluções</p>
            <div className="mn-sols">
              {SOLUTIONS.map((s, i) => {
                const Art = SOLUTION_ART[s.slug]
                return (
                  <Link key={s.slug} to={`/solucoes/${s.slug}`} className="mn-sol" style={{ '--i': i + 2 } as CSSProperties}>
                    <span className="mn-sol-art" aria-hidden="true">{Art && <Art />}</span>
                    <span className="mn-sol-num">{s.num}</span>
                    <strong>{s.title}</strong>
                  </Link>
                )
              })}
            </div>
            <div className="mn-foot">
              <div>
                <p className="mn-kicker">Contato</p>
                <a href={CONTACT_LINKS.email}>{CONTACT.email}</a>
                <a href={CONTACT_LINKS.phone}>{CONTACT.phone}</a>
              </div>
              <div>
                <p className="mn-kicker">Redes</p>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                  Instagram ↗
                </a>
                <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  )
}
