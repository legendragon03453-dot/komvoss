import { useMemo } from 'react'
import AnimatedGradient from '../components/ui/animated-gradient'
import { prefersReducedMotion } from '../motion'
import { A } from '../content'
import { GhostLink } from '../pages/ui'
import { FluidParticles } from '../components/ui/fluid-particles'
import { HeroNetwork } from './HeroNetwork'
import { Grad, OutlineButton, V2 } from './ui'
import { home } from '../cms/pages/home'

/**
 * Hero da Home: logo completo, título e chamadas à esquerda; à direita a rede de conexões do ecossistema
 * (núcleo Komvos, frentes e empresas), sobre o gradiente animado prateado e partículas.
 */
export function Hero() {
  // Grafite e prata da marca, lento e discreto; a cor da identidade fica só no destaque "Mais rápida."
  const gradient = useMemo(
    () => ({
      preset: 'custom' as const,
      color1: '#111516',
      color2: '#22282a',
      color3: '#4b5154',
      rotation: -35,
      proportion: 20,
      scale: 0.35,
      speed: prefersReducedMotion() ? 0 : 10,
      distortion: 5,
      swirl: 55,
      swirlIterations: 6,
      softness: 100,
      offset: -240,
      shape: 'Checks' as const,
      shapeSize: 22,
    }),
    [],
  )

  return (
    <section className="v2-hero" data-chapter="Início">
      <div className="v2-hero-card">
        <AnimatedGradient config={gradient} noise={{ opacity: 0.12 }} resolutionScale={0.5} className="v2-hero-gradient" />
        <FluidParticles className="hero-particles hx-particles" color="220, 224, 228" alpha={0.16} density={700} />
        <div className="v2-hero-bg" aria-hidden="true">
          <img className="v2-hero-grid" src={`${V2}/hero-grid.svg`} alt="" width={1921} height={1564} />
          <span className="v2-hero-vignette" />
        </div>

        <div className="v2-hero-content hx" data-hero="panel">
          <div className="hx-copy">
            <img className="hx-logo" src={`${A}/logo-komvos-prata.webp`} alt="Komvos – Tecnologia que transforma" width={900} height={210} />
            <h1 className="v2-hero-title">
              {home.hero.line1}
              <br />
              {home.hero.line2}{' '}
              <Grad hero strong>
                {home.hero.highlight}
              </Grad>
            </h1>
            <p className="v2-hero-lead">{home.hero.lead}</p>
            <div className="hx-actions">
              <OutlineButton to="/contato">{home.hero.primary}</OutlineButton>
              <GhostLink to="/solucoes">{home.hero.secondary}</GhostLink>
            </div>
          </div>
          <div className="hx-visual">
            <HeroNetwork />
          </div>
        </div>
      </div>
    </section>
  )
}
