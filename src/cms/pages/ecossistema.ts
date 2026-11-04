import type { Head, Hero, Item, Seo } from './types'

/** Página /ecossistema (as empresas ficam em src/cms/empresas) */
export const ecossistema: {
  seo: Seo
  hero: Hero
  /** diagrama de feixes: a empresa do cliente → Grupo Komvos → especialistas */
  beams: Head & { client: string; hub: string }
  companies: Head
  why: Head & { items: Item[] }
} = {
  seo: {
    title: 'Ecossistema | Senior Noroeste Paulista, Statum e Trusth – Grupo Komvos',
    description:
      'Conheça as empresas especialistas do Grupo Komvos: Senior Noroeste Paulista (Gestão e ERP), Statum (Cloud, Dados, Tech e IA) e Trusth (Operação, BPO e RH).',
  },
  hero: {
    eyebrow: 'Ecossistema Komvos',
    title: { text: 'Empresas especialistas. Uma única visão.', highlight: 'Uma única visão.' },
    lead: 'O Grupo Komvos reúne Senior Noroeste Paulista, Statum e Trusth para atuar nas diferentes partes da sua empresa, com uma leitura compartilhada do que está acontecendo.',
    actions: [{ label: 'Falar com um especialista', to: '/contato' }],
  },
  beams: {
    eyebrow: 'Como se conecta',
    title: { text: 'Um ponto de contato. Três especialistas.', highlight: 'Três especialistas.' },
    lead: 'Você fala com o Grupo Komvos, e a empresa certa cuida de cada frente, compartilhando a mesma visão do seu negócio.',
    client: 'Sua empresa',
    hub: 'Grupo Komvos',
  },
  companies: {
    eyebrow: 'Quem faz parte',
    title: { text: 'Especialistas em cada frente', highlight: 'cada frente' },
  },
  why: {
    eyebrow: 'Por que um ecossistema',
    title: { text: 'Um contato. Todas as frentes.', highlight: 'Todas as frentes.' },
    items: [
      { title: 'Uma visão compartilhada', text: 'Gestão, pessoas, tecnologia e dados enxergando a mesma empresa.' },
      { title: 'Especialista em cada frente', text: 'Quem executa é quem mais entende de cada assunto.' },
      { title: 'Menos fornecedores para coordenar', text: 'O Grupo Komvos conecta as entregas para você.' },
    ],
  },
}
