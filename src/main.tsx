import './live/boot'
import { StrictMode, useEffect, useReducer } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import 'lenis/dist/lenis.css'
import './index.css'
import './motion.css'
import './mobile.css'
import './reels.css'
import './pages.css'
import './ref.css'
import './v2.css'
import './v2-motion.css'
import './atp.css'
import './shiny.css'
import './sp.css'
import './cms.css'
import './menu.css'
import './brand.css'
import './hero.css'
import './cards.css'
import './tweaks.css'
import './deck.css'
import './colors.css'
import { onContentChange, refreshContent } from './live/content'
import './live/blocks.css'

/** Busca as edições mais recentes do painel e, se algo mudou desde a última visita, atualiza a página. */
function Root() {
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    const off = onContentChange(rerender)
    refreshContent().catch(() => {})
    return off
  }, [])
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
