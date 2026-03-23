import { useMemo } from 'react'

import { checkApiHealth } from '../features/health/healthSlice'
import { useAppDispatch, useAppSelector } from './redux'

export const useHealth = () => {
  const dispatch = useAppDispatch()
  const health = useAppSelector((state) => state.health)

  return useMemo(
    () => ({
      ...health,
      refresh: () => dispatch(checkApiHealth()),
    }),
    [dispatch, health],
  )
}
