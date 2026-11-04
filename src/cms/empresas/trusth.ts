import type { Company } from './types'

const company: Company = {
  id: 'trusth',
  name: 'Trusth',
  area: 'Operação, BPO e RH',
  text: 'Especialista em operação de RH e BPO, cuidando da folha de pagamento e das rotinas que exigem precisão.',
  points: [
    'BPO de folha de pagamento',
    'DP terceirizado de alta performance',
    'Serviços especializados de RH',
  ],
  logo: {
    src: 'logo-trusth.svg',
    w: 171,
    h: 29,
    chip: true,
  },
  solutions: ['pessoas-rh'],
}

export default company
