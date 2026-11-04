import type { Head, Hero, Item, Seo, Title } from './types'

/*
 * Páginas das camadas da arquitetura Komvos (a "espinha dorsal"):
 * o ERP guarda, o Komvos OS movimenta e o Komvos Mind pensa (o Mind fica em komvos-mind.ts).
 */

export type LayerPage = {
  path: string
  seo: Seo
  hero: Hero
  /** selo/reconhecimento exibido ao lado do hero (opcional) */
  badge?: { src: string; alt: string; title: string; text: string }
  /** `points`: pontos-chave no card ao lado do texto */
  about: { eyebrow: string; title: Title; text: string; points: string[] }
  items: Head & { items: (Item & { tag?: string })[] }
  /** playlist de vídeos assistida no site (capas em public/assets/guga/<id>.webp) */
  playlist?: Head & { videos: { id: string; title: string }[] }
}

export const erp: LayerPage = {
  path: '/erp-by-senior',
  seo: {
    title: 'ERP by Senior | A base sólida da sua empresa – Grupo Komvos',
    description:
      'ERP by Senior com o Grupo Komvos, Canal Diamante e eleito o Melhor Canal em 2026 da Senior Sistemas: gestão, processos e dados estruturados para a sua empresa crescer.',
  },
  hero: {
    eyebrow: 'ERP by Senior',
    title: { text: 'ERP: A base sólida para a sua empresa crescer.', highlight: 'para a sua empresa crescer.' },
    lead: 'Gestão, processos e dados estruturados com a tecnologia líder de mercado. O registro seguro onde a sua operação acontece.',
    actions: [{ label: 'Falar com um especialista', to: '/contato' }],
  },
  badge: {
    src: '/assets/partners/selo-canal-diamante-senior.webp',
    alt: 'Selo Senior Canal Diamante Certificado',
    title: 'Canal Diamante',
    text: 'Eleito o Melhor Canal em 2026 da Senior Sistemas.',
  },
  about: {
    eyebrow: 'O que entregamos',
    title: { text: 'Muito além de um software, o coração da sua operação.', highlight: 'o coração da sua operação.' },
    text: 'Como a base da Arquitetura Komvos, o nosso ERP by Senior padroniza rotinas, garante compliance fiscal e unifica os departamentos. É a fundação confiável que permite à sua empresa escalar sem perder o controle.',
    points: ['Rotinas padronizadas', 'Compliance fiscal garantido', 'Departamentos unificados', 'Crescimento sem perder o controle'],
  },
  items: {
    eyebrow: 'Módulos',
    title: { text: 'Controle de ponta a ponta', highlight: 'ponta a ponta' },
    items: [
      { tag: 'Finanças', title: 'Finanças & Contabilidade', text: 'Controle absoluto sobre o fluxo de caixa, tributos e auditoria.' },
      { tag: 'Logística', title: 'Logística & Suprimentos', text: 'Gestão inteligente de estoque e cadeia de suprimentos.' },
      { tag: 'Indústria', title: 'Manufatura & Indústria', text: 'Rastreabilidade e eficiência de ponta a ponta na produção.' },
    ],
  },
  playlist: {
    eyebrow: 'Guga Kuerten e Senior',
    title: { text: 'Quem vê o todo antecipa o jogo', highlight: 'antecipa o jogo' },
    lead: 'A série da Senior Sistemas com Guga Kuerten mostra como a gestão integrada leva cada setor a decidir melhor.',
    videos: [
      { id: 'GAKi4tZwoPI', title: 'A tecnologia que entra em campo com a sua empresa' },
      { id: 'jI0VTPdN6Pg', title: 'Inteligência Artificial na Gestão Empresarial' },
      { id: 'R6O_MWCx59E', title: 'Senior ERP com Inteligência Artificial: gestão integrada para empresas' },
      { id: '2tc5e_DTDss', title: 'Senior HCM: gestão de pessoas com Inteligência Artificial' },
      { id: 'k9MUhKhWLSM', title: 'Logística inteligente: controle total da cadeia de suprimentos' },
      { id: 'vDsTsYiLcJM', title: 'Gestão do Agronegócio: do campo à decisão estratégica' },
      { id: 'atN_TWf5Dl8', title: 'Gestão de Obras na Construção: menos risco, mais previsibilidade' },
      { id: 'cZQABzc8Jpc', title: 'Indústria inteligente: tenha controle total da operação' },
      { id: '4Epv_BcS9jY', title: 'Varejo inteligente: decisões que aumentam margem' },
    ],
  },
}

export const komvosOs: LayerPage = {
  path: '/komvos-os',
  seo: {
    title: 'Komvos OS | A engenharia da sua operação – Grupo Komvos',
    description:
      'Komvos OS conecta áreas, simplifica fluxos e unifica informações: o ambiente onde o seu time opera, integrado aos dados do ERP.',
  },
  hero: {
    eyebrow: 'Komvos OS',
    title: { text: 'Komvos OS: A engenharia da sua operação.', highlight: 'A engenharia da sua operação.' },
    lead: 'O sistema que conecta áreas, simplifica fluxos e unifica informações. Pare de perder tempo com processos quebrados e ganhe uma operação fluida.',
    actions: [
      { label: 'Conhecer o Komvos OS', to: '/komvos-os#como-funciona' },
      { label: 'Falar com um especialista', to: '/contato', ghost: true },
    ],
  },
  about: {
    eyebrow: 'Como funciona',
    title: { text: 'Onde o trabalho do dia a dia acontece.', highlight: 'do dia a dia acontece.' },
    text: 'O Komvos OS não atua sozinho, ele é o ambiente onde o seu time opera. Ele integra os dados do ERP e os transforma em fluxos de trabalho claros e organizados, garantindo que a informação certa chegue à pessoa certa, no momento exato.',
    points: ['Áreas conectadas', 'Fluxos de trabalho organizados', 'Dados do ERP em movimento', 'A informação certa, na hora certa'],
  },
  items: {
    eyebrow: 'Na prática',
    title: { text: 'Tudo o que sua equipe precisa para operar melhor', highlight: 'operar melhor' },
    items: [
      { tag: 'RH', title: 'Atendimento ao Colaborador', text: 'Centralização de dúvidas sobre ponto, férias e holerites em um único portal.' },
      { tag: 'Folha', title: 'Conferência e Fechamento', text: 'Fluxos de validação de inconsistências organizados antes do envio final.' },
      { tag: 'Suporte', title: 'Triagem de Chamados', text: 'Organização, classificação e direcionamento de tickets para os níveis corretos de atendimento.' },
      { tag: 'Financeiro', title: 'Conciliação e Alertas', text: 'Ferramentas que cruzam dados bancários e geram alertas de fluxo de caixa para a equipe.' },
      { tag: 'Gestão', title: 'Painéis e Indicadores', text: 'Dashboards centralizados que extraem dados brutos do ERP e transformam em relatórios visuais.' },
      { tag: 'Comercial', title: 'Organização de Oportunidades', text: 'Funil estruturado onde os leads são organizados e priorizados para o time de vendas agir.' },
    ],
  },
}
