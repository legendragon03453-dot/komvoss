import gestao from './gestao-empresarial'
import pessoas from './pessoas-rh'
import cloud from './cloud-tecnologia'
import dados from './dados-automacao-ia'
import type { Solution } from './types'

export type { Solution } from './types'

/** Ordem em que as soluções aparecem no site (menu, cards, seletor e páginas). */
export const SOLUTIONS: Solution[] = [gestao, pessoas, cloud, dados]
