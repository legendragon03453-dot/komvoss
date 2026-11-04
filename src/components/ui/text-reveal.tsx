import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../../motion'

/**
 * Texto que acende palavra por palavra conforme o scroll (inspirado no "text reveal" do 21st.dev).
 */
export function TextReveal({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('.tr-w'),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.4 },
        },
      )
    }, el)
    return () => ctx.revert()
  }, [text])

  return (
    <p ref={ref} className={`tr ${className}`}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="tr-w">
          {w}{' '}
        </span>
      ))}
    </p>
  )
}
