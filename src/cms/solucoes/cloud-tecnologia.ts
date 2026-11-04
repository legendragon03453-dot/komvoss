import type { Solution } from './types'

const solution: Solution = {
  slug: 'cloud-tecnologia',
  num: '03',
  title: 'Cloud & Tecnologia',
  highlight: 'Tecnologia',
  short: 'Infraestrutura, cloud, desenvolvimento e sustentação.',
  problem: 'Lentidão tecnológica, infraestrutura frágil e sistemas que não acompanham o ritmo de crescimento da empresa.',
  pains: [
    'Sistemas lentos e indisponibilidades que param a operação.',
    'Infraestrutura cara de manter e difícil de escalar.',
    'Projetos de tecnologia que não saem do papel.',
  ],
  gains: [
    'Ambientes estáveis e monitorados, para a operação não parar.',
    'Cloud com custo sob controle e capacidade de crescer quando precisar.',
    'Projetos entregues por especialistas, com prazo e meta claros.',
  ],
  deliveries: [
    { title: 'Infraestrutura', text: 'Ambientes estáveis, seguros e monitorados.' },
    { title: 'Cloud', text: 'Migração e operação em nuvem com custo sob controle.' },
    { title: 'Desenvolvimento', text: 'Soluções sob medida e integrações entre sistemas.' },
    { title: 'Sustentação', text: 'Suporte contínuo para manter tudo funcionando.' },
    { title: 'Modernização tecnológica', text: 'Evolução de sistemas legados sem parar o negócio.' },
  ],
  executor: 'statum',
}

export default solution
