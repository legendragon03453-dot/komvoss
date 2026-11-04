/**
 * Card lateral das camadas da arquitetura (ERP / Komvos OS / Komvos Mind): faixa prateada no tom
 * da camada, com os pontos-chave que ela entrega. Fica ao lado do texto longo da seção.
 */
export function LayerPoints({
  layer,
  role,
  name,
  points,
}: {
  /** 0 = ERP, 1 = Komvos OS, 2 = Komvos Mind (define o tom de prata) */
  layer: number
  role: string
  name: string
  points: string[]
}) {
  return (
    <aside className={`lp is-l${layer}`} data-anim="up">
      <div className="lp-head">
        <span className="lp-role">{role}</span>
        <strong>{name}</strong>
      </div>
      <ol className="lp-list">
        {points.map((p, i) => (
          <li key={p}>
            <span className="lp-num">{String(i + 1).padStart(2, '0')}</span>
            {p}
          </li>
        ))}
      </ol>
    </aside>
  )
}
