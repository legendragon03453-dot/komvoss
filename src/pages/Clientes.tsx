import { useState } from 'react'
import { ClientLogos, CtaFinal } from '../sections'
import { clientes as c } from '../cms/pages/clientes'
import { NUMEROS } from './data'
import { usePageMeta } from './ui'
import { CmsHero, H, pad, spotlight } from './kit'
import { DotGrid } from '../components/ui/dot-grid'
import { DragColumn } from '../components/ui/drag-column'

export function ClientesPage() {
  usePageMeta(c.seo.title, c.seo.description)
  const [active, setActive] = useState(0)
  const cols = [0, 1, 2].map((k) => c.testimonials.items.filter((_, i) => i % 3 === k))
  const cs = c.cases.items[active]

  return (
    <>
      <CmsHero hero={c.hero} crumbs={[{ label: 'Clientes' }]} background={<DotGrid />} />

      <section className="pg-sec" data-chapter={c.numbers.eyebrow}>
        <div className="pg-wrap">
          <H head={c.numbers} />
          <div className="cms-stats">
            {NUMEROS.map((n) => (
              <div key={n.label} className="spot cms-stat" onPointerMove={spotlight} data-anim="up">
                <strong>{n.value}</strong>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.logos.eyebrow}>
        <div className="pg-wrap">
          <H head={c.logos} center />
        </div>
        <div className="pg-wrap">
          <ClientLogos />
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.testimonials.eyebrow}>
        <div className="pg-wrap">
          <H head={c.testimonials} center />
          <div className="cms-quotes" data-anim="up">
            {cols.map((col, k) => (
              <DragColumn key={k} reverse={k === 1} speed={20 + k * 4}>
                {col.map((q, i) => (
                  <figure key={i} className={`cms-quote${q.destaque ? ' is-highlight' : ''}`}>
                    <blockquote>{q.quote}</blockquote>
                    <figcaption>
                      <span className="cms-avatar" aria-hidden="true">
                        {q.name.replace(/[^A-Za-zÀ-ú]/g, '').slice(0, 1) || 'K'}
                      </span>
                      <span>
                        <strong>{q.name}</strong>
                        <small>{q.role}</small>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </DragColumn>
            ))}
          </div>
          <p className="dc-hint">Arraste para cima ou para baixo para ver mais</p>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.cases.eyebrow}>
        <div className="pg-wrap">
          <H head={c.cases} />
          <div className="cases">
            <div className="cases-tabs" role="tablist" aria-label="Cases">
              {c.cases.items.map((it, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={i === active ? 'is-active' : ''}
                  onClick={() => setActive(i)}
                >
                  <span className="cases-num">{pad(i + 1)}</span>
                  <span>
                    <strong>{it.company}</strong>
                    <small>
                      {it.solution} · {it.sector}
                    </small>
                  </span>
                </button>
              ))}
            </div>
            <div className="cases-panel" role="tabpanel" key={active}>
              {[
                ['Desafio', cs.challenge],
                ['Solução', cs.result],
                ['Resultado', cs.outcome],
              ].map(([k, v], i) => (
                <div key={k} className="cases-step" style={{ animationDelay: `${i * 0.12}s` }}>
                  <span className="cases-step-k">{k}</span>
                  <p>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaFinal />
    </>
  )
}

