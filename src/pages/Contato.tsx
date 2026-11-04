import { Link } from 'react-router-dom'
import { LeadForm } from '../sections'
import { contato as c } from '../cms/pages/contato'
import { CONTACT, CONTACT_LINKS, SOLUTIONS } from './data'
import { usePageMeta } from './ui'
import { CmsHero, H, pad, spotlight } from './kit'
import { SOLUTION_ART } from './SolutionsBento'
import { DotGrid } from '../components/ui/dot-grid'

export function ContatoPage() {
  usePageMeta(c.seo.title, c.seo.description)

  return (
    <>
      <CmsHero hero={c.hero} crumbs={[{ label: 'Entre em contato' }]} background={<DotGrid />} />

      <section className="pg-sec pg-sec-tight" data-chapter="Formulário">
        <div className="pg-wrap pg-contact">
          <div className="pg-contact-form">
            <LeadForm />
          </div>
          <aside className="spot contact-info" onPointerMove={spotlight} data-anim="up">
            <h2>{c.info.title}</h2>
            <dl>
              <div>
                <dt>{c.info.labels.email}</dt>
                <dd>
                  <a href={CONTACT_LINKS.email}>{CONTACT.email}</a>
                </dd>
              </div>
              <div>
                <dt>{c.info.labels.phone}</dt>
                <dd>
                  <a href={CONTACT_LINKS.phone}>{CONTACT.phone}</a>
                </dd>
              </div>
              {CONTACT.whatsapp && (
                <div>
                  <dt>{c.info.labels.whatsapp}</dt>
                  <dd>{CONTACT.whatsapp}</dd>
                </div>
              )}
              <div>
                <dt>Redes</dt>
                <dd className="contact-social">
                  <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                  </a>
                  <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram ↗
                  </a>
                </dd>
              </div>
            </dl>
            <h2>{c.info.officesTitle}</h2>
            {CONTACT.sedes.map((s) => (
              <address key={s.name}>
                <strong>{s.name}</strong>
                {s.address}
                <br />
                {s.city}
              </address>
            ))}
          </aside>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.next.eyebrow}>
        <div className="pg-wrap">
          <H head={c.next} />
          <ol className="flow">
            {c.next.items.map((s, i) => (
              <li key={s.title} className="flow-step" data-anim="up">
                <span className="flow-num">{pad(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.shortcuts.eyebrow}>
        <div className="pg-wrap">
          <H head={c.shortcuts} />
          <div className="sp-others-grid contact-shortcuts">
            {SOLUTIONS.map((o) => {
              const Art = SOLUTION_ART[o.slug]
              return (
                <Link key={o.slug} to={`/solucoes/${o.slug}`} className="sp-other" data-anim="up">
                  <div className="sp-other-art">{Art && <Art />}</div>
                  <span className="sp-other-num">{o.num}</span>
                  <strong>{o.title}</strong>
                  <p>{o.short}</p>
                  <span className="sp-more">Ver solução →</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
