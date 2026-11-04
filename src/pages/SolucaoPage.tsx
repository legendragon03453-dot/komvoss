import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { CtaFinal } from '../sections'
import { GlassFold } from '../components/ui/glass-fold'
import { prefersReducedMotion } from '../motion'
import { COMPANIES, SOLUTIONS } from './data'
import type { Solution } from './data'
import { GhostLink, PrimaryLink, SectionHead, usePageMeta } from './ui'
import { NotFound } from './NotFound'
import { CompanyLogo } from './Solucoes'
import { SOLUTION_ART } from './SolutionsBento'
import { ArchToProcess } from './ArchToProcess'
import { solutionSeo } from '../seo/site'

/*
 * Página de cada solução (/solucoes/:slug), montada inteira a partir do CMS em src/cms/solucoes.
 * Mesma linguagem da página Soluções: hero com GlassFold, bento, transição para "Como trabalhamos"
 * e paleta prateada no lugar do azul.
 */

const pad = (n: number) => String(n).padStart(2, '0')

/** Título com a parte `highlight` em gradiente prateado. */
function Highlight({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.lastIndexOf(highlight) : -1
  if (!highlight || at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="teal">{highlight}</span>
      {text.slice(at + highlight.length)}
    </>
  )
}

export function SolucaoPage() {
  const { slug } = useParams()
  const s = SOLUTIONS.find((x) => x.slug === slug)
  usePageMeta(
    s ? solutionSeo(s).title : 'Página não encontrada | Grupo Komvos',
    s ? solutionSeo(s).description : 'Página não encontrada.',
  )
  if (!s) return <NotFound />

  return (
    <div className="theme-silver sp" key={s.slug}>
      <SolHero s={s} />
      <BeforeAfter s={s} />
      <Deliveries s={s} />
      {s.mindBand && <MindBand />}
      <ArchToProcess />
      <Executor s={s} />
      <Others s={s} />
      <CtaFinal />
    </div>
  )
}

/* ---------------- Hero ---------------- */

function SolHero({ s }: { s: Solution }) {
  const executor = COMPANIES.find((c) => c.id === s.executor)
  const Art = SOLUTION_ART[s.slug]
  return (
    <section className="pg-hero has-background sp-hero" data-chapter={`Solução ${s.num}`}>
      <div className="pg-hero-background" aria-hidden="true">
        <GlassFold color1="#2a3033" color2="#111516" color3="#8a9196" speed={0.22} scale={0.85} noise={0.1} />
      </div>
      <div className="pg-wrap sp-hero-grid">
        <div className="sp-hero-copy" data-hero="panel">
          <nav className="pg-crumbs" aria-label="Você está em">
            <Link to="/">Início</Link>
            <span>
              <span aria-hidden="true">/</span>
              <Link to="/solucoes">Soluções</Link>
            </span>
            <span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{s.title}</span>
            </span>
          </nav>
          <p className="pg-eyebrow">
            Frente {s.num} / {pad(SOLUTIONS.length)}
            {executor && <> · Executado por {executor.name}</>}
          </p>
          <h1 className="pg-h1">
            <Highlight text={s.title} highlight={s.highlight} />
          </h1>
          <p className="pg-lead">{s.problem}</p>
          <div className="pg-actions">
            <PrimaryLink to="/contato">Falar com um especialista</PrimaryLink>
            <GhostLink to="/solucoes">Todas as soluções</GhostLink>
          </div>
        </div>
        {Art && (
          <div className="sp-hero-art" data-hero="panel">
            <div className="sp-art-card">
              <span className="sp-art-num" aria-hidden="true">
                {s.num}
              </span>
              <Art />
              <p className="sp-art-caption">{s.short}</p>
            </div>
          </div>
        )}
      </div>
      <div className="pg-wrap">
        <FrontNav current={s.slug} />
      </div>
    </section>
  )
}

/* Seletor das frentes (mesmo visual do "Escolha uma frente"); o ponto desliza da frente anterior para a atual. */
let lastFront = -1

function FrontNav({ current }: { current: string }) {
  const n = SOLUTIONS.length
  const idx = SOLUTIONS.findIndex((x) => x.slug === current)
  const [shown, setShown] = useState(() => (lastFront >= 0 && lastFront !== idx ? lastFront : idx))

  useEffect(() => {
    lastFront = idx
    const id = requestAnimationFrame(() => setShown(idx))
    return () => cancelAnimationFrame(id)
  }, [idx])

  return (
    <nav className="front-slider sp-front" aria-label="Outras frentes">
      <div className="front-slider-head">
        <span>Navegue pelas frentes</span>
        <span aria-hidden="true">↔</span>
      </div>
      <div className="front-slider-stops">
        {SOLUTIONS.map((x, k) => (
          <Link key={x.slug} to={`/solucoes/${x.slug}`} className={k === idx ? 'is-active' : ''} aria-current={k === idx ? 'page' : undefined}>
            <span>{x.num}</span> {x.title.split(/,| &/)[0]}
          </Link>
        ))}
      </div>
      <div className="front-slider-track" style={{ ['--pct' as string]: `${(shown / (n - 1)) * 100}%` }} aria-hidden="true">
        <span className="front-slider-rail">
          <span className="front-slider-fill" />
          {SOLUTIONS.map((x, k) => (
            <span key={x.slug} className={`front-slider-tick${k <= shown ? ' is-on' : ''}`} style={{ left: `${(k / (n - 1)) * 100}%` }} />
          ))}
          <span className="front-slider-knob" />
        </span>
      </div>
    </nav>
  )
}

/* ---------------- Antes → depois (guiado pelo scroll) ---------------- */

function BeforeAfter({ s }: { s: Solution }) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.sp-ba-row').forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 82%', end: 'top 38%', scrub: 0.5 },
          defaults: { ease: 'none' },
        })
        tl.fromTo(row.querySelector('.sp-ba-strike'), { '--strike': '0%' }, { '--strike': '100%', duration: 1 }, 0)
          .fromTo(row.querySelector('.sp-ba-before'), { opacity: 1 }, { opacity: 0.45, duration: 1 }, 0.2)
          .fromTo(row.querySelector('.sp-ba-arrow'), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.5 }, 0.4)
          .fromTo(row.querySelector('.sp-ba-after'), { opacity: 0.12, x: 40 }, { opacity: 1, x: 0, duration: 0.8 }, 0.5)
      })
    }, ref)
    return () => ctx.revert()
  }, [s.slug])

  const rows = s.pains.map((pain, i) => ({ pain, gain: s.gains[i] }))

  return (
    <section className="pg-sec sp-ba" ref={ref} data-chapter="Da dor ao resultado">
      <div className="pg-wrap">
        <div className="sb-head">
          <h2 className="sb-title" data-anim="up">
            Se isso parece familiar…
          </h2>
          <p className="sb-sub" data-anim="up">
            Veja o que muda com o <span className="teal">Grupo Komvos.</span>
          </p>
        </div>
        <ol className="sp-ba-list">
          {rows.map((r, i) => (
            <li key={r.pain} className="sp-ba-row">
              <span className="sp-ba-num">{pad(i + 1)}</span>
              <div className="sp-ba-before">
                <span className="sp-ba-tag">Hoje</span>
                <p>
                  <span className="sp-ba-strike">{r.pain}</span>
                </p>
              </div>
              <span className="sp-ba-arrow" aria-hidden="true">
                →
              </span>
              <div className="sp-ba-after">
                <span className="sp-ba-tag">Com o Grupo Komvos</span>
                <p>{r.gain}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------- O que entregamos (bento) ---------------- */

// largura de cada card (em colunas de 6) conforme a quantidade de entregas
const SPANS: Record<number, number[]> = {
  1: [6],
  2: [3, 3],
  3: [4, 2, 6],
  4: [4, 2, 2, 4],
  5: [4, 2, 2, 2, 2],
  6: [4, 2, 2, 4, 3, 3],
}

function Deliveries({ s }: { s: Solution }) {
  const spans = SPANS[s.deliveries.length] ?? s.deliveries.map(() => 2)

  // brilho prateado que segue o ponteiro
  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section className="pg-sec sp-del" data-chapter="O que entregamos">
      <div className="pg-wrap">
        <SectionHead eyebrow="O que entregamos" title={<Short text={s.short} />} />
        <div className="sp-bento">
          {s.deliveries.map((d, i) => (
            <article
              key={d.title}
              className={`sp-card${spans[i] >= 4 ? ' is-wide' : ''}`}
              style={{ '--span': spans[i] } as CSSProperties}
              onPointerMove={onMove}
              data-anim="up"
            >
              <span className="sp-card-num">{pad(i + 1)}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
              <span className="sp-card-line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Short({ text }: { text: string }): ReactNode {
  return (
    <>
      {text.replace(/\.$/, '')}
      <span className="teal">.</span>
    </>
  )
}

/* ---------------- Komvos Mind ---------------- */

function MindBand() {
  return (
    <section className="pg-sec pg-sec-tight" data-chapter="Komvos Mind">
      <div className="pg-wrap">
        <Link to="/komvos-mind" className="sp-mind" data-anim="up">
          <div>
            <p className="sp-mind-kicker">Diferencial Komvos</p>
            <strong>Komvos Mind: a inteligência que trabalha pela sua operação.</strong>
          </div>
          <span className="sp-mind-cta">Conhecer →</span>
        </Link>
      </div>
    </section>
  )
}

/* ---------------- Quem executa ---------------- */

function Executor({ s }: { s: Solution }) {
  const executor = COMPANIES.find((c) => c.id === s.executor)
  if (!executor) return null
  return (
    <section className="pg-sec sp-exec" data-chapter="Quem executa">
      <div className="pg-wrap pg-split">
        <SectionHead
          eyebrow="Quem executa"
          title={
            <>
              Do ecossistema <span className="teal">Komvos</span>
            </>
          }
          lead="Você contrata o Grupo Komvos e tem a empresa especialista certa cuidando de cada frente, com uma única visão do seu negócio."
        />
        <Link to={`/ecossistema#${executor.id}`} className="sp-exec-card" data-anim="right">
          {executor.logo && (
            <span className="sp-exec-logo">
              <CompanyLogo c={executor} />
            </span>
          )}
          <span className="sp-exec-area">{executor.area}</span>
          <strong>{executor.name}</strong>
          <p>{executor.text}</p>
          <span className="sp-more">Ver o ecossistema →</span>
        </Link>
      </div>
    </section>
  )
}

/* ---------------- Outras soluções ---------------- */

function Others({ s }: { s: Solution }) {
  const others = SOLUTIONS.filter((x) => x.slug !== s.slug)
  return (
    <section className="pg-sec sp-others" data-chapter="Conheça também">
      <div className="pg-wrap">
        <SectionHead
          eyebrow="Conheça também"
          title={
            <>
              Outras <span className="teal">soluções</span>
            </>
          }
        />
        <div className="sp-others-grid">
          {others.map((o) => {
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
  )
}
