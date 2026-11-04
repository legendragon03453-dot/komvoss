import type { Company } from './types'

const company: Company = {
  id: 'senior',
  name: 'Senior Noroeste Paulista',
  area: 'Gestão e ERP',
  text: 'Especialista em sistemas de gestão empresarial e HCM, responsável por implantar e sustentar a base de gestão das empresas.',
  points: ['ERP e gestão integrada', 'HCM e gestão de pessoas', 'Implantação e suporte'],
  logo: {
    src: 'logo-senior-np.webp',
    w: 329,
    h: 76,
    chip: true,
  },
  solutions: ['gestao-empresarial', 'pessoas-rh'],
}

export default company
