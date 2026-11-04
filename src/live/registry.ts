import { home } from '../cms/pages/home'
import { erp, komvosOs } from '../cms/pages/arquitetura'
import { komvosMind } from '../cms/pages/komvos-mind'
import { ecossistema } from '../cms/pages/ecossistema'
import { clientes } from '../cms/pages/clientes'
import { insights } from '../cms/pages/insights'
import { sobre } from '../cms/pages/sobre'
import { contato } from '../cms/pages/contato'
import { parceiro } from '../cms/pages/parceiro'
import { trabalhe } from '../cms/pages/trabalhe'
import { SOLUTIONS } from '../cms/solucoes'
import { COMPANIES } from '../cms/empresas'
import { CONTACT, MIND_LAYERS, NUMEROS, STEPS } from '../cms/site'
import { PARTNERS } from '../cms/parceiros'

/**
 * Conteúdo editável pelo painel: cada raiz é um objeto do CMS (src/cms). Um texto é identificado pelo
 * caminho até ele, ex. "sobre.hero.title.text". O painel lista esses textos; o site aplica as edições
 * por cima do CMS ao carregar (ver content.ts).
 */
export const ROOTS: Record<string, { label: string; url: string; obj: object }> = {
  home: { label: 'Home', url: '/', obj: home },
  solucoes: { label: 'Soluções (4 frentes)', url: '/solucoes', obj: SOLUTIONS },
  erp: { label: 'ERP by Senior', url: '/erp-by-senior', obj: erp },
  'komvos-os': { label: 'Komvos OS', url: '/komvos-os', obj: komvosOs },
  'komvos-mind': { label: 'Komvos Mind', url: '/komvos-mind', obj: komvosMind },
  ecossistema: { label: 'Ecossistema', url: '/ecossistema', obj: ecossistema },
  empresas: { label: 'Empresas do grupo', url: '/ecossistema', obj: COMPANIES },
  clientes: { label: 'Clientes', url: '/clientes', obj: clientes },
  insights: { label: 'Insights (página)', url: '/insights', obj: insights },
  sobre: { label: 'Sobre', url: '/sobre', obj: sobre },
  parceiro: { label: 'Seja um parceiro', url: '/seja-um-parceiro', obj: parceiro },
  trabalhe: { label: 'Trabalhe conosco', url: '/trabalhe-conosco', obj: trabalhe },
  contato: { label: 'Entre em contato', url: '/contato', obj: contato },
  geral: {
    label: 'Geral (contatos, números, camadas)',
    url: '/',
    obj: { contato: CONTACT, numeros: NUMEROS, camadas: MIND_LAYERS, etapas: STEPS, parceiros: PARTNERS },
  },
}

// chaves que não são texto de leitura (endereços, arquivos, identificadores, tamanhos)
const SKIP = new Set(['to', 'slug', 'src', 'id', 'href', 'accept', 'autoComplete', 'type', 'icon', 'art', 'color', 'w', 'h', 'num', 'video', 'list'])

export type TextField = { path: string; root: string; section: string; label: string; value: string; long: boolean }

const NAMES: Record<string, string> = {
  hero: 'Topo',
  seo: 'Google (SEO)',
  title: 'Título',
  text: 'Texto',
  lead: 'Subtítulo',
  eyebrow: 'Rótulo acima do título',
  highlight: 'Destaque',
  description: 'Descrição',
  label: 'Rótulo',
  line1: 'Linha 1',
  line2: 'Linha 2',
  primary: 'Botão principal',
  secondary: 'Botão secundário',
  submit: 'Botão de enviar',
  items: 'Itens',
  points: 'Pontos',
  actions: 'Botões',
  heading: 'Título',
  name: 'Nome',
  role: 'Função',
  problem: 'Problema',
  excerpt: 'Resumo',
  about: 'Sobre a camada',
  allLabel: 'Rótulo "Todos"',
  arch: 'Arquitetura',
  article: 'Artigo',
  badge: 'Selo',
  beams: 'Ligações',
  cases: 'Casos de uso',
  companies: 'Empresas',
  cta: 'Contato (fim da página)',
  culture: 'Cultura',
  ecosystem: 'Ecossistema',
  empty: 'Mensagem sem resultados',
  featuredLabel: 'Rótulo de destaque',
  form: 'Formulário',
  history: 'Linha do tempo',
  how: 'Como funciona',
  info: 'Informações',
  insights: 'Insights',
  layers: 'Camadas',
  logos: 'Logos',
  manifesto: 'Manifesto',
  models: 'Modelos',
  next: 'Próximo passo',
  numbers: 'Números',
  orbit: 'Órbita',
  path: 'Caminho',
  playlist: 'Vídeos',
  purpose: 'Missão e visão',
  reel: 'Vídeo',
  reels: 'Vídeos',
  shortcuts: 'Atalhos',
  social: 'Prova social',
  steps: 'Etapas',
  testimonials: 'Depoimentos',
  values: 'Valores',
  why: 'Por que',
  deliveries: 'Entregas',
  gains: 'Ganhos',
  pains: 'Dores',
  short: 'Nome curto',
  area: 'Área',
  fields: 'Campos',
  options: 'Opções',
  doneTitle: 'Título após enviar',
  doneText: 'Texto após enviar',
  mission: 'Missão',
  vision: 'Visão',
  contato: 'Contatos',
  numeros: 'Números',
  camadas: 'Camadas',
  etapas: 'Etapas',
  parceiros: 'Parceiros',
  types: 'Tipos',
  sedes: 'Sedes',
  address: 'Endereço',
  city: 'Cidade',
  value: 'Valor',
  year: 'Ano',
  tag: 'Etiqueta',
  greek: 'Grego',
  symbolCaption: 'Legenda do símbolo',
  chooseLabel: 'Pergunta de escolha',
}

const human = (k: string) => (/^\d+$/.test(k) ? `#${Number(k) + 1}` : (NAMES[k] ?? k.replace(/([A-Z])/g, ' $1').toLowerCase()))

const itemName = (obj: object, i: string) => {
  const it = (obj as Record<string, Record<string, unknown>>)[i]
  return String(it?.title ?? it?.name ?? it?.label ?? `#${Number(i) + 1}`)
}

/** Todos os textos editáveis de todas as raízes. */
export function listTexts(): TextField[] {
  const out: TextField[] = []
  const walk = (v: unknown, path: string[], root: string) => {
    if (typeof v === 'string') {
      const key = path[path.length - 1]
      if (SKIP.has(key) || (key === 'name' && path.includes('fields')) || !v.trim()) return
      out.push({
        path: [root, ...path].join('.'),
        root,
        // nas listas (soluções, empresas), a seção é o nome do item
        section: /^\d+$/.test(path[0] ?? '') ? itemName(ROOTS[root].obj, path[0]) : human(path[0] ?? ''),
        label: path.slice(1).map(human).join(' › ') || human(path[0]),
        value: v,
        long: v.length > 90,
      })
      return
    }
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, [...path, String(i)], root))
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, [...path, k], root)
  }
  for (const [root, r] of Object.entries(ROOTS)) walk(r.obj, [], root)
  return out
}

/** Lê / grava um valor pelo caminho ("sobre.hero.title.text"). */
export function getPath(path: string): unknown {
  const [root, ...rest] = path.split('.')
  let o: unknown = ROOTS[root]?.obj
  for (const k of rest) o = o == null ? undefined : (o as Record<string, unknown>)[k]
  return o
}

export function setPath(path: string, value: unknown): boolean {
  const [root, ...rest] = path.split('.')
  let o = ROOTS[root]?.obj as Record<string, unknown> | undefined
  for (const k of rest.slice(0, -1)) {
    o = o?.[k] as Record<string, unknown> | undefined
    if (!o || typeof o !== 'object') return false
  }
  const last = rest[rest.length - 1]
  if (!o || typeof o[last] !== 'string') return false
  o[last] = value
  return true
}
