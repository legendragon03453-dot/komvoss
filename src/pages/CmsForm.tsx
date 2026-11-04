import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitLead } from '../live/leads'

/** Campo de formulário descrito no CMS. */
export type Field = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'file'
  required?: boolean
  /** opções de um select */
  options?: string[]
  /** ocupa só meia linha (dois campos lado a lado) */
  half?: boolean
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

/**
 * Formulário montado a partir do CMS, com o mesmo visual do formulário de contato.
 * O envio vai para os leads do painel (src/live/leads.ts); `source` identifica o formulário.
 */
export function CmsForm({ form, id, anim = true, source = 'formulario' }: { form: FormContent; id?: string; anim?: boolean; source?: string }) {
  const { sent, sending, error, handleSubmit } = useLeadSubmit(source)

  // agrupa campos "half" consecutivos em linhas de dois
  const rows: Field[][] = []
  for (const f of form.fields) {
    const last = rows[rows.length - 1]
    if (f.half && last && last.length === 1 && last[0].half) last.push(f)
    else rows.push([f])
  }

  const input = (f: Field) => {
    const common = { name: f.name, required: f.required, autoComplete: f.autoComplete }
    if (f.type === 'textarea') return <textarea {...common} rows={3} />
    if (f.type === 'select')
      return (
        <select {...common} defaultValue="">
          <option value="" disabled>
            Selecione
          </option>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )
    if (f.type === 'file') return <input {...common} type="file" accept={f.accept} className="cms-file" />
    return <input {...common} type={f.type ?? 'text'} />
  }

  return (
    <form className="lead-form cms-form" id={id} data-anim={anim ? 'up' : undefined} onSubmit={handleSubmit}>
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
                {row.map((f) => (
                  <label key={f.name}>
                    {f.label}
                    {input(f)}
                  </label>
                ))}
              </div>
            ) : (
              <label key={row[0].name}>
                {row[0].label}
                {input(row[0])}
              </label>
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

  return { sent, sending, error, handleSubmit }
}
