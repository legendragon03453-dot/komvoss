import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, scrollToY } from '../motion'
import { SOLUTIONS } from '../pages/data'
import { Grad } from './ui'

// Títulos como no Figma (frames KOMVOS 2–5)
const TITLES = ['Gestão Empresarial', 'Pessoas', 'Cloud & Tecnologia', 'Dados & IA']

/** Mantém cada serviço parado um tempo antes de girar para o próximo. */
function dwell(raw: number) {
  const i = Math.floor(raw)
  const f = raw - i
  const t = Math.min(1, Math.max(0, (f - 0.3) / 0.4))
  return i + t * t * (3 - 2 * t)
}

/**
 * Seção 2: o que o Grupo Komvos faz. A seção fica fixa enquanto a pessoa rola e os serviços
 * trocam em um "tambor" 3D (rotateX), como no prólogo da referência (shapeofintelligence.com).
 */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const numsRef = useRef<(HTMLSpanElement | null)[]>([])
  const [active, setActive] = useState(0)
  const n = SOLUTIONS.length

  useEffect(() => {
    const section = sectionRef.current!
    const paint = (p: number) => {
      itemsRef.current.forEach((el, i) => {
        if (!el) return
        const d = i - p
        const a = Math.abs(d)
        el.style.transform = `translate3d(0, ${d * 32}vh, 0) rotateX(${-d * 65}deg)`
        el.style.opacity = String(Math.max(0, 1 - a * 1.25))
        el.style.pointerEvents = a < 0.5 ? 'auto' : 'none'
        el.setAttribute('aria-hidden', a < 0.5 ? 'false' : 'true')
      })
      numsRef.current.forEach((el, i) => {
        if (!el) return
        const d = i - p
        el.style.transform = `translate3d(0, ${d * 1.1}em, 0) rotateX(${-d * 80}deg)`
        el.style.opacity = String(Math.max(0, 1 - Math.abs(d) * 1.4))
      })
      setActive(Math.min(n - 1, Math.max(0, Math.round(p))))
    }
    paint(0)
    if (prefersReducedMotion()) return

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => paint(dwell(self.progress * (n - 1))),
    })
    return () => st.kill()
  }, [n])

  // Clique nos marcadores: rola até o ponto em que aquele serviço está centralizado
  const goTo = (i: number) => {
    const section = sectionRef.current!
    const top = section.getBoundingClientRect().top + window.scrollY
    const travel = section.offsetHeight - window.innerHeight
    scrollToY(top + (travel * i) / (n - 1))
  }

  return (
    <section className="v2-services" ref={sectionRef} style={{ height: `${n * 100}vh` }} data-chapter="Soluções" aria-label="O que o Grupo Komvos faz">
      <div className="v2-services-sticky">
        <div className="v2-services-side">
          <p className="v2-services-num" aria-hidden="true">
            {SOLUTIONS.map((s, i) => (
              <span key={s.slug} ref={(el) => (numsRef.current[i] = el)}>
                {i + 1}
              </span>
            ))}
          </p>
          <p className="v2-services-q">
            Como nós podemos ajudar seu <Grad>negócio hoje?</Grad>
          </p>
        </div>

        <div className="v2-services-stage">
          {SOLUTIONS.map((s, i) => (
            <div key={s.slug} className="v2-service" ref={(el) => (itemsRef.current[i] = el)}>
              <h2 className="v2-service-title">{TITLES[i]}</h2>
              <p className="v2-service-desc">{s.problem}</p>
              <Link to={`/solucoes/${s.slug}`} className="v2-service-link" tabIndex={i === active ? 0 : -1}>
                Conheça {s.title} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          ))}
        </div>

        <nav className="v2-services-dots" aria-label="Serviços">
          {SOLUTIONS.map((s, i) => (
            <button key={s.slug} type="button" className={i === active ? 'is-active' : ''} aria-label={`Ver ${s.title}`} aria-current={i === active} onClick={() => goTo(i)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </nav>

        <p className="v2-services-note" aria-hidden="true">
          Role para ver o que fazemos <span>↓</span>
        </p>
      </div>
    </section>
  )
}
