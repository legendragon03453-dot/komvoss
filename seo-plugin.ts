import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { OG_IMAGE, ROUTES, SITE_NAME, SITE_URL, organizationLd } from './src/seo/routes'
import type { RouteSeo } from './src/seo/routes'

/*
 * SEO no build: o site é um app React (o conteúdo é montado no navegador), então robôs e redes
 * sociais leriam o mesmo HTML em todas as páginas. Aqui, depois do build, geramos um HTML por rota
 * com título, descrição, canonical, Open Graph, Twitter e dados estruturados (JSON-LD), além do
 * sitemap.xml e do robots.txt. Com "cleanUrls" na Vercel, /solucoes serve dist/solucoes.html.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function headTags(r: RouteSeo) {
  const url = SITE_URL + (r.path === '/' ? '' : r.path)
  const img = SITE_URL + OG_IMAGE
  const ld = [organizationLd, ...(r.jsonLd ?? [])]
  return [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    `<meta property="og:type" content="${r.ogType ?? 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Grupo Komvos – Tecnologia que transforma" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ')
}

export function seoPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'komvos-seo',
    apply: 'build',
    configResolved(c) {
      outDir = path.resolve(c.root, c.build.outDir)
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html')
      const base = fs.readFileSync(indexFile, 'utf8')
      if (!base.includes('<!--seo-->')) throw new Error('index.html sem o marcador <!--seo-->')

      for (const r of ROUTES) {
        const html = base.replace('<!--seo-->', headTags(r))
        const file = r.path === '/' ? indexFile : path.join(outDir, r.path.slice(1) + '.html')
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
      }

      // páginas inexistentes: a Vercel serve 404.html com status 404; o app mostra a tela "não encontrada"
      const notFound = base.replace(
        '<!--seo-->',
        '<title>Página não encontrada | Grupo Komvos</title>\n    <meta name="robots" content="noindex" />',
      )
      fs.writeFileSync(path.join(outDir, '404.html'), notFound)

      const today = new Date().toISOString().slice(0, 10)
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...ROUTES.map(
          (r) =>
            `  <url><loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority.toFixed(1)}</priority></url>`,
        ),
        '</urlset>',
        '',
      ].join('\n')
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap)
      fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /painel\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
    },
  }
}
