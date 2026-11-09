import type { Category } from './data'
import { SOLUTION_ART } from './SolutionsBento'

// capa gerada de cada artigo: a ilustração da frente mais próxima da categoria
const COVER: Record<Category, string> = {
  'IA aplicada': 'dados-automacao-ia',
  Dados: 'dados-automacao-ia',
  Gestão: 'gestao-empresarial',
  'Transformação Empresarial': 'gestao-empresarial',
  RH: 'pessoas-rh',
  Cloud: 'cloud-tecnologia',
}

const isSvg = (src: string) => /^data:image\/svg\+xml|\.svg(\?|#|$)/i.test(src)

/** Com `src` (capa enviada pelo painel), mostra a foto ou a capa animada (.svg com CSS dentro);
 *  senão, a ilustração da categoria. */
export function Cover({ cat, src }: { cat: Category; src?: string }) {
  if (src && isSvg(src))
    return (
      <div className="ins-cover is-svg">
        <img src={src} alt="" loading="lazy" decoding="async" />
      </div>
    )
  if (src)
    return (
      <div className="ins-cover is-photo">
        <img src={src} alt="" loading="lazy" decoding="async" />
      </div>
    )
  const Art = SOLUTION_ART[COVER[cat]] ?? SOLUTION_ART['gestao-empresarial']
  return <div className="ins-cover">{Art && <Art />}</div>
}
