import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../motion'

/**
 * Camadas empilhadas em perspectiva que se afastam conforme o scroll (ERP → OS → Mind).
 * A última camada é a prateada (o destaque).
 */
export function LayerStack({ layers }: { layers: { name: string; role: string; text: string }[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      const plates = gsap.utils.toArray<HTMLElement>('.ls-plate')
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 75%', end: 'center 45%', scrub: 0.5 } })
      plates.forEach((p, i) => {
        tl.fromTo(p, { '--gap': 0 }, { '--gap': i, ease: 'power1.out' }, 0)
      })
      tl.fromTo('.ls-label', { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.15 }, 0.3)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div className="ls" ref={ref}>
      <div className="ls-scene" aria-hidden="true">
        {layers.map((l, i) => (
          <div key={l.name} className={`ls-plate${i === layers.length - 1 ? ' is-top' : ''}`} style={{ zIndex: i + 1 }}>
            <span className="ls-plate-name">{l.name}</span>
          </div>
        ))}
      </div>
      <ol className="ls-labels">
        {[...layers].reverse().map((l, i) => (
          <li key={l.name} className={`ls-label${i === 0 ? ' is-top' : ''}`}>
            <span className="ls-role">{l.role}</span>
            <strong>{l.name}</strong>
            <p>{l.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
