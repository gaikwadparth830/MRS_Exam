import {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

import { ACCESS_TOKEN_KEY, CURRENT_USER_ID_KEY, clearAuthClaims } from '../auth/permissions'

const AUTH_HEADER = 'Authorization'
const USER_ID_HEADER = 'X-User-Id'
const API_LOGGING_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_API_LOGGING === 'true'

const getToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY)
const getUserId = (): string | null => localStorage.getItem(CURRENT_USER_ID_KEY)

const setHeader = (
  config: InternalAxiosRequestConfig,
  name: string,
  value: string,
): void => {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set(name, value)
    return
  }

  config.headers = AxiosHeaders.from(config.headers)
  config.headers.set(name, value)
}

const logRequest = (config: InternalAxiosRequestConfig): void => {
  if (!API_LOGGING_ENABLED) {
    return
  }

  const method = config.method?.toUpperCase() ?? 'GET'
  console.info(`[API] ${method} ${config.url ?? ''}`)
}

const logResponse = (
  config: InternalAxiosRequestConfig,
  status: number,
): void => {
  if (!API_LOGGING_ENABLED) {
    return
  }

  const method = config.method?.toUpperCase() ?? 'GET'
  const elapsed = Date.now() - (config.metadata?.startTime ?? Date.now())
  console.info(`[API] ${method} ${config.url ?? ''} -> ${status} (${elapsed}ms)`)
}

const logError = (error: AxiosError): void => {
  if (!API_LOGGING_ENABLED) {
    return
  }

  const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN'
  const path = error.config?.url ?? ''
  const status = error.response?.status ?? 'NETWORK'
  const elapsed = error.config?.metadata?.startTime
    ? Date.now() - error.config.metadata.startTime
    : 0

  console.error(`[API] ${method} ${path} -> ${status} (${elapsed}ms)`, error)
}

const normalizeError = (error: AxiosError): AxiosError => {
  const status = error.response?.status
  const fallbackMessage = status ? `API request failed (${status})` : 'Network error'
  const responseMessage =
    typeof error.response?.data === 'object' &&
    error.response?.data !== null &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
      ? error.response.data.message
      : undefined

  error.message = responseMessage ?? error.message ?? fallbackMessage
  return error
}

export const registerInterceptors = (client: AxiosInstance): void => {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.metadata = { ...config.metadata, startTime: Date.now() }

    const token = getToken()
    if (token) {
      setHeader(config, AUTH_HEADER, `Bearer ${token}`)
    }

    const userId = getUserId()?.trim()
    if (userId) {
      setHeader(config, USER_ID_HEADER, userId)
    }

    logRequest(config)

    return config
  })

  client.interceptors.response.use(
    (response) => {
      logResponse(response.config, response.status)
      return response
    },
    (error: AxiosError) => {
      logError(error)

      if (error.response?.status === 401) {
        clearAuthClaims()
      }

      return Promise.reject(normalizeError(error))
    },
  )
}
