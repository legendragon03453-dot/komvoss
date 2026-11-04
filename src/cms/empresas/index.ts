import senior from './senior'
import statum from './statum'
import trusth from './trusth'
import type { Company } from './types'

export type { Company } from './types'

/** Ordem em que as empresas aparecem no site. */
export const COMPANIES: Company[] = [senior, statum, trusth]
