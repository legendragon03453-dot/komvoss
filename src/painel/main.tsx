import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PainelApp } from './App'
import './painel.css'
import './brand.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PainelApp />
  </StrictMode>,
)
