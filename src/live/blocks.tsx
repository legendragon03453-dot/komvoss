import type { ReactNode } from 'react'

/**
 * Blocos do editor visual de artigos (painel → Blog). O mesmo componente desenha o artigo no site
 * e a pré-visualização dentro do editor, então o que a pessoa monta é exatamente o que vai ao ar.
 *
 * Texto aceita uma marcação simples: **negrito**, *itálico* e [texto do link](https://endereco).
 */

export type Align = 'left' | 'center' | 'right'

export type Block =
  | { id: string; type: 'heading'; text: string; level: 2 | 3; align: Align }
  | { id: string; type: 'paragraph'; text: string; align: Align }
  | { id: string; type: 'image'; src: string; alt: string; caption: string; size: 'normal' | 'wide' | 'full' }
  | { id: string; type: 'button'; label: string; url: string; align: Align; style: 'primary' | 'ghost' }
  | { id: string; type: 'video'; url: string; caption: string }
  | { id: string; type: 'link'; url: string; title: string; text: string; image: string }
  | { id: string; type: 'author'; name: string; role: string; avatar: string; url: string }
  | { id: string; type: 'quote'; text: string; cite: string }
  | { id: string; type: 'list'; items: string[]; ordered: boolean }
  | { id: string; type: 'divider' }

export type BlockType = Block['type']

export type Author = { name: string; role?: string; avatar?: string; url?: string }

const uid = () => Math.random().toString(36).slice(2, 10)

/** Bloco novo, já com um conteúdo de exemplo para a pessoa entender o que é. */
export function newBlock(type: BlockType): Block {
  const id = uid()
  switch (type) {
    case 'heading':
      return { id, type, text: 'Novo título', level: 2, align: 'left' }
    case 'paragraph':
      return { id, type, text: 'Escreva aqui. Use **negrito**, *itálico* e [links](https://grupokomvos.com.br).', align: 'left' }
    case 'image':
      return { id, type, src: '', alt: '', caption: '', size: 'normal' }
    case 'button':
      return { id, type, label: 'Fale com um especialista', url: '/contato', align: 'left', style: 'primary' }
    case 'video':
      return { id, type, url: '', caption: '' }
    case 'link':
      return { id, type, url: '', title: 'Título do projeto', text: 'Uma frase sobre o projeto.', image: '' }
    case 'author':
      return { id, type, name: 'Nome de quem escreveu', role: 'Cargo · Grupo Komvos', avatar: '', url: '' }
    case 'quote':
      return { id, type, text: 'Uma frase de destaque.', cite: '' }
    case 'list':
      return { id, type, items: ['Primeiro item', 'Segundo item'], ordered: false }
    case 'divider':
      return { id, type }
  }
}

/** Parágrafos antigos (texto puro) viram blocos. */
export const paragraphsToBlocks = (body: string[]): Block[] => body.map((text) => ({ id: uid(), type: 'paragraph', text, align: 'left' }))

/** Texto corrido de todos os blocos (tempo de leitura, busca). */
export function blocksText(blocks: Block[]) {
  return blocks
    .map((b) => ('text' in b ? b.text : b.type === 'list' ? b.items.join(' ') : ''))
    .join(' ')
}

/** Identificador do vídeo do YouTube a partir de qualquer formato de link. */
export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  return m?.[1] ?? (/^[\w-]{11}$/.test(url.trim()) ? url.trim() : null)
}

const safeUrl = (u: string) => (/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(u.trim()) ? u.trim() : '#')
const external = (u: string) => /^https?:\/\//i.test(u)

/** **negrito**, *itálico* e [link](url), sem HTML (texto é sempre escapado pelo React). */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let k = 0
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>)
    else if (m[2]) out.push(<em key={k++}>{m[2]}</em>)
    else {
      const href = safeUrl(m[4])
      out.push(
        <a key={k++} href={href} {...(external(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {m[3]}
        </a>,
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out.map((p, i) => (typeof p === 'string' ? p.split('\n').flatMap((s, j) => (j ? [<br key={`b${i}-${j}`} />, s] : [s])) : p))}</>
}

export function AuthorCard({ a }: { a: Author }) {
  const initials = a.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  const inner = (
    <>
      <span className="kb-avatar">{a.avatar ? <img src={a.avatar} alt="" /> : initials || '•'}</span>
      <span className="kb-author-text">
        <small>Escrito por</small>
        <strong>{a.name}</strong>
        {a.role && <span>{a.role}</span>}
      </span>
    </>
  )
  return a.url ? (
    <a className="kb-author" href={safeUrl(a.url)} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <div className="kb-author">{inner}</div>
  )
}

/** Um bloco já desenhado (sem edição). */
export function BlockView({ b, editing = false }: { b: Block; editing?: boolean }) {
  switch (b.type) {
    case 'heading': {
      const H = b.level === 3 ? 'h3' : 'h2'
      return (
        <H className={`kb-h is-${b.align}`}>
          <Inline text={b.text} />
        </H>
      )
    }
    case 'paragraph':
      return (
        <p className={`kb-p is-${b.align}`}>
          <Inline text={b.text} />
        </p>
      )
    case 'image':
      return (
        <figure className={`kb-img is-${b.size}`}>
          {b.src ? <img src={b.src} alt={b.alt} loading="lazy" decoding="async" /> : editing ? <span className="kb-empty">Escolha uma imagem</span> : null}
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      )
    case 'button':
      return (
        <div className={`kb-btn-row is-${b.align}`}>
          <a
            className={`kb-btn is-${b.style}`}
            href={safeUrl(b.url)}
            {...(external(b.url) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onClick={editing ? (e) => e.preventDefault() : undefined}
          >
            {b.label}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      )
    case 'video': {
      const id = youtubeId(b.url)
      return (
        <figure className="kb-video">
          {id ? (
            <div className="kb-video-frame">
              {editing ? (
                <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" />
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
                  title={b.caption || 'Vídeo do YouTube'}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {editing && <span className="kb-play" aria-hidden="true" />}
            </div>
          ) : (
            editing && <span className="kb-empty">Cole o link de um vídeo do YouTube</span>
          )}
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      )
    }
    case 'link':
      return (
        <a
          className="kb-link"
          href={safeUrl(b.url)}
          target={external(b.url) ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={editing ? (e) => e.preventDefault() : undefined}
        >
          {b.image && <img src={b.image} alt="" loading="lazy" />}
          <span>
            <small>{b.url ? b.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : 'link do projeto'}</small>
            <strong>{b.title}</strong>
            {b.text && <span>{b.text}</span>}
          </span>
          <em aria-hidden="true">↗</em>
        </a>
      )
    case 'author':
      return <AuthorCard a={b} />
    case 'quote':
      return (
        <blockquote className="kb-quote">
          <p>
            <Inline text={b.text} />
          </p>
          {b.cite && <cite>{b.cite}</cite>}
        </blockquote>
      )
    case 'list': {
      const L = b.ordered ? 'ol' : 'ul'
      return (
        <L className="kb-list">
          {b.items.filter(Boolean).map((it, i) => (
            <li key={i}>
              <Inline text={it} />
            </li>
          ))}
        </L>
      )
    }
    case 'divider':
      return <hr className="kb-hr" />
  }
}

/** Artigo inteiro montado com blocos. */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="kb-doc">
      {blocks.map((b) => (
        <div key={b.id} className={`kb-block is-${b.type}`} data-anim="up">
          <BlockView b={b} />
        </div>
      ))}
    </div>
  )
}
