import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* Estados iniciais dos elementos marcados com data-anim="…"; cada um volta ao neutro ao entrar na tela. */
const FROM: Record<string, gsap.TweenVars> = {
  up: { y: 80, opacity: 0 },
  left: { x: -100, opacity: 0 },
  right: { x: 100, opacity: 0 },
  fade: { opacity: 0 },
  scale: { scale: 0.5, opacity: 0 },
  line: { scaleX: 0, transformOrigin: '0% 50%' },
  clip: { clipPath: 'inset(0% 100% 0% 0%)' },
}

// os mesmos estados de FROM, em CSS
const START: Record<string, Partial<CSSStyleDeclaration>> = {
  up: { transform: 'translate(0px, 80px)', opacity: '0' },
  left: { transform: 'translate(-100px, 0px)', opacity: '0' },
  right: { transform: 'translate(100px, 0px)', opacity: '0' },
  fade: { opacity: '0' },
  scale: { transform: 'scale(0.5)', opacity: '0' },
  line: { transform: 'scaleX(0)', transformOrigin: '0% 50%' },
  clip: { clipPath: 'inset(0% 100% 0% 0%)' },
}

const NEUTRAL: gsap.TweenVars ={ x: 0, y: 0, opacity: 1, scale: 1, scaleX: 1, clipPath: 'inset(0% 0% 0% 0%)' }

let activeLenis: Lenis | null = null

/** Trava a rolagem da página (menu, modal). Retorna a função que destrava. */
export function lockScroll() {
  const html = document.documentElement
  html.classList.add('menu-open')
  activeLenis?.stop()
  return () => {
    html.classList.remove('menu-open')
    if (!html.classList.contains('is-loading')) activeLenis?.start()
  }
}

/** Rola até uma âncora (#id) mesmo com a rolagem travada, ex.: ao clicar num link do menu mobile. */
export function scrollToHash(hash: string, offset = 0) {
  const target = hash === '#' ? 0 : document.querySelector<HTMLElement>(hash)
  if (target === null) return
  if (activeLenis) activeLenis.scrollTo(target, { offset, force: true })
  else if (target === 0) window.scrollTo({ top: 0 })
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset })
}

/** Rolagem suave (Lenis) sincronizada com o ScrollTrigger. Fica parada enquanto `locked`. */
export function useSmoothScroll(locked: boolean, anchorOffset: number) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ anchors: { offset: anchorOffset }, lerp: 0.1 })
    lenisRef.current = lenis
    activeLenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      if (activeLenis === lenis) activeLenis = null
    }
  }, [anchorOffset])

  useEffect(() => {
    document.documentElement.classList.toggle('is-loading', locked)
    if (locked) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [locked, anchorOffset])
}

/** Rola suavemente até um elemento, descontando o cabeçalho fixo. */
export function scrollToElement(el: HTMLElement) {
  const offset = window.matchMedia('(max-width: 900px)').matches ? -72 : -96
  if (activeLenis) activeLenis.scrollTo(el, { offset, force: true })
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
}

/** Rola suavemente até uma posição vertical absoluta (ex.: um passo dentro de uma seção fixa). */
export function scrollToY(y: number) {
  if (activeLenis) activeLenis.scrollTo(y, { force: true, duration: 1.2 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Volta ao topo sem animação (troca de página). */
export function scrollToTop() {
  if (activeLenis) activeLenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

// O cabeçalho só faz a entrada animada no primeiro carregamento, não a cada troca de página.
let navIntroDone = false

/**
 * Animações do site: entrada do hero (tocada quando a intro revela a página),
 * revelações por scroll (ScrollTrigger.batch) e efeitos com scrub.
 * Refeitas a cada troca de página (pathname) ou de layout (isMobile).
 */
export function useSiteMotion(root: RefObject<HTMLElement | null>, isMobile: boolean, revealed: boolean, pathname: string) {
  const heroTl = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const has = (sel: string) => q(sel).length > 0

      /* ---- Entrada do hero ---- */
      const hero = gsap.timeline({
        paused: true,
        defaults: { ease: 'expo.out' },
        onStart: () => {
          navIntroDone = true
        },
        onComplete: () => ScrollTrigger.refresh(),
      })
      if (has('.v2-hero-bg')) hero.from('.v2-hero-bg, .v2-hero-gradient', { opacity: 0, duration: 1.8 }, 0)
      if (has('.pg-hero-grid')) hero.from('.pg-hero-grid', { opacity: 0, duration: 1.2 }, 0)
      if (has('.pg-hero-word')) hero.from('.pg-hero-word', { yPercent: 40, opacity: 0, duration: 1.6 }, 0.1)
      if (!navIntroDone && has('[data-hero="nav"]')) {
        hero.from('[data-hero="nav"]', { y: -30, opacity: 0, duration: 1 }, 0.1)
      }
      if (has('[data-hero="panel"]')) {
        hero.from('[data-hero="panel"] > *', { y: 50, opacity: 0, duration: 1.2, stagger: 0.09 }, 0.25)
      }
      heroTl.current = hero

      /* ---- Revelações por scroll ---- */
      for (const [type, from] of Object.entries(FROM)) {
        const els = q(`[data-anim="${type}"]`)
        if (!els.length) continue
        // estado inicial escrito direto no estilo: gsap.set lê o estilo calculado de cada elemento
        // entre uma escrita e outra, o que fazia o navegador recalcular a página inteira ~100 vezes na entrada
        const css = START[type]
        for (const el of els) Object.assign((el as HTMLElement).style, css)
        const keys = Object.keys(from).filter((k) => k !== 'transformOrigin')
        const to = Object.fromEntries(keys.map((k) => [k, NEUTRAL[k]]))
        ScrollTrigger.batch(els, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              ...to,
              duration: type === 'clip' ? 1.4 : 1.1,
              ease: 'expo.out',
              stagger: 0.12,
              overwrite: true,
              clearProps: keys.join(','),
            }),
        })
      }

      /* ---- Efeitos com scrub ---- */
      const heroSection = q('.v2-hero, .pg-hero')[0]

      // Hero da Home: o texto se despede enquanto a página rola
      if (has('.v2-hero')) {
        gsap.to('.v2-hero-content', {
          y: -90,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: { trigger: '.v2-hero', start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      // Ecossistema: as ligações "descem" do hub até os cards
      if (has('.v2-eco-branches')) {
        gsap.fromTo('.v2-eco-branches', { clipPath: 'inset(0% 0% 100% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: { trigger: '.v2-eco-map', start: 'top 75%', end: 'top 25%', scrub: 1 },
        })
      }

      if (has('.pg-hero-word')) {
        gsap.to('.pg-hero-word', {
          xPercent: -12,
          ease: 'none',
          scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      if (has('.pg-timeline')) {
        gsap.from('.pg-timeline-line', {
          scaleY: 0,
          transformOrigin: '50% 0%',
          ease: 'none',
          scrollTrigger: { trigger: '.pg-timeline', start: 'top 75%', end: 'bottom 60%', scrub: true },
        })
      }

      // Imagens e fontes mudam a altura da página depois do carregamento: recalcula as posições.
      let raf = 0
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => ScrollTrigger.refresh())
      })
      ro.observe(root.current!)
      ScrollTrigger.refresh()
      return () => {
        ro.disconnect()
        cancelAnimationFrame(raf)
      }
    },
    { scope: root, dependencies: [isMobile, pathname], revertOnUpdate: true },
  )

  useEffect(() => {
    if (revealed) heroTl.current?.play()
  }, [revealed, isMobile, pathname])

  // Desempenho: animações CSS infinitas (brilho dos botões, degradês, faixas, órbitas) continuam
  // recalculando estilo mesmo fora da tela. Seções fora da viewport ganham .is-offscreen e pausam.
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const blocks = [...el.querySelectorAll<HTMLElement>('section, footer')].filter((s) => !s.parentElement?.closest('section, footer'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting)),
      { rootMargin: '200px 0px' },
    )
    blocks.forEach((b) => io.observe(b))
    return () => {
      io.disconnect()
      blocks.forEach((b) => b.classList.remove('is-offscreen'))
    }
  }, [root, pathname])
}
