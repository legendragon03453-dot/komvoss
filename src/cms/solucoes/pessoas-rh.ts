import type { Solution } from './types'

const solution: Solution = {
  slug: 'pessoas-rh',
  num: '02',
  title: 'Pessoas & RH',
  highlight: 'RH',
  short: 'Tecnologia HCM, operação de folha e serviços especializados.',
  problem: 'Erros na folha de pagamento, retrabalho no DP e times de RH presos à operação em vez de cuidar de pessoas.',
  pains: [
    'Folha de pagamento com erros que viram passivo e desgaste.',
    'Departamento pessoal sobrecarregado com tarefas manuais.',
    'Pouco tempo para estratégia, desenvolvimento e cultura.',
  ],
  gains: [
    'Folha conferida por especialistas e tecnologia HCM, com menos risco de erro.',
    'Rotinas de DP automatizadas e um time livre do trabalho manual.',
    'Um RH com tempo para o que importa: pessoas, desenvolvimento e cultura.',
  ],
  deliveries: [
    { title: 'Tecnologia HCM', text: 'Plataforma completa de gestão de pessoas, do ponto à folha.' },
    { title: 'Operação de folha', text: 'BPO de folha de pagamento com especialistas cuidando do processo.' },
    { title: 'Serviços especializados', text: 'Apoio técnico em DP e RH para rotinas, obrigações e projetos.' },
  ],
  executor: 'trusth',
}

export default solution
