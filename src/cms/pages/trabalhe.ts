import type { Head, Hero, Seo, Title } from './types'

/** Portal de vagas do grupo (as candidaturas são feitas lá, não mais por formulário no site). */
export const JOBS_URL = 'https://seniornoroeste.portaldetalentos.senior.com.br/jobs'

/* Página /trabalhe-conosco. Os valores vêm da página Sobre (src/cms/pages/sobre.ts)
   e as empresas de src/cms/empresas. */
export const trabalhe: {
  seo: Seo
  /** `video`: vídeo de capa no lugar da foto (enviado pelo painel → Editar site → Trabalhe conosco → Banner do topo) */
  hero: Hero & { video?: string }
  culture: Head
  reel: { id: string; tag: string; title: string; eyebrow: string; heading: Title; text: string }
  companies: Head
  jobs: Head & { button: string; href: string }
} = {
  seo: {
    title: 'Trabalhe conosco | Grupo Komvos',
    description:
      'Venha fazer parte do Grupo Komvos: Senior Noroeste Paulista, Statum e Trusth em um só ecossistema de gestão, pessoas, tecnologia e IA.',
  },
  hero: {
    eyebrow: 'Trabalhe conosco',
    title: { text: 'Venha fazer parte do ecossistema.', highlight: 'do ecossistema.' },
    lead: 'No Grupo Komvos você trabalha ao lado de especialistas em gestão, pessoas, tecnologia e IA, ajudando empresas a operar de um jeito mais simples.',
    actions: [{ label: 'Confira nossas Vagas', to: JOBS_URL }],
    // vídeo "KOMEÇA" enviado pelo cliente (comprimido para 720p, sem som); o painel pode trocar ou remover
    video: '/assets/trabalhe-capa.mp4',
  },
  culture: {
    eyebrow: 'Nossa cultura',
    title: { text: 'O que nos move todos os dias', highlight: 'todos os dias' },
  },
  reel: {
    id: 'Db3WOHpOfjP',
    tag: 'Nosso time',
    title: 'De 2006 a 2026',
    eyebrow: 'Nosso time',
    heading: { text: 'Duas décadas construídas por pessoas', highlight: 'por pessoas' },
    text: 'Conheça um pouco da história e do time que faz o Grupo Komvos acontecer desde 2006.',
  },
  companies: {
    eyebrow: 'Onde você pode atuar',
    title: { text: 'Três empresas, uma única visão', highlight: 'uma única visão' },
  },
  jobs: {
    eyebrow: 'Vagas abertas',
    title: { text: 'Confira nossas vagas', highlight: 'vagas' },
    lead: 'As candidaturas são feitas no nosso Portal de Talentos: escolha a vaga, cadastre o seu currículo e acompanhe o processo por lá.',
    button: 'Confira nossas Vagas',
    href: JOBS_URL,
  },
}
