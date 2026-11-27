import { httpClient } from '../httpClient'

export type UserWiseFormsReport = {
  header: {
    sessionNo: number
    month?: string | null
    year?: string | null
    title: string
    titleMr?: string | null
    regionName?: string | null
    rowCount?: number
  }
  rows: Array<{
    userId?: string | null
    exam?: string | null
    formCount: number
  }>
}

const messageFromError = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    const data = response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      const payload = data as Record<string, unknown>
      if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export const userWiseFormsApi = {
  messageFromError,

  listUsers: async (): Promise<string[]> => {
    const { data } = await httpClient.get<string[]>('/api/reports/userwise-forms/users')
    return Array.isArray(data) ? data : []
  },

  getReport: async (userId?: string): Promise<UserWiseFormsReport> => {
    const { data } = await httpClient.get<UserWiseFormsReport>('/api/reports/userwise-forms', {
      params: userId ? { userId } : undefined,
    })
    return data
  },
}
