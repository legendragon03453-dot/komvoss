import type { Head, Hero, Item, Seo, Title } from './types'

/** Página /komvos-mind — a camada que pensa (o ERP guarda, o Komvos OS movimenta, o Mind decide). */
export const komvosMind: {
  seo: Seo
  hero: Hero
  /** rótulos dos agentes que orbitam o núcleo no hero */
  orbit: string[]
  /** reel em destaque logo abaixo do hero (capa em public/assets/reels/<id>.webp) */
  reel: { id: string; tag: string; title: string; eyebrow: string; heading: Title; text: string }
  manifesto: { eyebrow: string; title?: Title; text: string; points: string[] }
  layers: Head
  how: Head & {
    steps: Item[]
    /** demonstração animada de um agente executando uma análise (ilustrativa) */
    demo: { title: string; note: string; tasks: { step: number; label: string; subs: string[] }[] }
  }
  cases: Head & { items: { area: string; title: string; text: string }[] }
} = {
  seo: {
    title: 'Komvos Mind | IA corporativa que decide com você – Grupo Komvos',
    description:
      'Komvos Mind é a camada de inteligência corporativa do Grupo Komvos: agentes de IA que analisam dados do ERP e do Komvos OS para prever, recomendar e apoiar decisões.',
  },
  hero: {
    eyebrow: 'Komvos Mind',
    title: { text: 'Komvos Mind: A inteligência que decide com você.', highlight: 'A inteligência que decide com você.' },
    lead: 'Não é apenas automação, é a camada de inteligência corporativa do Grupo Komvos. Agentes de IA que trafegam entre seus sistemas para analisar dados complexos e apoiar as decisões mais críticas do seu negócio.',
    actions: [
      { label: 'Descubra o poder da IA', to: '/komvos-mind#casos' },
      { label: 'Falar com um especialista', to: '/contato', ghost: true },
    ],
  },
  orbit: ['Predição', 'Riscos', 'Financeiro', 'Métricas', 'Comercial', 'Contexto'],
  reel: {
    id: 'Daij_JvgdeQ',
    tag: 'Dados & IA',
    title: 'Top 5 motivos para conhecer o Komvos Mind',
    eyebrow: 'Komvos Mind em vídeo',
    heading: { text: 'Quando os dados deixam de apoiar a gestão', highlight: 'apoiar a gestão' },
    text: 'Alguns sinais mostram quando os dados deixam de apoiar a gestão e passam a dificultar a operação. Veja como o Komvos Mind ajuda a virar esse jogo.',
  },
  manifesto: {
    eyebrow: 'O novo paradigma',
    title: { text: 'De executor a conselheiro estratégico.', highlight: 'conselheiro estratégico.' },
    text: 'Enquanto o ERP registra e o Komvos OS opera, o Komvos Mind pensa. Ele é a camada superior da nossa arquitetura, cruzando montanhas de dados do seu ecossistema para entregar predições, recomendar caminhos e automatizar decisões complexas de forma autônoma e segura.',
    points: ['Predições a partir dos dados', 'Recomendação de caminhos', 'Decisões complexas automatizadas', 'Autonomia com segurança'],
  },
  layers: {
    eyebrow: 'Arquitetura',
    title: { text: 'ERP ➔ Komvos OS ➔ Komvos Mind', highlight: 'Komvos Mind' },
    lead: 'O ERP guarda, o Komvos OS movimenta e o Komvos Mind pensa estrategicamente. Cada camada sustenta a próxima.',
  },
  how: {
    eyebrow: 'Como funciona',
    title: { text: 'Dos dados à decisão', highlight: 'à decisão' },
    lead: 'A IA analisa, prevê e recomenda, sempre com pessoas no controle das decisões.',
    steps: [
      { title: 'Conecta', text: 'Os agentes trafegam entre o ERP, o Komvos OS e as demais fontes de dados da empresa.' },
      { title: 'Analisa', text: 'Cruzam histórico, contexto e variáveis externas para entender o que está acontecendo.' },
      { title: 'Prevê', text: 'Projetam cenários e antecipam riscos antes que eles cheguem ao resultado.' },
      { title: 'Recomenda', text: 'Indicam o melhor caminho para a liderança, com o motivo de cada recomendação.' },
    ],
    demo: {
      title: 'Agente de análise de margem',
      note: 'Exemplo ilustrativo',
      tasks: [
        { step: 0, label: 'Conectar ao ERP e ao Komvos OS', subs: ['Ler custos e receitas por unidade', 'Ler os fluxos logísticos do mês'] },
        { step: 1, label: 'Analisar a variação', subs: ['Comparar com o histórico', 'Isolar o aumento do custo logístico'] },
        { step: 2, label: 'Projetar cenários', subs: ['Simular rotas alternativas', 'Estimar o impacto na margem'] },
        { step: 3, label: 'Recomendar à diretoria', subs: ['Sugerir a revisão da rota Y'] },
      ],
    },
  },
  cases: {
    eyebrow: 'Casos de uso',
    title: { text: 'Como o Mind transforma dados em direção', highlight: 'dados em direção' },
    items: [
      {
        area: 'RH Estratégico',
        title: 'Predição de Turnover',
        text: 'O Mind cruza dados de clima, desempenho e mercado para prever riscos de saída de talentos, permitindo ações preventivas da liderança.',
      },
      {
        area: 'Folha',
        title: 'Auditoria Inteligente',
        text: 'Agentes autônomos que não apenas conferem, mas aprendem com o histórico para identificar padrões anômalos de custos e fraudes invisíveis ao olho humano.',
      },
      {
        area: 'Operações',
        title: 'Antecipação de Gargalos',
        text: 'A IA monitora os fluxos do Komvos OS em tempo real e alerta gestores sobre processos que estão prestes a travar antes que afetem o cliente.',
      },
      {
        area: 'Financeiro',
        title: 'Projeção de Cenários',
        text: 'Simulação avançada de fluxo de caixa baseada em variáveis macroeconômicas e histórico do ERP, recomendando o melhor momento para investimentos.',
      },
      {
        area: 'Diretoria',
        title: 'Conselheiro Virtual de Negócios',
        text: 'Em vez de olhar dashboards, o CEO recebe insights em linguagem natural: "O lucro da unidade X caiu 3% devido ao aumento logístico. Recomendo revisar a rota Y."',
      },
      {
        area: 'Comercial',
        title: 'Scoring de Propensão',
        text: 'A IA analisa o comportamento e o histórico dos leads, indicando não apenas quem contatar, mas qual a probabilidade de conversão e a melhor abordagem.',
      },
    ],
  },
}
