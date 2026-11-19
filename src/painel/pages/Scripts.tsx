import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEMO, listContent, saveContent } from '../db'
import { SCRIPTS_KEY, scriptsFrom } from '../../live/scripts'
import type { TrackingScript } from '../../live/scripts'
import { Badge, Card, Icon, Loading, Modal, PageHead, useConfirm, useData, useToast } from '../ui'

/**
 * Códigos de monitoramento do site (RD Station, Google Tag Manager, Meta Pixel…).
 * Gravados em site_content "scripts:tracking"; o site insere os ligados em todas as páginas (ver live/scripts.ts).
 */
export function Scripts() {
  const { data, error, reload } = useData(async () => {
    const row = (await listContent()).find((r) => r.key === SCRIPTS_KEY)
    return scriptsFrom(row?.value)
  })
  const [form, setForm] = useState<'new' | TrackingScript | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  async function persist(items: TrackingScript[], msg: string) {
    try {
      await saveContent([{ key: SCRIPTS_KEY, value: { items } }])
      toast(DEMO ? `${msg} (modo demonstração: só neste navegador).` : `${msg} Vale para quem abrir o site a partir de agora.`)
      reload()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function toggle(s: TrackingScript) {
    if (!data) return
    await persist(
      data.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x)),
      s.enabled ? `“${s.name}” desligado.` : `“${s.name}” ligado.`,
    )
  }

  async function remove(s: TrackingScript) {
    if (!data) return
    const ok = await confirm({
      title: `Remover “${s.name}”?`,
      consequences: ['O código sai de todas as páginas do site.', 'Se só quiser pausar, use “Desligar”: o código fica guardado aqui.'],
      confirm: 'Remover código',
      danger: true,
    })
    if (ok) await persist(data.filter((x) => x.id !== s.id), `“${s.name}” removido.`)
  }

  async function saveForm(s: TrackingScript) {
    if (!data) return
    const exists = data.some((x) => x.id === s.id)
    await persist(exists ? data.map((x) => (x.id === s.id ? s : x)) : [...data, s], exists ? 'Código atualizado.' : 'Código adicionado.')
    setForm(null)
  }

  return (
    <>
      <PageHead
        title="Códigos de monitoramento"
        lead="Scripts de ferramentas de marketing e análise (RD Station, Google Tag Manager, Meta Pixel…) que entram em todas as páginas do site."
        actions={
          <button type="button" className="btn is-primary" onClick={() => setForm('new')}>
            <Icon name="plus" size={16} /> Adicionar código
          </button>
        }
      />
      {error && <p className="form-msg is-error">{error}</p>}
      {!data && !error ? (
        <Loading />
      ) : data ? (
        <Card hint="Desligar ou remover vale a partir do próximo carregamento da página. Os códigos não rodam dentro do painel.">
          {data.length === 0 ? (
            <p className="empty">Nenhum código no site. Use “Adicionar código” para colar o da ferramenta.</p>
          ) : (
            <ul className="user-list">
              {data.map((s) => (
                <li key={s.id}>
                  <span className="user-avatar">
                    <Icon name="globe" size={16} />
                  </span>
                  <div className="user-info">
                    <strong>
                      {s.name} {s.enabled ? <Badge tone="green">Ligado</Badge> : <Badge>Desligado</Badge>}
                    </strong>
                    <small style={{ fontFamily: 'ui-monospace, Consolas, monospace', wordBreak: 'break-all' }}>
                      {s.code.length > 140 ? `${s.code.slice(0, 140)}…` : s.code}
                    </small>
                  </div>
                  <div className="menu-actions">
                    <button type="button" className="btn is-small" onClick={() => toggle(s)}>
                      <Icon name={s.enabled ? 'eyeOff' : 'eye'} size={15} /> {s.enabled ? 'Desligar' : 'Ligar'}
                    </button>
                    <button type="button" className="btn is-small" onClick={() => setForm(s)}>
                      <Icon name="edit" size={15} /> Editar
                    </button>
                    <button type="button" className="btn is-small is-danger-ghost" onClick={() => remove(s)} aria-label={`Remover ${s.name}`}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
      {form && <ScriptForm script={form === 'new' ? null : form} onClose={() => setForm(null)} onSave={saveForm} />}
    </>
  )
}

function ScriptForm({ script, onClose, onSave }: { script: TrackingScript | null; onClose: () => void; onSave: (s: TrackingScript) => Promise<void> }) {
  const [name, setName] = useState(script?.name ?? '')
  const [code, setCode] = useState(script?.code ?? '')
  const [place, setPlace] = useState<'head' | 'body'>(script?.place ?? 'head')
  const [busy, setBusy] = useState(false)
  const looksHtml = /<\s*(script|noscript|img|iframe)\b/i.test(code)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!looksHtml) return
    setBusy(true)
    await onSave({
      id: script?.id ?? `${name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'codigo'}-${Date.now().toString(36)}`,
      name: name.trim() || 'Código',
      code: code.trim(),
      enabled: script?.enabled ?? true,
      place,
    })
    setBusy(false)
  }

  return (
    <Modal onClose={onClose} labelledBy="sc-title">
      <form onSubmit={submit} className="user-form">
        <h2 id="sc-title" className="modal-title">
          {script ? `Editar “${script.name}”` : 'Adicionar código de monitoramento'}
        </h2>
        <p className="modal-lead">Cole o código exatamente como a ferramenta entrega, com as tags &lt;script&gt;.</p>
        <label className="field">
          <span>Nome (só para identificar aqui)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: RD Station, Google Tag Manager" required />
        </label>
        <label className="field">
          <span>Código</span>
          <textarea
            rows={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={'<script async src="https://…"></script>'}
            spellCheck={false}
            style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13 }}
            required
          />
          {code && !looksHtml && <small className="field-foot is-error">O código precisa ter a tag &lt;script&gt; (ou &lt;noscript&gt;/&lt;img&gt;/&lt;iframe&gt;).</small>}
        </label>
        <label className="field">
          <span>Onde entra</span>
          <select value={place} onChange={(e) => setPlace(e.target.value as 'head' | 'body')}>
            <option value="head">No &lt;head&gt; (padrão, o que a maioria das ferramentas pede)</option>
            <option value="body">No fim do &lt;body&gt;</option>
          </select>
        </label>
        <div className="modal-foot">
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn is-primary" disabled={busy || !looksHtml}>
            {busy ? 'Salvando…' : script ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
