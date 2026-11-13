import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { CtaFinal } from '../sections'
import { insights as c } from '../cms/pages/insights'
import { ARTICLES, CATEGORIES } from './data'
import type { Article } from './data'
import { PrimaryLink, usePageMeta } from './ui'
import { CmsHero, H, spotlight } from './kit'
import { NotFound } from './NotFound'
import { articleSeo } from '../seo/site'
import { Cover } from './Cover'
import { AuthorCard, Blocks } from '../live/blocks'
import { GlassFold } from '../components/ui/glass-fold'
import { prefersReducedMotion } from '../motion'


function InsightCard({ a }: { a: Article }) {
  return (
    <Link to={`/insights/${a.slug}`} className="spot ins-card" onPointerMove={spotlight} data-anim="up">
      <Cover cat={a.cat} src={a.cover} alt={a.seo?.coverAlt} />
      <div className="ins-card-body">
        <span className="ins-meta">
          <span className="cms-tag">{a.cat}</span>
          {a.date} · {a.read}
        </span>
        <h3>{a.title}</h3>
        <p>{a.excerpt}</p>
        <span className="sp-more">Ler artigo →</span>
      </div>
    </Link>
  )
}

export function InsightsPage() {
  usePageMeta(c.seo.title, c.seo.description)
  const tabs = [c.allLabel, ...CATEGORIES]
  const [cat, setCat] = useState<string>(c.allLabel)
  const [featured, ...rest] = ARTICLES
  const list = cat === c.allLabel ? rest : ARTICLES.filter((a) => a.cat === cat)

  // pílula que desliza até a aba ativa
  const tabsRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ x: 0, w: 0 })
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabsRef.current?.querySelector<HTMLElement>('.is-active')
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [cat])

  return (
    <>
      <CmsHero
        hero={c.hero}
        crumbs={[{ label: 'Insights' }]}
        background={<GlassFold color1="#2a3033" color2="#111516" color3="#8a9196" speed={0.2} scale={0.8} noise={0.1} />}
      />

      <section className="pg-sec pg-sec-tight" data-chapter={c.featuredLabel}>
        <div className="pg-wrap">
          <Link to={`/insights/${featured.slug}`} className="spot ins-featured" onPointerMove={spotlight} data-anim="up">
            <Cover cat={featured.cat} src={featured.cover} alt={featured.seo?.coverAlt} />
            <div className="ins-featured-body">
              <span className="ins-meta">
                <span className="cms-tag is-solid">{c.featuredLabel}</span>
                <span className="cms-tag">{featured.cat}</span>
                {featured.date} · {featured.read}
              </span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <span className="sp-more">Ler artigo →</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="pg-sec" data-chapter="Artigos">
        <div className="pg-wrap">
          <div className="ins-tabs" ref={tabsRef} role="group" aria-label="Filtrar por categoria">
            <span className="ins-pill" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} aria-hidden="true" />
            {tabs.map((t) => (
              <button key={t} type="button" className={t === cat ? 'is-active' : ''} aria-pressed={t === cat} onClick={() => setCat(t)}>
                {t}
              </button>
            ))}
          </div>
          {list.length ? (
            <div className="ins-grid" key={cat}>
              {list.map((a) => (
                <InsightCard key={a.slug} a={a} />
              ))}
            </div>
          ) : (
            <p className="pg-empty">{c.empty.replace('{cat}', cat)}</p>
          )}
        </div>
      </section>

      <CtaFinal />
    </>
  )
}

export function ArtigoPage() {
  const { slug } = useParams()
  const a = ARTICLES.find((x) => x.slug === slug)
  usePageMeta(a ? articleSeo(a).title : 'Página não encontrada | Grupo Komvos', a ? articleSeo(a).description : 'Página não encontrada.', {
    keywords: a ? [a.seo?.keyword, a.seo?.keywords].filter(Boolean).join(', ') : '',
    image: a ? a.seo?.ogImage || (a.cover && !/\.svg(\?|#|$)|^data:/i.test(a.cover) ? a.cover : '') : '',
    imageAlt: a?.seo?.coverAlt || a?.title || '',
    noindex: !a || Boolean(a.seo?.noindex),
  })

  // barra de progresso de leitura
  const barRef = useRef<HTMLSpanElement>(null)
  const bodyRef = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (!a || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: bodyRef.current, start: 'top 70%', end: 'bottom 70%', scrub: true } },
      )
    })
    return () => ctx.revert()
  }, [a])

  if (!a) return <NotFound />
  const related = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3)

  return (
    <>
      <span className="ins-progress" ref={barRef} aria-hidden="true" />
      <CmsHero
        hero={{ eyebrow: a.cat, title: { text: a.title }, lead: `${a.date} · ${a.read} de leitura` }}
        crumbs={[{ label: 'Insights', to: '/insights' }, { label: a.cat }]}
        background={<GlassFold color1="#2a3033" color2="#111516" color3="#8a9196" speed={0.18} scale={0.8} noise={0.1} />}
        aside={
          <div className="ins-hero-cover">
            <Cover cat={a.cat} src={a.cover} alt={a.seo?.coverAlt} />
          </div>
        }
      />

      <section className="pg-sec pg-sec-tight" ref={bodyRef} data-chapter="Artigo">
        <div className="pg-wrap ins-layout">
          <article className="ins-article">
            {a.author && (
              <div className="ins-byline" data-anim="up">
                <AuthorCard a={a.author} />
              </div>
            )}
            <p className="ins-intro" data-anim="up">
              {a.excerpt}
            </p>
            {a.blocks?.length ? (
              <Blocks blocks={a.blocks} />
            ) : (
              a.body.map((p) => (
                <p key={p.slice(0, 24)} data-anim="up">
                  {p}
                </p>
              ))
            )}
          </article>
          {/* lateral fixa: dados do artigo e chamada para um especialista */}
          <aside className="ins-aside">
            <div className="ins-aside-card">
              <Cover cat={a.cat} src={a.cover} alt={a.seo?.coverAlt} />
              <dl className="ins-aside-meta">
                <div>
                  <dt>Categoria</dt>
                  <dd>{a.cat}</dd>
                </div>
                <div>
                  <dt>Publicado</dt>
                  <dd>{a.date}</dd>
                </div>
                <div>
                  <dt>Leitura</dt>
                  <dd>{a.read}</dd>
                </div>
              </dl>
              <div className="ins-aside-cta">
                <strong>{c.article.ctaTitle}</strong>
                <PrimaryLink to="/contato">{c.article.ctaLabel}</PrimaryLink>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.article.relatedEyebrow}>
        <div className="pg-wrap">
          <H head={{ eyebrow: c.article.relatedEyebrow, title: c.article.relatedTitle }} />
          <div className="ins-grid">
            {related.map((r) => (
              <InsightCard key={r.slug} a={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
