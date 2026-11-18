import { trabalhe as c } from '../cms/pages/trabalhe'
import { sobre } from '../cms/pages/sobre'
import { ReelFeature } from '../Reels'
import { COMPANIES } from './data'
import { CompanyLogo } from './Solucoes'
import { PrimaryLink, usePageMeta } from './ui'
import { CmsHero, H, T, pad, spotlight } from './kit'

export function TrabalheConoscoPage() {
  usePageMeta(c.seo.title, c.seo.description)

  return (
    <>
      <CmsHero
        hero={c.hero}
        crumbs={[{ label: 'Trabalhe conosco' }]}
        background={
          <div className="hero-photo">
            {c.hero.video ? (
              // vídeo de capa (enviado pelo painel); a foto vira o quadro inicial enquanto o vídeo carrega
              <video key={c.hero.video} src={c.hero.video} poster={c.hero.video === '/assets/trabalhe-capa.mp4' ? '/assets/trabalhe-capa.webp' : '/assets/trabalhe-time.webp'} autoPlay muted loop playsInline preload="metadata" />
            ) : (
              <img src="/assets/trabalhe-time.webp" alt="" width={1600} height={906} />
            )}
          </div>
        }
      />

      <section className="pg-sec" data-chapter={c.culture.eyebrow}>
        <div className="pg-wrap">
          <H head={c.culture} />
          <div className="about-values">
            {sobre.values.items.map((v, i) => (
              <article key={v.title} className="spot cms-card about-value" onPointerMove={spotlight} data-anim="up">
                <span className="about-value-num">{pad(i + 1)}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReelFeature reel={c.reel} eyebrow={c.reel.eyebrow} title={<T title={c.reel.heading} />} text={c.reel.text} />

      <section className="pg-sec" data-chapter={c.companies.eyebrow}>
        <div className="pg-wrap">
          <H head={c.companies} />
          <div className="eco-cards">
            {COMPANIES.map((co) => (
              <article key={co.id} className="spot eco-card" onPointerMove={spotlight} data-anim="up">
                <div className="eco-card-top">
                  <span className="eco-card-logo">
                    <CompanyLogo c={co} plain />
                  </span>
                </div>
                <span className="cms-tag">{co.area}</span>
                <h2>{co.name}</h2>
                <p>{co.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* candidaturas: no Portal de Talentos (antes era um formulário aqui) */}
      <section className="pg-sec jobs-cta" id="vagas" data-chapter={c.jobs.eyebrow}>
        <div className="pg-wrap">
          <H head={c.jobs} center />
          <div className="pg-actions jobs-cta-actions" data-anim="up">
            <PrimaryLink to={c.jobs.href}>{c.jobs.button}</PrimaryLink>
          </div>
        </div>
      </section>
    </>
  )
}
