import { useState } from 'react'
import type { CSSProperties } from 'react'
import { CtaFinal } from '../sections'
import { komvosMind as c } from '../cms/pages/komvos-mind'
import { MIND_LAYERS } from './data'
import { usePageMeta } from './ui'
import { H, T, pad, spotlight } from './kit'
import { Orbit } from '../components/ui/orbit'
import { TextReveal } from '../components/ui/text-reveal'
import { LayerStack } from '../components/ui/layer-stack'
import { AgentPlan } from '../components/ui/agent-plan'
import { ReelFeature } from '../Reels'
import { LayerPoints } from '../components/ui/layer-points'
import { LayerHero } from '../components/ui/layer-hero'

// largura de cada caso de uso no bento (colunas de 6)
const CASE_SPANS = [4, 2, 2, 4, 3, 3]

export function KomvosMindPage() {
  usePageMeta(c.seo.title, c.seo.description)
  const [step, setStep] = useState(-1)

  return (
    <>
      <LayerHero layer={2} hero={c.hero} crumbs={[{ label: 'Komvos Mind' }]} aside={<Orbit labels={c.orbit} />} />

      <ReelFeature reel={c.reel} eyebrow={c.reel.eyebrow} title={<T title={c.reel.heading} />} text={c.reel.text} />

      <section className="pg-sec cms-manifesto" data-chapter={c.manifesto.eyebrow}>
        <div className="pg-wrap mf-split">
          <div>
            <p className="pg-eyebrow" data-anim="up">
              {c.manifesto.eyebrow}
            </p>
            {c.manifesto.title && (
              <h2 className="pg-h2 cms-manifesto-title" data-anim="up">
                <T title={c.manifesto.title} />
              </h2>
            )}
            <TextReveal text={c.manifesto.text} className="cms-reveal" />
          </div>
          <LayerPoints layer={2} role={MIND_LAYERS[2].role} name={MIND_LAYERS[2].name} points={c.manifesto.points} />
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.layers.eyebrow}>
        <div className="pg-wrap">
          <H head={c.layers} />
          <LayerStack layers={MIND_LAYERS} />
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.how.eyebrow}>
        <div className="pg-wrap">
          <H head={c.how} />
          <div className="mind-how">
            <ol className="mind-steps">
              {c.how.steps.map((s, i) => (
                <li key={s.title} className={`mind-step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}>
                  <span className="mind-step-num">{pad(i + 1)}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div data-anim="up">
              <AgentPlan title={c.how.demo.title} note={c.how.demo.note} tasks={c.how.demo.tasks} onStep={setStep} />
            </div>
          </div>
        </div>
      </section>

      <section className="pg-sec" id="casos" data-chapter={c.cases.eyebrow}>
        <div className="pg-wrap">
          <H head={c.cases} />
          <div className="cms-bento">
            {c.cases.items.map((it, i) => (
              <article
                key={it.title}
                className="spot cms-card"
                style={{ '--span': CASE_SPANS[i] ?? 2 } as CSSProperties}
                onPointerMove={spotlight}
                data-anim="up"
              >
                <span className="cms-tag">{it.area}</span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaFinal />
    </>
  )
}
