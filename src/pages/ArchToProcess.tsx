import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlowLines } from '../components/ui/flow-lines'
import { FluidParticles } from '../components/ui/fluid-particles'
import { RecordGrid } from '../components/ui/record-grid'
import { prefersReducedMotion, scrollToY } from '../motion'
import { MIND_LAYERS, STEPS } from './data'
import { ArchitectureStrip, Steps } from './Solucoes'
import { SectionHead } from './ui'

/**
 * "Tudo conectado em uma arquitetura" → "Como trabalhamos", guiado pelo scroll.
 * A seção fica fixa; ao rolar, cada card (ERP → Komvos OS → Komvos Mind) cresce até virar o fundo da tela,
 * com o texto no centro; em seguida vêm os passos 01–04, apresentados um de cada vez.
 */
export function ArchToProcess() {
  const [reduced] = useState(prefersReducedMotion)
  if (reduced) return <StaticVersion />
  return <ScrollVersion />
}

/* Sem animação (prefers-reduced-motion): as duas seções lado a lado, como antes. */
function StaticVersion() {
  return (
    <>
      <section className="pg-sec pg-sec-light" data-chapter="Arquitetura">
        <div className="pg-wrap">
          <SectionHead
            dark
            eyebrow="A espinha dorsal Komvos"
            title={
              <>
                Tudo conectado em <span className="teal">uma arquitetura</span>
              </>
            }
            lead="Cada solução se apoia na mesma base: gestão, processos, dados e inteligência integrados de forma coesa."
          />
          <ArchitectureStrip />
        </div>
      </section>
      <section className="pg-sec" data-chapter="Como trabalhamos">
        <div className="pg-wrap">
          <SectionHead
            eyebrow="Como trabalhamos"
            title={
              <>
                Do diagnóstico à <span className="teal">evolução contínua</span>
              </>
            }
          />
          <Steps items={STEPS} />
        </div>
      </section>
    </>
  )
}

// início de cada camada na linha do tempo
const LAYER_AT = [0, 1.9, 3.8]
const pad = (n: number) => String(n).padStart(2, '0')

function ScrollVersion() {
  const sectionRef = useRef<HTMLElement>(null)
  const stRef = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(-1)

  useLayoutEffect(() => {
    const section = sectionRef.current!
    const stage = section.querySelector<HTMLElement>('.atp-stage')!
    const cards = gsap.utils.toArray<HTMLElement>('.atp-card', section)

    // posição de cada card dentro do palco, para o fundo daquela camada "nascer" exatamente dele
    // (os cards só somem por opacidade, sem mover, então a posição continua valendo)
    const cardInset = (i: number) => () => {
      const st = stage.getBoundingClientRect()
      const c = cards[i].getBoundingClientRect()
      return `inset(${c.top - st.top}px ${st.right - c.right}px ${st.bottom - c.bottom}px ${c.left - st.left}px round 16px)`
    }
    const cardOffset = (i: number) => {
      const st = stage.getBoundingClientRect()
      const c = cards[i].getBoundingClientRect()
      return { x: c.left + c.width / 2 - (st.left + st.width / 2), y: c.top + c.height / 2 - (st.top + st.height / 2) }
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } })
      tl.to('.atp-head', { opacity: 0, y: -50, duration: 0.7, ease: 'power1.in' }, 0)

      // 1) cada camada (ERP → Komvos OS → Komvos Mind) explode do próprio card e ocupa a tela
      LAYER_AT.forEach((at, i) => {
        tl.to(cards[i].querySelector('.atp-card-copy'), { opacity: 0, duration: 0.3 }, at)
          .fromTo(`.atp-bg.is-l${i}`, { clipPath: cardInset(i) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1, ease: 'power2.inOut' }, at)
          .set(cards[i], { opacity: 0 }, at + 0.05)
          .fromTo(
            `.atp-layer.is-l${i}`,
            { opacity: 0, x: () => cardOffset(i).x, y: () => cardOffset(i).y, scale: 0.5 },
            { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
            at + 0.35,
          )
          .addLabel(`layer${i}`, at + 1.3)
          .to(`.atp-layer.is-l${i}`, { opacity: 0, y: -60, duration: 0.5, ease: 'power1.in' }, at + 1.6)
        // os outros cards somem quando a primeira camada toma a tela
        if (i === 0) tl.to(cards.slice(1), { opacity: 0, duration: 0.4 }, at + 0.15)
        // o fundo das próximas camadas fica invisível até a vez delas (senão aparece recortado sobre a anterior)
        else tl.fromTo(`.atp-bg.is-l${i}`, { opacity: 0 }, { opacity: 1, duration: 0.2 }, at - 0.15)
      })

      // 2) dá lugar ao "Como trabalhamos"
      const P = LAYER_AT[LAYER_AT.length - 1] + 2.2
      tl.fromTo('.atp-process-head', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, P)
        .fromTo('.atp-rail', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, P + 0.2)

      // 4) passos 01–04, um de cada vez
      const steps = gsap.utils.toArray<HTMLElement>('.atp-step')
      steps.forEach((el, i) => {
        const at = P + 0.4 + i * 1.2
        tl.addLabel(`step${i}`, at + 0.3)
        tl.fromTo(el, { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at)
        // sai por completo antes de o próximo entrar (sem sobreposição)
        if (i < steps.length - 1) tl.to(el, { opacity: 0, y: -70, duration: 0.4, ease: 'power2.in' }, at + 0.75)
      })
      const end = P + 0.4 + steps.length * 1.2
      tl.fromTo('.atp-rail-fill', { scaleX: 0 }, { scaleX: 1, duration: end - 0.6 - (P + 0.4) }, P + 0.4)
        // no fim, o fundo escurece para emendar na próxima seção
        .to('.atp-dim', { opacity: 1, duration: 0.6 }, end)
        .to('.atp-step:last-child, .atp-process-head, .atp-rail', { opacity: 0, duration: 0.5 }, end + 0.1)

      // passo ativo calculado a cada quadro da animação (inclusive durante a suavização do scrub)
      const labels = steps.map((_, i) => tl.labels[`step${i}`])
      tl.eventCallback('onUpdate', () => {
        const t = tl.time()
        let idx = -1
        labels.forEach((l, i) => {
          if (t >= l - 0.35) idx = i
        })
        setActive(idx)
      })
      stRef.current = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 10}`,
        pin: true,
        scrub: 0.6,
        animation: tl,
        invalidateOnRefresh: true,
      })
    }, section)

    return () => {
      stRef.current = null
      ctx.revert()
    }
  }, [])

  // clique nos marcadores: rola até o passo
  const goTo = (i: number) => {
    const st = stRef.current
    if (!st) return
    const anim = st.animation as gsap.core.Timeline
    const progress = anim.labels[`step${i}`] / anim.duration()
    scrollToY(st.start + (st.end - st.start) * progress)
  }

  return (
    <section className="atp" ref={sectionRef} data-chapter="Arquitetura e processo">
      <div className="atp-stage">
        {MIND_LAYERS.map((l, i) => (
          <div key={l.name} className={`atp-bg is-l${i}`} aria-hidden="true">
            {i === 0 && <RecordGrid className="lh-fx" />}
            {i === 1 && <FlowLines className="atp-fx-flow" />}
            {i === MIND_LAYERS.length - 1 && (
              <>
                <FluidParticles className="atp-particles" alpha={0.12} />
                <span className="atp-dim" />
              </>
            )}
          </div>
        ))}

        <div className="atp-arch">
          <div className="atp-head">
            <p className="pg-eyebrow">A espinha dorsal Komvos</p>
            <h2 className="pg-h2">
              Tudo conectado em <span className="teal">uma arquitetura</span>
            </h2>
            <p className="pg-sublead">Cada solução se apoia na mesma base: gestão, processos, dados e inteligência integrados de forma coesa.</p>
          </div>
          <div className="atp-cards">
            {MIND_LAYERS.map((l, i) => (
              <div key={l.name} className={`atp-card is-l${i}${i === MIND_LAYERS.length - 1 ? ' atp-card-mind' : ''}`}>
                <div className="atp-card-copy">
                  <span className="atp-role">{l.role}</span>
                  <strong>{l.name}</strong>
                  <p>{l.text}</p>
                </div>
                {i < MIND_LAYERS.length - 1 && (
                  <span className="atp-arrow" aria-hidden="true">
                    ➔
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {MIND_LAYERS.map((l, i) => (
          <div key={l.name} className={`atp-mind atp-layer is-l${i}`} aria-hidden="true">
            <span className="atp-role">{l.role}</span>
            <strong>{l.name}</strong>
            <p>{l.text}</p>
          </div>
        ))}

        <div className="atp-process">
          <div className="atp-process-head">
            <p className="atp-kicker">Como trabalhamos</p>
            <h2>Do diagnóstico à evolução contínua</h2>
          </div>
          <ol className="atp-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="atp-step" aria-current={i === active ? 'step' : undefined}>
                <span className="atp-step-num">{pad(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="atp-rail">
            <span className="atp-rail-line">
              <span className="atp-rail-fill" />
            </span>
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                type="button"
                className={`atp-node${i <= active ? ' is-done' : ''}${i === active ? ' is-active' : ''}`}
                style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}
                onClick={() => goTo(i)}
                aria-label={`Passo ${pad(i + 1)}: ${s.title}`}
              >
                <span className="atp-node-dot" />
                <span className="atp-node-label">
                  {pad(i + 1)} · {s.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
