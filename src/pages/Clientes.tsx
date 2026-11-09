import { useEffect, useState } from 'react'
import { ClientLogos, CtaFinal } from '../sections'
import { clientes as c } from '../cms/pages/clientes'
import { NUMEROS } from './data'
import { usePageMeta } from './ui'
import { CmsHero, H, pad, spotlight } from './kit'
import { DotGrid } from '../components/ui/dot-grid'
import { DragColumn } from '../components/ui/drag-column'

// no celular os depoimentos ficam numa coluna só (com todos os itens)
function useNarrow() {
  const q = '(max-width: 900px)'
  const [narrow, setNarrow] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

type Quote = (typeof c.testimonials.items)[number]

function QuoteCard({ q }: { q: Quote }) {
  return (
    <figure className={`cms-quote${q.destaque ? ' is-highlight' : ''}`}>
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
  )
}

export function ClientesPage() {
  usePageMeta(c.seo.title, c.seo.description)
  const [active, setActive] = useState(0)
  const narrow = useNarrow()
  const quotes = c.testimonials.items.filter((q) => q.quote.trim())
  // colunas escolhidas no painel (1 a 3), nunca mais colunas do que depoimentos
  const n = narrow ? 1 : Math.max(1, Math.min(3, c.testimonials.cols ?? 3, quotes.length))
  const cols = Array.from({ length: n }, (_, k) => quotes.filter((_, i) => i % n === k))
  // com poucos depoimentos por coluna, o carrossel infinito repetiria os mesmos cards: fica parado
  const still = Math.max(...cols.map((col) => col.length)) < 3
  const cs = c.cases.items[Math.min(active, c.cases.items.length - 1)]

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

      {!c.testimonials.hidden && quotes.length > 0 && (
        <section className="pg-sec" data-chapter={c.testimonials.eyebrow}>
          <div className="pg-wrap">
            <H head={c.testimonials} center />
            <div className={`cms-quotes is-cols-${n}${still ? ' is-still' : ''}`} data-anim="up">
              {cols.map((col, k) =>
                still ? (
                  <div key={k} className="cms-quotes-col">
                    {col.map((q, i) => (
                      <QuoteCard key={i} q={q} />
                    ))}
                  </div>
                ) : (
                  <DragColumn key={k} reverse={k === 1} speed={20 + k * 4}>
                    {col.map((q, i) => (
                      <QuoteCard key={i} q={q} />
                    ))}
                  </DragColumn>
                ),
              )}
            </div>
            {!still && <p className="dc-hint">Arraste para cima ou para baixo para ver mais</p>}
          </div>
        </section>
      )}

      {!c.cases.hidden && cs && (
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
      )}

      <CtaFinal />
    </>
  )
}
