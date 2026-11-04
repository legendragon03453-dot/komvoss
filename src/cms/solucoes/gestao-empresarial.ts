import type { Solution } from './types'

const solution: Solution = {
  slug: 'gestao-empresarial',
  num: '01',
  title: 'Gestão Empresarial',
  highlight: 'Empresarial',
  short: 'ERP e gestão integrada para operar com uma visão única do negócio.',
  problem: 'Sistemas desconectados, dados que não batem entre as áreas e decisões tomadas sem uma visão única do negócio.',
  pains: [
    'Cada área trabalha em um sistema e ninguém confia no mesmo número.',
    'Fechamentos lentos, planilhas paralelas e retrabalho constante.',
    'Crescimento que aumenta a complexidade em vez da eficiência.',
  ],
  gains: [
    'Uma única base de dados para todas as áreas: um número, uma verdade.',
    'Processos integrados de ponta a ponta, sem planilhas paralelas.',
    'Uma operação que escala junto com o negócio, sem perder o controle.',
  ],
  deliveries: [
    { title: 'ERP', text: 'Gestão integrada de ponta a ponta, do comercial ao fiscal, em uma única base.' },
    { title: 'HCM', text: 'Gestão de pessoas conectada ao restante da operação.' },
    { title: 'Gestão financeira', text: 'Contas, fluxo de caixa e controladoria com informação confiável.' },
    { title: 'Logística', text: 'Compras, estoque e expedição com rastreabilidade.' },
    { title: 'Indústria', text: 'Planejamento e controle da produção integrados ao negócio.' },
    { title: 'Agronegócio', text: 'Gestão adaptada à realidade e ao ciclo do agro.' },
  ],
  executor: 'senior',
}

export default solution
