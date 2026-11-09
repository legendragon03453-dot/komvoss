import { useEffect, useMemo, useRef, useState } from 'react'
import images from 'virtual:site-images'
import { MENU, MENU_ARCH_LABEL } from '../../cms/menu'
import { ROOTS, SECTIONS, getPath, listTexts } from '../../live/registry'
import type { SectionConfig, SectionValue, TextField } from '../../live/registry'
import type { ContentRow } from '../../live/content'
import { DEMO, deleteContent, listContent, saveContent, uploadMedia } from '../db'
import { Badge, Card, Icon, Loading, Modal, PageHead, Tabs, fmtDate, useConfirm, useData, useToast } from '../ui'

type Tab = 'paginas' | 'imagens' | 'menu'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'paginas', label: 'Páginas, banners e textos', icon: 'text' },
  { id: 'imagens', label: 'Todas as imagens', icon: 'image' },
  { id: 'menu', label: 'Menu do site', icon: 'menu' },
]

const PUBLISH_NOTE = DEMO ? 'No modo demonstração, a mudança aparece só no site aberto neste navegador.' : 'Já está no ar para todos os visitantes.'

export function SiteEditor({ tab, go }: { tab: string; go: (s: string) => void }) {
  const current = (TABS.some((t) => t.id === tab) ? tab : 'paginas') as Tab
  const { data: rows, error, reload } = useData(listContent)
  const byKey = useMemo(() => new Map((rows ?? []).map((r) => [r.key, r as ContentRow & { updated_at?: string; updated_by?: string }])), [rows])

  return (
    <>
      <PageHead title="Gerenciar site" lead="Mude banners, títulos, textos, imagens e o menu, vendo o resultado ao vivo antes de publicar." />
      <Tabs value={current} onChange={(t) => go(`editar-site/${t}`)} items={TABS} />
      {error && <p className="form-msg is-error">{error}</p>}
      {!rows ? <Loading /> : current === 'paginas' ? <Pages byKey={byKey} reload={reload} /> : current === 'imagens' ? <Images byKey={byKey} reload={reload} /> : <Menu byKey={byKey} reload={reload} />}
    </>
  )
}

type Props = { byKey: Map<string, ContentRow & { updated_at?: string; updated_by?: string }>; reload: () => void }

/* ---------- pré-visualização ao vivo ---------- */

type Focus = { text?: string; src?: string; n: number }

/**
 * A página real do site num quadro. Recebe o rascunho (sem salvar) e acende o trecho em edição
 * (ver src/live/preview.ts, do lado do site).
 */
export function Preview({
  url,
  rows = [],
  removed = [],
  focus,
  reloadKey = 0,
  compact = false,
}: {
  url: string
  rows?: ContentRow[]
  removed?: string[]
  focus?: Focus | null
  reloadKey?: number
  compact?: boolean
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [ready, setReady] = useState(false)
  const [w, setW] = useState(640)
  const W = device === 'desktop' ? 1366 : 390
  const H = compact ? (device === 'desktop' ? 520 : 700) : device === 'desktop' ? 900 : 780
  const scale = Math.min(1, w / W)
  const latest = useRef({ rows, removed })
  latest.current = { rows, removed }
  const send = (msg: object) => frame.current?.contentWindow?.postMessage(msg, location.origin)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    if (box.current) ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || e.data?.type !== 'kv-ready') return
      setReady(true)
      send({ type: 'kv-preview', ...latest.current })
    }
    window.addEventListener('message', on)
    return () => window.removeEventListener('message', on)
  }, [])
  useEffect(() => setReady(false), [url, device, reloadKey])
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => send({ type: 'kv-preview', rows, removed }), 180)
    return () => window.clearTimeout(t)
  }, [rows, removed, ready])
  useEffect(() => {
    if (ready && focus) send({ type: 'kv-focus', text: focus.text, src: focus.src })
  }, [focus, ready])

  const src = `${url}${url.includes('?') ? '&' : '?'}kv-preview=1`
  return (
    <div className={`preview${compact ? ' is-compact' : ''}`} data-tour="editor-preview">
      <div className="preview-bar">
        <span className="preview-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="preview-url">komvoss.vercel.app{url === '/' ? '' : url}</span>
        <div className="seg is-dark" role="group" aria-label="Tamanho da tela">
          <button type="button" className={device === 'desktop' ? 'is-on' : ''} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} title="Computador">
            <Icon name="monitor" size={15} />
          </button>
          <button type="button" className={device === 'mobile' ? 'is-on' : ''} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} title="Celular">
            <Icon name="phone" size={15} />
          </button>
        </div>
        <a className="preview-open" href={url} target="_blank" rel="noopener noreferrer" title="Abrir a página publicada" aria-label="Abrir a página publicada">
          <Icon name="link" size={15} />
        </a>
      </div>
      <div className="preview-stage" ref={box} style={{ height: H * scale }}>
        <iframe key={url + device + reloadKey} ref={frame} src={src} title="Pré-visualização do site" style={{ width: W, height: H, transform: `scale(${scale})` }} />
        {!ready && <Loading text="Carregando a página…" />}
      </div>
      <p className="preview-note">
        <span className="live-dot" /> Pré-visualização ao vivo{rows.length || removed.length ? ' · mostrando o que você ainda não publicou' : ''}
      </p>
    </div>
  )
}

/* ---------- páginas: banner do topo, textos e imagens de cada página, com pré-visualização ---------- */

// arquivos de cada página, para achar as imagens dela
const ROOT_FILES: Record<string, string[]> = {
  home: ['src/v2/', 'src/pages/Home.tsx', 'src/sections.tsx', 'src/Reels.tsx', 'src/cms/parceiros.ts'],
  solucoes: ['src/pages/Solucoes.tsx', 'src/pages/SolucaoPage.tsx', 'src/cms/solucoes/'],
  erp: ['src/cms/pages/arquitetura.ts', 'src/pages/Plataforma.tsx'],
  'komvos-os': ['src/pages/Plataforma.tsx'],
  'komvos-mind': ['src/pages/KomvosMind.tsx', 'src/cms/pages/komvos-mind.ts'],
  ecossistema: ['src/pages/Ecossistema.tsx', 'src/cms/pages/ecossistema.ts'],
  empresas: ['src/cms/empresas/'],
  clientes: ['src/pages/Clientes.tsx', 'src/cms/pages/clientes.ts', 'src/cms/parceiros.ts'],
  sobre: ['src/pages/Sobre.tsx', 'src/cms/pages/sobre.ts'],
  parceiro: ['src/pages/Parceiro.tsx', 'src/cms/pages/parceiro.ts'],
  trabalhe: ['src/pages/Trabalhe.tsx', 'src/cms/pages/trabalhe.ts'],
  contato: ['src/pages/Contato.tsx', 'src/cms/pages/contato.ts'],
}

const SECTION_NAME: Record<string, string> = { Topo: 'Banner do topo', 'Google (SEO)': 'Como aparece no Google' }

function Pages({ byKey, reload }: Props) {
  const toast = useToast()
  const confirm = useConfirm()
  const all = useMemo(listTexts, [])
  const [root, setRoot] = useState('home')
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [focus, setFocus] = useState<Focus | null>(null)
  const [img, setImg] = useState<Img | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [open, setOpen] = useState<string | null>('Banner do topo')
  const [secDraft, setSecDraft] = useState<Record<string, SectionValue>>({})

  // seções com controles (ocultar, colunas, lista de itens): valor publicado e rascunho
  const secSaved = (path: string): SectionValue => {
    const cfg = SECTIONS[path]
    const row = byKey.get(`section:${path}`)?.value as SectionValue | undefined
    const o = getPath(path) as { hidden?: boolean; cols?: number; items?: Record<string, string | boolean>[] }
    const items = cfg.items
      ? (row?.items ??
        (o.items ?? []).map((it, i) => {
          // textos editados antes, campo a campo, entram na lista
          const out: Record<string, string | boolean> = { ...it }
          for (const f of cfg.items!) {
            const t = byKey.get(`text:${path}.items.${i}.${f.key}`)?.value.v
            if (typeof t === 'string') out[f.key] = t
          }
          return out
        }))
      : undefined
    return { hidden: row?.hidden ?? Boolean(o.hidden), ...(cfg.cols ? { cols: row?.cols ?? o.cols ?? 3 } : {}), ...(items ? { items } : {}) }
  }
  const secValue = (path: string) => secDraft[path] ?? secSaved(path)
  const secChanged = Object.keys(secDraft).filter((p) => JSON.stringify(secDraft[p]) !== JSON.stringify(secSaved(p)))

  const edited = (f: TextField) => byKey.get(`text:${f.path}`)
  const valueOf = (f: TextField) => draft[f.path] ?? (edited(f)?.value.v as string | undefined) ?? f.value
  const term = q.trim().toLowerCase()
  const fields = all.filter((f) => (term ? f.value.toLowerCase().includes(term) || valueOf(f).toLowerCase().includes(term) : f.root === root))
  const sections = useMemo(() => {
    const m = new Map<string, TextField[]>()
    for (const f of fields) {
      const name = SECTION_NAME[f.section] ?? f.section
      const k = term ? `${ROOTS[f.root].label} › ${name}` : name
      m.set(k, [...(m.get(k) ?? []), f])
    }
    // o banner do topo primeiro, o Google por último
    const rank = (k: string) => (k.includes('Banner') ? 0 : k.includes('Google') ? 2 : 1)
    return [...m.entries()].sort(([a], [b]) => rank(a) - rank(b))
  }, [fields, term])
  const changed = Object.entries(draft).filter(([path, v]) => {
    const f = all.find((x) => x.path === path)!
    return v !== ((byKey.get(`text:${path}`)?.value.v as string | undefined) ?? f.value)
  })
  const editedCount = (r: string) =>
    all.filter((f) => f.root === r && byKey.has(`text:${f.path}`)).length + Object.keys(SECTIONS).filter((p) => SECTIONS[p].root === r && byKey.has(`section:${p}`)).length
  const total = changed.length + secChanged.length
  const pageImages = images.filter((i) => (ROOT_FILES[root] ?? []).some((p) => i.uses.some((u) => u.startsWith(p))) && !(i.folder === 'v2' && i.name.endsWith('.svg')) && (root === 'clientes' || i.folder !== 'clientes'))

  // rascunho para a pré-visualização
  const previewRows = useMemo(() => {
    const rows: ContentRow[] = []
    const removed: string[] = []
    for (const [path, v] of Object.entries(draft)) {
      const f = all.find((x) => x.path === path)!
      if (v === f.value) removed.push(`text:${path}`)
      else rows.push({ key: `text:${path}`, value: { v } })
    }
    for (const p of Object.keys(secDraft)) rows.push({ key: `section:${p}`, value: secDraft[p] })
    return { rows, removed }
  }, [draft, all, secDraft])

  useEffect(() => setOpen(sections[0]?.[0] ?? null), [root]) // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    const empty = changed.filter(([, v]) => !v.trim())
    if (empty.length) return toast('Há textos vazios. Escreva algo ou use "Voltar ao original".', 'error')
    const emptyItem = secChanged.find((p) => secDraft[p].items?.some((it) => !String(it.quote ?? it.name ?? '').trim()))
    if (emptyItem) return toast(`Há ${SECTIONS[emptyItem].itemLabel?.toLowerCase() ?? 'item'} sem texto. Preencha ou remova a caixa.`, 'error')
    setSaving(true)
    try {
      const back = changed.filter(([path, v]) => v === all.find((x) => x.path === path)!.value).map(([path]) => `text:${path}`)
      // a lista salva em grupo substitui as edições antigas, campo a campo, dos mesmos itens
      const stale = [...byKey.keys()].filter((k) => secChanged.some((p) => SECTIONS[p].items && k.startsWith(`text:${p}.items.`)))
      await deleteContent([...back, ...stale])
      await saveContent([
        ...changed.filter(([path]) => !back.includes(`text:${path}`)).map(([path, v]) => ({ key: `text:${path}`, value: { v } })),
        ...secChanged.map((p) => ({ key: `section:${p}`, value: secDraft[p] as Record<string, unknown> })),
      ])
      setDraft({})
      setSecDraft({})
      reload()
      toast(`${total} ${total === 1 ? 'alteração publicada' : 'alterações publicadas'}. ${PUBLISH_NOTE}`)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function restore(f: TextField) {
    const ok = await confirm({
      title: 'Voltar ao texto original?',
      consequences: [
        <>
          O texto volta a ser: <em>“{f.value}”</em>
        </>,
        'A versão editada sai do site.',
      ],
      confirm: 'Voltar ao original',
    })
    if (!ok) return
    try {
      await deleteContent([`text:${f.path}`])
      setDraft(({ [f.path]: _, ...rest }) => rest)
      reload()
      setReloadKey((k) => k + 1)
      toast('Texto original de volta.')
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function discard() {
    const ok = await confirm({ title: 'Descartar as alterações?', consequences: ['Tudo o que você mudou e ainda não publicou volta ao que está no ar.'], confirm: 'Descartar', danger: true })
    if (ok) {
      setDraft({})
      setSecDraft({})
    }
  }

  async function restoreSection(path: string) {
    const ok = await confirm({
      title: `Voltar “${SECTIONS[path].name}” ao original?`,
      consequences: ['A seção volta a aparecer no site, com os itens e as colunas originais.', 'As mudanças publicadas nesta seção saem do site.'],
      confirm: 'Voltar ao original',
    })
    if (!ok) return
    try {
      await deleteContent([`section:${path}`, ...[...byKey.keys()].filter((k) => k.startsWith(`text:${path}.items.`))])
      setSecDraft(({ [path]: _, ...rest }) => rest)
      reload()
      setReloadKey((k) => k + 1)
      toast('Seção original de volta.')
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <div className="pages">
      <aside className="editor-nav">
        <label className="search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar em todo o site…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar texto" />
        </label>
        <nav aria-label="Páginas">
          {Object.entries(ROOTS).map(([id, r]) => (
            <button key={id} type="button" className={!term && id === root ? 'is-on' : ''} onClick={() => (setQ(''), setRoot(id))}>
              {r.label}
              {editedCount(id) > 0 && <Badge tone="pink">{editedCount(id)}</Badge>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="pages-fields">
        <ol className="how">
          <li>
            <span>1</span> Clique num campo: o trecho acende na pré-visualização.
          </li>
          <li>
            <span>2</span> Edite e veja mudar ao vivo.
          </li>
          <li>
            <span>3</span> Clique em <strong>Publicar no site</strong>.
          </li>
        </ol>
        {!term && pageImages.length > 0 && (
          <Card title="Imagens e banners desta página" hint="Clique para trocar. A troca vale em todos os lugares onde a imagem aparece.">
            <div className="page-imgs">
              {pageImages.slice(0, 12).map((i) => {
                const r = byKey.get(`image:${i.src}`)
                return (
                  <button
                    key={i.src}
                    type="button"
                    className={`page-img${r ? ' is-swapped' : ''}`}
                    onClick={() => setImg(i)}
                    onMouseEnter={() => setFocus({ src: i.src, n: Date.now() })}
                    title={i.name}
                  >
                    <img src={(r?.value.url as string) ?? i.src} alt="" loading="lazy" />
                    <span>{r ? 'Trocada' : 'Trocar'}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        )}
        {!sections.length && <p className="empty">Nenhum texto encontrado.</p>}
        {sections.map(([name, list]) => {
          const isOpen = Boolean(term) || open === name
          const secPath = term ? undefined : Object.keys(SECTIONS).find((p) => SECTIONS[p].root === root && SECTIONS[p].name === name)
          const sec = secPath ? secValue(secPath) : undefined
          const dirty = list.some((f) => draft[f.path] !== undefined) || (secPath ? secChanged.includes(secPath) : false)
          return (
            <section key={name} className={`acc${isOpen ? ' is-open' : ''}`}>
              <button type="button" className="acc-head" onClick={() => setOpen(isOpen && !term ? null : name)} aria-expanded={isOpen}>
                <span className="acc-icon">
                  <Icon name={name.includes('Banner') ? 'image' : name.includes('Google') ? 'search' : 'text'} size={16} />
                </span>
                <strong>{name}</strong>
                <small>
                  {sec?.items ? `${sec.items.length} ${sec.items.length === 1 ? 'item' : 'itens'}` : `${list.length} ${list.length === 1 ? 'campo' : 'campos'}`}
                </small>
                {sec?.hidden && <Badge tone="dark">Oculta</Badge>}
                {dirty && <Badge tone="amber">Não publicado</Badge>}
                {(list.some((f) => edited(f)) || (secPath && byKey.has(`section:${secPath}`))) && <Badge tone="pink">Editado</Badge>}
                <span className="acc-caret" aria-hidden="true" />
              </button>
              {isOpen && (
                <div className="text-fields">
                  {list.map((f) => {
                    const e = edited(f)
                    const v = valueOf(f)
                    const long = f.long || v.length > 90
                    const onFocus = () => setFocus({ text: v, n: Date.now() })
                    const onChange = (val: string) => setDraft((d) => ({ ...d, [f.path]: val }))
                    return (
                      <label key={f.path} className={`field text-field${draft[f.path] !== undefined ? ' is-dirty' : ''}`}>
                        <span>
                          {f.label}
                          {e && <Badge tone="pink">Editado</Badge>}
                          {f.path.endsWith('.highlight') && <small className="hint-chip">trecho colorido do título</small>}
                        </span>
                        {long ? (
                          <textarea rows={Math.min(8, Math.ceil(v.length / 80) + 1)} value={v} onFocus={onFocus} onChange={(ev) => onChange(ev.target.value)} />
                        ) : (
                          <input value={v} onFocus={onFocus} onChange={(ev) => onChange(ev.target.value)} />
                        )}
                        {e && (
                          <small className="field-foot">
                            Original: “{f.value.length > 120 ? f.value.slice(0, 120) + '…' : f.value}”
                            <button type="button" className="link-btn" onClick={(ev) => (ev.preventDefault(), restore(f))}>
                              Voltar ao original
                            </button>
                          </small>
                        )}
                      </label>
                    )
                  })}
                  {secPath && sec && (
                    <SectionTools
                      cfg={SECTIONS[secPath]}
                      value={sec}
                      published={byKey.has(`section:${secPath}`)}
                      onChange={(v) => setSecDraft((d) => ({ ...d, [secPath]: v }))}
                      onFocus={(text) => setFocus({ text, n: Date.now() })}
                      onRestore={() => restoreSection(secPath)}
                    />
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <div className="pages-preview">
        <Preview url={term ? '/' : ROOTS[root].url} rows={previewRows.rows} removed={previewRows.removed} focus={focus} reloadKey={reloadKey} />
      </div>

      {total > 0 && (
        <div className="savebar">
          <span className="live-dot" />
          <span>
            {total} {total === 1 ? 'alteração para publicar' : 'alterações para publicar'}
          </span>
          <button type="button" className="btn" onClick={discard}>
            Descartar
          </button>
          <button type="button" className="btn is-primary" onClick={save} disabled={saving}>
            {saving ? 'Publicando…' : 'Publicar no site'}
          </button>
        </div>
      )}
      {img && (
        <ImageModal
          img={img}
          row={byKey.get(`image:${img.src}`)}
          onClose={() => setImg(null)}
          onSaved={() => {
            reload()
            setReloadKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}

/* ---------- seção com controles: mostrar/ocultar, colunas e lista de itens em caixas ---------- */

function SectionTools({
  cfg,
  value,
  published,
  onChange,
  onFocus,
  onRestore,
}: {
  cfg: SectionConfig
  value: SectionValue
  published: boolean
  onChange: (v: SectionValue) => void
  onFocus: (text: string) => void
  onRestore: () => void
}) {
  const items = value.items ?? []
  const setItems = (next: Record<string, string | boolean>[]) => onChange({ ...value, items: next })
  const setItem = (i: number, patch: Record<string, string | boolean>) => setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it)))
  const move = (i: number, d: number) => {
    const next = [...items]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    setItems(next)
  }
  const label = cfg.itemLabel ?? 'Item'
  return (
    <div className="sec-tools">
      <div className="sec-bar">
        <label className="sec-toggle">
          <input type="checkbox" checked={!value.hidden} onChange={(e) => onChange({ ...value, hidden: !e.target.checked })} />
          <span>
            <strong>{value.hidden ? 'Seção oculta no site' : 'Seção visível no site'}</strong>
            <small>{value.hidden ? 'Ninguém vê esta parte até você mostrar de novo.' : 'Desmarque para esconder sem apagar nada.'}</small>
          </span>
        </label>
        {cfg.cols && (
          <div className="sec-cols">
            <span>Colunas</span>
            <div className="seg" role="group" aria-label="Colunas">
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" className={value.cols === n ? 'is-on' : ''} aria-pressed={value.cols === n} onClick={() => onChange({ ...value, cols: n })}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {cfg.items && (
        <>
          <div className="sec-items">
            {items.map((it, i) => (
              <fieldset key={i} className="sec-item">
                <legend>
                  {label} {i + 1}
                </legend>
                <div className="sec-item-tools">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Subir" aria-label="Subir">
                    <Icon name="up" size={14} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} title="Descer" aria-label="Descer">
                    <Icon name="down" size={14} />
                  </button>
                  <button type="button" className="is-danger" onClick={() => setItems(items.filter((_, j) => j !== i))} title={`Remover ${label.toLowerCase()}`} aria-label={`Remover ${label.toLowerCase()}`}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
                {cfg.items!.map((f) =>
                  f.check ? (
                    <label key={f.key} className="check">
                      <input type="checkbox" checked={Boolean(it[f.key])} onChange={(e) => setItem(i, { [f.key]: e.target.checked })} /> {f.label}
                    </label>
                  ) : (
                    <label key={f.key} className="field">
                      <span>{f.label}</span>
                      {f.long ? (
                        <textarea rows={3} value={String(it[f.key] ?? '')} onFocus={() => onFocus(String(it[f.key] ?? ''))} onChange={(e) => setItem(i, { [f.key]: e.target.value })} />
                      ) : (
                        <input value={String(it[f.key] ?? '')} onFocus={() => onFocus(String(it[f.key] ?? ''))} onChange={(e) => setItem(i, { [f.key]: e.target.value })} />
                      )}
                    </label>
                  ),
                )}
              </fieldset>
            ))}
          </div>
          <button type="button" className="btn sec-add" onClick={() => setItems([...items, { ...(cfg.blank ?? {}) }])}>
            <Icon name="plus" size={16} /> Adicionar {label.toLowerCase()}
          </button>
        </>
      )}
      {published && (
        <button type="button" className="link-btn is-muted" onClick={onRestore}>
          Voltar esta seção ao original
        </button>
      )}
    </div>
  )
}

/* ---------- imagens ---------- */

type Img = (typeof images)[number]

const FOLDER: Record<string, string> = {
  raiz: 'Logos e fotos gerais',
  sobre: 'Sobre (linha do tempo)',
  clientes: 'Logos de clientes',
  partners: 'Parceiros e selos',
  reels: 'Capas dos vídeos',
  guga: 'Playlist ERP',
  v2: 'Ícones e detalhes da Home',
}

function Images({ byKey, reload }: Props) {
  const [q, setQ] = useState('')
  const [folder, setFolder] = useState('')
  const [open, setOpen] = useState<Img | null>(null)
  const [showIcons, setShowIcons] = useState(false)
  const folders = useMemo(() => [...new Set(images.map((i) => i.folder))], [])
  const list = images.filter(
    (i) =>
      (!folder || i.folder === folder) &&
      (showIcons || folder === 'v2' || !(i.folder === 'v2' && i.name.endsWith('.svg'))) &&
      (!/-s\.webp$/.test(i.name) || folder === 'guga') &&
      (!q || i.name.toLowerCase().includes(q.toLowerCase())),
  )
  const swapped = images.filter((i) => byKey.has(`image:${i.src}`)).length

  return (
    <>
      <div className="filters">
        <label className="search">
          <Icon name="search" size={16} />
          <input placeholder="Buscar imagem pelo nome…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar imagem" />
        </label>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Grupo">
          <option value="">Todas as imagens</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {FOLDER[f] ?? f}
            </option>
          ))}
        </select>
        <label className="check">
          <input type="checkbox" checked={showIcons} onChange={(e) => setShowIcons(e.target.checked)} /> Mostrar ícones
        </label>
        {swapped > 0 && <span className="filters-note">{swapped} trocada(s)</span>}
      </div>
      <div className="img-grid">
        {list.map((i) => {
          const r = byKey.get(`image:${i.src}`)
          return (
            <button key={i.src} type="button" className={`img-card${r ? ' is-swapped' : ''}`} onClick={() => setOpen(i)}>
              <span className="img-thumb">
                <img src={(r?.value.url as string) ?? i.src} alt="" loading="lazy" />
              </span>
              <span className="img-name">{i.name}</span>
              <span className="img-meta">
                {FOLDER[i.folder] ?? i.folder}
                {r && <Badge tone="pink">Trocada</Badge>}
              </span>
            </button>
          )
        })}
      </div>
      {open && <ImageModal img={open} row={byKey.get(`image:${open.src}`)} onClose={() => setOpen(null)} onSaved={reload} />}
    </>
  )
}

function ImageModal({ img, row, onClose, onSaved }: { img: Img; row?: ContentRow & { updated_at?: string; updated_by?: string }; onClose: () => void; onSaved: () => void }) {
  const toast = useToast()
  const confirm = useConfirm()
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState((row?.value.url as string) ?? '')
  const [busy, setBusy] = useState(false)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [newSize, setNewSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const i = new Image()
    i.onload = () => setSize({ w: i.naturalWidth, h: i.naturalHeight })
    i.src = img.src
  }, [img.src])

  const ratio = (s: { w: number; h: number }) => s.w / s.h
  const ratioOff = size && newSize && Math.abs(ratio(size) - ratio(newSize)) / ratio(size) > 0.15

  async function pick(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast('Escolha um arquivo de imagem (JPG, PNG, WebP ou SVG).', 'error')
    if (file.size > 5 * 1024 * 1024) return toast('Imagem acima de 5 MB. Reduza antes de enviar (o site fica lento com imagens pesadas).', 'error')
    setBusy(true)
    try {
      setUrl(await uploadMedia(file, 'site'))
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    const where = img.uses.length ? `${img.uses.length} lugar(es) do código` : 'todos os lugares onde aparece'
    const ok = await confirm({
      title: 'Trocar esta imagem no site?',
      consequences: [
        <>
          <strong>{img.name}</strong> será substituída em {where}, em todas as páginas.
        </>,
        ratioOff ? (
          <strong>A nova imagem tem proporção diferente da original e pode aparecer cortada ou esticada.</strong>
        ) : (
          'A nova imagem ocupa o mesmo espaço da original.'
        ),
        'Dá para voltar à original a qualquer momento.',
        PUBLISH_NOTE,
      ],
      confirm: 'Trocar imagem',
    })
    if (!ok) return
    try {
      await saveContent([{ key: `image:${img.src}`, value: { url } }])
      toast('Imagem trocada.')
      onSaved()
      onClose()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function restore() {
    const ok = await confirm({
      title: 'Voltar à imagem original?',
      consequences: ['A imagem enviada deixa de aparecer no site e a original volta em todos os lugares.'],
      confirm: 'Voltar à original',
    })
    if (!ok) return
    try {
      await deleteContent([`image:${img.src}`])
      toast('Imagem original de volta.')
      onSaved()
      onClose()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <Modal onClose={onClose} labelledBy="img-title" wide>
      <h2 id="img-title" className="modal-title">
        {img.name}
      </h2>
      <p className="modal-lead">
        {FOLDER[img.folder] ?? img.folder}
        {size && ` · ${size.w}×${size.h}px`} · {(img.bytes / 1024).toFixed(0)} KB
        {img.uses.length > 0 && <> · usada em {img.uses.map((u) => u.replace(/^src\//, '')).join(', ')}</>}
      </p>
      <div className="img-compare">
        <figure>
          <figcaption>Original</figcaption>
          <img src={img.src} alt="Imagem original" />
        </figure>
        <figure>
          <figcaption>Nova {newSize && `· ${newSize.w}×${newSize.h}px`}</figcaption>
          {url ? (
            <img src={url} alt="Nova imagem" onLoad={(e) => setNewSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
          ) : (
            <button type="button" className="img-drop" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Icon name="plus" size={22} />
              {busy ? 'Enviando…' : 'Escolher nova imagem'}
              {size && <small>Ideal: {size.w}×{size.h}px ou mesma proporção</small>}
            </button>
          )}
        </figure>
      </div>
      {ratioOff && (
        <p className="form-msg is-warn">
          <Icon name="alert" size={16} /> Proporção diferente da original: a imagem pode aparecer cortada. O ideal é{' '}
          {size && `${size.w}×${size.h}px`} ou outra medida com a mesma proporção.
        </p>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <div className="modal-foot">
        {row && (
          <button type="button" className="btn is-danger-ghost" onClick={restore}>
            <Icon name="undo" size={16} /> Voltar à original
          </button>
        )}
        {row?.updated_at && (
          <span className="muted">
            Trocada em {fmtDate(row.updated_at)}
            {row.updated_by ? ` por ${row.updated_by}` : ''}
          </span>
        )}
        <span className="spacer" />
        {url && (
          <button type="button" className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? 'Enviando…' : 'Escolher outra'}
          </button>
        )}
        <button type="button" className="btn is-primary" disabled={!url || busy || url === row?.value.url} onClick={save}>
          Salvar troca
        </button>
      </div>
    </Modal>
  )
}

/* ---------- menu ---------- */

function Menu({ byKey, reload }: Props) {
  const toast = useToast()
  const confirm = useConfirm()
  const [names, setNames] = useState<Record<string, string>>({})
  const [reloadKey, setReloadKey] = useState(0)
  const o = (id: string) => (byKey.get(`menu:${id}`)?.value ?? {}) as { label?: string; hidden?: boolean; deleted?: boolean }
  const active = MENU.filter((m) => !o(m.id).deleted)
  const deleted = MENU.filter((m) => o(m.id).deleted)
  const visibleArch = active.filter((m) => m.group === 'arch' && !o(m.id).hidden).length

  async function put(id: string, patch: Record<string, unknown>, msg: string) {
    const next = { ...o(id), ...patch }
    try {
      if (!next.label && !next.hidden && !next.deleted) await deleteContent([`menu:${id}`])
      else await saveContent([{ key: `menu:${id}`, value: next }])
      reload()
      setReloadKey((k) => k + 1)
      toast(`${msg} ${PUBLISH_NOTE}`)
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  const label = (m: (typeof MENU)[number]) => o(m.id).label || m.label

  async function toggle(m: (typeof MENU)[number]) {
    const hide = !o(m.id).hidden
    if (hide) {
      const last = m.group === 'arch' && visibleArch === 1
      const ok = await confirm({
        title: `Ocultar “${label(m)}” do menu?`,
        consequences: [
          'O link sai do menu do topo e do menu do celular.',
          <>
            A página <strong>{m.to}</strong> continua no ar: quem tiver o link, o Google e os botões dentro do site continuam levando até ela.
          </>,
          ...(last ? [<strong key="a">É o último item visível de “{MENU_ARCH_LABEL}”: o submenu inteiro some da barra do topo.</strong>] : []),
          ...(m.id === 'solucoes' ? [<strong key="s">O submenu com as 4 soluções também some da barra do topo.</strong>] : []),
          'Você pode mostrar de novo quando quiser.',
        ],
        confirm: 'Ocultar do menu',
      })
      if (!ok) return
    }
    put(m.id, { hidden: hide }, hide ? 'Item oculto.' : 'Item visível de novo.')
  }

  async function remove(m: (typeof MENU)[number]) {
    const ok = await confirm({
      title: `Excluir “${label(m)}” do menu?`,
      consequences: [
        'O item sai do menu e desta lista. Ele vai para “Itens excluídos”, no fim da página.',
        <>
          A página <strong>{m.to}</strong> NÃO é apagada: continua no ar e acessível pelo link, pelo Google e pelos botões do site.
        </>,
        'Se a ideia é tirar só por um tempo, prefira “Ocultar”.',
      ],
      confirm: 'Excluir do menu',
      danger: true,
      typeToConfirm: label(m),
    })
    if (ok) put(m.id, { deleted: true, hidden: false }, 'Item excluído do menu.')
  }

  async function rename(m: (typeof MENU)[number]) {
    const v = (names[m.id] ?? '').trim()
    if (!v) return toast('Escreva um nome para o item.', 'error')
    await put(m.id, { label: v === m.label ? undefined : v }, 'Nome atualizado.')
    setNames(({ [m.id]: _, ...rest }) => rest)
  }

  return (
    <>
      <div className="menu-preview">
        <Preview url="/" compact reloadKey={reloadKey} />
      </div>
      <Card title="Itens do menu" hint="Ordem em que aparecem no site. Os de “Arquitetura” ficam agrupados num submenu da barra do topo.">
        <ul className="menu-list">
          {active.map((m) => {
            const ov = o(m.id)
            const editing = names[m.id] !== undefined
            return (
              <li key={m.id} className={ov.hidden ? 'is-hidden' : ''}>
                <div className="menu-info">
                  {editing ? (
                    <input value={names[m.id]} onChange={(e) => setNames((n) => ({ ...n, [m.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && rename(m)} autoFocus aria-label="Novo nome" />
                  ) : (
                    <strong>{label(m)}</strong>
                  )}
                  <span>
                    {m.to}
                    {m.group === 'arch' && <Badge>Submenu {MENU_ARCH_LABEL}</Badge>}
                    {m.bar === false && <Badge>Só no menu do celular</Badge>}
                    {ov.hidden && <Badge tone="amber">Oculto</Badge>}
                    {ov.label && <Badge tone="pink">Renomeado</Badge>}
                  </span>
                </div>
                <div className="menu-actions">
                  {editing ? (
                    <>
                      <button type="button" className="btn is-small" onClick={() => setNames(({ [m.id]: _, ...rest }) => rest)}>
                        Cancelar
                      </button>
                      <button type="button" className="btn is-small is-primary" onClick={() => rename(m)}>
                        Salvar nome
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn is-small" onClick={() => setNames((n) => ({ ...n, [m.id]: label(m) }))}>
                        <Icon name="edit" size={15} /> Renomear
                      </button>
                      {ov.label && (
                        <button type="button" className="btn is-small" onClick={() => put(m.id, { label: undefined }, 'Nome original de volta.')}>
                          <Icon name="undo" size={15} /> Nome original
                        </button>
                      )}
                      <button type="button" className="btn is-small" onClick={() => toggle(m)}>
                        <Icon name={ov.hidden ? 'eye' : 'eyeOff'} size={15} /> {ov.hidden ? 'Mostrar' : 'Ocultar'}
                      </button>
                      <button type="button" className="btn is-small is-danger-ghost" onClick={() => remove(m)} aria-label={`Excluir ${label(m)}`}>
                        <Icon name="trash" size={15} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
      {deleted.length > 0 && (
        <Card title="Itens excluídos" hint="Não aparecem no site. Restaure para colocar de volta no menu.">
          <ul className="menu-list">
            {deleted.map((m) => (
              <li key={m.id} className="is-hidden">
                <div className="menu-info">
                  <strong>{label(m)}</strong>
                  <span>{m.to}</span>
                </div>
                <button type="button" className="btn is-small" onClick={() => put(m.id, { deleted: undefined }, 'Item restaurado.')}>
                  <Icon name="undo" size={15} /> Restaurar
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
