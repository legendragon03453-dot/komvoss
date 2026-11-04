import agentes from './agentes-de-ia-na-operacao'
import folha from './folha-sem-erros-hcm-e-bpo'
import sistemas from './sistemas-desconectados-custam-caro'
import dados from './dados-que-viram-decisao'
import cloud from './cloud-com-custo-sob-controle'
import crescer from './crescer-sem-perder-o-controle'
import type { Article } from './types'

export { CATEGORIES } from './types'
export type { Article, Category } from './types'

/** Artigos publicados, do mais recente para o mais antigo. O primeiro é o destaque da página Insights. */
export const ARTICLES: Article[] = [agentes, folha, sistemas, dados, cloud, crescer]
