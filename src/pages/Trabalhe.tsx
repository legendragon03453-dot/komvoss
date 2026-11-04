import { trabalhe as c } from '../cms/pages/trabalhe'
import { sobre } from '../cms/pages/sobre'
import { ReelFeature } from '../Reels'
import { COMPANIES } from './data'
import { CompanyLogo } from './Solucoes'
import { usePageMeta } from './ui'
import { CmsHero, H, T, pad, spotlight } from './kit'
import { CmsForm } from './CmsForm'

export function TrabalheConoscoPage() {
  usePageMeta(c.seo.title, c.seo.description)

  return (
    <>
      <CmsHero
        hero={c.hero}
        crumbs={[{ label: 'Trabalhe conosco' }]}
        background={
          <div className="hero-photo">
            <img src="/assets/trabalhe-time.webp" alt="" width={1600} height={906} />
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

      <section className="pg-sec" id="candidatura" data-chapter={c.form.eyebrow}>
        <div className="pg-wrap cms-form-wrap">
          <H head={c.form} />
          <CmsForm form={c.form} source="trabalhe conosco" />
        </div>
      </section>
    </>
  )
}
