import { GhostLink, PageHero, PrimaryLink, usePageMeta } from './ui'

export function NotFound() {
  usePageMeta('Página não encontrada | Grupo Komvos', 'A página que você procura não existe ou mudou de endereço.')

  return (
    <PageHero
      eyebrow="Erro 404"
      word="404"
      title={
        <>
          Essa conexão <span className="teal">não existe.</span>
        </>
      }
      lead="A página que você procura não existe ou mudou de endereço."
    >
      <PrimaryLink to="/">Voltar ao início</PrimaryLink>
      <GhostLink to="/contato">Falar com a gente</GhostLink>
    </PageHero>
  )
}
