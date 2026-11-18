import { useEffect, useState } from 'react'
import { FONTS, STYLE_KEYS, STYLE_LABELS, WEIGHTS, applyInsightStyles } from '../live/insightStyles'
import type { InsightStyles, TextStyle } from '../live/insightStyles'
import { DEMO, listContent, saveContent } from './db'
import { Icon, Loading, Modal, useToast } from './ui'

const KEY = 'style:insights'

/**
 * Estilos padrão do blog: para Parágrafo e H1…H5, fonte, tamanho, peso e cor; e a cor dos links.
 * Vale para todos os artigos (gravado em site_content "style:insights"). Pré-visualiza ao vivo.
 */
export function InsightStylesModal({ onClose }: { onClose: () => void }) {
  const toast = useToast()
  const [saved, setSaved] = useState<InsightStyles | null>(null)
  const [draft, setDraft] = useState<InsightStyles>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    listContent()
      .then((rows) => {
        const v = (rows.find((r) => r.key === KEY)?.value ?? {}) as InsightStyles
        setSaved(v)
        setDraft(v)
      })
      .catch((e) => toast((e as Error).message, 'error'))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // pré-visualização ao vivo no editor (e volta ao salvo ao fechar sem salvar)
  useEffect(() => {
    if (!loading) applyInsightStyles(draft)
  }, [draft, loading])
  const close = () => {
    applyInsightStyles(saved)
    onClose()
  }

  const set = (k: (typeof STYLE_KEYS)[number], patch: Partial<TextStyle>) => setDraft((d) => ({ ...d, [k]: { ...d[k], ...patch } }))

  async function save() {
    setBusy(true)
    try {
      // tira campos vazios
      const clean: InsightStyles = {}
      for (const k of STYLE_KEYS) {
        const t = draft[k]
        const o: TextStyle = {}
        if (t?.font) o.font = t.font
        if (t?.size) o.size = t.size
        if (t?.color) o.color = t.color
        if (t?.weight) o.weight = t.weight
        if (Object.keys(o).length) clean[k] = o
      }
      if (draft.link?.color || draft.link?.underline === false) clean.link = { ...(draft.link.color ? { color: draft.link.color } : {}), ...(draft.link.underline === false ? { underline: false } : {}) }
      await saveContent([{ key: KEY, value: clean as Record<string, unknown> }])
      setSaved(clean)
      applyInsightStyles(clean)
      toast(DEMO ? 'Estilos salvos (modo demonstração: só neste navegador).' : 'Estilos salvos. Já valem para todos os artigos do site.')
      onClose()
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={close} labelledBy="ins-styles-title" wide>
      <h2 id="ins-styles-title" className="modal-title">
        <Icon name="palette" size={18} /> Estilos do blog
      </h2>
      <p className="modal-lead">
        Padrão de fonte, tamanho e cor de cada estilo de texto, para <strong>todos os artigos</strong>. Campo vazio = estilo original do site. No editor, o trecho
        que tiver fonte, tamanho ou cor próprios continua com o que foi escolhido nele.
      </p>
      {loading ? (
        <Loading />
      ) : (
        <div className="ins-styles">
          <div className="ins-styles-grid">
            <span className="ins-styles-h">Estilo</span>
            <span className="ins-styles-h">Fonte</span>
            <span className="ins-styles-h">Tamanho (px)</span>
            <span className="ins-styles-h">Peso</span>
            <span className="ins-styles-h">Cor</span>
            {STYLE_KEYS.map((k) => {
              const t = draft[k] ?? {}
              return (
                <div key={k} className="ins-styles-row">
                  <strong>{STYLE_LABELS[k]}</strong>
                  <select value={t.font ?? ''} onChange={(e) => set(k, { font: e.target.value })} aria-label={`Fonte do ${STYLE_LABELS[k]}`}>
                    {FONTS.map((f) => (
                      <option key={f.label} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={8}
                    max={120}
                    placeholder="padrão"
                    value={t.size ?? ''}
                    onChange={(e) => set(k, { size: e.target.value ? Number(e.target.value) : undefined })}
                    aria-label={`Tamanho do ${STYLE_LABELS[k]}`}
                  />
                  <select value={t.weight ?? ''} onChange={(e) => set(k, { weight: e.target.value })} aria-label={`Peso do ${STYLE_LABELS[k]}`}>
                    {WEIGHTS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                  <ColorField value={t.color} onChange={(color) => set(k, { color })} label={`Cor do ${STYLE_LABELS[k]}`} />
                </div>
              )
            })}
            <div className="ins-styles-row">
              <strong>Links</strong>
              <label className="check">
                <input
                  type="checkbox"
                  checked={draft.link?.underline !== false}
                  onChange={(e) => setDraft((d) => ({ ...d, link: { ...d.link, underline: e.target.checked } }))}
                />{' '}
                Sublinhado
              </label>
              <span />
              <span />
              <ColorField value={draft.link?.color} onChange={(color) => setDraft((d) => ({ ...d, link: { ...d.link, color } }))} label="Cor dos links" />
            </div>
          </div>

          <div className="ins-styles-preview kb-doc">
            <div className="kb-rich">
              <h1>Título H1</h1>
              <h2>Título H2 do artigo</h2>
              <h3>Título H3</h3>
              <h4>Título H4</h4>
              <h5>Título H5</h5>
              <p>
                Parágrafo de exemplo com <strong>negrito</strong>, <em>itálico</em> e um <a href="#exemplo">link de exemplo</a> para ver as cores juntas.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="modal-foot">
        <button type="button" className="btn" onClick={() => setDraft({})} disabled={busy}>
          Voltar tudo ao padrão do site
        </button>
        <span className="spacer" />
        <button type="button" className="btn" onClick={close}>
          Cancelar
        </button>
        <button type="button" className="btn is-primary" onClick={save} disabled={busy || loading}>
          {busy ? 'Salvando…' : 'Salvar estilos'}
        </button>
      </div>
    </Modal>
  )
}

function ColorField({ value, onChange, label }: { value?: string; onChange: (v: string) => void; label: string }) {
  return (
    <span className="ins-color">
      <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <input value={value ?? ''} placeholder="padrão" onChange={(e) => onChange(e.target.value.trim())} aria-label={`${label} (código)`} maxLength={9} />
      {value && (
        <button type="button" className="link-btn" onClick={() => onChange('')} title="Voltar ao padrão">
          ×
        </button>
      )}
    </span>
  )
}
