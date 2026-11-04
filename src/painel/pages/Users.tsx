import { useState } from 'react'
import type { FormEvent } from 'react'
import { usersApi } from '../db'
import type { PanelUser, Role } from '../db'
import { Badge, Card, Icon, Kpi, Loading, Modal, PageHead, fmtDate, useConfirm, useData, useToast } from '../ui'

const ROLE: Record<Role, { label: string; text: string }> = {
  admin: { label: 'Administrador geral', text: 'Tudo, inclusive dar e tirar acesso de outras pessoas.' },
  editor: { label: 'Editor', text: 'Gerencia site, blog, leads e estatísticas. Não mexe em usuários.' },
}

/** Senha forte gerada para o primeiro acesso. */
function genPassword() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const r = crypto.getRandomValues(new Uint32Array(12))
  return 'Kv-' + [...r].map((n) => a[n % a.length]).join('')
}

export function Users() {
  const { data, error, reload } = useData(() => usersApi<{ me: string; users: PanelUser[] }>('list'))
  const [form, setForm] = useState<'new' | PanelUser | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  async function changeRole(u: PanelUser, role: Role) {
    if (role === u.role) return
    const ok = await confirm({
      title: `Mudar o acesso de ${u.name || u.email}?`,
      consequences: [
        <>
          Passa a ser <strong>{ROLE[role].label}</strong>: {ROLE[role].text}
        </>,
        'Vale a partir da próxima vez que a pessoa abrir o painel.',
      ],
      confirm: 'Mudar acesso',
    })
    if (!ok) return
    try {
      await usersApi('update', { email: u.email, role })
      toast('Acesso atualizado.')
      reload()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  async function remove(u: PanelUser) {
    const ok = await confirm({
      title: `Remover ${u.name || u.email}?`,
      consequences: [
        'A pessoa perde o acesso ao painel na hora e o login dela é apagado.',
        'O que ela já publicou no site e no blog continua no ar.',
        'Para voltar a ter acesso, será preciso criar o usuário de novo.',
      ],
      confirm: 'Remover acesso',
      danger: true,
      typeToConfirm: u.email,
    })
    if (!ok) return
    try {
      await usersApi('delete', { email: u.email })
      toast('Acesso removido.')
      reload()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <>
      <PageHead
        title="Usuários do painel"
        lead="Quem pode entrar aqui e o que cada pessoa pode fazer."
        actions={
          <button type="button" className="btn is-primary" onClick={() => setForm('new')}>
            <Icon name="plus" size={16} /> Novo usuário
          </button>
        }
      />
      {error && <p className="form-msg is-error">{error}</p>}
      {!data && !error ? (
        <Loading />
      ) : data ? (
        <>
          <div className="kpis">
            <Kpi label="Pessoas com acesso" value={String(data.users.length)} />
            <Kpi label="Administradores gerais" value={String(data.users.filter((u) => u.role === 'admin').length)} />
            <Kpi label="Editores" value={String(data.users.filter((u) => u.role === 'editor').length)} />
            <Kpi label="Nunca entraram" value={String(data.users.filter((u) => !u.last_sign_in_at).length)} />
          </div>
          <div className="role-cards">
            {(Object.keys(ROLE) as Role[]).map((r) => (
              <div key={r} className={`role-card is-${r}`}>
                <Icon name={r === 'admin' ? 'star' : 'edit'} size={18} />
                <strong>{ROLE[r].label}</strong>
                <span>{ROLE[r].text}</span>
              </div>
            ))}
          </div>
          <Card>
            <ul className="user-list">
              {data.users.map((u) => {
                const self = u.email.toLowerCase() === data.me
                return (
                  <li key={u.email}>
                    <span className={`user-avatar is-${u.role}`}>{(u.name || u.email)[0]?.toUpperCase()}</span>
                    <div className="user-info">
                      <strong>
                        {u.name || u.email.split('@')[0]} {self && <Badge tone="dark">Você</Badge>}
                      </strong>
                      <span>{u.email}</span>
                      <small>
                        {u.last_sign_in_at ? `Último acesso: ${fmtDate(u.last_sign_in_at)}` : 'Ainda não entrou'}
                        {u.created_by ? ` · criado por ${u.created_by}` : ''}
                      </small>
                    </div>
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value as Role)} disabled={self} aria-label={`Acesso de ${u.email}`}>
                      {(Object.keys(ROLE) as Role[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE[r].label}
                        </option>
                      ))}
                    </select>
                    <div className="menu-actions">
                      <button type="button" className="btn is-small" onClick={() => setForm(u)}>
                        <Icon name="key" size={15} /> Senha
                      </button>
                      {!self && (
                        <button type="button" className="btn is-small is-danger-ghost" onClick={() => remove(u)} aria-label={`Remover ${u.email}`}>
                          <Icon name="trash" size={15} />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
        </>
      ) : null}
      {form && (
        <UserForm
          user={form === 'new' ? null : form}
          onClose={() => setForm(null)}
          onDone={() => {
            setForm(null)
            reload()
          }}
        />
      )}
    </>
  )
}

function UserForm({ user, onClose, onDone }: { user: PanelUser | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const [email, setEmail] = useState(user?.email ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [role, setRole] = useState<Role>(user?.role ?? 'editor')
  const [password, setPassword] = useState(genPassword)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (user) await usersApi('password', { email: user.email, password })
      else await usersApi('create', { email: email.trim(), name: name.trim(), role, password })
      setDone(true)
    } catch (err) {
      toast((err as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const message = `Seu acesso ao painel do site Komvos:\n${location.origin}/painel\nE-mail: ${user?.email ?? email.trim()}\nSenha: ${password}\n(troque a senha depois do primeiro acesso, em "Esqueci minha senha")`

  if (done)
    return (
      <Modal onClose={onDone} labelledBy="u-done" small>
        <div className="confirm">
          <span className="confirm-icon is-ok">
            <Icon name="star" size={22} />
          </span>
          <h2 id="u-done">{user ? 'Senha trocada!' : 'Usuário criado!'}</h2>
          <p className="confirm-lead">Envie estes dados para a pessoa (a senha não aparece de novo):</p>
          <pre className="credentials">{message}</pre>
          <div className="confirm-actions">
            <button
              type="button"
              className="btn"
              onClick={() => {
                navigator.clipboard?.writeText(message)
                toast('Copiado.')
              }}
            >
              <Icon name="copy" size={16} /> Copiar
            </button>
            <button type="button" className="btn is-primary" onClick={onDone}>
              Concluir
            </button>
          </div>
        </div>
      </Modal>
    )

  return (
    <Modal onClose={onClose} labelledBy="u-title" small>
      <form onSubmit={submit} className="user-form">
        <h2 id="u-title" className="modal-title">
          {user ? `Nova senha para ${user.name || user.email}` : 'Novo usuário do painel'}
        </h2>
        <p className="modal-lead">{user ? 'A senha antiga deixa de funcionar na hora.' : 'A pessoa entra com este e-mail e a senha abaixo.'}</p>
        {!user && (
          <>
            <label className="field">
              <span>Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Ana Ribeiro" />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana@grupokomvos.com.br" />
            </label>
            <div className="field">
              <span>O que pode fazer</span>
              <div className="role-pick">
                {(Object.keys(ROLE) as Role[]).map((r) => (
                  <label key={r} className={role === r ? 'is-on' : ''}>
                    <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} />
                    <strong>{ROLE[r].label}</strong>
                    <span>{ROLE[r].text}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
        <label className="field">
          <span>Senha {user ? 'nova' : 'inicial'}</span>
          <div className="pass">
            <input value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            <button type="button" onClick={() => setPassword(genPassword())} title="Gerar outra">
              <Icon name="undo" size={16} />
            </button>
          </div>
          <small className="field-foot">Pelo menos 8 caracteres. Já deixamos uma senha forte gerada.</small>
        </label>
        <div className="modal-foot">
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn is-primary" disabled={busy}>
            {busy ? 'Salvando…' : user ? 'Trocar senha' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
