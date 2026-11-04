import type { Company } from './types'

const company: Company = {
  id: 'statum',
  name: 'Statum',
  area: 'Cloud, Dados, Tech e IA',
  text: 'Especialista em infraestrutura, cloud, desenvolvimento e dados, levando automação e inteligência artificial para a operação.',
  points: [
    'Infraestrutura, cloud e segurança',
    'Integração, desenvolvimento e SaaS',
    'Dados, automação e IA',
  ],
  logo: {
    src: 'logo-statum.png',
    w: 400,
    h: 69,
    chip: true,
  },
  solutions: ['cloud-tecnologia', 'dados-automacao-ia'],
}

export default company
