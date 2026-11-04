import { A } from '../content'
import { CtaFinal } from '../sections'
import { MIND_LAYERS } from './data'
import type { Company } from './data'
import { GhostLink, PageHero, PrimaryLink, usePageMeta } from './ui'
import { FrontSlider } from './FrontSlider'
import { SolutionsBento } from './SolutionsBento'
import { ArchToProcess } from './ArchToProcess'
import { GlassFold } from '../components/ui/glass-fold'
import { SOLUCOES_SEO } from '../seo/site'

export function Steps({ items }: { items: { title: string; text: string }[] }) {
  return (
    <ol className="pg-steps">
      {items.map((s, i) => (
        <li key={s.title} className="pg-step" data-anim="up">
          <span className="pg-step-num">{String(i + 1).padStart(2, '0')}</span>
          <h3>{s.title}</h3>
          <p>{s.text}</p>
        </li>
      ))}
    </ol>
  )
}

/** Logo da empresa sobre o card na cor da marca (verde Senior, azul Statum, magenta Trusth). */
/** `plain`: só o logo, sem o selo branco (a cor é definida pelo CSS de onde ele aparece). */
export function CompanyLogo({ c, plain = false }: { c: Company; plain?: boolean }) {
  if (c.logo) {
    const img = <img className="pg-company-logo" src={`${A}/${c.logo.src}`} alt={c.name} width={c.logo.w} height={c.logo.h} />
    return c.logo.chip && !plain ? <span className="pg-logo-chip">{img}</span> : img
  }
  // Sem logo da Statum no Figma: wordmark provisório em texto.
  return <span className="pg-wordmark">{c.name.toUpperCase()}</span>
}

export function ArchitectureStrip() {
  return (
    <div className="pg-arch" data-anim="up">
      {MIND_LAYERS.map((l, i) => (
        <div key={l.name} className={`pg-arch-item${i === MIND_LAYERS.length - 1 ? ' is-mind' : ''}`}>
          <span className="pg-arch-role">{l.role}</span>
          <strong>{l.name}</strong>
          <p>{l.text}</p>
          {i < MIND_LAYERS.length - 1 && (
            <span className="pg-arch-arrow" aria-hidden="true">
              ➔
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function SolucoesPage() {
  usePageMeta(SOLUCOES_SEO.title, SOLUCOES_SEO.description)


  return (
    <div className="theme-silver">
      <PageHero
        eyebrow="Soluções"
        background={<GlassFold color1="#2a3033" color2="#111516" color3="#8a9196" speed={0.22} scale={0.85} noise={0.1} />}
        meta={['Quatro frentes, uma única visão.', 'Gestão · Pessoas · Cloud · IA']}
        bottom={<FrontSlider />}
        crumbs={[{ label: 'Soluções' }]}
        title={
          <>
            Qual problema <span className="teal">nós resolvemos?</span>
          </>
        }
        lead="Organizamos nossas soluções pelas dores que mais travam as empresas. Encontre a sua e veja como o Grupo Komvos resolve, com especialistas em cada frente."
      >
        <PrimaryLink to="/contato">Falar com um especialista</PrimaryLink>
        <GhostLink to="/komvos-mind">Conheça o Komvos Mind</GhostLink>
      </PageHero>

      <section className="pg-sec" data-chapter="Da dor à solução">
        <div className="pg-wrap">
          <div className="sb-head">
            <h2 className="sb-title" data-anim="up">
              Da dor à solução
            </h2>
            <p className="sb-sub" data-anim="up">
              Quatro frentes. <span className="teal">Uma única visão.</span>
            </p>
          </div>
          <SolutionsBento />
        </div>
      </section>

      <ArchToProcess />

      <CtaFinal />
    </div>
  )
}
