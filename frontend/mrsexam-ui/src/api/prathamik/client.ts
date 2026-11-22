import { httpClient } from '../httpClient'

export type Candidate = {
  srNo: number
  rollNo?: number | null
  regionNo?: number | null
  name?: string | null
  sessionNo?: number | null
  gender?: string | null
  formCentre?: string | null
  examCentre?: string | null
  marks1?: string | null
  totMarks?: number | null
  grade?: string | null
  specialRank?: string | null
  result?: string | null
  userId?: string | null
}

export type CandidateWriteRequest = {
  name: string
  gender: string
  formCentre: string
  examCentre: string
  userId?: string
}

export type CentreResolve = {
  centreNo: string
  centreName?: string | null
  city?: string | null
  display?: string | null
  districtName?: string | null
  regionNo?: number | null
  regionName?: string | null
  isClosed: boolean
}

export type CurrentSession = {
  sessionNo: number
  month?: string | null
  defa?: string | null
  backup?: string | null
  resgenBalbodhini?: string | null
  resgenPrathamik?: string | null
  isLocked: boolean
  isLockedPrathamik: boolean
  isBackup: boolean
  resultDate?: string | null
}

const messageFromError = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: unknown } }).response
    const data = response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object') {
      const payload = data as Record<string, unknown>
      if (typeof payload.message === 'string' && payload.message.trim()) return payload.message
      if (typeof payload.title === 'string' && payload.title.trim()) return payload.title
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export const prathamikApi = {
  messageFromError,

  getCurrentSession: async (): Promise<CurrentSession | null> => {
    try {
      const { data } = await httpClient.get<CurrentSession>('/api/Sessions/current')
      return data
    } catch {
      return null
    }
  },

  resolveCentre: async (centreNo: string): Promise<CentreResolve> => {
    const { data } = await httpClient.get<CentreResolve>(`/api/centres/${encodeURIComponent(centreNo)}/resolve`)
    return data
  },

  listCandidates: async (formCentre?: string): Promise<Candidate[]> => {
    const { data } = await httpClient.get<Candidate[]>('/api/prathamik/candidates', {
      params: formCentre ? { formCentre } : undefined,
    })
    return data
  },

  countForCentre: async (formCentre: string): Promise<number> => {
    const { data } = await httpClient.get<{ count: number }>('/api/prathamik/candidates/count', {
      params: { formCentre },
    })
    return data.count
  },

  createCandidate: async (payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.post<Candidate>('/api/prathamik/candidates', payload)
    return data
  },

  updateCandidate: async (srNo: number, payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.put<Candidate>(`/api/prathamik/candidates/${srNo}`, payload)
    return data
  },

  deleteCandidate: async (srNo: number): Promise<void> => {
    await httpClient.delete(`/api/prathamik/candidates/${srNo}`)
  },

  insertBetween: async (previousSrNo: number, candidate: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.post<Candidate>('/api/prathamik/candidates/insert-between', {
      previousSrNo,
      candidate,
    })
    return data
  },

  searchByName: async (name: string): Promise<Candidate[]> => {
    const { data } = await httpClient.get<Candidate[]>('/api/prathamik/candidates/search', { params: { name } })
    return data
  },

  batchInsert: async (payload: {
    centreCode: string
    regionNo: number
    startRollNo: number
    endRollNo: number
    startName?: string
    endName?: string
    userId?: string
  }) => {
    const { data } = await httpClient.post<{ inserted: number }>('/api/prathamik/candidates/batch', payload)
    return data
  },

  resetLock: async () => {
    const { data } = await httpClient.post<{ resgenPrathamik: string }>('/api/prathamik/results/lock/reset')
    return data
  },
}
