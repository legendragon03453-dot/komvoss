import type { Head, Hero, Seo } from './types'

/* Página /clientes. Itens entre [colchetes] são placeholders: substituir por dados reais,
   com autorização dos clientes. Os números ficam em src/cms/site.ts (NUMEROS). */
export const clientes: {
  seo: Seo
  hero: Hero
  numbers: Head
  /** os logos ficam em src/cms/parceiros.ts (CLIENT_LOGOS) */
  logos: Head
  /** `destaque: true` deixa o depoimento em card branco (o time escolhe quais).
   *  `cols` (1 a 3) e `hidden` também podem ser mudados pelo painel (Gerenciar site › Clientes › Depoimentos). */
  testimonials: Head & { items: { quote: string; name: string; role: string; destaque?: boolean }[]; cols?: number; hidden?: boolean }
  cases: Head & {
    hidden?: boolean
    items: { company: string; sector: string; solution: string; challenge: string; result: string; outcome: string }[]
  }
} = {
  seo: {
    title: 'Clientes e cases | Grupo Komvos',
    description:
      'Números, depoimentos e cases de sucesso de empresas que simplificaram e aceleraram a operação com o Grupo Komvos.',
  },
  hero: {
    eyebrow: 'Clientes',
    title: { text: 'Resultados que falam por nós.', highlight: 'falam por nós.' },
    lead: 'Empresas de diferentes setores confiam no Grupo Komvos para simplificar a gestão, cuidar das pessoas e acelerar a tecnologia.',
    actions: [{ label: 'Quero resultados assim', to: '/contato' }],
  },
  numbers: {
    eyebrow: 'Em números',
    title: { text: 'Credibilidade construída desde 2006', highlight: 'desde 2006' },
  },
  logos: {
    eyebrow: 'Quem confia no Grupo Komvos',
    title: { text: 'Empresas que simplificaram', highlight: 'simplificaram' },
  },
  testimonials: {
    eyebrow: 'Depoimentos',
    title: { text: 'O que dizem nossos clientes', highlight: 'nossos clientes' },
    cols: 3,
    items: [
      { quote: '[Depoimento do cliente sobre o resultado alcançado com o Grupo Komvos.]', name: '[Nome]', role: '[Cargo, Empresa]', destaque: true },
      { quote: '[Depoimento do cliente sobre a experiência com o ecossistema Komvos.]', name: '[Nome]', role: '[Cargo, Empresa]' },
      { quote: '[Depoimento do cliente sobre o atendimento e a parceria.]', name: '[Nome]', role: '[Cargo, Empresa]' },
      { quote: '[Depoimento sobre a implantação e o suporte das equipes.]', name: '[Nome]', role: '[Cargo, Empresa]' },
      { quote: '[Depoimento sobre a operação de folha e o DP.]', name: '[Nome]', role: '[Cargo, Empresa]', destaque: true },
      { quote: '[Depoimento sobre dados, automação e IA na operação.]', name: '[Nome]', role: '[Cargo, Empresa]' },
    ],
  },
  cases: {
    eyebrow: 'Cases de sucesso',
    title: { text: 'Desafio, solução e resultado', highlight: 'resultado' },
    items: [
      {
        company: '[Empresa cliente]',
        sector: '[Setor]',
        solution: 'Gestão Empresarial',
        challenge: '[Qual era o problema do cliente.]',
        result: '[O que o Grupo Komvos implantou.]',
        outcome: '[Número ou ganho alcançado.]',
      },
      {
        company: '[Empresa cliente]',
        sector: '[Setor]',
        solution: 'Pessoas & RH',
        challenge: '[Qual era o problema do cliente.]',
        result: '[O que o Grupo Komvos implantou.]',
        outcome: '[Número ou ganho alcançado.]',
      },
      {
        company: '[Empresa cliente]',
        sector: '[Setor]',
        solution: 'Dados, Automação & IA',
        challenge: '[Qual era o problema do cliente.]',
        result: '[O que o Grupo Komvos implantou.]',
        outcome: '[Número ou ganho alcançado.]',
      },
    ],
  },
}
