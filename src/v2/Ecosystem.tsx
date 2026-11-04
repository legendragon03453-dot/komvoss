import { Link } from 'react-router-dom'
import { A } from '../content'
import { Grad, OutlineButton, V2 } from './ui'
import { home } from '../cms/pages/home'

// Um card por empresa. No Figma o terceiro card repetia a Senior; aqui ele é a Statum,
// e cada card segue a cor da empresa (verde Senior, magenta Trusth, azul Statum) na área de atuação e na faixa do topo.
const CARDS = [
  {
    id: 'senior',
    className: 'is-senior',
    name: 'Gestão Empresarial',
    text: 'Gestão e ERP: sistemas de gestão empresarial e HCM como base do negócio.',
  },
  {
    id: 'trusth',
    className: 'is-trusth',
    name: 'BPO & RH',
    text: 'Operação, BPO e RH: folha de pagamento e DP terceirizado de alta performance.',
  },
  {
    id: 'statum',
    className: 'is-statum',
    name: 'Tecnologia',
    text: 'Cloud, Dados, Tech e IA: infraestrutura, integração, segurança e automação.',
  },
]

/** Seção "Ecossistema Komvos" do Figma v2: hub com o ícone oficial ligado às três empresas. */
export function Ecosystem() {
  return (
    <section className="v2-eco" data-chapter="Ecossistema">
      <p className="v2-eco-kicker" data-anim="up">
        Ecossistema Komvos
      </p>
      <h2 className="v2-eco-title" data-anim="up">
        {home.ecosystem.title} <Grad>{home.ecosystem.highlight}</Grad>
      </h2>

      <div className="v2-eco-map">
        <div className="v2-eco-hub" data-anim="scale">
          <img className="v2-eco-ring" src={`${V2}/eco-ring.svg`} alt="" width={156} height={156} />
          <span className="logo-crop v2-eco-icon">
            <img src={`${A}/logo.png`} alt="Grupo Komvos" />
          </span>
          <span className="v2-eco-pulse" aria-hidden="true" />
        </div>

        <div className="v2-eco-branches" aria-hidden="true">
          <span className="v2-eco-branch is-left">
            <img src={`${V2}/eco-branch-left.svg`} alt="" width={275} height={539} />
          </span>
          <span className="v2-eco-branch is-right">
            <img src={`${V2}/eco-branch-right.svg`} alt="" width={275} height={540} />
          </span>
          <span className="v2-eco-stem">
            <img src={`${V2}/eco-line.svg`} alt="" width={275} height={3} />
          </span>
          <span className="v2-eco-signal" />
        </div>

        <div className="v2-eco-cards">
          {CARDS.map((c) => (
            <Link key={c.id} to={`/ecossistema#${c.id}`} className={`v2-eco-card ${c.className}`} data-anim="up">
              <strong className="v2-eco-name">{c.name}</strong>
              <p>{c.text}</p>
              <span className="v2-eco-more">Conhecer →</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="v2-eco-cta" data-anim="up">
        <OutlineButton to="/contato">Entre em contato</OutlineButton>
      </div>
    </section>
  )
}
