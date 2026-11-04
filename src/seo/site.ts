/* Constantes leves de SEO (usadas pelas páginas sem carregar todo o CMS). */
import type { Solution } from '../cms/solucoes'
import type { Article } from '../cms/insights'

/** Endereço público do site. Trocar quando o domínio próprio (ex.: grupokomvos.com.br) entrar no ar. */
export const SITE_URL = 'https://komvoss.vercel.app'
export const SITE_NAME = 'Grupo Komvos'
export const OG_IMAGE = '/og.jpg'

export const absoluteUrl = (p: string) => SITE_URL + (p === '/' ? '' : p)

export const HOME_SEO = {
  title: 'Grupo Komvos | Ecossistema de Soluções Empresariais, RH e IA',
  description:
    'Ecossistema de soluções empresariais: software ERP e HCM, terceirização de folha de pagamento, cloud, dados e IA para simplificar e acelerar o seu negócio.',
}

export const SOLUCOES_SEO = {
  title: 'Soluções | Grupo Komvos – Gestão, RH, Cloud, Dados e IA',
  description:
    'Gestão Empresarial, Pessoas & RH, Cloud & Tecnologia e Dados, Automação & IA: descubra qual problema o Grupo Komvos resolve na sua empresa.',
}

/** Corta no limite de palavra (buscadores exibem ~155 caracteres de descrição). */
export const clip = (t: string, max = 155) => (t.length <= max ? t : t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,.;:]$/, '') + '…')

export const solutionSeo = (s: Solution) => ({
  title: s.seo?.title ?? `${s.title} | Soluções Grupo Komvos`,
  description: s.seo?.description ?? clip(`${s.title} com o Grupo Komvos: ${s.short.replace(/\.$/, '')}. ${s.problem}`),
})

export const articleSeo = (a: Article) => ({
  title: `${a.title} | Komvos Insights`,
  description: a.excerpt,
})
