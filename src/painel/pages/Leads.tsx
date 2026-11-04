import { useMemo, useState } from 'react'
import { deleteLead, leadFileUrl, listLeads, updateLead } from '../db'
import type { Lead, LeadStatus } from '../db'
import { num, pageName } from '../stats'
import { Badge, Card, Icon, Kpi, Loading, Modal, PageHead, fmtDate, useConfirm, useData, useToast } from '../ui'

export const STATUS: Record<LeadStatus, { label: string; tone: 'blue' | 'amber' | 'pink' | 'green' | 'neutral' }> = {
  novo: { label: 'Novo', tone: 'blue' },
  em_contato: { label: 'Em contato', tone: 'amber' },
  qualificado: { label: 'Qualificado', tone: 'pink' },
  ganho: { label: 'Virou cliente', tone: 'green' },
  perdido: { label: 'Perdido', tone: 'neutral' },
}

const FIELD_LABEL: Record<string, string> = {
  nome: 'Nome',
  email: 'E-mail',
  telefone: 'Telefone',
  empresa: 'Empresa',
  cargo: 'Cargo',
  desafio: 'Desafio',
  mensagem: 'Mensagem',
  area: 'Área de interesse',
  linkedin: 'LinkedIn',
  curriculo: 'Currículo',
}

function toCsv(rows: Lead[]) {
  const cols = ['Data', 'Formulário', 'Status', 'Nome', 'E-mail', 'Telefone', 'Empresa', 'Cargo', 'Mensagem', 'Origem', 'Página', 'Anotações']
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((l) =>
    [fmtDate(l.created_at), l.form, STATUS[l.status]?.label, l.name, l.email, l.phone, l.company, l.role, l.message, l.source, l.page, l.notes].map(esc).join(';'),
  )
  return '﻿' + [cols.map(esc).join(';'), ...lines].join('\r\n')
}

export function Leads() {
  const { data, error, reload, setData } = useData(listLeads)
  const [q, setQ] = useState('')
  const [form, setForm] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState<Lead | null>(null)

  const forms = useMemo(() => [...new Set((data ?? []).map((l) => l.form))].sort(), [data])
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (data ?? []).filter(
      (l) =>
        (!form || l.form === form) &&
        (!status || l.status === status) &&
        (!t || [l.name, l.email, l.company, l.phone, l.message, l.role].some((v) => v?.toLowerCase().includes(t))),
    )
  }, [data, q, form, status])

  const count = (s: LeadStatus) => (data ?? []).filter((l) => l.status === s).length

  function exportCsv() {
    const blob = new Blob([toCsv(list)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `leads-komvos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <PageHead
        title="Captura de leads"
        lead="Tudo o que chega pelos formulários do site: contato, seja um parceiro e trabalhe conosco."
        actions={
          <button type="button" className="btn" onClick={exportCsv} disabled={!list.length}>
            <Icon name="download" size={16} /> Exportar planilha
          </button>
        }
      />
      {error && <p className="form-msg is-error">{error}</p>}
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="kpis">
            <Kpi label="Total de leads" value={num(data.length)} />
            <Kpi label="Novos (sem resposta)" value={num(count('novo'))} />
            <Kpi label="Em contato" value={num(count('em_contato') + count('qualificado'))} />
            <Kpi label="Viraram clientes" value={num(count('ganho'))} />
          </div>

          <Card>
            <div className="filters">
              <label className="search">
                <Icon name="search" size={16} />
                <input placeholder="Buscar por nome, e-mail, empresa…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar leads" />
              </label>
              <select value={form} onChange={(e) => setForm(e.target.value)} aria-label="Formulário">
                <option value="">Todos os formulários</option>
                {forms.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
                <option value="">Todos os status</option>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {list.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quem</th>
                      <th>Formulário</th>
                      <th>Origem</th>
                      <th>Recebido</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((l) => (
                      <tr key={l.id} onClick={() => setOpen(l)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(l)}>
                        <td>
                          <strong>{l.name || 'Sem nome'}</strong>
                          <span>{[l.email, l.company].filter(Boolean).join(' · ')}</span>
                        </td>
                        <td>{l.form}</td>
                        <td>{l.source ?? '—'}</td>
                        <td>{fmtDate(l.created_at)}</td>
                        <td>
                          <Badge tone={STATUS[l.status]?.tone}>{STATUS[l.status]?.label ?? l.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty">{data.length ? 'Nenhum lead com esses filtros.' : 'Nenhum lead ainda. Eles aparecem aqui assim que alguém enviar um formulário do site.'}</p>
            )}
          </Card>
        </>
      )}

      {open && (
        <LeadDetail
          lead={open}
          onClose={() => setOpen(null)}
          onChange={(l) => {
            setOpen(l)
            setData((d) => d?.map((x) => (x.id === l.id ? l : x)) ?? null)
          }}
          onDeleted={() => {
            setOpen(null)
            reload()
          }}
        />
      )}
    </>
  )
}

function LeadDetail({ lead, onClose, onChange, onDeleted }: { lead: Lead; onClose: () => void; onChange: (l: Lead) => void; onDeleted: () => void }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [notes, setNotes] = useState(lead.notes ?? '')

  async function save(patch: Partial<Lead>, msg = 'Lead atualizado.') {
    try {
      await updateLead(lead.id, patch)
      onChange({ ...lead, ...patch })
      toast(msg)
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function remove() {
    const ok = await confirm({
      title: 'Excluir este lead?',
      consequences: [
        <>
          Os dados de <strong>{lead.name || lead.email || 'este contato'}</strong> somem do painel para sempre.
        </>,
        'Não dá para desfazer. Se quiser só tirar da frente, marque como "Perdido".',
        'Use a exclusão quando a pessoa pedir para apagar os dados (LGPD) ou for spam.',
      ],
      confirm: 'Excluir lead',
      danger: true,
    })
    if (!ok) return
    try {
      await deleteLead(lead.id)
      toast('Lead excluído.')
      onDeleted()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function openFile(v: string) {
    const url = await leadFileUrl(v.replace(/^arquivo:/, ''))
    if (url) window.open(url, '_blank', 'noopener')
    else toast('O arquivo só fica disponível com o Supabase conectado.', 'error')
  }

  const phone = lead.phone?.replace(/\D/g, '')
  const fields = Object.entries(lead.data ?? {})

  return (
    <Modal onClose={onClose} labelledBy="lead-title">
      <div className="lead">
        <span className="lead-form-name">{lead.form}</span>
        <h2 id="lead-title">{lead.name || 'Sem nome'}</h2>
        <p className="lead-meta">
          Recebido em {fmtDate(lead.created_at)}
          {lead.page && <> · enviado em {pageName(lead.page)}</>}
          {lead.source && <> · chegou por {lead.source}</>}
        </p>

        <div className="lead-actions">
          {lead.email && (
            <a className="btn" href={`mailto:${lead.email}`}>
              <Icon name="leads" size={16} /> Responder por e-mail
            </a>
          )}
          {phone && (
            <a className="btn" href={`https://wa.me/55${phone}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          )}
        </div>

        <dl className="lead-data">
          {(fields.length
            ? fields
            : (
                [
                  ['email', lead.email],
                  ['telefone', lead.phone],
                  ['empresa', lead.company],
                  ['cargo', lead.role],
                  ['mensagem', lead.message],
                ] as [string, string | null][]
              ).filter(([, v]) => v)
          ).map(([k, v]) => (
            <div key={k}>
              <dt>{FIELD_LABEL[k] ?? k}</dt>
              <dd>
                {String(v).startsWith('arquivo:') ? (
                  <button type="button" className="link-btn" onClick={() => openFile(String(v))}>
                    Baixar arquivo
                  </button>
                ) : (
                  String(v)
                )}
              </dd>
            </div>
          ))}
        </dl>

        <label className="field">
          <span>Status</span>
          <select value={lead.status} onChange={(e) => save({ status: e.target.value as LeadStatus }, 'Status atualizado.')}>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Anotações da equipe</span>
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: liguei dia 12, pediu proposta para março." />
        </label>
        <div className="lead-foot">
          <button type="button" className="btn is-danger-ghost" onClick={remove}>
            <Icon name="trash" size={16} /> Excluir
          </button>
          <button type="button" className="btn is-primary" disabled={notes === (lead.notes ?? '')} onClick={() => save({ notes }, 'Anotação salva.')}>
            Salvar anotação
          </button>
        </div>
      </div>
    </Modal>
  )
}
