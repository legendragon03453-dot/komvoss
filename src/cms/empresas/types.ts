/**
 * Empresa do ecossistema (um arquivo por empresa nesta pasta).
 * Para incluir uma empresa: copie um arquivo, troque o conteúdo e registre-o em index.ts.
 */
export type Company = {
  /** identificador usado em links (/ecossistema#<id>) e nas soluções (campo `executor`) */
  id: string
  name: string
  /** área de atuação, em poucas palavras */
  area: string
  text: string
  /** destaques da atuação (lista com marcadores) */
  points: string[]
  /** logo oficial em public/assets; `chip`: o logo é colorido e vai sobre um fundo branco */
  logo?: { src: string; w: number; h: number; chip?: boolean }
  /** slugs das soluções em que a empresa atua (ver src/cms/solucoes) */
  solutions: string[]
}
