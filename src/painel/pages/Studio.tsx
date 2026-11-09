import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { CATEGORIES } from '../../cms/insights'
import { BlockView, blocksText, newBlock, youtubeId } from '../../live/blocks'
import type { Align, Author, Block, BlockType } from '../../live/blocks'
import '../../live/blocks.css'
import { uploadMedia } from '../db'
import { Icon, useConfirm, useToast } from '../ui'

/*
 * Estúdio de artigos (estilo Elementor): arraste blocos da paleta para o artigo, reordene arrastando,
 * edite o texto direto no artigo e ajuste cada bloco no painel da direita. O centro mostra o artigo
 * com o visual do site.
 */

export type StudioDoc = {
  title: string
  slug: string
  cat: string
  date: string
  excerpt: string
  cover: string
  author: Author | null
  blocks: Block[]
}

type Props = {
  doc: StudioDoc
  /** artigo que já vem no site: o endereço não muda */
  lockedSlug?: boolean
  status: 'draft' | 'published' | 'site'
  taken: string[]
  onClose: () => void
  onSave: (doc: StudioDoc, status: 'draft' | 'published') => Promise<void>
}

const PALETTE: { type: BlockType; label: string; hint: string; icon: string }[] = [
  { type: 'heading', label: 'Título', hint: 'Seção do artigo', icon: 'heading' },
  { type: 'paragraph', label: 'Parágrafo', hint: 'Texto corrido', icon: 'paragraph' },
  { type: 'image', label: 'Imagem', hint: 'Foto ou anexo', icon: 'image' },
  { type: 'button', label: 'Botão', hint: 'Chamada para ação', icon: 'button' },
  { type: 'video', label: 'Vídeo', hint: 'YouTube', icon: 'video' },
  { type: 'link', label: 'Link de projeto', hint: 'Card para outro site', icon: 'link' },
  { type: 'author', label: 'Autor', hint: 'Tag de quem criou', icon: 'author' },
  { type: 'quote', label: 'Citação', hint: 'Frase em destaque', icon: 'quote' },
  { type: 'list', label: 'Lista', hint: 'Itens em tópicos', icon: 'list' },
  { type: 'divider', label: 'Divisória', hint: 'Separa seções', icon: 'divider' },
]
const LABEL = Object.fromEntries(PALETTE.map((p) => [p.type, p.label])) as Record<BlockType, string>

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

export const readTimeOf = (blocks: Block[]) => `${Math.max(1, Math.round(blocksText(blocks).split(/\s+/).filter(Boolean).length / 200))} min`

const clone = (b: Block): Block => ({ ...JSON.parse(JSON.stringify(b)), id: Math.random().toString(36).slice(2, 10) })

export function Studio({ doc: initial, lockedSlug, status, taken, onClose, onSave }: Props) {
  const toast = useToast()
  const confirm = useConfirm()
  const [doc, setDoc] = useState<StudioDoc>(initial)
  const [sel, setSel] = useState<string | null>(null)
  const [tab, setTab] = useState<'bloco' | 'artigo'>('artigo')
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [drop, setDrop] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug))
  const canvasRef = useRef<HTMLDivElement>(null)

  /* ---------- desfazer / refazer ---------- */
  const past = useRef<StudioDoc[]>([])
  const future = useRef<StudioDoc[]>([])
  const lastKey = useRef<{ key: string; at: number } | null>(null)
  const savedRef = useRef(JSON.stringify(initial))
  const dirty = JSON.stringify(doc) !== savedRef.current

  const update = useCallback((fn: (d: StudioDoc) => StudioDoc, coalesce?: string) => {
    setDoc((d) => {
      const next = fn(d)
      const now = Date.now()
      // digitar no mesmo campo vira um passo só no "desfazer"
      if (!(coalesce && lastKey.current?.key === coalesce && now - lastKey.current.at < 1200)) past.current.push(d)
      if (past.current.length > 80) past.current.shift()
      future.current = []
      lastKey.current = coalesce ? { key: coalesce, at: now } : null
      return next
    })
  }, [])
  const undo = () => {
    const prev = past.current.pop()
    if (!prev) return
    future.current.push(doc)
    lastKey.current = null
    setDoc(prev)
  }
  const redo = () => {
    const next = future.current.pop()
    if (!next) return
    past.current.push(doc)
    lastKey.current = null
    setDoc(next)
  }

  const setBlock = (id: string, patch: Partial<Block>, coalesce = false) =>
    update((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)) }), coalesce ? `b:${id}:${Object.keys(patch).join()}` : undefined)
  const setMeta = (patch: Partial<StudioDoc>, key?: string) => update((d) => ({ ...d, ...patch }), key ? `m:${key}` : undefined)

  const insert = (type: BlockType, at?: number) => {
    const b = newBlock(type)
    update((d) => {
      const i = at ?? (sel ? d.blocks.findIndex((x) => x.id === sel) + 1 : d.blocks.length)
      const blocks = [...d.blocks]
      blocks.splice(i, 0, b)
      return { ...d, blocks }
    })
    setSel(b.id)
    setTab('bloco')
    requestAnimationFrame(() => document.querySelector(`[data-block="${b.id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  }
  const move = (id: string, to: number) =>
    update((d) => {
      const from = d.blocks.findIndex((b) => b.id === id)
      if (from < 0) return d
      const blocks = [...d.blocks]
      const [b] = blocks.splice(from, 1)
      blocks.splice(to > from ? to - 1 : to, 0, b)
      return { ...d, blocks }
    })
  const remove = (id: string) => {
    update((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }))
    if (sel === id) setSel(null)
  }
  const duplicate = (id: string) =>
    update((d) => {
      const i = d.blocks.findIndex((b) => b.id === id)
      const blocks = [...d.blocks]
      blocks.splice(i + 1, 0, clone(d.blocks[i]))
      return { ...d, blocks }
    })

  /* ---------- atalhos ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]')
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel && !typing) {
        e.preventDefault()
        remove(sel)
      }
      if (e.key === 'Escape' && !typing) setSel(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const warn = (e: BeforeUnloadEvent) => {
      if (JSON.stringify(doc) !== savedRef.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('beforeunload', warn)
    }
  }, [doc])

  /* ---------- arrastar e soltar ---------- */
  const indexAt = (y: number) => {
    const els = [...(canvasRef.current?.querySelectorAll<HTMLElement>('[data-block]') ?? [])]
    for (let i = 0; i < els.length; i++) {
      const r = els[i].getBoundingClientRect()
      if (y < r.top + r.height / 2) return i
    }
    return els.length
  }
  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes('text/kv-block')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === 'copy' ? 'copy' : 'move'
    setDrop(indexAt(e.clientY))
  }
  const onDrop = (e: DragEvent) => {
    const data = e.dataTransfer.getData('text/kv-block')
    if (!data) return
    e.preventDefault()
    const at = indexAt(e.clientY)
    setDrop(null)
    const [kind, value] = data.split(':')
    if (kind === 'new') insert(value as BlockType, at)
    else move(value, at)
  }

  /* ---------- salvar ---------- */
  const finalSlug = lockedSlug ? doc.slug : slugTouched ? slugify(doc.slug) : slugify(doc.title)
  const slugTaken = !lockedSlug && finalSlug !== initial.slug && taken.includes(finalSlug)

  async function save(next: 'draft' | 'published') {
    if (!doc.title.trim()) return (setTab('artigo'), toast('Dê um título ao artigo.', 'error'))
    if (!doc.excerpt.trim()) return (setTab('artigo'), toast('Escreva o resumo (aparece nos cards e no Google).', 'error'))
    if (!doc.blocks.length) return toast('O artigo está vazio: arraste pelo menos um bloco.', 'error')
    if (!finalSlug || slugTaken) return (setTab('artigo'), toast(slugTaken ? 'Já existe um artigo com esse endereço.' : 'Endereço vazio.', 'error'))
    const emptyMedia = doc.blocks.find((b) => (b.type === 'image' && !b.src) || (b.type === 'video' && !youtubeId(b.url)))
    if (emptyMedia) {
      setSel(emptyMedia.id)
      setTab('bloco')
      return toast(emptyMedia.type === 'image' ? 'Há um bloco de imagem sem imagem.' : 'Há um bloco de vídeo sem um link válido do YouTube.', 'error')
    }
    if (initial.slug && status === 'published' && !lockedSlug && finalSlug !== initial.slug) {
      const ok = await confirm({
        title: 'Mudar o endereço de um artigo publicado?',
        consequences: [<>O link antigo /insights/{initial.slug} deixa de funcionar.</>, 'Quem salvou ou compartilhou o link cai em “página não encontrada”.'],
        confirm: 'Mudar endereço',
        danger: true,
      })
      if (!ok) return
    }
    setBusy(true)
    try {
      const final = { ...doc, slug: finalSlug }
      await onSave(final, next)
      savedRef.current = JSON.stringify(final)
      setDoc(final)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function close() {
    if (dirty) {
      const ok = await confirm({
        title: 'Sair sem salvar?',
        consequences: ['As mudanças feitas desde o último salvamento serão perdidas.'],
        confirm: 'Sair sem salvar',
        danger: true,
      })
      if (!ok) return
    }
    onClose()
  }

  const selected = doc.blocks.find((b) => b.id === sel) ?? null
  useEffect(() => {
    if (selected) setTab('bloco')
  }, [sel]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="studio" role="dialog" aria-modal="true" aria-label="Editor de artigo">
      {/* barra de cima */}
      <header className="st-top">
        <button type="button" className="st-back" onClick={close}>
          ← Artigos
        </button>
        <div className="st-title">
          <strong>{doc.title || 'Artigo sem título'}</strong>
          <span>
            {status === 'site' ? 'Artigo do site' : status === 'published' ? 'Publicado' : 'Rascunho'}
            {dirty ? ' · alterações não salvas' : ' · tudo salvo'}
          </span>
        </div>
        <div className="seg is-dark" role="group" aria-label="Tamanho da tela">
          <button type="button" className={device === 'desktop' ? 'is-on' : ''} onClick={() => setDevice('desktop')} aria-pressed={device === 'desktop'} title="Computador">
            <Icon name="monitor" size={16} />
          </button>
          <button type="button" className={device === 'mobile' ? 'is-on' : ''} onClick={() => setDevice('mobile')} aria-pressed={device === 'mobile'} title="Celular">
            <Icon name="phone" size={16} />
          </button>
        </div>
        <div className="st-history">
          <button type="button" onClick={undo} disabled={!past.current.length} title="Desfazer (Ctrl+Z)" aria-label="Desfazer">
            <Icon name="undo" size={16} />
          </button>
          <button type="button" onClick={redo} disabled={!future.current.length} title="Refazer (Ctrl+Shift+Z)" aria-label="Refazer">
            <span style={{ display: 'inline-flex', transform: 'scaleX(-1)' }}>
              <Icon name="undo" size={16} />
            </span>
          </button>
        </div>
        {status !== 'site' && (
          <button type="button" className="btn is-ghost-dark" onClick={() => save('draft')} disabled={busy}>
            {status === 'published' ? 'Voltar a rascunho' : 'Salvar rascunho'}
          </button>
        )}
        <button type="button" className="btn is-silver" onClick={() => save('published')} disabled={busy}>
          <Icon name="save" size={16} /> {busy ? 'Salvando…' : status === 'draft' ? 'Publicar' : 'Salvar e publicar'}
        </button>
      </header>

      <div className="st-body">
        {/* paleta */}
        <aside className="st-palette">
          <p className="st-kicker">Blocos</p>
          <p className="st-help">Arraste para o artigo ou clique para adicionar.</p>
          <div className="st-tiles">
            {PALETTE.map((p) => (
              <button
                key={p.type}
                type="button"
                className="st-tile"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/kv-block', `new:${p.type}`)
                  e.dataTransfer.effectAllowed = 'copy'
                }}
                onDragEnd={() => setDrop(null)}
                onClick={() => insert(p.type)}
              >
                <Icon name={p.icon} size={20} />
                <strong>{p.label}</strong>
                <small>{p.hint}</small>
              </button>
            ))}
          </div>
          <div className="st-tip">
            <Icon name="sparkle" size={16} />
            <span>
              No texto: <code>**negrito**</code>, <code>*itálico*</code> e <code>[link](https://…)</code>.
            </span>
          </div>
        </aside>

        {/* artigo */}
        <div className="st-stage" onClick={(e) => e.target === e.currentTarget && setSel(null)}>
          <div className={`st-page is-${device}`}>
            <div className="st-article-head">
              <span className="st-eyebrow">{doc.cat}</span>
              <textarea
                className="st-h1"
                value={doc.title}
                placeholder="Título do artigo"
                rows={1}
                onChange={(e) => setMeta({ title: e.target.value }, 'title')}
                onFocus={() => (setSel(null), setTab('artigo'))}
                ref={autosize}
              />
              <span className="st-meta">
                {doc.date} · {readTimeOf(doc.blocks)} de leitura
              </span>
              {doc.cover && <img className="st-cover" src={doc.cover} alt="" />}
              {doc.author?.name && (
                <div className="st-byline kb-doc">
                  <BlockView b={{ id: 'a', type: 'author', name: doc.author.name, role: doc.author.role ?? '', avatar: doc.author.avatar ?? '', url: doc.author.url ?? '' }} editing />
                </div>
              )}
              <p className="st-intro">{doc.excerpt || <em>O resumo aparece aqui (edite em “Artigo”, à direita).</em>}</p>
            </div>

            <div className="st-canvas kb-doc" ref={canvasRef} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setDrop(null)}>
              {!doc.blocks.length && (
                <div className={`st-empty${drop !== null ? ' is-over' : ''}`}>
                  <Icon name="plus" size={26} />
                  <strong>Arraste um bloco para cá</strong>
                  <span>ou clique num bloco da esquerda</span>
                </div>
              )}
              {doc.blocks.map((b, i) => (
                <div key={b.id}>
                  {drop === i && <div className="st-drop" />}
                  <div
                    data-block={b.id}
                    className={`st-block is-${b.type}${sel === b.id ? ' is-sel' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSel(b.id)
                    }}
                  >
                    <div className="st-tools" onClick={(e) => e.stopPropagation()}>
                      <span
                        className="st-handle"
                        draggable
                        title="Arraste para mudar de lugar"
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/kv-block', `move:${b.id}`)
                          e.dataTransfer.effectAllowed = 'move'
                          const el = document.querySelector(`[data-block="${b.id}"]`)
                          if (el) e.dataTransfer.setDragImage(el, 24, 24)
                        }}
                        onDragEnd={() => setDrop(null)}
                      >
                        <Icon name="drag" size={16} />
                        {LABEL[b.type]}
                      </span>
                      <button type="button" onClick={() => move(b.id, i - 1)} disabled={i === 0} aria-label="Subir">
                        <Icon name="up" size={14} />
                      </button>
                      <button type="button" onClick={() => move(b.id, i + 2)} disabled={i === doc.blocks.length - 1} aria-label="Descer">
                        <Icon name="down" size={14} />
                      </button>
                      <button type="button" onClick={() => duplicate(b.id)} aria-label="Duplicar" title="Duplicar">
                        <Icon name="copyBlock" size={14} />
                      </button>
                      <button type="button" className="is-danger" onClick={() => remove(b.id)} aria-label="Excluir bloco" title="Excluir bloco">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                    {sel === b.id && (b.type === 'heading' || b.type === 'paragraph' || b.type === 'quote') ? (
                      <InlineEdit b={b} onChange={(text) => setBlock(b.id, { text }, true)} />
                    ) : (
                      <BlockView b={b} editing />
                    )}
                  </div>
                </div>
              ))}
              {drop === doc.blocks.length && doc.blocks.length > 0 && <div className="st-drop" />}
            </div>
          </div>
        </div>

        {/* ajustes */}
        <aside className="st-inspector">
          <div className="st-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'bloco'} className={tab === 'bloco' ? 'is-on' : ''} onClick={() => setTab('bloco')}>
              Bloco
            </button>
            <button type="button" role="tab" aria-selected={tab === 'artigo'} className={tab === 'artigo' ? 'is-on' : ''} onClick={() => setTab('artigo')}>
              Artigo
            </button>
          </div>
          {tab === 'bloco' ? (
            selected ? (
              <BlockSettings b={selected} set={(p, c) => setBlock(selected.id, p, c)} onRemove={() => remove(selected.id)} />
            ) : (
              <div className="st-none">
                <Icon name="drag" size={24} />
                <p>Clique num bloco do artigo para ajustar aqui.</p>
              </div>
            )
          ) : (
            <ArticleSettings doc={doc} setMeta={setMeta} finalSlug={finalSlug} lockedSlug={lockedSlug} slugTaken={slugTaken} onSlug={(v) => (setSlugTouched(true), setMeta({ slug: v }, 'slug'))} />
          )}
        </aside>
      </div>
    </div>
  )
}

/** textarea que cresce com o texto */
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return
  const fit = () => {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
  fit()
  el.oninput = fit
}

/** Texto editado direto no artigo, com o mesmo visual do bloco. */
function InlineEdit({ b, onChange }: { b: Extract<Block, { type: 'heading' | 'paragraph' | 'quote' }>; onChange: (t: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    autosize(ref.current)
    ref.current?.focus()
  }, [])
  useLayoutEffect(() => autosize(ref.current), [b])
  const cls = b.type === 'heading' ? `kb-h is-${b.align}${b.level === 3 ? ' is-h3' : ''}` : b.type === 'paragraph' ? `kb-p is-${b.align}` : 'kb-quote-edit'
  return <textarea ref={ref} className={`st-inline ${cls}`} value={b.text} onChange={(e) => onChange(e.target.value)} rows={1} aria-label={LABEL[b.type]} />
}

/* ---------- ajustes de cada bloco ---------- */

function AlignPick({ value, onChange }: { value: Align; onChange: (a: Align) => void }) {
  return (
    <div className="seg is-block" role="group" aria-label="Alinhamento">
      {(['left', 'center', 'right'] as Align[]).map((a) => (
        <button key={a} type="button" className={value === a ? 'is-on' : ''} aria-pressed={value === a} onClick={() => onChange(a)} title={{ left: 'Esquerda', center: 'Centro', right: 'Direita' }[a]}>
          <Icon name={{ left: 'alignLeft', center: 'alignCenter', right: 'alignRight' }[a]} size={16} />
          {{ left: 'Esquerda', center: 'Centro', right: 'Direita' }[a]}
        </button>
      ))}
    </div>
  )
}

function F({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="field-foot">{hint}</small>}
    </label>
  )
}

/** Limpa um SVG enviado (tira <script>, on*="..." e links javascript:) e devolve um arquivo .svg pronto para subir. */
function svgFile(code: string, name = 'capa.svg'): File {
  let svg = code.trim().replace(/^<\?xml[^>]*>\s*/i, '')
  if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>\s*$/i.test(svg)) throw new Error('O código precisa começar com <svg …> e terminar com </svg>.')
  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, '$1#')
  if (!/xmlns=/.test(svg.slice(0, svg.indexOf('>')))) svg = svg.replace(/^<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  // SVG é XML: um erro de sintaxe (tag sem fechar, "&" solto, "--" dentro de comentário) vira imagem quebrada no site
  const err = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror')
  if (err) throw new Error('O SVG tem um erro de código e não abriria no site: ' + ((err.textContent ?? '').match(/(?:error on )?line \d+[\s\S]*?(?=Below is|$)/i)?.[0].trim() ?? 'confira o código.'))
  return new File([svg], name.replace(/\.[^.]+$/, '') + '.svg', { type: 'image/svg+xml' })
}

const isSvgFile = (f: File) => f.type === 'image/svg+xml' || /\.svg$/i.test(f.name)

function ImagePick({
  value,
  onChange,
  label = 'Imagem',
  ratio,
  svg,
}: {
  value: string
  onChange: (url: string) => void
  label?: string
  ratio?: string
  /** aceita capa animada: arquivo .svg (com o CSS dentro) ou código SVG colado */
  svg?: boolean
}) {
  const toast = useToast()
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [code, setCode] = useState<string | null>(null)
  async function send(file: File) {
    setBusy(true)
    try {
      onChange(await uploadMedia(file, 'blog'))
      setCode(null)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }
  async function pick(file?: File) {
    if (!file) return
    if (svg && isSvgFile(file)) {
      try {
        return send(svgFile(await file.text(), file.name))
      } catch (e) {
        return toast((e as Error).message, 'error')
      }
    }
    if (!file.type.startsWith('image/') || isSvgFile(file)) return toast(`Escolha uma imagem (JPG, PNG, WebP${svg ? ' ou SVG' : ''}).`, 'error')
    if (file.size > 6 * 1024 * 1024) return toast('Imagem acima de 6 MB. Reduza antes de enviar.', 'error')
    send(file)
  }
  function useCode() {
    try {
      send(svgFile(code ?? ''))
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }
  const isSvg = /^data:image\/svg\+xml|\.svg(\?|#|$)/i.test(value)
  return (
    <div className="field">
      <span>{label}</span>
      <button
        type="button"
        className={`st-drop-img${over ? ' is-over' : ''}${value ? ' has-img' : ''}${isSvg ? ' is-svg' : ''}`}
        style={ratio ? { aspectRatio: ratio } : undefined}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          pick(e.dataTransfer.files[0])
        }}
        disabled={busy}
      >
        {value ? <img src={value} alt="" /> : <Icon name="image" size={22} />}
        <span>{busy ? 'Enviando…' : value ? 'Trocar imagem' : svg ? 'Solte uma imagem ou um .svg animado' : 'Solte um arquivo aqui ou clique'}</span>
      </button>
      {svg && code === null && (
        <div className="st-svg-links">
          <button type="button" className="link-btn" onClick={() => setCode('')}>
            Colar código SVG
          </button>
          <a className="link-btn" href="/capas/modelo-capa.svg" download="modelo-capa-komvos.svg">
            Baixar modelo de capa animada
          </a>
        </div>
      )}
      {svg && code !== null && (
        <div className="st-svg-code">
          <textarea
            rows={7}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={'<svg viewBox="0 0 640 360" …>\n  <style> …animações… </style>\n  …\n</svg>'}
            spellCheck={false}
            autoFocus
          />
          <small className="field-foot">O CSS das animações vai dentro do próprio SVG, num &lt;style&gt;. Formato 16:9.</small>
          <div className="st-svg-links">
            <button type="button" className="btn is-primary is-small" onClick={useCode} disabled={busy || !code?.trim()}>
              {busy ? 'Enviando…' : 'Usar como capa'}
            </button>
            <button type="button" className="link-btn is-muted" onClick={() => setCode(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {value && (
        <button type="button" className="link-btn is-muted" onClick={() => onChange('')}>
          Remover imagem
        </button>
      )}
      <input ref={ref} type="file" accept={svg ? 'image/*,.svg' : 'image/*'} hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ''))} />
    </div>
  )
}

function BlockSettings({ b, set, onRemove }: { b: Block; set: (p: Partial<Block>, coalesce?: boolean) => void; onRemove: () => void }) {
  const head = PALETTE.find((p) => p.type === b.type)!
  let body: ReactNode = null
  switch (b.type) {
    case 'heading':
      body = (
        <>
          <F label="Texto">
            <input value={b.text} onChange={(e) => set({ text: e.target.value }, true)} />
          </F>
          <div className="field">
            <span>Tamanho</span>
            <div className="seg is-block">
              {([2, 3] as const).map((l) => (
                <button key={l} type="button" className={b.level === l ? 'is-on' : ''} onClick={() => set({ level: l })}>
                  {l === 2 ? 'Título grande' : 'Subtítulo'}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Alinhamento</span>
            <AlignPick value={b.align} onChange={(align) => set({ align })} />
          </div>
        </>
      )
      break
    case 'paragraph':
      body = (
        <>
          <F label="Texto" hint="Dica: você também pode escrever direto no artigo.">
            <textarea rows={7} value={b.text} onChange={(e) => set({ text: e.target.value }, true)} />
          </F>
          <div className="field">
            <span>Alinhamento</span>
            <AlignPick value={b.align} onChange={(align) => set({ align })} />
          </div>
        </>
      )
      break
    case 'image':
      body = (
        <>
          <ImagePick value={b.src} onChange={(src) => set({ src })} />
          <F label="Descrição da imagem" hint="Para quem usa leitor de tela e para o Google.">
            <input value={b.alt} onChange={(e) => set({ alt: e.target.value }, true)} placeholder="Ex.: equipe reunida na sede" />
          </F>
          <F label="Legenda (opcional)">
            <input value={b.caption} onChange={(e) => set({ caption: e.target.value }, true)} />
          </F>
          <div className="field">
            <span>Largura</span>
            <div className="seg is-block">
              {(['normal', 'wide', 'full'] as const).map((s) => (
                <button key={s} type="button" className={b.size === s ? 'is-on' : ''} onClick={() => set({ size: s })}>
                  {{ normal: 'Coluna', wide: 'Larga', full: 'Máxima' }[s]}
                </button>
              ))}
            </div>
          </div>
        </>
      )
      break
    case 'button':
      body = (
        <>
          <F label="Texto do botão">
            <input value={b.label} onChange={(e) => set({ label: e.target.value }, true)} />
          </F>
          <F label="Leva para" hint="Uma página do site (ex.: /contato) ou um endereço completo (https://…).">
            <input value={b.url} onChange={(e) => set({ url: e.target.value }, true)} />
          </F>
          <div className="field">
            <span>Estilo</span>
            <div className="seg is-block">
              {(['primary', 'ghost'] as const).map((s) => (
                <button key={s} type="button" className={b.style === s ? 'is-on' : ''} onClick={() => set({ style: s })}>
                  {s === 'primary' ? 'Prata (destaque)' : 'Contorno'}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Alinhamento</span>
            <AlignPick value={b.align} onChange={(align) => set({ align })} />
          </div>
        </>
      )
      break
    case 'video':
      body = (
        <>
          <F label="Link do YouTube" hint={b.url && !youtubeId(b.url) ? <span className="is-error">Não reconheci esse link. Copie o endereço do vídeo no YouTube.</span> : 'Funciona com links de vídeo, Shorts e “youtu.be”. O vídeo toca dentro do site.'}>
            <input value={b.url} onChange={(e) => set({ url: e.target.value }, true)} placeholder="https://www.youtube.com/watch?v=…" />
          </F>
          <F label="Legenda (opcional)">
            <input value={b.caption} onChange={(e) => set({ caption: e.target.value }, true)} />
          </F>
        </>
      )
      break
    case 'link':
      body = (
        <>
          <F label="Endereço do projeto">
            <input value={b.url} onChange={(e) => set({ url: e.target.value }, true)} placeholder="https://…" />
          </F>
          <F label="Título">
            <input value={b.title} onChange={(e) => set({ title: e.target.value }, true)} />
          </F>
          <F label="Descrição">
            <textarea rows={2} value={b.text} onChange={(e) => set({ text: e.target.value }, true)} />
          </F>
          <ImagePick label="Miniatura (opcional)" value={b.image} onChange={(image) => set({ image })} ratio="4 / 3" />
        </>
      )
      break
    case 'author':
      body = (
        <>
          <F label="Nome">
            <input value={b.name} onChange={(e) => set({ name: e.target.value }, true)} />
          </F>
          <F label="Cargo / empresa">
            <input value={b.role} onChange={(e) => set({ role: e.target.value }, true)} />
          </F>
          <ImagePick label="Foto (opcional)" value={b.avatar} onChange={(avatar) => set({ avatar })} ratio="1 / 1" />
          <F label="Perfil (opcional)" hint="LinkedIn ou site da pessoa.">
            <input value={b.url} onChange={(e) => set({ url: e.target.value }, true)} placeholder="https://linkedin.com/in/…" />
          </F>
        </>
      )
      break
    case 'quote':
      body = (
        <>
          <F label="Frase">
            <textarea rows={4} value={b.text} onChange={(e) => set({ text: e.target.value }, true)} />
          </F>
          <F label="Quem disse (opcional)">
            <input value={b.cite} onChange={(e) => set({ cite: e.target.value }, true)} />
          </F>
        </>
      )
      break
    case 'list':
      body = (
        <>
          <F label="Itens" hint="Um item por linha.">
            <textarea rows={6} value={b.items.join('\n')} onChange={(e) => set({ items: e.target.value.split('\n') }, true)} />
          </F>
          <div className="field">
            <span>Tipo</span>
            <div className="seg is-block">
              <button type="button" className={!b.ordered ? 'is-on' : ''} onClick={() => set({ ordered: false })}>
                • Tópicos
              </button>
              <button type="button" className={b.ordered ? 'is-on' : ''} onClick={() => set({ ordered: true })}>
                1. Numerada
              </button>
            </div>
          </div>
        </>
      )
      break
    case 'divider':
      body = <p className="st-help">Uma linha fina para separar partes do artigo. Não tem ajustes.</p>
      break
  }
  return (
    <div className="st-settings">
      <div className="st-settings-head">
        <span>
          <Icon name={head.icon} size={18} />
        </span>
        <div>
          <strong>{head.label}</strong>
          <small>{head.hint}</small>
        </div>
      </div>
      {body}
      <button type="button" className="btn is-danger-ghost is-block" onClick={onRemove}>
        <Icon name="trash" size={15} /> Excluir bloco
      </button>
    </div>
  )
}

function ArticleSettings({
  doc,
  setMeta,
  finalSlug,
  lockedSlug,
  slugTaken,
  onSlug,
}: {
  doc: StudioDoc
  setMeta: (p: Partial<StudioDoc>, key?: string) => void
  finalSlug: string
  lockedSlug?: boolean
  slugTaken: boolean
  onSlug: (v: string) => void
}) {
  const a = doc.author ?? { name: '', role: '', avatar: '', url: '' }
  const setAuthor = (p: Partial<Author>) => setMeta({ author: { ...a, ...p } }, `author:${Object.keys(p).join()}`)
  const seoTitle = `${doc.title || 'Título do artigo'} | Komvos Insights`
  return (
    <div className="st-settings">
      <F label="Título">
        <input value={doc.title} onChange={(e) => setMeta({ title: e.target.value }, 'title')} maxLength={120} />
      </F>
      <div className="field">
        <span>Endereço</span>
        <div className="slug">
          <small>/insights/</small>
          <input value={finalSlug} disabled={lockedSlug} onChange={(e) => onSlug(e.target.value)} aria-invalid={slugTaken} />
        </div>
        {slugTaken && <small className="field-foot is-error">Esse endereço já existe.</small>}
        {lockedSlug && <small className="field-foot">Artigos do site mantêm o endereço (Google e links compartilhados).</small>}
      </div>
      <div className="st-row">
        <F label="Categoria">
          <select value={doc.cat} onChange={(e) => setMeta({ cat: e.target.value })}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </F>
        <F label="Data exibida">
          <input value={doc.date} onChange={(e) => setMeta({ date: e.target.value }, 'date')} />
        </F>
      </div>
      <F label="Resumo" hint={`${doc.excerpt.length}/220 · aparece nos cards, no topo do artigo e no Google`}>
        <textarea rows={3} value={doc.excerpt} maxLength={220} onChange={(e) => setMeta({ excerpt: e.target.value }, 'excerpt')} />
      </F>
      <ImagePick label="Capa (opcional)" value={doc.cover} onChange={(cover) => setMeta({ cover })} ratio="16 / 9" svg />

      <p className="st-kicker">Quem escreveu</p>
      <div className="st-row">
        <F label="Nome">
          <input value={a.name} onChange={(e) => setAuthor({ name: e.target.value })} placeholder="Opcional" />
        </F>
        <F label="Cargo">
          <input value={a.role ?? ''} onChange={(e) => setAuthor({ role: e.target.value })} />
        </F>
      </div>
      <ImagePick label="Foto" value={a.avatar ?? ''} onChange={(avatar) => setAuthor({ avatar })} ratio="1 / 1" />

      <p className="st-kicker">Como aparece no Google</p>
      <div className="seo-card">
        <small>komvoss.vercel.app › insights › {finalSlug || '…'}</small>
        <strong>{seoTitle.length > 62 ? seoTitle.slice(0, 60) + '…' : seoTitle}</strong>
        <span>{doc.excerpt || 'O resumo do artigo aparece aqui.'}</span>
      </div>
    </div>
  )
}

export function useStudioTaken(items: { slug: string }[]) {
  return useMemo(() => items.map((i) => i.slug), [items])
}
