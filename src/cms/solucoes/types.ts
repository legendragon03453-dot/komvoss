/**
 * Modelo de conteúdo de uma solução (o "CMS" das páginas /solucoes/:slug).
 * Cada solução é um arquivo nesta pasta; a página é montada inteira a partir dele.
 * Para criar uma nova solução: copie um arquivo, troque o conteúdo e registre-o em index.ts.
 */
export type Solution = {
  /** endereço da página: /solucoes/<slug> */
  slug: string
  /** número da frente, ex. "03" */
  num: string
  title: string
  /** parte do título que recebe o destaque prateado (precisa existir dentro de `title`) */
  highlight?: string
  /** frase curta usada nos cards e no topo de "O que entregamos" */
  short: string
  /** a dor principal; vira o texto de abertura do hero */
  problem: string
  /** dores do cliente ("Se isso parece familiar…") */
  pains: string[]
  /** o que muda com o Grupo Komvos; cada item responde à dor de mesma posição em `pains` */
  gains: string[]
  /** entregas da frente (bento de "O que entregamos"), de 3 a 6 itens */
  deliveries: { title: string; text: string }[]
  /** id da empresa do ecossistema que executa (ver COMPANIES em pages/data.ts) */
  executor: string
  /** mostra a faixa de chamada para o Komvos Mind */
  mindBand?: boolean
  /** título e descrição para buscadores; se vazio, são gerados a partir do conteúdo */
  seo?: { title?: string; description?: string }
}
