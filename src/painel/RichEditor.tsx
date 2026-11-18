import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { cleanPasted, sanitizeHtml, textToHtml } from '../live/richtext'
import { FONTS } from '../live/insightStyles'
import { Icon } from './ui'

/*
 * Editor de texto rico do bloco "Texto" dos artigos: barra com estilo de parágrafo (Parágrafo, H1…H5),
 * fonte, tamanho, cor, negrito/itálico/sublinhado/riscado, alinhamento, listas, link, citação e tabela.
 * Colar do Word, do Google Docs ou de um site mantém títulos, listas, links e tabelas; texto puro é
 * convertido (cada linha vira parágrafo, "-" vira lista, linhas curtas sem ponto viram subtítulo).
 * Usa o editor nativo do navegador (contentEditable) e grava o HTML já limpo.
 */

const BLOCK_STYLES = [
  { value: 'p', label: 'Parágrafo' },
  { value: 'h1', label: 'Título H1' },
  { value: 'h2', label: 'Título H2' },
  { value: 'h3', label: 'Título H3' },
  { value: 'h4', label: 'Título H4' },
  { value: 'h5', label: 'Título H5' },
  { value: 'blockquote', label: 'Citação' },
]
const SIZES = [12, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32, 36, 40, 48]
const SWATCHES = ['#ffffff', '#f4f7fb', '#c4c8cc', '#9aa1a7', '#00afef', '#00d3a7', '#ffb020', '#ff5d5d', '#111516']

const exec = (cmd: string, value?: string) => document.execCommand(cmd, false, value)

export function RichEditor({ html, onChange, autoFocus = true }: { html: string; onChange: (html: string) => void; autoFocus?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const saved = useRef<Range | null>(null)
  const [state, setState] = useState({ block: 'p', bold: false, italic: false, underline: false, strike: false, inTable: false, inLink: false, ul: false, ol: false })
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [tableOpen, setTableOpen] = useState(false)
  const [color, setColor] = useState('#00afef')

  // o HTML entra só ao montar (reescrever a cada tecla faria o cursor pular)
  useLayoutEffect(() => {
    const el = ref.current!
    el.innerHTML = sanitizeHtml(html)
    if (autoFocus) el.focus()
    exec('styleWithCSS', 'true')
    exec('defaultParagraphSeparator', 'p')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const emit = () => onChange(ref.current!.innerHTML)

  /* ---------- seleção ---------- */
  const inside = (n: Node | null) => !!n && !!ref.current?.contains(n)
  const saveSel = () => {
    const s = window.getSelection()
    if (s?.rangeCount && inside(s.anchorNode)) saved.current = s.getRangeAt(0).cloneRange()
  }
  const restoreSel = () => {
    const el = ref.current!
    el.focus()
    if (saved.current) {
      const s = window.getSelection()!
      s.removeAllRanges()
      s.addRange(saved.current)
    }
  }
  const closest = (sel: string) => {
    const n = window.getSelection()?.anchorNode
    const el = n ? (n.nodeType === 1 ? (n as Element) : n.parentElement) : null
    const hit = el?.closest(sel)
    return hit && inside(hit) ? (hit as HTMLElement) : null
  }

  useEffect(() => {
    const onSel = () => {
      const s = window.getSelection()
      if (!s?.rangeCount || !inside(s.anchorNode)) return
      saveSel()
      const blk = closest('h1, h2, h3, h4, h5, blockquote, p, li, td, th')
      const tag = blk?.tagName.toLowerCase() ?? 'p'
      setState({
        block: ['h1', 'h2', 'h3', 'h4', 'h5', 'blockquote'].includes(tag) ? tag : closest('blockquote') ? 'blockquote' : 'p',
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        inTable: Boolean(closest('td, th')),
        inLink: Boolean(closest('a')),
        ul: Boolean(closest('ul')),
        ol: Boolean(closest('ol')),
      })
    }
    document.addEventListener('selectionchange', onSel)
    return () => document.removeEventListener('selectionchange', onSel)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /** Roda um comando mantendo a seleção do texto. */
  const run = (fn: () => void) => {
    restoreSel()
    fn()
    saveSel()
    emit()
  }

  /* ---------- comandos ---------- */
  const setBlock = (tag: string) => run(() => exec('formatBlock', `<${tag}>`))

  // tamanho e fonte por <span style>, no lugar do antigo <font size="1-7">
  const styleSelection = (prop: 'fontSize' | 'fontFamily', value: string) =>
    run(() => {
      exec('styleWithCSS', 'false')
      exec('fontName', '__kv__')
      exec('styleWithCSS', 'true')
      ref.current!.querySelectorAll('font[face="__kv__"]').forEach((f) => {
        // o que já tinha fonte/tamanho dentro da seleção passa a seguir o novo valor
        f.querySelectorAll<HTMLElement>('[style]').forEach((s) => (s.style[prop] = ''))
        if (!value) {
          // "Padrão": tira o estilo e deixa valer o padrão do blog
          f.replaceWith(...f.childNodes)
          return
        }
        const span = document.createElement('span')
        span.style[prop] = value
        while (f.firstChild) span.appendChild(f.firstChild)
        f.replaceWith(span)
      })
    })

  const applyLink = () => {
    const url = linkUrl.trim()
    setLinkOpen(false)
    if (!url) return
    const href = /^(https?:\/\/|\/|mailto:|tel:|#)/i.test(url) ? url : `https://${url}`
    run(() => {
      const sel = window.getSelection()
      if (sel && sel.isCollapsed && !closest('a')) exec('insertHTML', `<a href="${href.replace(/"/g, '%22')}">${href.replace(/</g, '&lt;')}</a>`)
      else exec('createLink', href)
      ref.current!.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
        if (/^https?:\/\//i.test(a.getAttribute('href') ?? '')) {
          a.target = '_blank'
          a.rel = 'noopener noreferrer'
        }
      })
    })
  }

  const insertTable = (rows: number, cols: number) => {
    setTableOpen(false)
    const head = `<tr>${Array.from({ length: cols }, (_, c) => `<th>Coluna ${c + 1}</th>`).join('')}</tr>`
    const body = Array.from({ length: rows - 1 }, () => `<tr>${Array.from({ length: cols }, () => '<td><br></td>').join('')}</tr>`).join('')
    run(() => exec('insertHTML', `<table><thead>${head}</thead><tbody>${body}</tbody></table><p><br></p>`))
  }

  const tableEdit = (action: 'row+' | 'row-' | 'col+' | 'col-' | 'del') =>
    run(() => {
      const cell = closest('td, th') as HTMLTableCellElement | null
      const table = cell?.closest('table')
      if (!cell || !table) return
      const row = cell.parentElement as HTMLTableRowElement
      const idx = cell.cellIndex
      if (action === 'del') return table.remove()
      if (action === 'row+') {
        const r = document.createElement('tr')
        for (let i = 0; i < row.cells.length; i++) r.appendChild(Object.assign(document.createElement('td'), { innerHTML: '<br>' }))
        if (row.parentElement?.tagName === 'THEAD') {
          let tb = table.tBodies[0]
          if (!tb) tb = table.createTBody()
          tb.prepend(r)
        } else row.after(r)
      }
      if (action === 'row-') {
        if (table.rows.length <= 1) return table.remove()
        row.remove()
      }
      if (action === 'col+')
        [...table.rows].forEach((r) => {
          const c = document.createElement(r.parentElement?.tagName === 'THEAD' ? 'th' : 'td')
          c.innerHTML = '<br>'
          r.cells[idx]?.after(c)
        })
      if (action === 'col-') {
        if (row.cells.length <= 1) return table.remove()
        ;[...table.rows].forEach((r) => r.cells[idx]?.remove())
      }
    })

  /* ---------- colar ---------- */
  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')
    if (!html && !text) return
    e.preventDefault()
    insertBlocks((html && cleanPasted(html)) || textToHtml(text))
    emit()
  }

  /**
   * Cola blocos (títulos, parágrafos, listas, tabelas) no nível certo: o insertHTML do navegador
   * enfiaria tudo dentro do parágrafo/título onde está o cursor.
   */
  function insertBlocks(clean: string) {
    const root = ref.current!
    const tpl = document.createElement('template')
    tpl.innerHTML = clean
    const nodes = [...tpl.content.childNodes]
    // só um parágrafo: entra como texto no lugar do cursor
    if (nodes.length === 1 && nodes[0] instanceof HTMLParagraphElement) return exec('insertHTML', nodes[0].innerHTML)
    const sel = window.getSelection()
    if (!sel?.rangeCount || !inside(sel.anchorNode)) {
      root.append(...nodes)
      return
    }
    const range = sel.getRangeAt(0)
    range.deleteContents()
    // bloco de primeiro nível onde está o cursor
    let block: Node | null = range.startContainer
    while (block && block.parentNode !== root) block = block.parentNode
    if (!block || block === root) {
      root.append(...nodes)
    } else if (!(block instanceof HTMLElement)) {
      ;(block as ChildNode).after(...nodes)
    } else {
      // divide o bloco no cursor: o que vem depois vai para depois do que foi colado
      const after = document.createRange()
      after.setStart(range.startContainer, range.startOffset)
      after.setEndAfter(block.lastChild ?? block)
      const tail = after.extractContents()
      const rest = block.cloneNode(false) as HTMLElement
      rest.append(tail)
      const anchor = block as HTMLElement
      anchor.after(...nodes, rest)
      if (!rest.textContent?.trim() && !rest.querySelector('table, img')) rest.remove()
      if (!anchor.textContent?.trim() && !anchor.querySelector('table, img')) anchor.remove()
    }
    // cursor no fim do que foi colado
    const last = nodes[nodes.length - 1]
    if (last?.isConnected) {
      const r = document.createRange()
      r.selectNodeContents(last)
      r.collapse(false)
      sel.removeAllRanges()
      sel.addRange(r)
    }
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    // Tab dentro da tabela pula de célula
    if (e.key === 'Tab' && closest('td, th')) {
      e.preventDefault()
      const cells = [...(closest('table')?.querySelectorAll('td, th') ?? [])]
      const i = cells.indexOf(closest('td, th')!)
      const next = cells[i + (e.shiftKey ? -1 : 1)]
      if (next) {
        const r = document.createRange()
        r.selectNodeContents(next)
        r.collapse(false)
        const s = window.getSelection()!
        s.removeAllRanges()
        s.addRange(r)
      } else if (!e.shiftKey) tableEdit('row+')
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      saveSel()
      setLinkUrl(closest('a')?.getAttribute('href') ?? '')
      setLinkOpen(true)
    }
  }

  const Btn = ({ on, title, onClick, children }: { on?: boolean; title: string; onClick: () => void; children: ReactNode }) => (
    <button type="button" className={`rte-btn${on ? ' is-on' : ''}`} title={title} aria-label={title} aria-pressed={on} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {children}
    </button>
  )

  return (
    <div className="rte" onClick={(e) => e.stopPropagation()}>
      <div className="rte-bar" role="toolbar" aria-label="Formatação">
        <select className="rte-select" value={state.block} onChange={(e) => setBlock(e.target.value)} title="Estilo do parágrafo" onMouseDown={saveSel}>
          {BLOCK_STYLES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select className="rte-select" defaultValue="__" onChange={(e) => (styleSelection('fontFamily', e.target.value), (e.target.value = '__'))} title="Fonte do trecho selecionado" onMouseDown={saveSel}>
          <option value="__" disabled>
            Fonte
          </option>
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select className="rte-select is-small" defaultValue="__" onChange={(e) => (styleSelection('fontSize', e.target.value), (e.target.value = '__'))} title="Tamanho do trecho selecionado" onMouseDown={saveSel}>
          <option value="__" disabled>
            Tam.
          </option>
          <option value="">Padrão</option>
          {SIZES.map((s) => (
            <option key={s} value={`${s}px`}>
              {s}px
            </option>
          ))}
        </select>
        <span className="rte-sep" />
        <Btn on={state.bold} title="Negrito (Ctrl+B)" onClick={() => run(() => exec('bold'))}>
          <b>B</b>
        </Btn>
        <Btn on={state.italic} title="Itálico (Ctrl+I)" onClick={() => run(() => exec('italic'))}>
          <i>I</i>
        </Btn>
        <Btn on={state.underline} title="Sublinhado (Ctrl+U)" onClick={() => run(() => exec('underline'))}>
          <u>U</u>
        </Btn>
        <Btn on={state.strike} title="Riscado" onClick={() => run(() => exec('strikeThrough'))}>
          <s>S</s>
        </Btn>
        <span className="rte-color" title="Cor do texto">
          <Btn title="Aplicar cor" onClick={() => run(() => exec('foreColor', color))}>
            <span className="rte-a" style={{ borderColor: color }}>
              A
            </span>
          </Btn>
          <input type="color" value={color} onMouseDown={saveSel} onChange={(e) => setColor(e.target.value)} aria-label="Escolher cor (depois clique no A)" />
          <span className="rte-swatches">
            {SWATCHES.map((c) => (
              <button key={c} type="button" style={{ background: c }} title={c} onMouseDown={(e) => e.preventDefault()} onClick={() => (setColor(c), run(() => exec('foreColor', c)))} />
            ))}
          </span>
        </span>
        <span className="rte-sep" />
        <Btn title="Alinhar à esquerda" onClick={() => run(() => exec('justifyLeft'))}>
          <Icon name="alignLeft" size={15} />
        </Btn>
        <Btn title="Centralizar" onClick={() => run(() => exec('justifyCenter'))}>
          <Icon name="alignCenter" size={15} />
        </Btn>
        <Btn title="Alinhar à direita" onClick={() => run(() => exec('justifyRight'))}>
          <Icon name="alignRight" size={15} />
        </Btn>
        <Btn title="Justificar" onClick={() => run(() => exec('justifyFull'))}>
          <Icon name="menu" size={15} />
        </Btn>
        <span className="rte-sep" />
        <Btn on={state.ul} title="Lista com marcadores" onClick={() => run(() => exec('insertUnorderedList'))}>
          <Icon name="list" size={15} />
        </Btn>
        <Btn on={state.ol} title="Lista numerada" onClick={() => run(() => exec('insertOrderedList'))}>
          <span className="rte-ol">1.</span>
        </Btn>
        <Btn
          on={state.inLink}
          title="Link (Ctrl+K)"
          onClick={() => {
            saveSel()
            setLinkUrl(closest('a')?.getAttribute('href') ?? '')
            setLinkOpen((o) => !o)
            setTableOpen(false)
          }}
        >
          <Icon name="link" size={15} />
        </Btn>
        {state.inLink && (
          <Btn title="Remover link" onClick={() => run(() => exec('unlink'))}>
            <span className="rte-unlink">⌀</span>
          </Btn>
        )}
        <Btn
          title="Inserir tabela"
          onClick={() => {
            saveSel()
            setTableOpen((o) => !o)
            setLinkOpen(false)
          }}
        >
          <Icon name="table" size={15} />
        </Btn>
        <Btn title="Linha divisória" onClick={() => run(() => exec('insertHorizontalRule'))}>
          <Icon name="divider" size={15} />
        </Btn>
        <Btn title="Limpar formatação do trecho" onClick={() => run(() => (exec('removeFormat'), exec('unlink')))}>
          <span className="rte-clear">T̸</span>
        </Btn>
      </div>

      {linkOpen && (
        <div className="rte-pop">
          <input
            autoFocus
            value={linkUrl}
            placeholder="https://… ou /contato"
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.preventDefault(), applyLink())
              if (e.key === 'Escape') setLinkOpen(false)
            }}
          />
          <button type="button" className="btn is-small is-primary" onClick={applyLink}>
            Aplicar link
          </button>
          <small>Selecione o texto antes; a cor dos links é definida em “Estilos do blog”.</small>
        </div>
      )}
      {tableOpen && <TablePicker onPick={insertTable} />}
      {state.inTable && (
        <div className="rte-pop is-table">
          <span>Tabela:</span>
          <button type="button" className="btn is-small" onMouseDown={(e) => e.preventDefault()} onClick={() => tableEdit('row+')}>
            + Linha
          </button>
          <button type="button" className="btn is-small" onMouseDown={(e) => e.preventDefault()} onClick={() => tableEdit('col+')}>
            + Coluna
          </button>
          <button type="button" className="btn is-small" onMouseDown={(e) => e.preventDefault()} onClick={() => tableEdit('row-')}>
            − Linha
          </button>
          <button type="button" className="btn is-small" onMouseDown={(e) => e.preventDefault()} onClick={() => tableEdit('col-')}>
            − Coluna
          </button>
          <button type="button" className="btn is-small is-danger" onMouseDown={(e) => e.preventDefault()} onClick={() => tableEdit('del')}>
            Excluir tabela
          </button>
        </div>
      )}

      <div
        ref={ref}
        className="kb-rich rte-area"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Texto do artigo"
        onInput={emit}
        onBlur={() => onChange(sanitizeHtml(ref.current!.innerHTML))}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        onKeyUp={saveSel}
        onMouseUp={saveSel}
      />
    </div>
  )
}

/** Grade para escolher o tamanho da tabela. */
function TablePicker({ onPick }: { onPick: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState<[number, number]>([3, 3])
  return (
    <div className="rte-pop is-grid">
      <div className="rte-grid" onMouseLeave={() => setHover([3, 3])}>
        {Array.from({ length: 8 }, (_, r) =>
          Array.from({ length: 6 }, (_, c) => (
            <button
              key={`${r}-${c}`}
              type="button"
              className={r < hover[0] && c < hover[1] ? 'is-on' : ''}
              onMouseEnter={() => setHover([r + 1, c + 1])}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(r + 1, c + 1)}
              aria-label={`${r + 1} linhas por ${c + 1} colunas`}
            />
          )),
        )}
      </div>
      <small>
        {hover[0]} × {hover[1]} (a 1ª linha é o cabeçalho)
      </small>
    </div>
  )
}
