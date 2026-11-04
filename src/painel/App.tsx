import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { DEMO, finishTour, getMe, resetPassword, sb, signIn, signOut } from './db'
import type { Me } from './db'
import { clearDemo } from './seed'
import { ConfirmProvider, Icon, Loading, ToastProvider, useConfirm } from './ui'
import { Tour } from './Tour'
import type { TourStep } from './Tour'
import { Overview } from './pages/Overview'
import { Leads } from './pages/Leads'
import { Stats } from './pages/Stats'
import { SiteEditor } from './pages/SiteEditor'
import { Blog } from './pages/Blog'
import { Users } from './pages/Users'

/*
 * Painel do site Grupo Komvos (/painel). Navegação por "#/seção" para funcionar em qualquer hospedagem.
 */

const NAV = [
  { id: 'visao-geral', label: 'Visão geral', icon: 'home' },
  { id: 'editar-site', label: 'Gerenciar site', icon: 'edit' },
  { id: 'blog', label: 'Blog e artigos', icon: 'blog' },
  { id: 'leads', label: 'Captura de leads', icon: 'leads' },
  { id: 'estatisticas', label: 'Estatísticas', icon: 'stats' },
  { id: 'usuarios', label: 'Usuários', icon: 'users', admin: true },
] as const
type Section = (typeof NAV)[number]['id']

function useHashRoute(): [Section, string, (s: string) => void] {
  const read = () => {
    const [sec = 'visao-geral', ...rest] = location.hash.replace(/^#\/?/, '').split('/')
    return [(NAV.some((n) => n.id === sec) ? sec : 'visao-geral') as Section, rest.join('/')] as const
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((s: string) => {
    if (location.hash !== `#/${s}`) location.hash = `#/${s}`
  }, [])
  return [route[0], route[1], go]
}

export function PainelApp() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthGate />
      </ConfirmProvider>
    </ToastProvider>
  )
}

function AuthGate() {
  const [state, setState] = useState<'loading' | 'out' | 'denied' | 'error' | 'in'>('loading')
  const [me, setMe] = useState<Me | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const check = async () => {
      if (sb) {
        const s = (await sb.auth.getSession()).data.session
        if (!s) return setState('out')
        setEmail(s.user.email ?? '')
      }
      try {
        const m = await getMe()
        setMe(m)
        setState(m ? 'in' : 'denied')
      } catch (e) {
        setError((e as Error).message)
        setState('error')
      }
    }
    check()
    if (!sb) return
    const { data } = sb.auth.onAuthStateChange((ev) => {
      if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT') check()
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (state === 'loading') return <Loading text="Abrindo o painel…" />
  if (state === 'out') return <Login />
  if (state !== 'in' || !me)
    return (
      <div className="login">
        <div className="login-card">
          <Brand />
          <h1>{state === 'error' ? 'Quase lá' : 'Sem acesso'}</h1>
          {state === 'error' ? (
            <p>{error}</p>
          ) : (
            <p>
              O e-mail <strong>{email}</strong> entrou, mas não tem permissão no painel. Peça para um administrador geral liberar o seu acesso em
              Usuários.
            </p>
          )}
          <button type="button" className="btn" onClick={() => signOut()}>
            Sair
          </button>
        </div>
      </div>
    )
  return <Shell me={me} />
}

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`brand${dark ? ' is-dark' : ''}`}>
      <img src={dark ? '/assets/logo-komvos-branco.webp' : '/assets/logo-komvos-prata.webp'} alt="Grupo Komvos" width={170} height={40} />
      <span>Painel do site</span>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function forgot() {
    if (!email) return setError('Digite seu e-mail acima para receber o link.')
    try {
      await resetPassword(email.trim())
      setInfo('Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="login">
      <div className="login-art" aria-hidden="true">
        <span className="login-grid" />
        <span className="login-orb is-1" />
        <span className="login-orb is-2" />
        <span className="login-orb is-3" />
      </div>
      <form className="login-card" onSubmit={submit}>
        <Brand />
        <h1>Bem-vindo de volta</h1>
        <p>Entre para gerenciar o site, o blog e os contatos do Grupo Komvos.</p>
        <label className="field">
          <span>E-mail</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus placeholder="voce@empresa.com.br" />
        </label>
        <label className="field">
          <span>Senha</span>
          <div className="pass">
            <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
              <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </label>
        {error && <p className="form-msg is-error">{error}</p>}
        {info && <p className="form-msg">{info}</p>}
        <button type="submit" className="btn is-primary is-block is-big" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar no painel'}
        </button>
        <button type="button" className="link-btn" onClick={forgot}>
          Esqueci minha senha
        </button>
      </form>
    </div>
  )
}

function tourSteps(isAdmin: boolean): TourStep[] {
  return [
    {
      title: 'Bem-vindo ao painel do site Komvos 👋',
      icon: 'star',
      body: (
        <p>
          Aqui você cuida do site sem mexer em código: troca textos e imagens, publica artigos, acompanha os contatos e vê como as pessoas usam o
          site. Vamos dar uma volta rápida (leva 1 minuto).
        </p>
      ),
    },
    {
      target: 'nav-visao-geral',
      route: 'visao-geral',
      icon: 'home',
      title: 'Visão geral',
      body: <p>O resumo do site: visitas, de onde as pessoas vêm, quantas viraram contato e os leads mais recentes.</p>,
    },
    {
      target: 'nav-editar-site',
      route: 'editar-site/paginas',
      icon: 'edit',
      title: 'Gerenciar site',
      body: (
        <p>
          Mude títulos, textos, banners, imagens e o menu. Tudo com <strong>pré-visualização ao vivo</strong>: você vê o site mudando enquanto
          digita, e nada vai ao ar até clicar em <strong>Publicar</strong>.
        </p>
      ),
    },
    {
      target: 'editor-preview',
      route: 'editar-site/paginas',
      icon: 'eye',
      title: 'A pré-visualização',
      body: <p>Clique em qualquer campo e o trecho correspondente acende aqui, na página de verdade. Dá para ver no computador ou no celular.</p>,
    },
    {
      target: 'nav-blog',
      route: 'blog',
      icon: 'blog',
      title: 'Blog e artigos',
      body: (
        <p>
          Crie artigos montando blocos, no estilo <strong>arrastar e soltar</strong>: títulos, parágrafos, imagens, botões, vídeos do YouTube,
          links e a tag de quem escreveu. Também dá para ocultar, destacar ou excluir.
        </p>
      ),
    },
    {
      target: 'nav-leads',
      route: 'leads',
      icon: 'leads',
      title: 'Captura de leads',
      body: <p>Todo formulário enviado no site chega aqui. Marque o andamento (novo, em contato, virou cliente), anote e exporte em planilha.</p>,
    },
    {
      target: 'nav-estatisticas',
      route: 'estatisticas/origem',
      icon: 'stats',
      title: 'Estatísticas',
      body: <p>Por onde as pessoas entram (Google, Instagram, LinkedIn…), em que página chegam, de que cidade são e o mapa de calor dos cliques.</p>,
    },
    ...(isAdmin
      ? [
          {
            target: 'nav-usuarios',
            route: 'usuarios',
            icon: 'users',
            title: 'Usuários',
            body: <p>Dê acesso ao painel para outras pessoas da equipe, escolha o que cada uma pode fazer e troque senhas.</p>,
          },
        ]
      : []),
    {
      target: 'side-help',
      icon: 'help',
      title: 'Pronto!',
      body: <p>Se quiser rever este tutorial, é só clicar em “Ver tutorial” aqui embaixo. Bom trabalho!</p>,
    },
  ]
}

function Shell({ me }: { me: Me }) {
  const [section, sub, go] = useHashRoute()
  const [open, setOpen] = useState(false)
  const [tour, setTour] = useState(!me.tour_done)
  const confirm = useConfirm()
  const isAdmin = me.role === 'admin'
  useEffect(() => setOpen(false), [section])
  const nav = NAV.filter((n) => !('admin' in n) || isAdmin)

  async function resetDemo() {
    const ok = await confirm({
      title: 'Limpar a demonstração?',
      consequences: [
        'Apaga os dados de exemplo e tudo o que você testou aqui (leads, edições do site e artigos).',
        'O site deste navegador volta ao conteúdo original.',
      ],
      confirm: 'Limpar demonstração',
      danger: true,
    })
    if (!ok) return
    clearDemo(true)
    location.reload()
  }

  const closeTour = (done: boolean) => {
    setTour(false)
    finishTour().catch(() => {})
    if (done) go('visao-geral')
  }

  return (
    <div className={`shell${open ? ' is-nav-open' : ''}`}>
      <aside className="side">
        <div className="side-brand">
          <img src="/assets/logo-komvos-branco.webp" alt="Grupo Komvos" width={150} height={35} />
          <span>Painel</span>
        </div>
        <nav aria-label="Seções do painel">
          {nav.map((n) => (
            <a key={n.id} href={`#/${n.id}`} data-tour={`nav-${n.id}`} className={n.id === section ? 'is-on' : ''} aria-current={n.id === section ? 'page' : undefined}>
              <Icon name={n.icon} />
              {n.label}
            </a>
          ))}
        </nav>
        <div className="side-foot" data-tour="side-help">
          <button type="button" onClick={() => setTour(true)}>
            <Icon name="help" size={16} /> Ver tutorial
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="side-site">
            <Icon name="link" size={16} /> Ver o site
          </a>
          {DEMO ? (
            <button type="button" onClick={resetDemo}>
              <Icon name="undo" size={16} /> Limpar demonstração
            </button>
          ) : (
            <div className="side-me">
              <span className="side-avatar">{(me.name || me.email)[0]?.toUpperCase()}</span>
              <span>
                <strong>{me.name || me.email.split('@')[0]}</strong>
                <small>{isAdmin ? 'Administrador geral' : 'Editor'}</small>
              </span>
              <button type="button" onClick={() => signOut()} aria-label="Sair" title="Sair">
                <Icon name="out" size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button type="button" className="burger" onClick={() => setOpen((v) => !v)} aria-label="Abrir menu do painel" aria-expanded={open}>
            <Icon name="menu" />
          </button>
          <img src="/assets/logo-komvos-branco.webp" alt="Grupo Komvos" width={120} height={28} />
        </div>
        {DEMO && (
          <div className="demo-bar">
            <Icon name="alert" size={16} />
            <span>
              <strong>Modo demonstração.</strong> Os números são exemplos e tudo fica salvo só neste navegador.
            </span>
          </div>
        )}
        <main className="content">
          {section === 'visao-geral' && <Overview go={go} />}
          {section === 'leads' && <Leads />}
          {section === 'estatisticas' && <Stats tab={sub} go={go} />}
          {section === 'editar-site' && <SiteEditor tab={sub} go={go} />}
          {section === 'blog' && <Blog />}
          {section === 'usuarios' && isAdmin && <Users />}
        </main>
      </div>
      <button type="button" className="scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} />
      {tour && <Tour steps={tourSteps(isAdmin)} onClose={closeTour} onRoute={go} />}
    </div>
  )
}
