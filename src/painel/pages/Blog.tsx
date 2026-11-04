import { useMemo, useState } from 'react'
import { ARTICLES, CATEGORIES } from '../../cms/insights'
import { paragraphsToBlocks } from '../../live/blocks'
import type { Author, Block } from '../../live/blocks'
import { DEMO, clearPostFeatured, deleteContent, deletePost, listContent, listPosts, savePost, saveContent } from '../db'
import type { Post } from '../db'
import { Badge, Icon, Loading, PageHead, fmtDate, useConfirm, useData, useToast } from '../ui'
import { Studio, readTimeOf } from './Studio'
import type { StudioDoc } from './Studio'

/*
 * Blog (Komvos Insights): os artigos que já vêm no site (CMS) e os criados aqui no painel.
 * Todos abrem no estúdio de blocos. Artigos do site podem ser editados, ocultados e destacados;
 * os do painel também podem ser excluídos.
 */

type Item = {
  kind: 'site' | 'painel'
  id?: string
  slug: string
  title: string
  cat: string
  date: string
  read: string
  excerpt: string
  body: string[]
  blocks?: Block[]
  author?: Author | null
  cover?: string
  status: 'draft' | 'published'
  hidden: boolean
  featured: boolean
  edited?: boolean
  created_at?: string
  updated_at?: string
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const today = () => `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`

const NOTE = DEMO ? 'No modo demonstração, aparece só no site aberto neste navegador.' : 'Já está no site.'

// cor da capa provisória (sem foto) por categoria: as três cores do grupo
const CAT_TONE: Record<string, string> = {
  'IA aplicada': 'statum',
  Dados: 'statum',
  Cloud: 'statum',
  Gestão: 'senior',
  'Transformação Empresarial': 'senior',
  RH: 'trusth',
}

export function Blog() {
  const toast = useToast()
  const confirm = useConfirm()
  const { data, error, reload } = useData(async () => {
    const [posts, content] = await Promise.all([listPosts(), listContent()])
    return { posts, content }
  })
  const [editing, setEditing] = useState<Item | 'new' | null>(null)
  const [filter, setFilter] = useState<'todos' | 'publicados' | 'rascunhos' | 'ocultos'>('todos')
  const [q, setQ] = useState('')

  const items: Item[] = useMemo(() => {
    if (!data) return []
    const ov = new Map(data.content.filter((r) => r.key.startsWith('article:')).map((r) => [r.key.slice(8), r.value as Record<string, unknown>]))
    const fromPanel: Item[] = data.posts.map((p: Post) => ({
      kind: 'painel',
      id: p.id,
      slug: p.slug,
      title: p.title,
      cat: p.cat,
      date: p.date_label,
      read: p.read_time,
      excerpt: p.excerpt,
      body: p.body ?? [],
      blocks: p.blocks ?? undefined,
      author: p.author ?? null,
      cover: p.cover ?? undefined,
      status: p.status,
      hidden: p.hidden,
      featured: p.featured,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }))
    const fromSite: Item[] = ARTICLES.map((a) => {
      const o = ov.get(a.slug) ?? {}
      return {
        kind: 'site',
        slug: a.slug,
        title: (o.title as string) || a.title,
        cat: (o.cat as string) || a.cat,
        date: (o.date as string) || a.date,
        read: (o.read as string) || a.read,
        excerpt: (o.excerpt as string) || a.excerpt,
        body: (o.body as string[]) || a.body,
        blocks: (o.blocks as Block[]) || undefined,
        author: (o.author as Author) || null,
        cover: (o.cover as string) || undefined,
        status: 'published',
        hidden: Boolean(o.hidden),
        featured: Boolean(o.featured),
        edited: ['title', 'cat', 'date', 'read', 'excerpt', 'body', 'cover', 'blocks', 'author'].some((k) => o[k] !== undefined),
      }
    })
    return [...fromPanel.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')), ...fromSite]
  }, [data])

  // o site destaca o artigo marcado; sem marcação, o primeiro publicado da lista
  const live = items.filter((i) => i.status === 'published' && !i.hidden)
  const featured = live.find((i) => i.featured) ?? live[0]
  const term = q.trim().toLowerCase()
  const shown = items.filter(
    (i) =>
      (filter === 'publicados' ? i.status === 'published' && !i.hidden : filter === 'rascunhos' ? i.status === 'draft' : filter === 'ocultos' ? i.hidden : true) &&
      (!term || i.title.toLowerCase().includes(term) || i.cat.toLowerCase().includes(term)),
  )

  const override = (slug: string) => (data!.content.find((r) => r.key === `article:${slug}`)?.value ?? {}) as Record<string, unknown>

  async function setSiteOverride(slug: string, patch: Record<string, unknown>) {
    const next = Object.fromEntries(Object.entries({ ...override(slug), ...patch }).filter(([, v]) => v !== undefined && v !== false && v !== null))
    if (Object.keys(next).length) await saveContent([{ key: `article:${slug}`, value: next }])
    else await deleteContent([`article:${slug}`])
  }

  async function run(fn: () => Promise<unknown>, msg: string) {
    try {
      await fn()
      reload()
      toast(`${msg} ${NOTE}`)
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function toggleHidden(i: Item) {
    if (!i.hidden) {
      const ok = await confirm({
        title: `Ocultar “${i.title}”?`,
        consequences: [
          'O artigo sai da página Insights, da Home e dos “leia também”.',
          <>
            Quem abrir o link direto (<code>/insights/{i.slug}</code>) verá “página não encontrada”.
          </>,
          ...(featured?.slug === i.slug ? [<strong key="f">É o artigo em destaque: outro artigo assume o destaque.</strong>] : []),
          'Nada é apagado. Você pode mostrar de novo quando quiser.',
        ],
        confirm: 'Ocultar artigo',
      })
      if (!ok) return
    }
    run(() => (i.kind === 'site' ? setSiteOverride(i.slug, { hidden: !i.hidden }) : savePost({ id: i.id, slug: i.slug, hidden: !i.hidden })), i.hidden ? 'Artigo visível de novo.' : 'Artigo oculto.')
  }

  async function toggleFeatured(i: Item) {
    const on = !i.featured
    if (on && (i.hidden || i.status === 'draft')) return toast('Só dá para destacar um artigo publicado e visível.', 'error')
    run(async () => {
      if (on) {
        // um destaque por vez
        for (const r of data!.content.filter((r) => r.key.startsWith('article:') && (r.value as Record<string, unknown>).featured))
          await setSiteOverride(r.key.slice(8), { featured: false })
        await clearPostFeatured(i.kind === 'painel' ? i.id : undefined)
      }
      if (i.kind === 'site') await setSiteOverride(i.slug, { featured: on })
      else await savePost({ id: i.id, slug: i.slug, featured: on })
    }, on ? 'Artigo em destaque.' : 'Destaque removido.')
  }

  async function remove(i: Item) {
    const ok = await confirm({
      title: `Excluir “${i.title}”?`,
      consequences: [
        'O artigo é apagado de vez: texto, imagens do artigo e configurações.',
        <>
          O link <code>/insights/{i.slug}</code> deixa de funcionar (inclusive para quem salvou ou compartilhou).
        </>,
        'Não dá para desfazer. Se for só tirar do ar, prefira “Ocultar”.',
      ],
      confirm: 'Excluir artigo',
      danger: true,
      typeToConfirm: 'excluir',
    })
    if (ok) run(() => deletePost(i.id!), 'Artigo excluído.')
  }

  async function restore(i: Item) {
    const ok = await confirm({
      title: 'Voltar ao texto original deste artigo?',
      consequences: ['Título, resumo, blocos, categoria, data, capa e autor voltam a ser os originais.', 'Ocultar e destacar continuam como estão.'],
      confirm: 'Voltar ao original',
    })
    if (!ok) return
    const cur = override(i.slug)
    run(() => setSiteOverride(i.slug, { title: undefined, cat: undefined, date: undefined, read: undefined, excerpt: undefined, body: undefined, blocks: undefined, author: undefined, cover: undefined, hidden: cur.hidden, featured: cur.featured }), 'Artigo original de volta.')
  }

  function docOf(i: Item | null): StudioDoc {
    if (!i)
      return {
        title: '',
        slug: '',
        cat: CATEGORIES[0],
        date: today(),
        excerpt: '',
        cover: '',
        author: null,
        blocks: [
          { id: 'b1', type: 'paragraph', text: 'Comece a escrever aqui, ou arraste blocos da esquerda para montar o artigo.', align: 'left' },
        ],
      }
    return {
      title: i.title,
      slug: i.slug,
      cat: i.cat,
      date: i.date,
      excerpt: i.excerpt,
      cover: i.cover ?? '',
      author: i.author ?? null,
      blocks: i.blocks?.length ? i.blocks : paragraphsToBlocks(i.body),
    }
  }

  async function saveDoc(i: Item | null, d: StudioDoc, status: 'draft' | 'published') {
    const author = d.author?.name?.trim() ? d.author : null
    const body = d.blocks.filter((b) => b.type === 'paragraph').map((b) => (b as { text: string }).text)
    if (i?.kind === 'site') {
      const original = ARTICLES.find((a) => a.slug === i.slug)!
      const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
      const cur = override(i.slug)
      await setSiteOverride(i.slug, {
        title: same(d.title.trim(), original.title) ? undefined : d.title.trim(),
        cat: same(d.cat, original.cat) ? undefined : d.cat,
        date: same(d.date.trim(), original.date) ? undefined : d.date.trim(),
        read: readTimeOf(d.blocks),
        excerpt: same(d.excerpt.trim(), original.excerpt) ? undefined : d.excerpt.trim(),
        blocks: d.blocks,
        body: undefined,
        author: author ?? undefined,
        cover: d.cover || undefined,
        hidden: cur.hidden,
        featured: cur.featured,
      })
    } else {
      await savePost({
        id: i?.id,
        slug: d.slug,
        title: d.title.trim(),
        cat: d.cat,
        date_label: d.date.trim() || today(),
        read_time: readTimeOf(d.blocks),
        excerpt: d.excerpt.trim(),
        body,
        blocks: d.blocks,
        author,
        cover: d.cover || null,
        status,
      } as Partial<Post> & { slug: string })
    }
    reload()
    toast(i?.kind === 'site' ? `Artigo salvo. ${NOTE}` : status === 'published' ? `Artigo publicado. ${NOTE}` : 'Rascunho salvo.')
  }

  return (
    <>
      <PageHead
        title="Blog e artigos"
        lead="Escreva artigos montando blocos, escolha o destaque e organize o que está no ar."
        actions={
          <button type="button" className="btn is-primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={16} /> Novo artigo
          </button>
        }
      />
      {error && <p className="form-msg is-error">{error}</p>}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="filters">
            <div className="seg" role="group" aria-label="Filtro">
              {(['todos', 'publicados', 'rascunhos', 'ocultos'] as const).map((f) => (
                <button key={f} type="button" className={f === filter ? 'is-on' : ''} aria-pressed={f === filter} onClick={() => setFilter(f)}>
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <label className="search">
              <Icon name="search" size={16} />
              <input placeholder="Buscar artigo…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar artigo" />
            </label>
            <span className="filters-note">{live.length} no ar</span>
          </div>

          <div className="post-grid">
            <button type="button" className="post-new" onClick={() => setEditing('new')}>
              <span>
                <Icon name="plus" size={26} />
              </span>
              <strong>Novo artigo</strong>
              <small>Monte com blocos: títulos, imagens, vídeos, botões…</small>
            </button>
            {shown.map((i) => {
              const isFeatured = featured?.slug === i.slug
              return (
                <article key={i.kind + i.slug} className={`post-card${i.hidden ? ' is-hidden' : ''}${isFeatured ? ' is-featured' : ''}`}>
                  <button type="button" className={`post-cover is-${CAT_TONE[i.cat] ?? 'senior'}`} onClick={() => setEditing(i)} aria-label={`Editar ${i.title}`}>
                    {i.cover ? <img src={i.cover} alt="" loading="lazy" /> : <span className="post-cover-cat">{i.cat}</span>}
                    <span className="post-badges">
                      {isFeatured && <Badge tone="dark">★ Destaque{i.featured ? '' : ' (automático)'}</Badge>}
                      {i.status === 'draft' && <Badge tone="amber">Rascunho</Badge>}
                      {i.hidden && <Badge>Oculto</Badge>}
                    </span>
                    <span className="post-edit">
                      <Icon name="edit" size={16} /> Abrir no editor
                    </span>
                  </button>
                  <div className="post-body">
                    <span className="post-meta">
                      {i.cat} · {i.date} · {i.read}
                    </span>
                    <h3>{i.title}</h3>
                    <p>{i.excerpt}</p>
                    <span className="post-origin">
                      {i.kind === 'painel' ? (
                        <>
                          <Badge tone="blue">Criado no painel</Badge>
                          {i.updated_at && <small>editado {fmtDate(i.updated_at, false)}</small>}
                        </>
                      ) : i.edited ? (
                        <Badge tone="pink">Artigo do site · editado</Badge>
                      ) : (
                        <Badge>Artigo do site</Badge>
                      )}
                    </span>
                  </div>
                  <div className="post-actions">
                    <button type="button" className={`icon-btn${i.featured ? ' is-on' : ''}`} onClick={() => toggleFeatured(i)} title={i.featured ? 'Tirar destaque' : 'Destacar no topo do blog'} aria-label={i.featured ? 'Tirar destaque' : 'Destacar'}>
                      <Icon name="star" size={16} />
                    </button>
                    <button type="button" className="icon-btn" onClick={() => toggleHidden(i)} title={i.hidden ? 'Mostrar no site' : 'Ocultar do site'} aria-label={i.hidden ? 'Mostrar' : 'Ocultar'}>
                      <Icon name={i.hidden ? 'eye' : 'eyeOff'} size={16} />
                    </button>
                    {i.status === 'published' && !i.hidden && (
                      <a className="icon-btn" href={`/insights/${i.slug}`} target="_blank" rel="noopener noreferrer" title="Ver no site" aria-label="Ver no site">
                        <Icon name="link" size={16} />
                      </a>
                    )}
                    {i.kind === 'site' && i.edited && (
                      <button type="button" className="icon-btn" onClick={() => restore(i)} title="Voltar ao original" aria-label="Voltar ao original">
                        <Icon name="undo" size={16} />
                      </button>
                    )}
                    {i.kind === 'painel' && (
                      <button type="button" className="icon-btn is-danger" onClick={() => remove(i)} title="Excluir" aria-label="Excluir">
                        <Icon name="trash" size={16} />
                      </button>
                    )}
                    <span className="spacer" />
                    <button type="button" className="btn is-small" onClick={() => setEditing(i)}>
                      Editar
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
          {!shown.length && <p className="empty">Nenhum artigo neste filtro.</p>}
        </>
      )}
      {editing && data && (
        <Studio
          doc={docOf(editing === 'new' ? null : editing)}
          lockedSlug={editing !== 'new' && editing.kind === 'site'}
          status={editing === 'new' ? 'draft' : editing.kind === 'site' ? 'site' : editing.status}
          taken={items.map((i) => i.slug)}
          onClose={() => setEditing(null)}
          onSave={async (d, status) => {
            const item = editing === 'new' ? null : editing
            await saveDoc(item, d, status)
            // um artigo novo vira "do painel" depois de salvo: reabre como edição
            if (!item) setEditing(null)
          }}
        />
      )}
    </>
  )
}
