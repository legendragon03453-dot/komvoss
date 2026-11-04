import type { FormContent } from '../../pages/CmsForm'
import type { Head, Hero, Seo, Title } from './types'

/* Página /trabalhe-conosco. Os valores vêm da página Sobre (src/cms/pages/sobre.ts)
   e as empresas de src/cms/empresas. */
export const trabalhe: {
  seo: Seo
  hero: Hero
  culture: Head
  reel: { id: string; tag: string; title: string; eyebrow: string; heading: Title; text: string }
  companies: Head
  form: Head & FormContent
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
    actions: [{ label: 'Enviar meu currículo', to: '/trabalhe-conosco#candidatura' }],
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
  form: {
    eyebrow: 'Candidatura',
    title: { text: 'Envie seu currículo', highlight: 'currículo' },
    lead: 'Mesmo sem uma vaga aberta agora, guardamos o seu perfil para as próximas oportunidades.',
    fields: [
      { name: 'nome', label: 'Nome completo', required: true, autoComplete: 'name' },
      { name: 'email', label: 'E-mail', type: 'email', required: true, half: true, autoComplete: 'email' },
      { name: 'telefone', label: 'Telefone / WhatsApp', type: 'tel', half: true, autoComplete: 'tel' },
      { name: 'linkedin', label: 'LinkedIn', type: 'url', half: true },
      {
        name: 'area',
        label: 'Área de interesse',
        type: 'select',
        required: true,
        half: true,
        options: [
          'Gestão e ERP (Senior Noroeste Paulista)',
          'Cloud, Dados, Tech e IA (Statum)',
          'Operação, BPO e RH (Trusth)',
          'Áreas corporativas',
        ],
      },
      { name: 'curriculo', label: 'Currículo (PDF ou Word)', type: 'file', accept: '.pdf,.doc,.docx' },
      { name: 'mensagem', label: 'Conte um pouco sobre você', type: 'textarea' },
    ],
    submit: 'Enviar candidatura',
    doneTitle: 'Candidatura recebida!',
    doneText: 'Obrigado pelo interesse. Nosso time de pessoas vai analisar o seu perfil.',
  },
}
