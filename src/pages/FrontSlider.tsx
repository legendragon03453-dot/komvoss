import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { prefersReducedMotion } from '../motion'
import { SOLUTIONS } from './data'

const AUTO_MS = 3500

/**
 * Seletor "Escolha uma frente": um controle deslizante com as quatro soluções,
 * inspirado no "Change the shape of an idea" da referência (shapeofintelligence.com).
 * O ponto percorre as frentes sozinho e para quando a pessoa interage.
 */
export function FrontSlider() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [userTook, setUserTook] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const n = SOLUTIONS.length
  const s = SOLUTIONS[i]
  const pct = (i / (n - 1)) * 100

  // Avança sozinho enquanto ninguém interage e o seletor está na tela.
  useEffect(() => {
    if (paused || userTook || prefersReducedMotion()) return
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(rootRef.current!)
    const t = window.setInterval(() => {
      if (visible && !document.hidden) setI((v) => (v + 1) % n)
    }, AUTO_MS)
    return () => {
      window.clearInterval(t)
      io.disconnect()
    }
  }, [paused, userTook, n])

  const choose = (k: number) => {
    setUserTook(true)
    setI(k)
  }

  return (
    <div
      className="front-slider"
      ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="front-slider-head">
        <span>Escolha uma frente</span>
        <span aria-hidden="true">↔</span>
      </div>
      <div className="front-slider-stops">
        {SOLUTIONS.map((x, k) => (
          <button key={x.slug} type="button" className={k === i ? 'is-active' : ''} onClick={() => choose(k)}>
            <span>{x.num}</span> {x.title.split(/,| &/)[0]}
          </button>
        ))}
      </div>
      <div className="front-slider-track" style={{ ['--pct' as string]: `${pct}%` }}>
        <span className="front-slider-rail" aria-hidden="true">
          <span className="front-slider-fill" />
          {SOLUTIONS.map((x, k) => (
            <span key={x.slug} className={`front-slider-tick${k <= i ? ' is-on' : ''}`} style={{ left: `${(k / (n - 1)) * 100}%` }} />
          ))}
          <span className="front-slider-knob" />
        </span>
        <input
          type="range"
          min={0}
          max={n - 1}
          step={1}
          value={i}
          onChange={(e) => choose(Number(e.target.value))}
          aria-label="Escolha uma frente"
          aria-valuetext={s.title}
        />
      </div>
      <p className="front-slider-text" key={s.slug}>
        {s.short} <Link to={`/solucoes/${s.slug}`}>Ver {s.title} ↗</Link>
      </p>
    </div>
  )
}
