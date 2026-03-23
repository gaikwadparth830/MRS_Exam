import { useCallback, useMemo, useState } from 'react'
import axios, { type AxiosError } from 'axios'

export interface UseApiOptions<TData> {
  initialData?: TData | null
  onSuccess?: (data: TData) => void
  onError?: (message: string, error: unknown) => void
}

export interface UseApiResult<TData, TVariables> {
  data: TData | null
  error: string | null
  isLoading: boolean
  execute: (variables: TVariables) => Promise<TData | null>
  reset: () => void
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error as AxiosError<{ message?: string }>
    const responseMessage = apiError.response?.data?.message
    return responseMessage ?? apiError.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

export const useApi = <TData, TVariables>(
  apiCall: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions<TData> = {},
): UseApiResult<TData, TVariables> => {
  const { initialData = null, onSuccess, onError } = options

  const [data, setData] = useState<TData | null>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiCall(variables)
        setData(result)
        onSuccess?.(result)
        return result
      } catch (requestError) {
        const message = getErrorMessage(requestError)
        setError(message)
        onError?.(message, requestError)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [apiCall, onSuccess, onError],
  )

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setIsLoading(false)
  }, [initialData])

  return useMemo(
    () => ({
      data,
      error,
      isLoading,
      execute,
      reset,
    }),
    [data, error, isLoading, execute, reset],
  )
}
