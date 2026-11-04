/**
 * Linhas de fluxo atravessando a tela, com pulsos de luz correndo por elas
 * (fundo da camada Komvos OS: processos e integração).
 */
const LINES = [
  'M-50,120 C300,60 520,260 820,170 S1260,40 1650,150',
  'M-50,260 C260,330 560,180 860,280 S1280,380 1650,260',
  'M-50,400 C340,470 600,320 900,420 S1300,520 1650,410',
  'M-50,540 C240,480 580,640 880,560 S1260,460 1650,560',
  'M-50,680 C320,740 620,600 920,690 S1300,780 1650,690',
  'M-50,820 C280,770 600,880 900,810 S1280,720 1650,830',
]

export function FlowLines({ className = '' }: { className?: string }) {
  return (
    <svg className={`flow-lines ${className}`} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {LINES.map((d, i) => (
        <g key={i}>
          <path d={d} className="fl-line" />
          <path d={d} className="fl-pulse" pathLength={1} style={{ animationDelay: `${-i * 0.9}s`, animationDuration: `${5 + (i % 3)}s` }} />
          <path d={d} className="fl-pulse is-2" pathLength={1} style={{ animationDelay: `${-i * 0.9 - 2.6}s`, animationDuration: `${5 + (i % 3)}s` }} />
        </g>
      ))}
    </svg>
  )
}
