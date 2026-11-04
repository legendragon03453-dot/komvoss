import type { Action, Head, Hero, Item, Seo, Title } from './types'

export type TimelineItem = { year: string; title: string; text: string; media?: { src: string; alt: string; w?: number; h?: number }[] }

/** Página /sobre */
export const sobre: {
  seo: Seo
  hero: Hero
  name: { greek: string; head: Head; manifesto: string; symbolCaption: string }
  purpose: { mission: string; vision: string }
  values: Head & { items: Item[] }
  history: Head & { items: TimelineItem[]; action: Action }
  /** reel em destaque (capa em public/assets/reels/<id>.webp) */
  reel: { id: string; tag: string; title: string; eyebrow: string; heading: Title; text: string }
} = {
  seo: {
    title: 'Sobre o Grupo Komvos | O ponto onde tudo se conecta',
    description:
      'Komvos significa “nó” em grego: o ponto onde tudo se conecta. Conheça a missão, a visão, os valores e a história do Grupo Komvos.',
  },
  hero: {
    eyebrow: 'Sobre o Grupo Komvos',
    title: { text: 'O ponto onde tudo se conecta.', highlight: 'tudo se conecta.' },
    lead: 'O Grupo Komvos conecta tecnologia, dados, inteligência e operações para simplificar e acelerar a transformação das empresas.',
    actions: [{ label: 'Conheça o ecossistema', to: '/ecossistema' }],
  },
  name: {
    greek: 'κόμβος',
    head: { eyebrow: 'Etimologia', title: { text: 'Komvos significa “nó”', highlight: '“nó”' } },
    manifesto:
      'Em grego, kómvos é o nó: o ponto de encontro onde diferentes linhas se unem e ganham força. É exatamente o papel que assumimos nas empresas: conectar gestão, pessoas, tecnologia e dados.',
    symbolCaption:
      'O símbolo: um núcleo cercado por conexões. Cada nó é uma frente do negócio; o círculo é a visão única que une todas elas.',
  },
  purpose: {
    mission:
      'Promover, continuamente, a evolução tecnológica de empresas e pessoas, entregando soluções com inteligência, inovação e propósito, para que possam transformar o presente e construir o futuro que desejam.',
    vision:
      'Tornar-se referência nacional por consolidar e alavancar empresas com soluções inteligentes, personalizadas e escaláveis, reconhecida por suas boas práticas de governança e por uma cultura de atendimento consultivo admirada pelo mercado.',
  },
  values: {
    eyebrow: 'Nossos valores',
    title: { text: 'O que nos move', highlight: 'move' },
    items: [
      { title: 'Fazer o certo', text: 'Ética e responsabilidade em cada entrega.' },
      { title: 'Fazer chover', text: 'Atitude para gerar resultado de verdade.' },
      { title: 'Valorizar', text: 'Pessoas, parceiros e clientes no centro.' },
      { title: 'Todos conectados', text: 'Um só time, uma única visão.' },
      { title: 'Tudo pelo cliente', text: 'O sucesso do cliente é o nosso.' },
      { title: 'Extraordinarize', text: 'Ir além do esperado, todos os dias.' },
    ],
  },
  history: {
    eyebrow: 'Nossa história',
    title: { text: 'De 2006 até o futuro', highlight: 'o futuro' },
    items: [
      {
        year: '2006',
        title: 'O começo',
        text: 'A parceria entre Biosalc e Senior Sistemas dá início à história que daria origem ao Grupo Komvos.',
        media: [{ src: '/assets/sobre/2006-parceria.webp', w: 838, h: 626, alt: 'Reunião da parceria entre Biosalc e Senior Sistemas' }],
      },
      {
        year: '2007',
        title: 'A primeira sede',
        text: 'O primeiro endereço próprio, com a marca Senior na fachada.',
        media: [{ src: '/assets/sobre/2007-sede.webp', w: 832, h: 619, alt: 'Sede de 2007, prédio com a marca Senior' }],
      },
      {
        year: '2009',
        title: 'Mais espaço para crescer',
        text: 'Uma nova sede para acompanhar o crescimento do time e da carteira de clientes.',
        media: [{ src: '/assets/sobre/2009-sede.webp', w: 793, h: 464, alt: 'Sede de 2009 com a marca Senior' }],
      },
      {
        year: '2011',
        title: 'Uma casa maior',
        text: 'Mais uma mudança de endereço, com mais estrutura para atender os clientes.',
        media: [{ src: '/assets/sobre/2011-sede.webp', w: 831, h: 614, alt: 'Sede de 2011' }],
      },
      {
        year: '2018',
        title: 'Sede com a marca Komvos',
        text: 'O prédio que reuniu Senior Noroeste Paulista, Statum e Trusth sob a mesma marca.',
        media: [{ src: '/assets/sobre/2018-sede.webp', w: 1000, h: 754, alt: 'Sede de 2018, prédio de tijolos com a marca Komvos' }],
      },
      {
        year: '2026',
        title: 'Nova sede e Grupo Komvos',
        text: 'Senior Noroeste Paulista, Statum e Trusth em um só ecossistema, numa nova sede para operar, crescer e receber clientes e parceiros.',
        media: [{ src: '/assets/sobre/2026-sede.webp', w: 1000, h: 624, alt: 'Nova sede do Grupo Komvos, prédio de vidro' }],
      },
      { year: 'Futuro', title: 'Tecnologia que transforma', text: 'Gestão, pessoas, dados e inteligência artificial cada vez mais conectados.' },
    ],
    action: { label: 'Conheça o ecossistema', to: '/ecossistema' },
  },
  reel: {
    id: 'Db9EdEVFLGe',
    tag: 'Prêmios',
    title: '20 anos de reconhecimento',
    eyebrow: 'Grupo Komvos em vídeo',
    heading: { text: '20 anos de reconhecimento', highlight: 'reconhecimento' },
    text: 'Duas décadas de trabalho, parceria e prêmios conquistados ao lado dos clientes.',
  },
}
