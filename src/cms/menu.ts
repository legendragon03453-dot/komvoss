/**
 * Itens do menu do site (barra do topo em telas largas e menu em tela cheia).
 * O painel pode renomear, ocultar ou excluir itens; a ordem é a desta lista.
 * - `short`: rótulo mais curto usado na barra do topo
 * - `group: 'arch'`: entra no submenu "Arquitetura"
 * - `bar: false`: só aparece no menu em tela cheia (ex.: "Entre em contato", que já é o botão da direita)
 */
export type MenuItem = {
  id: string
  label: string
  to: string
  short?: string
  group?: 'arch'
  bar?: boolean
  hidden?: boolean
}

export const MENU: MenuItem[] = [
  { id: 'solucoes', label: 'Soluções', to: '/solucoes' },
  { id: 'erp', label: 'ERP by Senior', to: '/erp-by-senior', group: 'arch' },
  { id: 'komvos-os', label: 'Komvos OS', to: '/komvos-os', group: 'arch' },
  { id: 'komvos-mind', label: 'Komvos Mind', to: '/komvos-mind', group: 'arch' },
  { id: 'ecossistema', label: 'Ecossistema', to: '/ecossistema' },
  { id: 'clientes', label: 'Clientes', to: '/clientes' },
  { id: 'insights', label: 'Insights', to: '/insights' },
  { id: 'sobre', label: 'Sobre o Grupo Komvos', short: 'Sobre', to: '/sobre' },
  { id: 'parceiro', label: 'Seja um parceiro', to: '/seja-um-parceiro' },
  { id: 'trabalhe', label: 'Trabalhe conosco', to: '/trabalhe-conosco' },
  { id: 'contato', label: 'Entre em contato', to: '/contato', bar: false },
]

/** Título do submenu das camadas da arquitetura. */
export const MENU_ARCH_LABEL = 'Arquitetura'
