/* Parceiros oficiais e logos de clientes (arquivos em public/assets).
   Para incluir um logo: coloque o arquivo na pasta e acrescente uma linha aqui. */

export type Logo = { name: string; src: string }

/** parceiro oficial: `height` = altura do logo no selo branco (px); `badge` = selo/certificação ao lado */
export type Partner = Logo & { height?: number; badge?: { src: string; alt: string } }

/** Parceiros oficiais (faixa da Home). */
export const PARTNERS = {
  eyebrow: 'Parceiros oficiais',
  title: { text: 'Somos parceiros oficiais Senior, Oracle e Microsoft', highlight: 'Senior, Oracle e Microsoft' },
  lead: 'Parcerias oficiais que reforçam as soluções do ecossistema Komvos.',
  items: [
    {
      name: 'Senior Sistemas',
      src: '/assets/partners/senior.svg',
      height: 60,
      badge: { src: '/assets/partners/selo-canal-diamante-senior.webp', alt: 'Selo Senior Canal Diamante Certificado' },
    },
    { name: 'Oracle', src: '/assets/partners/oracle.svg', height: 30 },
    { name: 'Microsoft', src: '/assets/partners/microsoft.svg', height: 48 },
  ] as Partner[],
}

/** Clientes que autorizaram o uso do logo (Home e página Clientes). */
export const CLIENT_LOGOS: Logo[] = [
  { name: 'CMAA', src: '/assets/clientes/cmaa.webp' },
  { name: 'Jumil', src: '/assets/clientes/jumil.webp' },
  { name: 'COFCO Agri', src: '/assets/clientes/cofco-agri.webp' },
  { name: 'Grupo Colorado', src: '/assets/clientes/colorado.webp' },
  { name: 'Grupo Imediato', src: '/assets/clientes/imediato.webp' },
  { name: 'Iquegami Supermercados', src: '/assets/clientes/iquegami.webp' },
  { name: 'Engemasa', src: '/assets/clientes/engemasa.webp' },
  { name: 'Oranges Alimentos', src: '/assets/clientes/oranges.webp' },
  { name: 'Cooxupé', src: '/assets/clientes/cooxupe.webp' },
  { name: 'Frigol', src: '/assets/clientes/frigol.webp' },
  { name: 'Unimed São José do Rio Preto', src: '/assets/clientes/unimed-rio-preto.webp' },
  { name: 'Rodobens', src: '/assets/clientes/rodobens.webp' },
  { name: 'Ipiranga Agroindustrial', src: '/assets/clientes/ipiranga-agro.webp' },
  { name: 'União Marista do Brasil', src: '/assets/clientes/uniao-marista.webp' },
  { name: "Grupo Agro Pau D'Alho", src: '/assets/clientes/pau-dalho.webp' },
  { name: 'Grupo Santa Casa de Franca', src: '/assets/clientes/santa-casa-franca.webp' },
  { name: 'Prefeitura de Franca', src: '/assets/clientes/prefeitura-franca.webp' },
  { name: 'São Martinho', src: '/assets/clientes/sao-martinho.webp' },
  { name: 'Capebe', src: '/assets/clientes/capebe.webp' },
  { name: 'Usina Santa Adélia', src: '/assets/clientes/santa-adelia.webp' },
  { name: 'Gold Pão', src: '/assets/clientes/gold-pao.webp' },
  { name: 'Bebidas Poty', src: '/assets/clientes/poty.webp' },
  { name: 'Reserva de Minas', src: '/assets/clientes/reserva-de-minas.webp' },
  { name: 'Apis Vida', src: '/assets/clientes/apis-vida.webp' },
  { name: 'Aromasil', src: '/assets/clientes/aromasil.webp' },
  { name: 'Grupo Atram', src: '/assets/clientes/atram.webp' },
  { name: 'Barra Mansa', src: '/assets/clientes/barra-mansa.webp' },
  { name: 'Sucos Spres', src: '/assets/clientes/sucos-spres.webp' },
  { name: 'Mavi Alimentos', src: '/assets/clientes/mavi.webp' },
  { name: 'Andreza Enxovais', src: '/assets/clientes/andreza.webp' },
  { name: 'VPJ Alimentos', src: '/assets/clientes/vpj.webp' },
  { name: 'Refrigerantes Jaboti', src: '/assets/clientes/jaboti.webp' },
  { name: 'Biofarm', src: '/assets/clientes/biofarm.webp' },
  { name: 'Agromix', src: '/assets/clientes/agromix.webp' },
  { name: 'Thermas dos Laranjais', src: '/assets/clientes/thermas.webp' },
  { name: 'InterTV', src: '/assets/clientes/intertv.webp' },
  { name: 'Eurobike', src: '/assets/clientes/eurobike.webp' },
  { name: 'Itograss', src: '/assets/clientes/itograss.webp' },
  { name: 'Zanini Renk', src: '/assets/clientes/zanini-renk.webp' },
  { name: 'Coopadap', src: '/assets/clientes/coopadap.webp' },
]
