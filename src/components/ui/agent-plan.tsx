import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../motion'

type Task = { step: number; label: string; subs: string[] }

/**
 * Um agente executando um plano, tarefa por tarefa (inspirado no "agent plan" do 21st.dev).
 * Avança sozinho enquanto está na tela e recomeça ao terminar; `onStep` informa a etapa em execução.
 */
export function AgentPlan({
  title,
  note,
  tasks,
  onStep,
}: {
  title: string
  note: string
  tasks: Task[]
  onStep?: (step: number) => void
}) {
  // posição da execução: tarefa `t`, subtarefa `s` (s === subs.length: tarefa concluída)
  const [pos, setPos] = useState(() => (prefersReducedMotion() ? { t: tasks.length, s: 0 } : { t: 0, s: 0 }))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.3 })
    io.observe(ref.current!)
    const id = window.setInterval(() => {
      if (!visible || document.hidden) return
      setPos(({ t, s }) => {
        if (t >= tasks.length) return { t: 0, s: 0 } // recomeça
        if (s < tasks[t].subs.length) return { t, s: s + 1 }
        return { t: t + 1, s: 0 }
      })
    }, 1100)
    return () => {
      window.clearInterval(id)
      io.disconnect()
    }
  }, [tasks])

  // ao concluir, informa uma etapa além da última (todas concluídas)
  const running = pos.t < tasks.length ? tasks[pos.t].step : tasks[tasks.length - 1].step + 1
  useEffect(() => {
    onStep?.(running)
  }, [running, onStep])

  const done = pos.t >= tasks.length
  const progress = tasks.length ? Math.min(pos.t, tasks.length) / tasks.length : 0

  return (
    <div className="ap" ref={ref}>
      <div className="ap-head">
        <span className={`ap-live${done ? ' is-done' : ''}`} aria-hidden="true" />
        <strong>{title}</strong>
        <span className="ap-note">{note}</span>
      </div>
      <div className="ap-bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <ol className="ap-list">
        {tasks.map((task, ti) => {
          const state = ti < pos.t ? 'done' : ti === pos.t ? 'run' : 'todo'
          return (
            <li key={task.label} className={`ap-task is-${state}`}>
              <div className="ap-row">
                <StatusIcon state={state} />
                <span className="ap-label">{task.label}</span>
                <span className="ap-badge">{state === 'done' ? 'concluído' : state === 'run' ? 'executando' : 'na fila'}</span>
              </div>
              <ul className="ap-subs">
                {task.subs.map((sub, si) => {
                  const ss = state === 'done' || (state === 'run' && si < pos.s) ? 'done' : state === 'run' && si === pos.s ? 'run' : 'todo'
                  return (
                    <li key={sub} className={`ap-sub is-${ss}`}>
                      <StatusIcon state={ss} small />
                      {sub}
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>
      <p className="ap-foot" aria-live="polite">
        {done ? 'Plano concluído · aguardando aprovação do analista' : `Etapa ${pos.t + 1} de ${tasks.length}`}
      </p>
    </div>
  )
}

function StatusIcon({ state, small = false }: { state: string; small?: boolean }) {
  return (
    <span className={`ap-ic is-${state}${small ? ' is-small' : ''}`} aria-hidden="true">
      {state === 'done' && (
        <svg viewBox="0 0 16 16">
          <path d="M4 8.5l2.5 2.5L12 5.5" />
        </svg>
      )}
    </span>
  )
}
