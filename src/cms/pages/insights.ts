import type { Hero, Seo, Title } from './types'

/** Página /insights e páginas de artigo (os artigos ficam em src/cms/insights) */
export const insights: {
  seo: Seo
  hero: Hero
  featuredLabel: string
  allLabel: string
  /** texto quando a categoria ainda não tem artigos; {cat} vira o nome da categoria */
  empty: string
  article: { ctaTitle: string; ctaLabel: string; relatedEyebrow: string; relatedTitle: Title }
} = {
  seo: {
    title: 'Komvos Insights | IA aplicada, Gestão, RH, Dados e Cloud',
    description:
      'A central de inteligência do Grupo Komvos: conteúdos sobre IA aplicada, gestão, RH, dados, cloud e transformação empresarial.',
  },
  hero: {
    eyebrow: 'Komvos Insights',
    title: { text: 'Conteúdo para decidir melhor.', highlight: 'decidir melhor.' },
    lead: 'A central de inteligência do Grupo Komvos: ideias práticas sobre gestão, pessoas, tecnologia, dados e IA aplicada aos negócios.',
  },
  featuredLabel: 'Destaque',
  allLabel: 'Todos',
  empty: 'Em breve, novos conteúdos sobre {cat}.',
  article: {
    ctaTitle: 'Quer aplicar isso na sua empresa?',
    ctaLabel: 'Falar com um especialista',
    relatedEyebrow: 'Continue lendo',
    relatedTitle: { text: 'Mais insights', highlight: 'insights' },
  },
}
