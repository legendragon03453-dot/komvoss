import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { A } from './content'
import { lockScroll } from './motion'
import { home } from './cms/pages/home'

const IG_PROFILE = 'https://www.instagram.com/komvostech/'

// Reels do @komvostech (e das empresas do ecossistema). As capas (public/assets/reels) foram baixadas do Instagram, porque os links de lá expiram.
const REELS = [
  { id: 'DeM3jlqkyy9', title: 'Quando a operação cresce', tag: 'Gestão' },
  { id: 'DdKNuuqEfiU', title: 'Synkrh: o RH que responde no WhatsApp', tag: 'IA' },
  { id: 'DeIEohOFFXv', title: 'Terceirizar a folha de verdade', tag: 'BPO' },
  { id: 'DdFBGt9CfBq', title: 'Do chamado à solução', tag: 'Tecnologia' },
  { id: 'DeH4qXmlUg4', title: 'Organizar o que cresceu junto', tag: 'Gestão' },
  { id: 'DdXCps5jdKV', title: 'Programa Finders', tag: 'Parcerias' },
  { id: 'DbBpZ8yCluV', title: 'Processos, tecnologia e pessoas', tag: 'Integração' },
  { id: 'DaQIRkUEjMv', title: 'Rota Inova e a bioenergia', tag: 'Inovação' },
  { id: 'DZ52Nvtvqgc', title: 'Nossa nova sede', tag: 'Institucional' },
  { id: 'Db3WOHpOfjP', title: 'De 2006 a 2026', tag: 'Nosso time' },
  { id: 'Db9EdEVFLGe', title: '20 anos de reconhecimento', tag: 'Prêmios' },
  { id: 'Dd6xyt9mu7x', title: 'Indicações que geram valor', tag: 'Parcerias' },
]

export type Reel = { id: string; title: string; tag: string }

const pad = (n: number) => String(n).padStart(2, '0')

function Chevron({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={dir === 'prev' ? '15 18 9 12 15 6' : '9 6 15 12 9 18'} />
    </svg>
  )
}

function ReelModal({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const unlock = lockScroll()
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="reel-modal" role="dialog" aria-modal="true" aria-label={reel.title} onClick={onClose} data-lenis-prevent>
      <div className="reel-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="reel-modal-head">
          <div>
            <span className="reel-modal-tag">{reel.tag}</span>
            <strong>{reel.title}</strong>
          </div>
          <button ref={closeRef} type="button" className="reel-modal-close" aria-label="Fechar vídeo" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>
        <iframe
          className="reel-modal-frame"
          src={`https://www.instagram.com/reel/${reel.id}/embed/`}
          title={`Reel: ${reel.title}`}
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
        />
        <a className="reel-modal-link" href={`https://www.instagram.com/reel/${reel.id}/`} target="_blank" rel="noopener noreferrer">
          Assistir no Instagram <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>,
    document.body,
  )
}

export function Reels() {
  const trackRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0, scale: 1 })
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [current, setCurrent] = useState(0)
  const [fill, setFill] = useState(0)
  const [open, setOpen] = useState<Reel | null>(null)
  const closeModal = useCallback(() => setOpen(null), [])

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft >= max - 4)
    const visible = el.clientWidth / el.scrollWidth
    setFill(visible + (1 - visible) * (max > 0 ? el.scrollLeft / max : 1))
    const item = el.querySelector<HTMLElement>('.car-item')
    if (item) {
      const step = item.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0')
      setCurrent(Math.min(REELS.length - 1, Math.round(el.scrollLeft / step)))
    }
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  function go(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const item = el.querySelector<HTMLElement>('.car-item')
    const step = item ? item.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth
    el.scrollBy({ left: dir * step * (el.clientWidth > step * 2.5 ? 2 : 1), behavior: 'smooth' })
  }

  // Arrastar com o mouse no desktop (o toque já rola nativamente).
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = trackRef.current!
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      scale: el.getBoundingClientRect().width / el.offsetWidth || 1,
    }
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d.active) return
    const dx = (e.clientX - d.startX) / d.scale
    if (Math.abs(dx) > 6 && !d.moved) {
      d.moved = true
      trackRef.current!.classList.add('is-dragging')
      trackRef.current!.setPointerCapture(e.pointerId)
    }
    if (d.moved) trackRef.current!.scrollLeft = d.startScroll - dx
  }

  function onPointerUp() {
    const d = drag.current
    d.active = false
    trackRef.current?.classList.remove('is-dragging')
    // Mantém `moved` até o click seguinte, para não abrir o vídeo ao soltar um arraste.
    setTimeout(() => (d.moved = false), 0)
  }

  return (
    <section className="frame sec reels" id="reels">
      <article className="servico servico--reels" id="servico-reels">
        <div className="servico-txt">
          <span className="servico-num" aria-hidden="true" data-anim="up">
            {pad(current + 1)}
            <small> / {pad(REELS.length)}</small>
          </span>
          <p className="eyebrow" data-anim="up">{home.reels.eyebrow}</p>
          <h3 className="sec-title" data-anim="up">
            {home.reels.title} <span className="teal">{home.reels.highlight}</span>
          </h3>
          <p className="servico-desc" data-anim="up">{home.reels.text}</p>
          <a className="servico-link" href={IG_PROFILE} target="_blank" rel="noopener noreferrer" data-anim="up">
            Siga @komvostech no Instagram <span aria-hidden="true">↗</span>
          </a>
          <div className="car-navs" data-anim="up">
            <button className="car-nav car-prev" type="button" aria-label="Anterior" disabled={atStart} onClick={() => go(-1)}>
              <Chevron dir="prev" />
            </button>
            <button className="car-nav car-next" type="button" aria-label="Próximo" disabled={atEnd} onClick={() => go(1)}>
              <Chevron dir="next" />
            </button>
          </div>
        </div>

        <div className="carrossel carrossel--vertical" data-carrossel="">
          <div
            ref={trackRef}
            className="car-trilho"
            onScroll={update}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {REELS.map((r, i) => (
              <div key={r.id} className="car-item" data-anim="up">
                <img src={`${A}/reels/${r.id}.webp`} alt="" width={540} height={960} loading="lazy" draggable={false} />
                <span className="car-idx" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <button
                  className="car-play"
                  type="button"
                  aria-label={`Reproduzir vídeo: ${r.title}`}
                  onClick={() => !drag.current.moved && setOpen(r)}
                >
                  <span className="car-play-ico">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="car-cap">
                    <em>{r.tag}</em>
                    <b>{r.title}</b>
                  </span>
                </button>
              </div>
            ))}
          </div>
          <div className="car-progress" aria-hidden="true">
            <span style={{ width: `${fill * 100}%` }} />
          </div>
        </div>
      </article>

      {open && <ReelModal reel={open} onClose={closeModal} />}
    </section>
  )
}

/**
 * Um reel em destaque, ao lado de um texto (usado nas páginas internas).
 * A capa fica em public/assets/reels/<id>.webp.
 */
export function ReelFeature({
  reel,
  eyebrow,
  title,
  text,
}: {
  reel: Reel
  eyebrow: string
  title: ReactNode
  text: string
}) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <section className="pg-sec rf" data-chapter={eyebrow}>
      <div className="pg-wrap rf-grid">
        <div className="rf-copy">
          <p className="pg-eyebrow" data-anim="up">
            {eyebrow}
          </p>
          <h2 className="pg-h2" data-anim="up">
            {title}
          </h2>
          <p className="pg-sublead" data-anim="up">
            {text}
          </p>
          <a className="rf-link" href={`https://www.instagram.com/reel/${reel.id}/`} target="_blank" rel="noopener noreferrer" data-anim="up">
            Ver no Instagram <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="rf-card" data-anim="up">
          <img src={`${A}/reels/${reel.id}.webp`} alt="" width={540} height={960} loading="lazy" />
          <button className="car-play" type="button" aria-label={`Reproduzir vídeo: ${reel.title}`} onClick={() => setOpen(true)}>
            <span className="car-play-ico">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="car-cap">
              <em>{reel.tag}</em>
              <b>{reel.title}</b>
            </span>
          </button>
        </div>
      </div>
      {open && <ReelModal reel={reel} onClose={close} />}
    </section>
  )
}
