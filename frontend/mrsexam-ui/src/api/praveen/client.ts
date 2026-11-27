import { httpClient } from '../httpClient'

export type Candidate = {
  rollNo: number
  regionNo: number
  sessionNo?: number | null
  name?: string | null
  formCentre?: string | null
  examCentre?: string | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  oralMarks?: string | null
  regLang?: string | null
  totMarks?: number | null
  grade?: string | null
  specialRank?: string | null
  result?: string | null
  userId?: string | null
}

export type CandidateWriteRequest = {
  name: string
  rollNo: number
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
  resgenPraveen?: string | null
  isLocked: boolean
  isLockedPraveen: boolean
  isBackup: boolean
  resultDate?: string | null
}

export type MarksRow = {
  rollNo: number
  regionNo: number
  sessionNo?: number | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  oralMarks?: string | null
  regLang?: string | null
  totMarks?: number | null
  name?: string | null
}

export type MarksUpdateResponse = {
  rollNo: number
  regionNo: number
  sessionNo: number
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  oralMarks?: string | null
  regLang?: string | null
  totMarks?: number | null
}

export type ResultRow = {
  rollNo: number
  regionNo?: number | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  oralMarks?: string | null
  regLang?: string | null
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
  titleMr?: string | null
  examName?: string | null
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
    marks2?: string | null
    marks3?: string | null
    marks4?: string | null
    marks5?: string | null
    oralMarks?: string | null
    regLang?: string | null
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

export const praveenApi = {
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
    const { data } = await httpClient.get<Candidate[]>('/api/praveen/candidates', {
      params: formCentre ? { formCentre } : undefined,
    })
    return data
  },

  countForCentre: async (formCentre: string): Promise<number> => {
    const { data } = await httpClient.get<{ count: number }>('/api/praveen/candidates/count', {
      params: { formCentre },
    })
    return data.count
  },

  createCandidate: async (payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.post<Candidate>('/api/praveen/candidates', payload)
    return data
  },

  updateCandidate: async (rollNo: number, regionNo: number, payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.put<Candidate>(`/api/praveen/candidates/${rollNo}/${regionNo}`, payload)
    return data
  },

  deleteCandidate: async (rollNo: number, regionNo: number): Promise<void> => {
    await httpClient.delete(`/api/praveen/candidates/${rollNo}/${regionNo}`)
  },

  searchByName: async (name: string): Promise<Candidate[]> => {
    const { data } = await httpClient.get<Candidate[]>('/api/praveen/candidates/search', { params: { name } })
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
    const { data } = await httpClient.post<{ inserted: number }>('/api/praveen/candidates/batch', payload)
    return data
  },

  resetLock: async () => {
    const { data } = await httpClient.post<{ resgenPraveen: string }>('/api/praveen/results/lock/reset')
    return data
  },

  listMarks: async (regionNo: number, fromRoll: number): Promise<MarksRow[]> => {
    const { data } = await httpClient.get<MarksRow[]>('/api/praveen/marks', { params: { regionNo, fromRoll } })
    return data
  },

  updateMarks: async (
    rollNo: number,
    regionNo: number,
    paper1: string,
    paper2: string,
    paper3: string,
    paper4: string,
    paper5: string,
    oralMarks: string,
    regLang: string,
  ): Promise<MarksUpdateResponse> => {
    const { data } = await httpClient.put<MarksUpdateResponse>(`/api/praveen/marks/${rollNo}/${regionNo}`, {
      paper1,
      paper2,
      paper3,
      paper4,
      paper5,
      oralMarks,
      regLang,
    })
    return data
  },

  nextRoll: async (regionNo: number) => {
    const { data } = await httpClient.get<{
      regionNo: number
      sessionNo: number
      nextRollNo: number
    }>('/api/praveen/roll-numbers/next', { params: { regionNo } })
    return data
  },

  listRolls: async (regionNo: number) => {
    const { data } = await httpClient.get<Array<{
      rollNo: number
      regionNo: number
      sessionNo: number
      name?: string | null
      formCentre?: string | null
      examCentre?: string | null
    }>>('/api/praveen/roll-numbers', { params: { regionNo } })
    return data
  },

  generateResults: async (regionNo: number) => {
    const { data } = await httpClient.post('/api/praveen/results/generate', { regionNo })
    return data
  },

  findRanks: async () => {
    const { data } = await httpClient.post('/api/praveen/results/ranks')
    return data
  },

  listResults: async (regionNo: number): Promise<ResultRow[]> => {
    const { data } = await httpClient.get<ResultRow[]>('/api/praveen/results', { params: { regionNo } })
    return data
  },

  getAttendanceReport: async (centreNo: string): Promise<AttendanceReport> => {
    const { data } = await httpClient.get<AttendanceReport>('/api/praveen/reports/attendance', {
      params: { centreNo },
    })
    return data
  },

  getNameListReport: async (centreNo?: string): Promise<NameListReport> => {
    const { data } = await httpClient.get<NameListReport>('/api/praveen/reports/name-list', {
      params: centreNo ? { centreNo } : undefined,
    })
    return data
  },

  getResultSheetReport: async (params: {
    mode: 'named' | 'noname'
    centreNo?: string
    regionNo?: number
  }): Promise<ResultSheetReport> => {
    const { data } = await httpClient.get<ResultSheetReport>('/api/praveen/reports/result-sheet', { params })
    return data
  },

  getCertificateReport: async (params: {
    regionNo: number
    fromRoll?: number
    toRoll?: number
  }): Promise<CertificateReport> => {
    const { data } = await httpClient.get<CertificateReport>('/api/praveen/reports/certificates', { params })
    return data
  },

  getRegisterReport: async (regionNo?: number): Promise<RegisterReport> => {
    const { data } = await httpClient.post<RegisterReport>('/api/praveen/reports/register', null, {
      params: regionNo ? { regionNo } : undefined,
    })
    return data
  },

  getMarkSheetReport: async (params: {
    regionNo?: number
    fromRoll?: number
    toRoll?: number
  }) => {
    const { data } = await httpClient.get('/api/praveen/reports/mark-sheet', { params })
    return data as {
      header: ReportHeader
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        formCentre?: string | null
        examCentre?: string | null
        marks1?: string | null
        marks2?: string | null
        marks3?: string | null
        marks4?: string | null
        marks5?: string | null
        oralMarks?: string | null
        regLang?: string | null
        totMarks?: number | null
        grade?: string | null
        result?: string | null
        specialRank?: string | null
      }>
    }
  },

  getRanksReport: async () => {
    const { data } = await httpClient.get('/api/praveen/reports/ranks')
    return data as {
      header: ReportHeader
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        totMarks?: number | null
        grade?: string | null
        result?: string | null
        specialRank?: string | null
        regionNo?: number | null
        regionName?: string | null
        formCentre?: string | null
        examCentre?: string | null
      }>
    }
  },

  getLostByTwoReport: async (regionNo?: number) => {
    const { data } = await httpClient.get('/api/praveen/reports/lost-two-marks', {
      params: regionNo ? { regionNo } : undefined,
    })
    return data as {
      header: ReportHeader
      class3Marks?: number | null
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        marks1?: string | null
        marks2?: string | null
        marks3?: string | null
        marks4?: string | null
        marks5?: string | null
        totMarks?: number | null
        grade?: string | null
        nearMissReason?: string | null
        formCentre?: string | null
        examCentre?: string | null
      }>
    }
  },

  getCentreWiseStudentsReport: async (regionNo?: number): Promise<CentreWiseStudentsReport> => {
    const { data } = await httpClient.get<CentreWiseStudentsReport>(
      '/api/praveen/reports/centre-wise-students',
      { params: regionNo ? { regionNo } : undefined },
    )
    return data
  },
}
