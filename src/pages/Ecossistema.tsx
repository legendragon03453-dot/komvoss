import { Link } from 'react-router-dom'
import { CtaFinal } from '../sections'
import { ecossistema as c } from '../cms/pages/ecossistema'
import { COMPANIES, SOLUTIONS } from './data'
import { CompanyLogo } from './Solucoes'
import { usePageMeta } from './ui'
import { CmsHero, H, pad, spotlight } from './kit'
import { GlassFold } from '../components/ui/glass-fold'
import { AnimatedBeams } from '../components/ui/animated-beams'
import { A } from '../content'

export function EcossistemaPage() {
  usePageMeta(c.seo.title, c.seo.description)

  return (
    <>
      <CmsHero
        hero={c.hero}
        crumbs={[{ label: 'Ecossistema' }]}
        background={<GlassFold color1="#2a3033" color2="#111516" color3="#8a9196" speed={0.2} scale={0.9} noise={0.1} />}
      />

      <section className="pg-sec" data-chapter={c.beams.eyebrow}>
        <div className="pg-wrap">
          <H head={c.beams} center />
          <div data-anim="up">
            <AnimatedBeams
              source={
                <span className="eco-node eco-client">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h2M14 8h2M8 12h2M14 12h2" />
                  </svg>
                  {c.beams.client}
                </span>
              }
              hub={
                <span className="eco-node eco-hub">
                  <span className="logo-crop eco-hub-logo">
                    <img src={`${A}/logo-preto.png`} alt={c.beams.hub} />
                  </span>
                </span>
              }
              targets={COMPANIES.map((co) => (
                <a key={co.id} href={`#${co.id}`} className="eco-node eco-company">
                  <span className="eco-company-logo">
                    <CompanyLogo c={co} plain />
                  </span>
                </a>
              ))}
            />
          </div>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.companies.eyebrow}>
        <div className="pg-wrap">
          <H head={c.companies} />
          <div className="eco-cards">
            {COMPANIES.map((co, i) => (
              <article key={co.id} id={co.id} className="spot eco-card" onPointerMove={spotlight} data-anim="up">
                <div className="eco-card-top">
                  <span className="eco-card-num">{pad(i + 1)}</span>
                  <span className="eco-card-logo">
                    <CompanyLogo c={co} plain />
                  </span>
                </div>
                <span className="cms-tag">{co.area}</span>
                <h2>{co.name}</h2>
                <p>{co.text}</p>
                <ul className="eco-points">
                  {co.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <div className="eco-sols">
                  {co.solutions.map((slug) => {
                    const s = SOLUTIONS.find((x) => x.slug === slug)
                    return s ? (
                      <Link key={slug} to={`/solucoes/${slug}`}>
                        {s.title} →
                      </Link>
                    ) : null
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.why.eyebrow}>
        <div className="pg-wrap pg-split">
          <div className="eco-why-head">
            <H head={c.why} />
          </div>
          {/* cartões que se empilham conforme o scroll */}
          <ol className="stack">
            {c.why.items.map((w, i) => (
              <li key={w.title} className="stack-card" style={{ top: `calc(120px + ${i * 22}px)` }}>
                <span className="stack-num">{pad(i + 1)}</span>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaFinal />
    </>
  )
}
