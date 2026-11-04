import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollToY } from '../motion'
import { MIND_LAYERS } from '../pages/data'
import { Grad, OutlineButton, V2 } from './ui'
import { home } from '../cms/pages/home'

const STEPS = [
  { title: 'ERP / Senior', text: 'A base de gestão: onde a operação acontece e os dados nascem, com o ERP da Senior.' },
  { title: 'Komvos OS', text: 'O sistema que conecta áreas, processos e informações em um único fluxo.' },
  { title: 'Komvos Mind', text: 'A camada de inteligência: agentes de IA que analisam, recomendam e executam.' },
]

/**
 * Seção "Arquitetura Tecnológica" do Figma v2. No desktop a seção fica fixa e o passo ativo
 * (quadrado em gradiente com brilho) avança com a rolagem; no celular cada passo acende ao passar pelo centro.
 */
export function Architecture({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const rowsRef = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current!
    if (isMobile) {
      const triggers = rowsRef.current.map((el, i) =>
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => s.isActive && setActive(i) }),
      )
      return () => triggers.forEach((t) => t.kill())
    }
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => setActive(Math.min(STEPS.length - 1, Math.floor(s.progress * STEPS.length * 0.999))),
    })
    return () => st.kill()
  }, [isMobile])

  const goTo = (i: number) => {
    if (isMobile) return setActive(i)
    const section = sectionRef.current!
    const top = section.getBoundingClientRect().top + window.scrollY
    const travel = section.offsetHeight - window.innerHeight
    scrollToY(top + travel * ((i + 0.5) / STEPS.length))
  }

  return (
    <section
      className={`v2-arch${isMobile ? ' is-mobile' : ''}`}
      ref={sectionRef}
      style={isMobile ? undefined : { height: `${STEPS.length * 85}vh` }}
      data-chapter="Arquitetura"
    >
      <div className="v2-arch-sticky">
        <div className="v2-arch-head">
          <p className="v2-eyebrow">{home.arch.eyebrow}</p>
          <h2 className="v2-arch-title">
            {home.arch.title} <Grad strong>{home.arch.highlight}</Grad>
          </h2>
          <OutlineButton to="/contato">Entre em contato</OutlineButton>
        </div>

        <div className="v2-arch-steps">
          <div className="v2-arch-squares" style={{ ['--active' as string]: active }}>
            <span className="v2-arch-highlight" aria-hidden="true">
              <img src={`${V2}/glow-step.svg`} alt="" width={481.665} height={479.863} />
            </span>
            {STEPS.map((s, i) => (
              <button key={s.title} type="button" className={`v2-arch-square${i === active ? ' is-active' : ''}`} onClick={() => goTo(i)} aria-label={`Passo ${i + 1}: ${s.title}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="v2-arch-texts">
            {STEPS.map((s, i) => (
              <div key={s.title} ref={(el) => (rowsRef.current[i] = el)} className={`v2-arch-text${i === active ? ' is-active' : ''}`} onClick={() => goTo(i)}>
                <span className="v2-arch-mnum" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <span className="v2-arch-role">{MIND_LAYERS[i].role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
