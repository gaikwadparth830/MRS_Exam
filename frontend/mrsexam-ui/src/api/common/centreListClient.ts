import { httpClient } from '../httpClient'

export type CentreListReport = {
  header: {
    title?: string | null
    titleMr?: string | null
    rowCount?: number | null
  }
  printDate: string
  rows: Array<{
    centreNo?: string | null
    centreName?: string | null
    address?: string | null
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

export const centreListApi = {
  messageFromError,

  getReport: async (): Promise<CentreListReport> => {
    const { data } = await httpClient.get<CentreListReport>('/api/reports/centre-list')
    return data
  },
}
