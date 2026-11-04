import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/*
 * Módulo virtual "virtual:site-images": a lista de imagens de public/assets, com tamanho do arquivo e
 * em quais arquivos do código cada uma aparece. O painel usa essa lista em "Editar site → Imagens".
 */

const ID = 'virtual:site-images'
const EXT = /\.(webp|png|jpe?g|svg|gif|avif)$/i

function walk(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

export function siteImagesPlugin(): Plugin {
  let root = process.cwd()
  return {
    name: 'komvos-site-images',
    configResolved(c) {
      root = c.root
    },
    resolveId(id) {
      if (id === ID) return '\0' + ID
    },
    load(id) {
      if (id !== '\0' + ID) return
      const pub = path.join(root, 'public')
      const sources = walk(path.join(root, 'src'))
        .filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes(`${path.sep}painel${path.sep}`))
        .map((f) => ({ file: path.relative(root, f).split(path.sep).join('/'), text: fs.readFileSync(f, 'utf8') }))
      const images = walk(path.join(pub, 'assets'))
        .filter((f) => EXT.test(f))
        .map((f) => {
          const src = '/' + path.relative(pub, f).split(path.sep).join('/')
          const name = path.basename(f)
          const stem = name.replace(EXT, '')
          // procura o nome do arquivo (ou o radical, para caminhos montados como `${id}.webp`) no código
          const uses = sources.filter((s) => s.text.includes(name)).map((s) => s.file)
          return { src, name, folder: path.dirname(src).replace(/^\/assets\/?/, '') || 'raiz', bytes: fs.statSync(f).size, uses, dynamic: !uses.length && sources.some((s) => s.text.includes(stem)) }
        })
      return `export default ${JSON.stringify(images)}`
    },
  }
}
