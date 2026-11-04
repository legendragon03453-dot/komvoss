/* Ponto único de leitura do conteúdo do site.
   Todo o conteúdo vive no CMS em src/cms (um arquivo por solução, empresa, artigo e página);
   este arquivo só reexporta para o restante do código. */

export { SOLUTIONS } from '../cms/solucoes'
export type { Solution } from '../cms/solucoes'
export { COMPANIES } from '../cms/empresas'
export type { Company } from '../cms/empresas'
export { ARTICLES, CATEGORIES } from '../cms/insights'
export type { Article, Category } from '../cms/insights'
export { CONTACT, CONTACT_LINKS, MIND_LAYERS, NUMEROS, STEPS } from '../cms/site'
