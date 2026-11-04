import type { Head, Hero, Item, Seo } from './types'

/** Página /contato (os contatos e endereços ficam em src/cms/site.ts) */
export const contato: {
  seo: Seo
  hero: Hero
  info: { title: string; officesTitle: string; labels: { email: string; phone: string; whatsapp: string } }
  next: Head & { items: Item[] }
  shortcuts: Head
} = {
  seo: {
    title: 'Entre em contato | Falar com um especialista – Grupo Komvos',
    description:
      'Fale com um especialista do Grupo Komvos. Conte seu desafio e descubra como simplificar e acelerar a operação da sua empresa.',
  },
  hero: {
    eyebrow: 'Entre em contato',
    title: { text: 'Existe um jeito mais simples de fazer.', highlight: 'mais simples de fazer.' },
    lead: 'Conte qual é o seu desafio. Um especialista do Grupo Komvos retorna para entender o cenário da sua empresa e indicar o melhor caminho.',
  },
  info: {
    title: 'Contatos',
    officesTitle: 'Sede',
    labels: { email: 'E-mail', phone: 'Telefone', whatsapp: 'WhatsApp' },
  },
  next: {
    eyebrow: 'O que acontece depois',
    title: { text: 'Simples, como tem que ser', highlight: 'tem que ser' },
    items: [
      { title: 'Você envia', text: 'Conte qual é o seu desafio atual no formulário.' },
      { title: 'Entendemos', text: 'Um especialista analisa o cenário da sua empresa.' },
      { title: 'Conversamos', text: 'Retornamos com o melhor caminho dentro do ecossistema.' },
    ],
  },
  shortcuts: {
    eyebrow: 'Prefere começar por uma frente?',
    title: { text: 'Conheça as soluções', highlight: 'soluções' },
  },
}
