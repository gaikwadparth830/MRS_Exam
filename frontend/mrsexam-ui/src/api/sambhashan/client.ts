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
  resgenSambhashan?: string | null
  isLocked: boolean
  isLockedSambhashan: boolean
  isBackup: boolean
  resultDate?: string | null
}

export type MarksRow = {
  srNo: number
  rollNo?: number | null
  sessionNo?: number | null
  marks1?: string | null
  totMarks?: number | null
  regionNo?: number | null
  name?: string | null
}

export type MarksUpdateResponse = {
  srNo: number
  marks1?: string | null
  totMarks?: number | null
  graceOffered?: boolean
  graceAmount?: number | null
  message?: string | null
}

export type RollPreviewResponse = {
  formCount: number
  rollCount: number
  lastCandidateName?: string | null
  assignments: Array<{ srNo: number; name?: string | null; rollNo: number }>
}

export type ResultRow = {
  srNo: number
  rollNo?: number | null
  marks1?: string | null
  totMarks?: number | null
  grade?: string | null
  specialRank?: string | null
  result?: string | null
}

export type ReportHeader = {
  sessionNo: number
  month?: string | null
  year?: string | null
  title: string
  centreNo?: string | null
  centreName?: string | null
  regionName?: string | null
  resultDate?: string | null
  rowCount?: number
}

export type AttendanceReport = {
  header: ReportHeader
  maxRollNo?: number | null
  pairs: Array<{ rollNo1?: number | null; rollNo2?: number | null }>
}

export type NameListReport = {
  header: ReportHeader
  rows: Array<{
    rollNo?: number | null
    name?: string | null
    examCentre?: string | null
    centreName?: string | null
    districtName?: string | null
  }>
}

export type ResultSheetReport = {
  header: ReportHeader
  mode: string
  rows: Array<{
    rollNo?: number | null
    name?: string | null
    examCentre?: string | null
    marks1?: string | null
    totMarks?: number | null
    grade?: string | null
    result?: string | null
    specialRank?: string | null
  }>
}

export type CertificateReport = {
  header: ReportHeader
  rows: Array<{
    rollNo?: number | null
    name?: string | null
    gender?: string | null
    grade?: string | null
    result?: string | null
    specialRank?: string | null
    examCentre?: string | null
    regionName?: string | null
  }>
}

export type RegisterReport = {
  header: ReportHeader
  totalCandidates: number
  passCount: number
  failCount: number
  absentCount: number
  stoppedCount: number
  passPercent: string
  rows: Array<{
    dummyCentreCode?: number | null
    examCentre?: string | null
    centreName?: string | null
    regionNo?: number | null
    regionName?: string | null
    candidateCount: number
    passCount: number
    failCount: number
    absentCount: number
  }>
}

export type CentreWiseStudentsReport = {
  header: ReportHeader
  rows: Array<{
    centreNo?: string | null
    centreName?: string | null
    rollFrom?: number | null
    rollTo?: number | null
    rollFrom2?: number | null
    rollTo2?: number | null
    studentCount?: number
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
      if (typeof payload.title === 'string' && payload.title.trim()) return payload.title
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

export const sambhashanApi = {
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
    const { data } = await httpClient.get<Candidate[]>('/api/sambhashan/candidates', {
      params: formCentre ? { formCentre } : undefined,
    })
    return data
  },

  countForCentre: async (formCentre: string): Promise<number> => {
    const { data } = await httpClient.get<{ count: number }>('/api/sambhashan/candidates/count', {
      params: { formCentre },
    })
    return data.count
  },

  createCandidate: async (payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.post<Candidate>('/api/sambhashan/candidates', payload)
    return data
  },

  updateCandidate: async (srNo: number, payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.put<Candidate>(`/api/sambhashan/candidates/${srNo}`, payload)
    return data
  },

  deleteCandidate: async (srNo: number): Promise<void> => {
    await httpClient.delete(`/api/sambhashan/candidates/${srNo}`)
  },

  insertBetween: async (previousSrNo: number, candidate: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.post<Candidate>('/api/sambhashan/candidates/insert-between', {
      previousSrNo,
      candidate,
    })
    return data
  },

  searchByName: async (name: string): Promise<Candidate[]> => {
    const { data } = await httpClient.get<Candidate[]>('/api/sambhashan/candidates/search', { params: { name } })
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
    const { data } = await httpClient.post<{ inserted: number }>('/api/sambhashan/candidates/batch', payload)
    return data
  },

  resetLock: async () => {
    const { data } = await httpClient.post<{ resgenSambhashan: string }>('/api/sambhashan/results/lock/reset')
    return data
  },

  listMarks: async (regionNo: number, fromRoll: number): Promise<MarksRow[]> => {
    const { data } = await httpClient.get<MarksRow[]>('/api/sambhashan/marks', { params: { regionNo, fromRoll } })
    return data
  },

  updateMarks: async (srNo: number, paper1: string, acceptGrace: boolean): Promise<MarksUpdateResponse> => {
    const { data } = await httpClient.put<MarksUpdateResponse>(`/api/sambhashan/marks/${srNo}`, { paper1, acceptGrace })
    return data
  },

  previewRolls: async (payload: {
    seatRegionNo: number
    formCentre: string
    firstRollNo: number
    lastRollNo: number
  }): Promise<RollPreviewResponse> => {
    const { data } = await httpClient.post<RollPreviewResponse>('/api/sambhashan/roll-numbers/preview', payload)
    return data
  },

  commitRolls: async (payload: {
    seatRegionNo: number
    formCentre: string
    firstRollNo: number
    lastRollNo: number
    confirmed: boolean
  }): Promise<RollPreviewResponse> => {
    const { data } = await httpClient.post<RollPreviewResponse>('/api/sambhashan/roll-numbers/commit', payload)
    return data
  },

  nextCentre: async (seatRegionNo: number) => {
    const { data } = await httpClient.get<{
      formCentre?: string | null
      centreName?: string | null
      suggestedFirstRollNo?: number | null
    }>('/api/sambhashan/roll-numbers/next-centre', { params: { seatRegionNo } })
    return data
  },

  generateResults: async (regionNo: number) => {
    const { data } = await httpClient.post('/api/sambhashan/results/generate', { regionNo })
    return data
  },

  findRanks: async () => {
    const { data } = await httpClient.post('/api/sambhashan/results/ranks')
    return data
  },

  listResults: async (regionNo: number): Promise<ResultRow[]> => {
    const { data } = await httpClient.get<ResultRow[]>('/api/sambhashan/results', { params: { regionNo } })
    return data
  },

  clearRolls: async (formCentre: string) => {
    const { data } = await httpClient.post<{ cleared: number }>('/api/sambhashan/roll-numbers/clear', {
      formCentre,
      confirmed: true,
    })
    return data
  },

  aurPreview: async (seatRegionNo: number, formCentre: string) => {
    const { data } = await httpClient.post<RollPreviewResponse>('/api/sambhashan/roll-numbers/aur/preview', {
      seatRegionNo,
      formCentre,
      confirmed: false,
    })
    return data
  },

  aurCommit: async (seatRegionNo: number, formCentre: string) => {
    const { data } = await httpClient.post<RollPreviewResponse>('/api/sambhashan/roll-numbers/aur/commit', {
      seatRegionNo,
      formCentre,
      confirmed: true,
    })
    return data
  },

  getAttendanceReport: async (centreNo: string): Promise<AttendanceReport> => {
    const { data } = await httpClient.get<AttendanceReport>('/api/sambhashan/reports/attendance', {
      params: { centreNo },
    })
    return data
  },

  getNameListReport: async (centreNo?: string): Promise<NameListReport> => {
    const { data } = await httpClient.get<NameListReport>('/api/sambhashan/reports/name-list', {
      params: centreNo ? { centreNo } : undefined,
    })
    return data
  },

  getResultSheetReport: async (params: {
    mode: 'named' | 'noname'
    centreNo?: string
    regionNo?: number
  }): Promise<ResultSheetReport> => {
    const { data } = await httpClient.get<ResultSheetReport>('/api/sambhashan/reports/result-sheet', { params })
    return data
  },

  getCertificateReport: async (params: {
    regionNo: number
    fromRoll?: number
    toRoll?: number
  }): Promise<CertificateReport> => {
    const { data } = await httpClient.get<CertificateReport>('/api/sambhashan/reports/certificates', { params })
    return data
  },

  getRegisterReport: async (regionNo?: number): Promise<RegisterReport> => {
    const { data } = await httpClient.post<RegisterReport>('/api/sambhashan/reports/register', null, {
      params: regionNo ? { regionNo } : undefined,
    })
    return data
  },

  getCentreWiseStudentsReport: async (regionNo?: number): Promise<CentreWiseStudentsReport> => {
    const { data } = await httpClient.get<CentreWiseStudentsReport>(
      '/api/sambhashan/reports/centre-wise-students',
      { params: regionNo ? { regionNo } : undefined },
    )
    return data
  },
}
