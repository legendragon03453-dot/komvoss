import { applyCached } from './content'
import { startTracking } from './track'
import { startPreview } from './preview'

/* Primeiro módulo do site (ver main.tsx): aplica as edições do painel guardadas no navegador antes de
   qualquer componente ler o CMS, liga as estatísticas e, dentro do painel, a pré-visualização ao vivo. */
applyCached()
startTracking()
startPreview()
