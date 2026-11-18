/**
 * Textos principais da Home (editáveis também pelo painel).
 * Em cada título, `highlight` é o trecho que recebe o destaque (gradiente) logo depois de `text`.
 */
export const home = {
  hero: {
    line1: 'Sua empresa.',
    line2: 'Mais simples,',
    highlight: 'mais rápida.',
    lead: 'Conectamos o que uma empresa precisa para funcionar melhor.',
    primary: 'Entre em contato',
    secondary: 'Conheça as soluções',
  },
  arch: { eyebrow: 'Nosso Posicionamento', title: 'Arquitetura', highlight: 'Tecnológica' },
  ecosystem: { title: 'Sistemas pensados para o melhor da', highlight: 'sua empresa' },
  social: { eyebrow: 'Prova social', title: 'Empresas especialistas.', highlight: 'Uma única visão.' },
  reels: {
    eyebrow: 'Komvos em vídeo',
    title: 'O Grupo Komvos',
    highlight: 'na prática',
    text: 'Gestão, pessoas, tecnologia e o dia a dia do Grupo Komvos em vídeos curtos, direto do nosso Instagram.',
    hidden: false,
    /** publicações do @komvostech (painel → Editar site → Home → Vídeos: adicionar, remover e reordenar).
     *  `cover` vazio usa a capa baixada em public/assets/reels/<id>.webp */
    items: [
      { url: 'https://www.instagram.com/reel/DeM3jlqkyy9/', title: 'Quando a operação cresce', tag: 'Gestão', cover: '' },
      { url: 'https://www.instagram.com/reel/DdKNuuqEfiU/', title: 'Synkrh: o RH que responde no WhatsApp', tag: 'IA', cover: '' },
      { url: 'https://www.instagram.com/reel/DeIEohOFFXv/', title: 'Terceirizar a folha de verdade', tag: 'BPO', cover: '' },
      { url: 'https://www.instagram.com/reel/DdFBGt9CfBq/', title: 'Do chamado à solução', tag: 'Tecnologia', cover: '' },
      { url: 'https://www.instagram.com/reel/DeH4qXmlUg4/', title: 'Organizar o que cresceu junto', tag: 'Gestão', cover: '' },
      { url: 'https://www.instagram.com/reel/DdXCps5jdKV/', title: 'Programa Finders', tag: 'Parcerias', cover: '' },
      { url: 'https://www.instagram.com/reel/DbBpZ8yCluV/', title: 'Processos, tecnologia e pessoas', tag: 'Integração', cover: '' },
      { url: 'https://www.instagram.com/reel/DaQIRkUEjMv/', title: 'Rota Inova e a bioenergia', tag: 'Inovação', cover: '' },
      { url: 'https://www.instagram.com/reel/DZ52Nvtvqgc/', title: 'Nossa nova sede', tag: 'Institucional', cover: '' },
      { url: 'https://www.instagram.com/reel/Db3WOHpOfjP/', title: 'De 2006 a 2026', tag: 'Nosso time', cover: '' },
      { url: 'https://www.instagram.com/reel/Db9EdEVFLGe/', title: '20 anos de reconhecimento', tag: 'Prêmios', cover: '' },
      { url: 'https://www.instagram.com/reel/Dd6xyt9mu7x/', title: 'Indicações que geram valor', tag: 'Parcerias', cover: '' },
    ] as { url: string; title: string; tag: string; cover: string }[],
  },
  insights: { eyebrow: 'Komvos Insights', title: 'Conteúdo para', highlight: 'decidir melhor' },
  cta: {
    eyebrow: 'Entre em contato',
    title: 'Existe um jeito mais simples de fazer.',
    text: 'Conte qual é o seu desafio atual. Um especialista do Grupo Komvos retorna para entender o cenário da sua empresa e indicar o melhor caminho.',
  },
}
