import { useMemo } from 'react'

import type { Center } from '../api/generatedClient'
import {
  defaultAllowedCentre,
  filterCentres,
  isCentreUser,
  loadAuthClaims,
  type AuthClaims,
} from './permissions'

export type CentreScope = {
  claims: AuthClaims
  centreLimited: boolean
  defaultCentre: string
  filterOptions: (centres: Center[]) => Center[]
}

export const useCentreScope = (): CentreScope => {
  const claims = useMemo(() => loadAuthClaims(), [])
  const centreLimited = isCentreUser(claims)
  const defaultCentre = defaultAllowedCentre(claims)

  return {
    claims,
    centreLimited,
    defaultCentre,
    filterOptions: (centres) => filterCentres(centres, claims),
  }
}
