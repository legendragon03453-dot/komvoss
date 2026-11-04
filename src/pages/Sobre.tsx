import { A } from '../content'
import { CtaFinal } from '../sections'
import { sobre as c } from '../cms/pages/sobre'
import { usePageMeta } from './ui'
import { Actions, CmsHero, H, T, pad, spotlight } from './kit'
import { ReelFeature } from '../Reels'
import { FluidParticles } from '../components/ui/fluid-particles'
import { TextReveal } from '../components/ui/text-reveal'
import { Marquee } from '../components/ui/marquee'
import { ScrollTimeline } from '../components/ui/scroll-timeline'

export function SobrePage() {
  usePageMeta(c.seo.title, c.seo.description)

  return (
    <>
      <CmsHero
        hero={c.hero}
        crumbs={[{ label: 'Sobre' }]}
        background={<FluidParticles className="hero-particles" color="220, 224, 228" alpha={0.2} density={800} />}
      />

      <section className="pg-sec cms-manifesto" data-chapter={c.name.head.eyebrow}>
        <div className="pg-wrap mf-split">
          <div>
            <p className="about-greek" data-anim="up" aria-hidden="true">
              {c.name.greek}
            </p>
            <H head={c.name.head} />
            <TextReveal text={c.name.manifesto} className="cms-reveal" />
          </div>
          <figure className="mf-symbol" data-anim="up">
            <span className="mf-symbol-mark">
              <span className="mf-symbol-ring" aria-hidden="true" />
              <img src={`${A}/logo.png`} alt="Símbolo Komvos" width={360} height={360} />
            </span>
            <figcaption>{c.name.symbolCaption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="pg-sec" data-chapter="Propósito">
        <div className="pg-wrap about-purpose">
          {[
            ['Missão', c.purpose.mission],
            ['Visão', c.purpose.vision],
          ].map(([k, v]) => (
            <article key={k} className="spot about-card" onPointerMove={spotlight} data-anim="up">
              <span className="about-card-beam" aria-hidden="true" />
              <p className="pg-eyebrow">{k}</p>
              <p className="about-card-text">{v}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.values.eyebrow}>
        <div className="about-values-band" aria-hidden="true">
          <Marquee duration={50} gap={48}>
            {c.values.items.map((v) => (
              <span key={v.title} className="about-band-word">
                {v.title}
                <span className="about-band-sep">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
        <div className="pg-wrap">
          <H head={c.values} />
          <div className="about-values">
            {c.values.items.map((v, i) => (
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

      <section className="pg-sec" data-chapter={c.history.eyebrow}>
        <div className="pg-wrap">
          <H head={c.history} />
          <ScrollTimeline items={c.history.items} />
          <div className="pg-center" data-anim="up">
            <Actions items={[c.history.action]} />
          </div>
        </div>
      </section>

      <CtaFinal />
    </>
  )
}
