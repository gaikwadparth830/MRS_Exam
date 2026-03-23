import { useCallback } from 'react'
import type { AxiosRequestConfig } from 'axios'

import { httpClient } from '../api/httpClient'
import { useApi, type UseApiOptions, type UseApiResult } from './useApi'

export interface UsePostOptions<TData>
  extends UseApiOptions<TData> {
  config?: AxiosRequestConfig
}

export interface UsePostResult<TData, TBody>
  extends UseApiResult<TData, TBody> {
  post: (payload: TBody) => Promise<TData | null>
}

export const usePost = <TData, TBody = unknown>(
  url: string,
  options: UsePostOptions<TData> = {},
): UsePostResult<TData, TBody> => {
  const { config, initialData, onSuccess, onError } = options

  const api = useApi<TData, TBody>(
    async (payload) => {
      const response = await httpClient.post<TData>(url, payload, config)
      return response.data
    },
    { initialData, onSuccess, onError },
  )

  const post = useCallback(
    (payload: TBody) => api.execute(payload),
    [api],
  )

  return {
    ...api,
    post,
  }
}
