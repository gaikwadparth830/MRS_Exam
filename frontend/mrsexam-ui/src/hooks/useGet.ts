import { useCallback, useEffect } from 'react'
import type { AxiosRequestConfig } from 'axios'

import { httpClient } from '../api/httpClient'
import { useApi, type UseApiOptions, type UseApiResult } from './useApi'

export interface UseGetOptions<TData, TParams>
  extends UseApiOptions<TData> {
  params?: TParams
  config?: AxiosRequestConfig
  enabled?: boolean
  immediate?: boolean
}

export interface UseGetResult<TData, TParams>
  extends UseApiResult<TData, TParams | undefined> {
  refetch: (params?: TParams) => Promise<TData | null>
}

export const useGet = <TData, TParams = Record<string, unknown>>(
  url: string,
  options: UseGetOptions<TData, TParams> = {},
): UseGetResult<TData, TParams> => {
  const {
    params,
    config,
    enabled = true,
    immediate = true,
    initialData,
    onSuccess,
    onError,
  } = options

  const api = useApi<TData, TParams | undefined>(
    async (requestParams) => {
      const response = await httpClient.get<TData>(url, {
        ...config,
        params: requestParams ?? params,
      })

      return response.data
    },
    { initialData, onSuccess, onError },
  )

  const refetch = useCallback(
    (requestParams?: TParams) => api.execute(requestParams ?? params),
    [api, params],
  )

  useEffect(() => {
    if (!enabled || !immediate) {
      return
    }

    void api.execute(params)
  }, [api, enabled, immediate, params])

  return {
    ...api,
    refetch,
  }
}
