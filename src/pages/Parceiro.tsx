import { useState } from 'react'
import type { CSSProperties } from 'react'
import { parceiro as c } from '../cms/pages/parceiro'
import { ReelFeature } from '../Reels'
import { GlassFold } from '../components/ui/glass-fold'
import { usePageMeta } from './ui'
import { CmsHero, H, T, pad, spotlight } from './kit'
import { CmsForm } from './CmsForm'

export function ParceiroPage() {
  usePageMeta(c.seo.title, c.seo.description)

  return (
    <>
      <CmsHero
        hero={c.hero}
        crumbs={[{ label: 'Seja um parceiro' }]}
        background={<GlassFold color1="#2a3033" color2="#111516" color3="#8a9196" speed={0.2} scale={0.85} noise={0.1} />}
      />

      <section className="pg-sec" data-chapter={c.models.eyebrow}>
        <div className="pg-wrap">
          <H head={c.models} />
          <div className="cms-bento">
            {c.models.items.map((m, i) => (
              <article
                key={m.title}
                className="spot cms-card"
                style={{ '--span': 2 } as CSSProperties}
                onPointerMove={spotlight}
                data-anim="up"
              >
                <span className="cms-tag">{m.tag}</span>
                <span className="cms-card-num">{pad(i + 1)}</span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.why.eyebrow}>
        <div className="pg-wrap">
          <H head={c.why} />
          <div className="cms-stats">
            {c.why.items.map((w) => (
              <div key={w.title} className="spot cms-stat cms-why" onPointerMove={spotlight} data-anim="up">
                <strong>{w.title}</strong>
                <span>{w.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReelFeature reel={c.reel} eyebrow={c.reel.eyebrow} title={<T title={c.reel.heading} />} text={c.reel.text} />

      <section className="pg-sec" data-chapter={c.steps.eyebrow}>
        <div className="pg-wrap">
          <H head={c.steps} />
          <ol className="flow">
            {c.steps.items.map((s, i) => (
              <li key={s.title} className="flow-step" data-anim="up">
                <span className="flow-num">{pad(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-sec" id="cadastro" data-chapter={c.form.eyebrow}>
        <div className="pg-wrap cms-form-wrap">
          <H head={c.form} />
          <PartnerForm />
        </div>
      </section>
    </>
  )
}

/** Primeiro a pessoa escolhe o tipo de parceria; depois aparece o formulário daquele tipo. */
function PartnerForm() {
  const [typeId, setTypeId] = useState<string | null>(null)
  const type = c.form.types.find((t) => t.id === typeId)

  if (!type) {
    return (
      <div className="pt">
        <p className="pt-label">{c.form.chooseLabel}</p>
        <div className="pt-choices" role="group" aria-label={c.form.chooseLabel}>
          {c.form.types.map((t, i) => (
            <button key={t.id} type="button" className="pt-choice" onClick={() => setTypeId(t.id)}>
              <span className="pt-num">{pad(i + 1)}</span>
              <span>
                <strong>{t.label}</strong>
                <small>{t.text}</small>
              </span>
              <span className="pt-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt pt-form-enter" key={type.id}>
      <div className="pt-selected">
        <span>
          Tipo de parceria: <strong>{type.label}</strong>
        </span>
        <button type="button" className="pt-change" onClick={() => setTypeId(null)}>
          Trocar tipo
        </button>
      </div>
      <CmsForm form={type.form} anim={false} source={`parceiro: ${type.label}`} />
    </div>
  )
}
