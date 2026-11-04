import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToElement } from '../motion'

type Chapter = { name: string; el: HTMLElement }

const pad = (n: number) => String(n).padStart(2, '0')

/** Nome do capítulo: data-chapter, ou o primeiro "eyebrow" da seção. */
function chapterName(el: HTMLElement) {
  return el.dataset.chapter || el.querySelector('.pg-eyebrow, .eyebrow')?.textContent?.trim() || 'Seção'
}

/**
 * Barra fixa inferior inspirada na referência (shapeofintelligence.com): mostra em que "capítulo" da página
 * a pessoa está, com marcadores clicáveis, e mantém a CTA principal sempre à mão.
 */
export function ChapterBar({ root, pathname, hidden }: { root: RefObject<HTMLElement | null>; pathname: string; hidden: boolean }) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const main = root.current?.querySelector('main')
    if (!main) return
    // seções de primeiro nível, em qualquer profundidade de wrappers (tema, pin-spacer do ScrollTrigger…)
    const els = [...main.querySelectorAll<HTMLElement>('section')].filter((el) => !el.parentElement?.closest('section'))
    setChapters(els.map((el) => ({ name: chapterName(el), el })))
    setActive(0)
    const triggers = els.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(i),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [root, pathname])

  if (!chapters.length) return null
  const current = chapters[active]

  return (
    <nav className={`chapter-bar${hidden ? ' is-hidden' : ''}`} aria-label="Capítulos da página">
      <div className="chapter-ticks">
        {chapters.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`chapter-tick${i === active ? ' is-active' : ''}${i < active ? ' is-past' : ''}`}
            aria-label={`Ir para ${c.name}`}
            aria-current={i === active ? 'step' : undefined}
            onClick={() => scrollToElement(c.el)}
          />
        ))}
      </div>
      <span className="chapter-label">Capítulos</span>
      <span className="chapter-count">
        {pad(active + 1)} <span>/</span> {pad(chapters.length)}
      </span>
      <span className="chapter-name" key={current?.name}>
        {current?.name}
      </span>
      <Link to="/contato" className="chapter-cta">
        Falar com um especialista <span aria-hidden="true">↗</span>
      </Link>
    </nav>
  )
}
