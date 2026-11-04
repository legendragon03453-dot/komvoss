import { useState } from 'react'

export type PlaylistVideo = { id: string; title: string }

/**
 * Playlist de vídeos assistida no próprio site: capa local (public/assets/guga/<id>.webp) e o player
 * só é carregado quando a pessoa dá play (youtube-nocookie, sem vídeos sugeridos no fim).
 */
export function VideoPlaylist({ videos, thumbBase }: { videos: PlaylistVideo[]; thumbBase: string }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const v = videos[index]

  const choose = (i: number) => {
    setIndex(i)
    setPlaying(true)
  }

  return (
    <div className="vp">
      <div className="vp-stage">
        {playing ? (
          <iframe
            key={v.id}
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="vp-poster" onClick={() => setPlaying(true)} aria-label={`Assistir: ${v.title}`}>
            <img src={`${thumbBase}/${v.id}.webp`} alt="" width={960} height={540} />
            <span className="vp-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="vp-title">{v.title}</span>
          </button>
        )}
      </div>

      <ol className="vp-list" aria-label="Vídeos da playlist">
        {videos.map((x, i) => (
          <li key={x.id}>
            <button type="button" className={`vp-item${i === index ? ' is-active' : ''}`} onClick={() => choose(i)} aria-current={i === index}>
              <span className="vp-thumb">
                <img src={`${thumbBase}/${x.id}-s.webp`} alt="" width={320} height={180} loading="lazy" decoding="async" />
              </span>
              <span className="vp-item-text">
                <span className="vp-num">{String(i + 1).padStart(2, '0')}</span>
                {x.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
