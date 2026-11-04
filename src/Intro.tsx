import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { A } from './content'

/* Tela de abertura. Usa o logo oficial (versão vertical branca do manual de identidade) como um bloco único:
   sem alterar proporção nem cores, apenas revelado por máscara. O contador vai a 100% e a cortina sobe. */
export function Intro({ onReveal, onDone }: { onReveal: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const counter = { v: 0 }
      const num = root.current!.querySelector('.intro-count')!

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: onDone })
      tl.fromTo('.intro-logo', { clipPath: 'inset(100% 0% 0% 0%)', y: 40 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.4 }, 0.15)
        .to(counter, {
          v: 100,
          duration: 1.6,
          ease: 'power2.inOut',
          onUpdate: () => {
            num.textContent = String(Math.round(counter.v)).padStart(3, '0')
          },
        }, 0.2)
        .from('.intro-bar span', { scaleX: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2)
        .to('.intro-logo', { clipPath: 'inset(0% 0% 100% 0%)', y: -40, duration: 0.7, ease: 'expo.in' }, '+=0.2')
        .to('.intro-count, .intro-bar', { opacity: 0, duration: 0.3 }, '<')
        .call(onReveal, [], '-=0.15')
        .to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '<')
    },
    { scope: root },
  )

  return (
    <div className="intro" ref={root} aria-hidden="true">
      <img className="intro-logo" src={`${A}/logo-vertical.png`} alt="" width={1682} height={1366} />
      <div className="intro-bar">
        <span />
      </div>
      <span className="intro-count">000</span>
    </div>
  )
}
