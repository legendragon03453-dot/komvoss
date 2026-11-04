import InkOrbitFeatures from '../components/ui/ink-orbit-features'

/**
 * "Mais simples, mais rápido": proposta de valor em 3 pilares (Simplificar, Acelerar, Conectar),
 * no bento interativo do InkOrbitFeatures, com as cores da identidade v2 (ver .komvos-features em v2.css).
 */
export function Features() {
  return (
    <section className="komvos-features" data-chapter="Mais simples, mais rápido" aria-label="Simplificar, acelerar e conectar">
      <InkOrbitFeatures
        theme="dark"
        brand="Komvos"
        tag="Mais simples, mais rápido"
        title={'Simplificar. *Acelerar.*\nConectar.'}
        collaboration={{
          title: 'Simplificar',
          description:
            'Menos sistemas desconectados, menos retrabalho. Processos claros do ERP à folha de pagamento, com quem entende de gestão e de pessoas.',
        }}
        reports={{
          title: 'Informação pronta para decidir',
          description: 'Relatórios e indicadores saindo direto da operação, sem planilhas paralelas nem números divergentes.',
        }}
        integrations={{
          title: 'Conectar',
          description: 'Gestão, processos, dados e inteligência integrados em uma única visão: ERP ➔ Komvos OS ➔ Komvos Mind.',
          tools: ['ERP', 'Cloud', 'Folha', 'Dados'],
        }}
        insights={{
          title: 'Acelerar',
          description: 'Infraestrutura, dados e automação para decidir e executar mais rápido, sem a lentidão tecnológica que trava o crescimento.',
        }}
      />
    </section>
  )
}
