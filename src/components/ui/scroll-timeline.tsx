import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../motion'

/**
 * Linha do tempo com um feixe que se preenche conforme o scroll (inspirada no "timeline" do 21st.dev).
 * O ano fica fixo à esquerda enquanto o texto do período passa.
 */
export function ScrollTimeline({
  items,
}: {
  items: { year: string; title: string; text: string; media?: { src: string; alt: string; w?: number; h?: number }[] }[]
}) {
  const ref = useRef<HTMLOListElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.stl-fill',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 } },
      )
      gsap.utils.toArray<HTMLElement>('.stl-item').forEach((item) => {
        gsap.fromTo(
          item,
          { '--lit': 0 },
          { '--lit': 1, ease: 'none', scrollTrigger: { trigger: item, start: 'top 62%', end: 'top 50%', scrub: true } },
        )
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <ol className="stl" ref={ref}>
      <span className="stl-line" aria-hidden="true">
        <span className="stl-fill" />
      </span>
      {items.map((t) => (
        <li key={t.year} className="stl-item">
          <div className="stl-side">
            <span className="stl-dot" aria-hidden="true" />
            <span className="stl-year">{t.year}</span>
          </div>
          <div className="stl-body">
            <h3>{t.title}</h3>
            <p>{t.text}</p>
            {t.media?.length ? (
              <div className={`stl-media is-${t.media.length > 1 ? 'many' : 'one'}`}>
                {t.media.map((m) => (
                  <figure key={m.src}>
                    <img src={m.src} alt={m.alt} width={m.w} height={m.h} loading="lazy" decoding="async" />
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
