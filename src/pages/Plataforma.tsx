import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CtaFinal } from '../sections'
import { erp, komvosOs } from '../cms/pages/arquitetura'
import type { LayerPage } from '../cms/pages/arquitetura'
import { MIND_LAYERS } from './data'
import { usePageMeta } from './ui'
import { H, T, pad, spotlight } from './kit'
import { TextReveal } from '../components/ui/text-reveal'
import { LayerPoints } from '../components/ui/layer-points'
import { VideoPlaylist } from '../components/ui/video-playlist'
import { LayerHero } from '../components/ui/layer-hero'

/* Páginas das camadas da arquitetura: ERP by Senior e Komvos OS (o Komvos Mind tem página própria). */

const LAYER_PATHS = ['/erp-by-senior', '/komvos-os', '/komvos-mind']
const LAYER_VERBS = ['guarda', 'movimenta', 'pensa']

// largura dos cards no bento (colunas de 6) conforme a quantidade
const SPANS: Record<number, number[]> = { 3: [2, 2, 2], 6: [4, 2, 2, 4, 3, 3] }

/** As três camadas, com a atual destacada; cada uma leva à sua página. */
function LayerNav({ current }: { current: number }) {
  return (
    <section className="pg-sec ly-sec" data-chapter="A espinha dorsal">
      <div className="pg-wrap">
        <H
          head={{
            eyebrow: 'A espinha dorsal Komvos',
            title: { text: 'O ERP guarda, o OS movimenta e o Mind pensa.', highlight: 'o Mind pensa.' },
          }}
        />
        <div className="ly-nav">
          {MIND_LAYERS.map((l, i) => (
            <Link key={l.name} to={LAYER_PATHS[i]} className={`ly-card is-l${i}${i === current ? ' is-current' : ''}`} data-anim="up">
              <span className="ly-num">{pad(i + 1)}</span>
              <span className="ly-role">{l.role}</span>
              <strong>{l.name}</strong>
              <p>{l.text}</p>
              <span className="ly-verb">
                {i === current ? 'Você está aqui' : `O que ${LAYER_VERBS[i]} →`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function LayerPageView({ c, layer, aside }: { c: LayerPage; layer: 0 | 1; aside?: ReactNode }) {
  usePageMeta(c.seo.title, c.seo.description)
  const spans = SPANS[c.items.items.length] ?? c.items.items.map(() => 2)

  return (
    <>
      <LayerHero layer={layer} hero={c.hero} crumbs={[{ label: c.hero.eyebrow }]} aside={aside} />

      <section className="pg-sec cms-manifesto" id="como-funciona" data-chapter={c.about.eyebrow}>
        <div className="pg-wrap mf-split">
          <div>
            <p className="pg-eyebrow" data-anim="up">
              {c.about.eyebrow}
            </p>
            <h2 className="pg-h2 cms-manifesto-title" data-anim="up">
              <T title={c.about.title} />
            </h2>
            <TextReveal text={c.about.text} className="cms-reveal" />
          </div>
          <LayerPoints layer={layer} role={MIND_LAYERS[layer].role} name={MIND_LAYERS[layer].name} points={c.about.points} />
        </div>
      </section>

      <section className="pg-sec" data-chapter={c.items.eyebrow}>
        <div className="pg-wrap">
          <H head={c.items} />
          <div className="cms-bento">
            {c.items.items.map((it, i) => (
              <article
                key={it.title}
                className="spot cms-card"
                style={{ '--span': spans[i] ?? 2 } as CSSProperties}
                onPointerMove={spotlight}
                data-anim="up"
              >
                {it.tag && <span className="cms-tag">{it.tag}</span>}
                <span className="cms-card-num">{pad(i + 1)}</span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {c.playlist && (
        <section className="pg-sec" data-chapter={c.playlist.eyebrow}>
          <div className="pg-wrap">
            <H head={c.playlist} />
            <VideoPlaylist videos={c.playlist.videos} thumbBase="/assets/guga" />
          </div>
        </section>
      )}

      <LayerNav current={layer} />
      <CtaFinal />
    </>
  )
}

export function ErpPage() {
  return (
    <LayerPageView
      c={erp}
      layer={0}
      aside={
        erp.badge && (
          <figure className="ly-badge">
            <img src={erp.badge.src} alt={erp.badge.alt} width={302} height={302} />
            <figcaption>
              <strong>{erp.badge.title}</strong>
              {erp.badge.text}
            </figcaption>
          </figure>
        )
      }
    />
  )
}

export function KomvosOsPage() {
  return <LayerPageView c={komvosOs} layer={1} />
}
