/**
 * Artigo do Komvos Insights (um arquivo por artigo nesta pasta).
 * Para publicar: copie um arquivo, troque o conteúdo e registre-o em index.ts (o primeiro da lista é o destaque).
 */
export const CATEGORIES = ['IA aplicada', 'Gestão', 'RH', 'Dados', 'Cloud', 'Transformação Empresarial'] as const

export type Category = (typeof CATEGORIES)[number]

export type Article = {
  /** endereço: /insights/<slug> */
  slug: string
  cat: Category
  /** data exibida, ex. "Out 2026" */
  date: string
  /** tempo de leitura, ex. "5 min" */
  read: string
  title: string
  /** resumo (cards, abertura do artigo e descrição para buscadores) */
  excerpt: string
  /** parágrafos do texto */
  body: string[]
  /** foto de capa (opcional; sem ela, a capa é a ilustração da categoria) */
  cover?: string
  /** destaque da página Insights (o painel pode marcar um artigo) */
  featured?: boolean
  /** artigo montado no editor visual do painel (substitui `body` quando existe) */
  blocks?: import('../../live/blocks').Block[]
  /** quem escreveu (aparece no topo do artigo) */
  author?: import('../../live/blocks').Author
}
