import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitLead } from '../live/leads'

/** Tipos de campo que o painel oferece (Editar site → página → Formulário). */
export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'consent'
  | 'file'

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'email', label: 'E-mail' },
  { value: 'tel', label: 'Telefone' },
  { value: 'url', label: 'Link (site, LinkedIn…)' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Lista suspensa (uma opção)' },
  { value: 'radio', label: 'Seleção única (bolinhas)' },
  { value: 'checkbox', label: 'Múltipla escolha (caixas)' },
  { value: 'consent', label: 'Caixa de seleção única (ex.: aceite)' },
  { value: 'file', label: 'Envio de arquivo' },
]

/** Campo de formulário descrito no CMS (e editável pelo painel). */
export type Field = {
  /** chave do dado no lead; campos criados no painel não têm e usam o rótulo */
  name?: string
  label: string
  type?: FieldType
  required?: boolean | string
  /** opções de lista/seleção/múltipla escolha: lista ou texto com uma opção por linha (vindo do painel) */
  options?: string[] | string
  /** ocupa só meia linha (dois campos lado a lado) */
  half?: boolean | string
  /** texto de ajuda dentro do campo */
  placeholder?: string
  /** tipos aceitos num envio de arquivo, ex. ".pdf,.doc,.docx" */
  accept?: string
  autoComplete?: string
}

export type FormContent = {
  fields: Field[]
  submit: string
  doneTitle: string
  doneText: string
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'campo'

const yes = (v: unknown) => v === true || v === 'true'

export const optionsOf = (f: Field) =>
  (Array.isArray(f.options) ? f.options : String(f.options ?? '').split('\n'))
    .map((o) => o.trim())
    .filter(Boolean)

/** Nome de cada campo (único no formulário). */
function named(fields: Field[]) {
  const used = new Set<string>()
  return fields
    .filter((f) => f && String(f.label ?? '').trim())
    .map((f) => {
      let n = f.name?.trim() || slug(f.label)
      for (let i = 2; used.has(n); i++) n = `${f.name?.trim() || slug(f.label)}_${i}`
      used.add(n)
      return { ...f, name: n, required: yes(f.required), half: yes(f.half) }
    })
}

/**
 * Formulário montado a partir do CMS, com o mesmo visual do formulário de contato.
 * O envio vai para os leads do painel (src/live/leads.ts) e por e-mail; `source` identifica o formulário.
 */
export function CmsForm({
  form,
  id,
  anim = 'up',
  source = 'formulario',
  plain = false,
}: {
  form: FormContent
  id?: string
  anim?: 'up' | 'right' | false | true
  source?: string
  /** sem a caixa escura (formulário dentro de um painel claro) */
  plain?: boolean
}) {
  const fields = named(form.fields ?? [])
  const { sent, sending, error, setError, handleSubmit } = useLeadSubmit(source)

  // agrupa campos "half" consecutivos em linhas de dois
  const rows: (typeof fields)[] = []
  for (const f of fields) {
    const last = rows[rows.length - 1]
    if (f.half && last && last.length === 1 && last[0].half) last.push(f)
    else rows.push([f])
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // múltipla escolha obrigatória: pelo menos uma caixa marcada
    const fd = new FormData(e.currentTarget)
    const missing = fields.find((f) => f.type === 'checkbox' && f.required && !fd.getAll(f.name).length)
    if (missing) {
      e.preventDefault()
      setError(`Marque pelo menos uma opção em “${missing.label}”.`)
      return
    }
    handleSubmit(e)
  }

  const control = (f: (typeof fields)[number]) => {
    const common = { name: f.name, required: f.required, autoComplete: f.autoComplete, placeholder: f.placeholder || undefined }
    const opts = optionsOf(f)
    switch (f.type) {
      case 'textarea':
        return <textarea {...common} rows={3} />
      case 'select':
        return (
          <select name={f.name} required={f.required} defaultValue="">
            <option value="" disabled>
              {f.placeholder || 'Selecione'}
            </option>
            {opts.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        )
      case 'radio':
      case 'checkbox':
        return (
          <span className="form-choices" role={f.type === 'radio' ? 'radiogroup' : 'group'} aria-label={f.label}>
            {opts.map((o) => (
              <label key={o} className="form-choice">
                <input type={f.type} name={f.name} value={o} required={f.type === 'radio' ? f.required : undefined} />
                <span>{o}</span>
              </label>
            ))}
          </span>
        )
      case 'file':
        return <input {...common} type="file" accept={f.accept} className="cms-file" />
      default:
        return <input {...common} type={f.type ?? 'text'} />
    }
  }

  const field = (f: (typeof fields)[number]) =>
    f.type === 'consent' ? (
      <label key={f.name} className="form-choice is-consent">
        <input type="checkbox" name={f.name} value="Sim" required={f.required} />
        <span>{f.label}</span>
      </label>
    ) : f.type === 'radio' || f.type === 'checkbox' ? (
      // grupo de opções: o rótulo do grupo não pode envolver as caixas (cada uma tem o seu)
      <div key={f.name} className="form-group">
        <span className="form-group-label">
          {f.label}
          {f.required && <span aria-hidden="true"> *</span>}
        </span>
        {control(f)}
      </div>
    ) : (
      <label key={f.name}>
        {f.label}
        {control(f)}
      </label>
    )

  return (
    <form
      className={`lead-form${plain ? '' : ' cms-form'}`}
      id={id}
      data-anim={anim === true ? 'up' : anim || undefined}
      onSubmit={onSubmit}
    >
      {sent ? (
        <div className="form-done">
          <h3>{form.doneTitle}</h3>
          <p>{form.doneText}</p>
        </div>
      ) : (
        <>
          {rows.map((row) =>
            row.length === 2 ? (
              <div key={row[0].name} className="form-row">
                {row.map(field)}
              </div>
            ) : (
              field(row[0])
            ),
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="form-submit" disabled={sending} aria-busy={sending}>
            <span>{sending ? 'Enviando…' : form.submit}</span>
            <span className="form-submit-box">
              <img src="/assets/v2/arrow-light.svg" alt="" width={27.2797} height={18.2624} />
            </span>
          </button>
        </>
      )}
    </form>
  )
}

/** Estado de envio compartilhado pelos formulários do site. */
export function useLeadSubmit(source: string) {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setError('')
    try {
      await submitLead(source, e.currentTarget)
      setSent(true)
    } catch (err) {
      const msg = err instanceof Error && err.message.startsWith('Arquivo') ? err.message : ''
      setError(msg || 'Não foi possível enviar agora. Tente de novo em instantes ou fale com a gente por e-mail.')
    } finally {
      setSending(false)
    }
  }

  return { sent, sending, error, setError, handleSubmit }
}
