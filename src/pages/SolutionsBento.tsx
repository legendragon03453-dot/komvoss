import { Link } from 'react-router-dom'
import { SOLUTIONS } from './data'

/* Ilustrações animadas (SVG + CSS) de cada frente. Cinza na estrutura; o destaque segue a empresa responsável
   (verde Senior, rosa Trusth, azul Statum). */

function GestaoArt() {
  const mods = [
    ['Financeiro', 60, 50],
    ['Compras', 200, 26],
    ['Estoque', 340, 50],
    ['Fiscal', 60, 190],
    ['Vendas', 200, 214],
    ['Produção', 340, 190],
  ] as const
  return (
    <svg viewBox="0 0 400 240" className="sb-art is-senior" aria-hidden="true">
      {mods.map(([, x, y], i) => (
        <path key={'l' + i} d={`M200 120 L${x} ${y}`} className="sb-line" />
      ))}
      {mods.map(([, x, y], i) => (
        <path key={'p' + i} d={`M${x} ${y} L200 120`} className="sb-flow" style={{ animationDelay: `${i * 0.45}s` }} pathLength={1} />
      ))}
      {mods.map(([name, x, y], i) => (
        <g key={name} className="sb-chip" style={{ animationDelay: `${i * 0.45}s` }}>
          <rect x={x - 42} y={y - 13} width="84" height="26" rx="7" />
          <text x={x} y={y + 4} textAnchor="middle">
            {name}
          </text>
        </g>
      ))}
      <g className="sb-hub">
        <rect x="168" y="96" width="64" height="48" rx="11" />
        <text x="200" y="125" textAnchor="middle">
          ERP
        </text>
      </g>
    </svg>
  )
}

function PessoasArt() {
  const rows = [0, 1, 2, 3, 4]
  return (
    <svg viewBox="0 0 400 240" className="sb-art is-trusth" aria-hidden="true">
      <text x="56" y="34" className="sb-label">
        Folha de pagamento · conferência
      </text>
      <rect x="56" y="44" width="288" height="4" rx="2" className="sb-track" />
      <rect x="56" y="44" width="288" height="4" rx="2" className="sb-progress" />
      {rows.map((r) => {
        const y = 70 + r * 32
        return (
          <g key={r} className="sb-row" style={{ animationDelay: `${r * 0.6}s` }}>
            <circle cx="70" cy={y + 10} r="9" className="sb-avatar" />
            <rect x="90" y={y + 4} width={110 - r * 9} height="5" rx="2.5" className="sb-bar" />
            <rect x="90" y={y + 13} width={70 + r * 6} height="4" rx="2" className="sb-bar sb-bar-soft" />
            <rect x="262" y={y + 3} width="54" height="14" rx="4" className="sb-amount" />
            <g className="sb-check" style={{ animationDelay: `${r * 0.6}s` }}>
              <circle cx="334" cy={y + 10} r="9" />
              <path d={`M329.5 ${y + 10} l3 3 l6 -6`} />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

function CloudArt() {
  const racks = [110, 200, 290]
  return (
    <svg viewBox="0 0 400 240" className="sb-art is-statum" aria-hidden="true">
      <path
        className="sb-cloud"
        d="M146 74 a28 28 0 0 1 52 -14 a34 34 0 0 1 62 12 a24 24 0 0 1 -4 47 h-104 a23 23 0 0 1 -6 -45z"
      />
      <text x="200" y="104" textAnchor="middle" className="sb-label sb-label-center">
        99,9% no ar
      </text>
      {racks.map((x, i) => (
        <g key={x}>
          <path d={`M${x} 150 V122`} className="sb-line" />
          <circle cx={x} cy="150" r="3" className="sb-packet" style={{ animationDelay: `${i * 0.7}s` }} />
          <rect x={x - 34} y="152" width="68" height="70" rx="8" className="sb-rack" />
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect x={x - 24} y={163 + k * 19} width="34" height="5" rx="2.5" className="sb-bar" />
              <circle cx={x + 20} cy={165.5 + k * 19} r="3" className="sb-led" style={{ animationDelay: `${(i * 3 + k) * 0.35}s` }} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

function DadosArt() {
  const line = 'M40 196 C80 186 98 160 130 164 S182 128 214 132 S268 94 300 98 S346 58 362 52'
  const pts = [
    [130, 164],
    [214, 132],
    [300, 98],
  ]
  return (
    <svg viewBox="0 0 400 240" className="sb-art is-statum" aria-hidden="true">
      {[60, 110, 160, 210].map((y) => (
        <path key={y} d={`M40 ${y} H362`} className="sb-grid-line" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <rect key={k} x={52 + k * 44} y={210 - (18 + k * 9)} width="16" height={18 + k * 9} rx="3" className="sb-col" />
      ))}
      <path d={line} className="sb-chart" pathLength={1} />
      <g className="sb-agent">
        <circle cx="96" cy="70" r="16" />
        <path d="M96 61 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6z" />
      </g>
      {pts.map(([x, y], i) => (
        <g key={x}>
          <path d={`M110 76 L${x} ${y}`} className="sb-dash" />
          <circle cx={x} cy={y} r="4.5" className="sb-point" style={{ animationDelay: `${0.8 + i * 0.5}s` }} />
        </g>
      ))}
      <circle cx="362" cy="52" r="5" className="sb-end" />
    </svg>
  )
}

/** Ilustração animada de cada frente, pelo slug (reaproveitada nas páginas de cada solução). */
export const SOLUTION_ART: Record<string, () => JSX.Element> = {
  'gestao-empresarial': GestaoArt,
  'pessoas-rh': PessoasArt,
  'cloud-tecnologia': CloudArt,
  'dados-automacao-ia': DadosArt,
}

/** "Da dor à solução": bento com as quatro frentes, em grade assimétrica (larga/estreita, estreita/larga). */
export function SolutionsBento() {
  return (
    <div className="sb-grid">
      {SOLUTIONS.map((s, i) => {
        const Art = SOLUTION_ART[s.slug]
        return (
          <Link key={s.slug} to={`/solucoes/${s.slug}`} className={`sb-card sb-card-${i + 1}`} data-anim="up">
            <div className="sb-visual">
              <Art />
            </div>
            <div className="sb-copy">
              <p className="sb-kicker">
                {s.num} · {s.title}
              </p>
              <h3>{s.short}</h3>
              <p className="sb-pain">{s.problem}</p>
              <span className="sb-more">Ver solução →</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
