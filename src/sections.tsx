import { Link } from 'react-router-dom'
import { A } from './content'
import { ARTICLES, CONTACT, CONTACT_LINKS, NUMEROS, SOLUTIONS } from './pages/data'
import { Cover } from './pages/Cover'
import { CLIENT_LOGOS, PARTNERS } from './cms/parceiros'
import { Marquee } from './components/ui/marquee'
import { home } from './cms/pages/home'
import { useLeadSubmit } from './pages/CmsForm'

/* ---------- Prova Social ---------- */

// Números no CMS (src/cms/site.ts); placeholders a substituir pelos reais.
export { NUMEROS }

export function ProvaSocial() {
  return (
    <section className="frame sec" id="clientes">
      <div className="social-panel">
        <p className="eyebrow" data-anim="up">{home.social.eyebrow}</p>
        <h2 className="sec-title black" data-anim="up">
          {home.social.title} <span className="teal">{home.social.highlight}</span>
        </h2>
        <div className="numeros">
          {NUMEROS.map((n) => (
            <div key={n.label} className="numero" data-anim="up">
              <strong>{n.value}</strong>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
        <p className="logos-label">Quem confia no Grupo Komvos</p>
        <ClientLogos />
      </div>
    </section>
  )
}

/** Logos dos clientes em faixas infinitas, sobre selos brancos. */
export function ClientLogos() {
  if (!CLIENT_LOGOS.length) return null
  const half = Math.ceil(CLIENT_LOGOS.length / 2)
  const row = (items: typeof CLIENT_LOGOS) =>
    items.map((l) => (
      <span key={l.name} className="client-logo">
        <img src={l.src} alt={l.name} loading="lazy" />
      </span>
    ))
  return (
    <div className="client-logos" data-anim="up">
      <Marquee duration={46}>{row(CLIENT_LOGOS.slice(0, half))}</Marquee>
      <Marquee duration={52} reverse>
        {row(CLIENT_LOGOS.slice(half))}
      </Marquee>
    </div>
  )
}

/* ---------- Parceiros oficiais ---------- */

export function Partners() {
  const { text, highlight } = PARTNERS.title
  const at = text.lastIndexOf(highlight)
  return (
    <section className="partners" data-chapter={PARTNERS.eyebrow}>
      <div className="partners-inner">
        <div className="partners-copy" data-anim="up">
          <p className="partners-eyebrow">{PARTNERS.eyebrow}</p>
          <h2>
            {text.slice(0, at)}
            <span className="brand-text">{highlight}</span>
          </h2>
          <p>{PARTNERS.lead}</p>
        </div>
        <ul className="partners-logos">
          {PARTNERS.items.map((p) => (
            <li key={p.name} className={p.badge ? 'has-badge' : undefined} data-anim="up">
              <span className="partners-logo-row">
                <img src={p.src} alt={p.name} style={p.height ? { height: p.height } : undefined} />
                {p.badge && <img className="partners-badge" src={p.badge.src} alt={p.badge.alt} width={302} height={302} />}
              </span>
              <span>Parceiro oficial</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Komvos Insights ---------- */

export function ArticleCard({ a }: { a: (typeof ARTICLES)[number] }) {
  return (
    <Link className="artigo" data-anim="up" to={`/insights/${a.slug}`}>
      <div className="artigo-thumb">
        <Cover cat={a.cat} src={a.cover} />
        <span className="artigo-cat">{a.cat}</span>
      </div>
      <div className="artigo-body">
        <span className="artigo-date">
          {a.date} · {a.read} de leitura
        </span>
        <h3>{a.title}</h3>
        <p>{a.excerpt}</p>
        <span className="artigo-more">Ler artigo →</span>
      </div>
    </Link>
  )
}

export function Insights() {
  return (
    <section className="frame sec" id="insights">
      <div className="insights-head">
        <div>
          <p className="eyebrow" data-anim="up">{home.insights.eyebrow}</p>
          <h2 className="sec-title" data-anim="up">
            {home.insights.title} <span className="teal">{home.insights.highlight}</span>
          </h2>
        </div>
        <Link className="link-arrow" data-anim="fade" to="/insights">
          Ver todos os artigos <img src="/assets/v2/arrow-light.svg" alt="" width={20} height={13.39} />
        </Link>
      </div>
      <div className="artigos">
        {ARTICLES.slice(0, 3).map((a) => (
          <ArticleCard key={a.slug} a={a} />
        ))}
      </div>
    </section>
  )
}

/* ---------- Formulário de lead + CTA Final ---------- */

export function LeadForm() {
  const { sent, sending, error, handleSubmit } = useLeadSubmit('contato')

  return (
    <form className="lead-form" data-anim="right" onSubmit={handleSubmit}>
      {sent ? (
        <div className="form-done">
          <h3>Recebemos seu contato!</h3>
          <p>Em breve um especialista do Grupo Komvos vai falar com você.</p>
        </div>
      ) : (
        <>
          <label>
            Nome completo
            <input name="nome" required autoComplete="name" />
          </label>
          <label>
            E-mail corporativo
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <div className="form-row">
            <label>
              Cargo
              <input name="cargo" required autoComplete="organization-title" />
            </label>
            <label>
              Empresa
              <input name="empresa" required autoComplete="organization" />
            </label>
          </div>
          <label>
            Desafio atual
            <textarea name="desafio" rows={3} />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="form-submit" disabled={sending} aria-busy={sending}>
            <span>{sending ? 'Enviando…' : home.cta.submit}</span>
            <span className="form-submit-box">
              <img src="/assets/v2/arrow-light.svg" alt="" width={27.2797} height={18.2624} />
            </span>
          </button>
        </>
      )}
    </form>
  )
}

export function CtaFinal() {
  return (
    <section className="frame sec" id="contato">
      <div className="cta-panel">
        <div className="cta-copy">
          <p className="eyebrow dark" data-anim="up">{home.cta.eyebrow}</p>
          <h2 className="sec-title black" data-anim="up">{home.cta.title}</h2>
          <p className="cta-text" data-anim="up">{home.cta.text}</p>
        </div>
        <LeadForm />
      </div>
    </section>
  )
}

/* ---------- Footer ---------- */

const FOOTER_COLS = [
  {
    title: 'Soluções',
    links: SOLUTIONS.map((s) => ({ label: s.title, to: `/solucoes/${s.slug}` })),
  },
  {
    title: 'Komvos',
    links: [
      { label: 'Komvos Mind', to: '/komvos-mind' },
      { label: 'Clientes', to: '/clientes' },
      { label: 'Insights', to: '/insights' },
      { label: 'Sobre o Grupo Komvos', to: '/sobre' },
      { label: 'Seja um parceiro', to: '/seja-um-parceiro' },
      { label: 'Trabalhe conosco', to: '/trabalhe-conosco' },
      { label: 'Entre em contato', to: '/contato' },
    ],
  },
  {
    title: 'Ecossistema',
    links: [
      { label: 'Senior Noroeste Paulista', to: '/ecossistema#senior' },
      { label: 'Statum', to: '/ecossistema#statum' },
      { label: 'Trusth', to: '/ecossistema#trusth' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="frame footer">
      <div className="footer-top">
        <div className="footer-brand" data-anim="up">
          <img src={`${A}/logo-komvos-branco.webp`} alt="Komvos — Tecnologia que transforma" width={440} height={102} />
          <p>
            Komvos vem do grego e significa “nó”: o ponto onde tudo se conecta. Um ecossistema de soluções
            empresariais em gestão, pessoas, cloud, dados e IA.
          </p>
          <p className="footer-contact">
            <a href={CONTACT_LINKS.email}>{CONTACT.email}</a>
            <a href={CONTACT_LINKS.phone}>{CONTACT.phone}</a>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
              Instagram ↗
            </a>
          </p>
        </div>
        {FOOTER_COLS.map((col) => (
          <nav key={col.title} className="footer-col" data-anim="up" aria-label={col.title}>
            <h4>{col.title}</h4>
            {col.links.map((l) => (
              <Link key={l.label} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Grupo Komvos. Todos os direitos reservados.</span>
        <Link to="/contato" className="footer-cta">
          Falar com um especialista →
        </Link>
      </div>
    </footer>
  )
}
