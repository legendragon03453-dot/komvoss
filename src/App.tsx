import { Suspense, createContext, lazy, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Footer } from './sections'
import { Intro } from './Intro'
import { prefersReducedMotion, scrollToHash, scrollToTop, useSiteMotion, useSmoothScroll } from './motion'
import { SiteHeader } from './v2/Header'
import { ChapterBar } from './site/ChapterBar'
import { HomePage } from './pages/Home'
import { trackPageview } from './live/track'

// Páginas internas carregadas sob demanda: cada rota baixa só o próprio código.
const SolucoesPage = lazy(() => import('./pages/Solucoes').then((m) => ({ default: m.SolucoesPage })))
const SolucaoPage = lazy(() => import('./pages/SolucaoPage').then((m) => ({ default: m.SolucaoPage })))
const KomvosMindPage = lazy(() => import('./pages/KomvosMind').then((m) => ({ default: m.KomvosMindPage })))
const EcossistemaPage = lazy(() => import('./pages/Ecossistema').then((m) => ({ default: m.EcossistemaPage })))
const ClientesPage = lazy(() => import('./pages/Clientes').then((m) => ({ default: m.ClientesPage })))
const InsightsPage = lazy(() => import('./pages/Insights').then((m) => ({ default: m.InsightsPage })))
const ArtigoPage = lazy(() => import('./pages/Insights').then((m) => ({ default: m.ArtigoPage })))
const SobrePage = lazy(() => import('./pages/Sobre').then((m) => ({ default: m.SobrePage })))
const ContatoPage = lazy(() => import('./pages/Contato').then((m) => ({ default: m.ContatoPage })))
const ErpPage = lazy(() => import('./pages/Plataforma').then((m) => ({ default: m.ErpPage })))
const KomvosOsPage = lazy(() => import('./pages/Plataforma').then((m) => ({ default: m.KomvosOsPage })))
const ParceiroPage = lazy(() => import('./pages/Parceiro').then((m) => ({ default: m.ParceiroPage })))
const TrabalheConoscoPage = lazy(() => import('./pages/Trabalhe').then((m) => ({ default: m.TrabalheConoscoPage })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

const MOBILE_QUERY = '(max-width: 900px)'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const update = () => setMobile(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}

/* Avisa o App quando o conteúdo da rota foi montado (inclusive páginas carregadas sob demanda),
   para que animações, capítulos e âncoras só sejam montados com a página já na tela. */
const MountedContext = createContext<(path: string) => void>(() => {})

function MountSignal() {
  const onMounted = useContext(MountedContext)
  const { pathname } = useLocation()
  useLayoutEffect(() => onMounted(pathname), [onMounted, pathname])
  return null
}

/* Páginas internas: layout responsivo em fluxo + footer. */
function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="page">{children}</main>
      <Footer />
      <MountSignal />
    </>
  )
}

/* A intro só toca quando o site é aberto pela Home, uma vez por sessão. */
function shouldPlayIntro() {
  if (prefersReducedMotion() || window.location.pathname !== '/' || window.top !== window) return false
  try {
    return !sessionStorage.getItem('komvos-intro')
  } catch {
    return true
  }
}
const PLAY_INTRO = shouldPlayIntro()

export default function App() {
  const isMobile = useIsMobile()
  const { pathname, hash } = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const [showIntro, setShowIntro] = useState(PLAY_INTRO)
  const [revealed, setRevealed] = useState(!PLAY_INTRO)
  const [mountedPath, setMountedPath] = useState('')
  const headerOffset = isMobile ? -72 : -100

  useSmoothScroll(!revealed, headerOffset)

  // Troca de página: volta ao topo antes de a nova página aparecer.
  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    scrollToTop()
  }, [pathname])

  // estatísticas do painel: página vista
  useEffect(() => trackPageview(pathname), [pathname])

  // Animações da página atual, montadas quando o conteúdo dela está no DOM.
  useSiteMotion(rootRef, isMobile, revealed, mountedPath)

  // Links com âncora (ex.: /ecossistema#statum) rolam até a seção depois da renderização.
  useEffect(() => {
    if (hash && mountedPath === pathname) requestAnimationFrame(() => scrollToHash(hash, headerOffset))
  }, [mountedPath, pathname, hash, headerOffset])

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])

  const endIntro = () => {
    setShowIntro(false)
    try {
      sessionStorage.setItem('komvos-intro', '1')
    } catch {
      /* armazenamento indisponível: a intro pode voltar a tocar */
    }
  }

  return (
    <MountedContext.Provider value={setMountedPath}>
      <div ref={rootRef} className={isMobile ? 'site mobile' : 'site'}>
        <SiteHeader />

        <Suspense fallback={<div className="route-loading" aria-hidden="true" />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HomePage isMobile={isMobile} />
                  <MountSignal />
                </>
              }
            />
            <Route path="/solucoes" element={<Page><SolucoesPage /></Page>} />
            <Route path="/solucoes/:slug" element={<Page><SolucaoPage /></Page>} />
            <Route path="/erp-by-senior" element={<Page><ErpPage /></Page>} />
            <Route path="/komvos-os" element={<Page><KomvosOsPage /></Page>} />
            <Route path="/komvos-mind" element={<Page><KomvosMindPage /></Page>} />
            <Route path="/ecossistema" element={<Page><EcossistemaPage /></Page>} />
            <Route path="/clientes" element={<Page><ClientesPage /></Page>} />
            <Route path="/insights" element={<Page><InsightsPage /></Page>} />
            <Route path="/insights/:slug" element={<Page><ArtigoPage /></Page>} />
            <Route path="/sobre" element={<Page><SobrePage /></Page>} />
            <Route path="/contato" element={<Page><ContatoPage /></Page>} />
            <Route path="/seja-um-parceiro" element={<Page><ParceiroPage /></Page>} />
            <Route path="/trabalhe-conosco" element={<Page><TrabalheConoscoPage /></Page>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </Suspense>

        <ChapterBar key={isMobile ? 'm' : 'd'} root={rootRef} pathname={mountedPath} hidden={!revealed} />

        {showIntro && <Intro onReveal={() => setRevealed(true)} onDone={endIntro} />}
      </div>
    </MountedContext.Provider>
  )
}
