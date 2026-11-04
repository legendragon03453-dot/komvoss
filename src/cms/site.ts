/* Conteúdo compartilhado por várias páginas.
   Itens entre [colchetes] são placeholders a preencher com dados reais do Grupo Komvos. */

/** Camadas da arquitetura Komvos (Home, Soluções e Komvos Mind). */
export const MIND_LAYERS = [
  { name: 'ERP by Senior', role: 'Registro e gestão', text: 'A base: onde a operação acontece e os dados nascem.' },
  { name: 'Komvos OS', role: 'Processos e integração', text: 'O sistema que conecta áreas, fluxos e informações.' },
  { name: 'Komvos Mind', role: 'Inteligência e agentes', text: 'A camada que analisa, recomenda e executa.' },
]

/** "Como trabalhamos": as quatro etapas de todo projeto. */
export const STEPS = [
  { title: 'Diagnóstico', text: 'Entendemos a operação, as dores e onde está o maior ganho.' },
  { title: 'Desenho da solução', text: 'Combinamos tecnologia, processos e pessoas no que faz sentido para você.' },
  { title: 'Implantação', text: 'Executamos com especialistas de cada frente, com prazos e metas claras.' },
  { title: 'Sustentação e evolução', text: 'Acompanhamos os resultados e evoluímos a solução junto com a empresa.' },
]

/** Contatos (página Entre em contato e menu). */
export const CONTACT = {
  email: 'marketing@grupokomvos.com.br',
  phone: '(16) 3515-1609',
  /** número de WhatsApp; vazio = a linha não aparece */
  whatsapp: '',
  linkedin: 'https://www.linkedin.com/company/komvostech/',
  instagram: 'https://www.instagram.com/komvostech/',
  sedes: [
    { name: 'Sede Grupo Komvos', address: 'Av. Eduardo Gomes de Souza, 800 – City Ribeirão', city: 'Ribeirão Preto / SP' },
  ],
}

/** Links prontos de e-mail e telefone (gerados a partir de CONTACT). */
export const CONTACT_LINKS = {
  // calculados na hora: o painel pode editar o e-mail e o telefone
  get email() {
    return `mailto:${CONTACT.email}`
  },
  get phone() {
    return `tel:+55${CONTACT.phone.replace(/\D/g, '')}`
  },
}

/** Números do Grupo Komvos (Home e Clientes). */
export const NUMEROS = [
  { value: '+280', label: 'clientes atendidos' },
  { value: '+20', label: 'anos de experiência' },
]
