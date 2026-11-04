import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { seoPlugin } from './seo-plugin'
import { siteImagesPlugin } from './site-images-plugin'

export default defineConfig({
  plugins: [react(), seoPlugin(), siteImagesPlugin()],
  build: {
    rollupOptions: {
      // duas páginas: o site (index.html) e o painel administrativo (painel.html → /painel)
      input: { main: 'index.html', painel: 'painel.html' },
      output: {
        // Bibliotecas em arquivos próprios: mudam pouco e ficam no cache do navegador entre atualizações do site.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['gsap', '@gsap/react', 'lenis'],
        },
      },
    },
  },
})
