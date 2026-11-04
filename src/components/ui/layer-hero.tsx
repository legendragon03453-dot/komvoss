import { useLayoutEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import gsap from 'gsap'
import { CmsHero } from '../../pages/kit'
import { prefersReducedMotion } from '../../motion'
import { FlowLines } from './flow-lines'
import { FluidParticles } from './fluid-particles'
import { RecordGrid } from './record-grid'

/**
 * Hero das páginas de Arquitetura sobre a tela prateada da camada (a mesma da transição em Soluções):
 * ERP = grade de registros, Komvos OS = fluxos, Komvos Mind = partículas.
 * Ao rolar, o hero fica fixo e a tela prateada encolhe até sumir, devolvendo o fundo escuro.
 */
export function LayerHero({ layer, ...hero }: { layer: 0 | 1 | 2 } & Omit<ComponentProps<typeof CmsHero>, 'background'>) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: '+=75%', scrub: true, pin: true } })
        .to('.lh-bg', { clipPath: 'inset(24% 22% 24% 22% round 48px)', opacity: 0, ease: 'power1.in' }, 0)
        .to('.sp-hero-grid', { opacity: 0, y: -50, scale: 0.96, ease: 'power1.in', duration: 0.45 }, 0)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className={`lh is-l${layer}`}>
      <CmsHero
        {...hero}
        background={
          <div className={`lh-bg atp-bg is-l${layer}`}>
            {layer === 0 && <RecordGrid className="lh-fx" />}
            {layer === 1 && <FlowLines />}
            {layer === 2 && <FluidParticles className="lh-fx" alpha={0.14} />}
          </div>
        }
      />
    </div>
  )
}
