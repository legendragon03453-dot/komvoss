import type { FormContent } from '../../pages/CmsForm'
import type { Head, Hero, Item, Seo, Title } from './types'

/* Página /seja-um-parceiro. Textos de base: revisar com o time comercial
   (modelos de parceria e regras do Programa Finders). */
/** Campos-base de cada tipo de parceria (provisórios, até chegarem os formulários específicos). */
function partnerForm(submit: string): FormContent {
  return {
    fields: [
      { name: 'nome', label: 'Nome completo', required: true, autoComplete: 'name' },
      { name: 'email', label: 'E-mail', type: 'email', required: true, half: true, autoComplete: 'email' },
      { name: 'telefone', label: 'Telefone / WhatsApp', type: 'tel', half: true, autoComplete: 'tel' },
      { name: 'empresa', label: 'Empresa', autoComplete: 'organization' },
      { name: 'mensagem', label: 'Conte um pouco sobre você', type: 'textarea' },
    ],
    submit,
    doneTitle: 'Cadastro recebido!',
    doneText: 'Em breve nosso time de parcerias vai falar com você.',
  }
}

export const parceiro: {
  seo: Seo
  hero: Hero
  models: Head & { items: (Item & { tag: string })[] }
  why: Head & { items: Item[] }
  reel: { id: string; tag: string; title: string; eyebrow: string; heading: Title; text: string }
  steps: Head & { items: Item[] }
  form: Head & { chooseLabel: string; types: { id: string; label: string; text: string; form: FormContent }[] }
} = {
  seo: {
    title: 'Seja um parceiro | Grupo Komvos',
    description:
      'Seja parceiro do Grupo Komvos: indique, revenda ou integre soluções de gestão, pessoas, tecnologia e IA do ecossistema Komvos.',
  },
  hero: {
    eyebrow: 'Seja um parceiro',
    title: { text: 'Cresça junto com o Grupo Komvos.', highlight: 'com o Grupo Komvos.' },
    lead: 'Indique, leve para a sua carteira ou integre soluções do ecossistema Komvos e gere valor para os seus clientes e para o seu negócio.',
    actions: [{ label: 'Quero ser parceiro', to: '/seja-um-parceiro#cadastro' }],
  },
  models: {
    eyebrow: 'Formas de parceria',
    title: { text: 'Escolha como caminhar com a gente', highlight: 'caminhar com a gente' },
    items: [
      {
        tag: 'Programa Finders',
        title: 'Indicação',
        text: 'Conhece uma empresa que precisa simplificar a operação? Indique pelo Programa Finders e acompanhe a oportunidade.',
      },
      {
        tag: 'Canal',
        title: 'Canal e revenda',
        text: 'Leve as soluções do ecossistema para a sua carteira de clientes, com o apoio dos especialistas de cada frente.',
      },
      {
        tag: 'Tecnologia',
        title: 'Integração e tecnologia',
        text: 'Conecte seu produto ou serviço às soluções de gestão, dados e IA do Grupo Komvos.',
      },
    ],
  },
  why: {
    eyebrow: 'Por que ser parceiro',
    title: { text: 'Um ecossistema inteiro ao seu lado', highlight: 'ao seu lado' },
    items: [
      { title: 'Um portfólio completo', text: 'Gestão, pessoas, cloud, dados e IA para oferecer em um só lugar.' },
      { title: 'Especialistas em cada frente', text: 'Senior Noroeste Paulista, Statum e Trusth cuidando de cada entrega.' },
      { title: 'Parcerias de peso', text: 'Somos parceiros oficiais Senior Sistemas, Oracle e Microsoft.' },
      { title: 'Experiência comprovada', text: 'Mais de 280 clientes atendidos e mais de 20 anos de história.' },
    ],
  },
  reel: {
    id: 'DdXCps5jdKV',
    tag: 'Parcerias',
    title: 'Programa Finders',
    eyebrow: 'Programa Finders',
    heading: { text: 'Indicações que geram valor', highlight: 'geram valor' },
    text: 'Conheça o Programa Finders, o jeito de transformar a sua rede de contatos em oportunidades com o Grupo Komvos.',
  },
  steps: {
    eyebrow: 'Como funciona',
    title: { text: 'Três passos para começar', highlight: 'começar' },
    items: [
      { title: 'Cadastre-se', text: 'Conte quem você é e qual modelo de parceria faz sentido para você.' },
      { title: 'Conversamos', text: 'Nosso time entra em contato para entender o seu perfil e alinhar os próximos passos.' },
      { title: 'Começamos juntos', text: 'Com tudo combinado, você passa a gerar oportunidades com o ecossistema Komvos.' },
    ],
  },
  form: {
    eyebrow: 'Cadastro',
    title: { text: 'Quero ser parceiro', highlight: 'parceiro' },
    lead: 'Escolha o tipo de parceria para ver o formulário certo. Nosso time de parcerias entra em contato.',
    chooseLabel: 'Que tipo de parceria você procura?',
    /* Cada tipo tem o próprio formulário. TODO: substituir pelos campos específicos que o time vai enviar. */
    types: [
      {
        id: 'indicacao',
        label: 'Indicação',
        text: 'Indique empresas pelo Programa Finders.',
        form: partnerForm('Quero indicar'),
      },
      {
        id: 'canal',
        label: 'Canal e revenda',
        text: 'Leve as soluções do ecossistema para a sua carteira.',
        form: partnerForm('Quero ser canal'),
      },
      {
        id: 'integracao',
        label: 'Integração e tecnologia',
        text: 'Conecte seu produto ou serviço às soluções Komvos.',
        form: partnerForm('Quero integrar'),
      },
    ],
  },
}
