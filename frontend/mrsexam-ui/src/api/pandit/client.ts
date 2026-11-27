import { httpClient } from '../httpClient'

export type Candidate = {
  rollNo: number
  sessionNo?: number | null
  name?: string | null
  formCentre?: string | null
  examCentre?: string | null
  undFlag?: string | null
  undClass?: string | null
  khandAppearing?: string | null
  flgPortion?: string | null
  concessionFlag?: string | null
  bothKhandFlag?: string | null
  resDeclFlag?: string | null
  othKhandRollNo?: number | null
  add1?: string | null
  add2?: string | null
  add3?: string | null
  rollNo1?: number | null
  sessionNo1?: number | null
  marks1?: string | null
  rollNo2?: number | null
  sessionNo2?: number | null
  marks2?: string | null
  rollNo3?: number | null
  sessionNo3?: number | null
  marks3?: string | null
  rollNo4?: number | null
  sessionNo4?: number | null
  marks4?: string | null
  rollNo5?: number | null
  sessionNo5?: number | null
  marks5?: string | null
  rollNo6?: number | null
  sessionNo6?: number | null
  marks6?: string | null
  rollNo7?: number | null
  sessionNo7?: number | null
  marks7?: string | null
  rollNo8?: number | null
  sessionNo8?: number | null
  marks8?: string | null
  oralRollNo?: number | null
  oralSessionNo?: number | null
  oralMarks?: string | null
  optMarks?: string | null
  khand1TotMarks?: number | null
  khand2TotMarks?: number | null
  totMarks?: number | null
  grade?: string | null
  specialRank?: string | null
  result?: string | null
  userId?: string | null
}

export type CandidateWriteRequest = {
  rollNo: number
  name: string
  formCentre: string
  examCentre: string
  undFlag: string
  undClass?: string
  khandAppearing: string
  flgPortion?: string
  add1?: string
  add2?: string
  add3?: string
  rollNo1?: number | null
  sessionNo1?: number | null
  marks1?: string | null
  rollNo2?: number | null
  sessionNo2?: number | null
  marks2?: string | null
  rollNo3?: number | null
  sessionNo3?: number | null
  marks3?: string | null
  rollNo4?: number | null
  sessionNo4?: number | null
  marks4?: string | null
  rollNo5?: number | null
  sessionNo5?: number | null
  marks5?: string | null
  rollNo6?: number | null
  sessionNo6?: number | null
  marks6?: string | null
  rollNo7?: number | null
  sessionNo7?: number | null
  marks7?: string | null
  rollNo8?: number | null
  sessionNo8?: number | null
  marks8?: string | null
  oralRollNo?: number | null
  oralSessionNo?: number | null
  oralMarks?: string | null
  optMarks?: string | null
  othKhandRollNo?: number | null
  bothKhandFlag?: string
  resDeclFlag?: string
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
  resgenPandit?: string | null
  isLocked: boolean
  isLockedPandit: boolean
  isBackup: boolean
  resultDate?: string | null
}

export type MarksRow = {
  rollNo: number
  sessionNo?: number | null
  name?: string | null
  formCentre?: string | null
  khandAppearing?: string | null
  flgPortion?: string | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  marks6?: string | null
  marks7?: string | null
  marks8?: string | null
  oralMarks?: string | null
  khand1TotMarks?: number | null
  khand2TotMarks?: number | null
  totMarks?: number | null
  regionNo?: number | null
}

export type ResultRow = {
  rollNo: number
  name?: string | null
  khandAppearing?: string | null
  flgPortion?: string | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  marks6?: string | null
  marks7?: string | null
  marks8?: string | null
  oralMarks?: string | null
  totMarks?: number | null
  grade?: string | null
  specialRank?: string | null
  result?: string | null
  concessionFlag?: string | null
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
    formCentre?: string | null
    examCentre?: string | null
    centreName?: string | null
    districtName?: string | null
    khandAppearing?: string | null
    flgPortion?: string | null
  }>
}

export type ResultSheetReport = {
  header: ReportHeader
  mode: string
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
    marks6?: string | null
    marks7?: string | null
    marks8?: string | null
    oralMarks?: string | null
    totMarks?: number | null
    khand1TotMarks?: number | null
    khand2TotMarks?: number | null
    khandAppearing?: string | null
    flgPortion?: string | null
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
    grade?: string | null
    result?: string | null
    specialRank?: string | null
    examCentre?: string | null
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

export const panditApi = {
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

  listCandidates: async (formCentre?: string, regionNo?: number): Promise<Candidate[]> => {
    const { data } = await httpClient.get<Candidate[]>('/api/pandit/candidates', {
      params: {
        ...(formCentre ? { formCentre } : {}),
        ...(regionNo ? { regionNo } : {}),
      },
    })
    return data
  },

  countForCentre: async (formCentre: string): Promise<number> => {
    const { data } = await httpClient.get<{ count: number }>('/api/pandit/candidates/count', {
      params: { formCentre },
    })
    return data.count
  },

  createCandidate: async (payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.post<Candidate>('/api/pandit/candidates', payload)
    return data
  },

  updateCandidate: async (rollNo: number, payload: CandidateWriteRequest): Promise<Candidate> => {
    const { data } = await httpClient.put<Candidate>(`/api/pandit/candidates/${rollNo}`, payload)
    return data
  },

  deleteCandidate: async (rollNo: number): Promise<void> => {
    await httpClient.delete(`/api/pandit/candidates/${rollNo}`)
  },

  searchByName: async (name: string): Promise<Candidate[]> => {
    const { data } = await httpClient.get<Candidate[]>('/api/pandit/candidates/search', { params: { name } })
    return data
  },

  checkConcession: async (rollNo: number) => {
    const { data } = await httpClient.post<{
      rollNo: number
      concessionFlag: string
      message: string
    }>(`/api/pandit/candidates/${rollNo}/check-concession`)
    return data
  },

  batchInsert: async (payload: {
    centreCode: string
    startRollNo: number
    endRollNo: number
    startName?: string
    endName?: string
    userId?: string
  }) => {
    const { data } = await httpClient.post<{ inserted: number }>('/api/pandit/candidates/batch', payload)
    return data
  },

  resetLock: async () => {
    const { data } = await httpClient.post<{ resgenPandit: string }>('/api/pandit/results/lock/reset')
    return data
  },

  listMarks: async (regionNo: number, fromRoll: number): Promise<MarksRow[]> => {
    const { data } = await httpClient.get<MarksRow[]>('/api/pandit/marks', { params: { regionNo, fromRoll } })
    return data
  },

  updateMarks: async (
    rollNo: number,
    payload: {
      paper1?: string
      paper2?: string
      paper3?: string
      paper4?: string
      paper5?: string
      paper6?: string
      paper7?: string
      paper8?: string
      oralMarks?: string
    },
  ) => {
    const { data } = await httpClient.put(`/api/pandit/marks/${rollNo}`, payload)
    return data
  },

  nextRoll: async () => {
    const { data } = await httpClient.get<{ sessionNo: number; nextRollNo: number }>('/api/pandit/roll-numbers/next')
    return data
  },

  listRolls: async (params?: { formCentre?: string; regionNo?: number }) => {
    const { data } = await httpClient.get<Array<{
      rollNo: number
      sessionNo: number
      name?: string | null
      formCentre?: string | null
      examCentre?: string | null
      khandAppearing?: string | null
    }>>('/api/pandit/roll-numbers', { params })
    return data
  },

  generateResults: async () => {
    const { data } = await httpClient.post('/api/pandit/results/generate')
    return data
  },

  findRanks: async () => {
    const { data } = await httpClient.post('/api/pandit/results/ranks')
    return data
  },

  listResults: async (regionNo?: number): Promise<ResultRow[]> => {
    const { data } = await httpClient.get<ResultRow[]>('/api/pandit/results', {
      params: regionNo ? { regionNo } : undefined,
    })
    return data
  },

  runCrossReference: async () => {
    const { data } = await httpClient.post<{
      sessionNo: number
      khand1Count: number
      khand2Count: number
      pairsLinked: number
    }>('/api/pandit/cross-reference/run')
    return data
  },

  crossReferenceStatus: async () => {
    const { data } = await httpClient.get<{
      sessionNo: number
      total: number
      bothKhand: number
      resDecl: number
      withOthRoll: number
    }>('/api/pandit/cross-reference/status')
    return data
  },

  getAttendanceReport: async (centreNo: string): Promise<AttendanceReport> => {
    const { data } = await httpClient.get<AttendanceReport>('/api/pandit/reports/attendance', {
      params: { centreNo },
    })
    return data
  },

  getNameListReport: async (centreNo?: string, regionNo?: number): Promise<NameListReport> => {
    const { data } = await httpClient.get<NameListReport>('/api/pandit/reports/name-list', {
      params: {
        ...(centreNo ? { centreNo } : {}),
        ...(regionNo ? { regionNo } : {}),
      },
    })
    return data
  },

  getResultSheetReport: async (params: {
    mode: 'named' | 'noname'
    centreNo?: string
    regionNo?: number
  }): Promise<ResultSheetReport> => {
    const { data } = await httpClient.get<ResultSheetReport>('/api/pandit/reports/result-sheet', { params })
    return data
  },

  getCertificateReport: async (params: {
    regionNo?: number
    formCentre?: string
    fromRoll?: number
    toRoll?: number
  }): Promise<CertificateReport> => {
    const { data } = await httpClient.get<CertificateReport>('/api/pandit/reports/certificates', { params })
    return data
  },

  getRegisterReport: async (regionNo?: number): Promise<RegisterReport> => {
    const { data } = await httpClient.post<RegisterReport>('/api/pandit/reports/register', null, {
      params: regionNo ? { regionNo } : undefined,
    })
    return data
  },

  getResultDetailsReport: async (params?: { centreNo?: string; regionNo?: number }) => {
    const { data } = await httpClient.get('/api/pandit/reports/result-details', { params })
    return data as {
      header: ReportHeader
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        formCentre?: string | null
        examCentre?: string | null
        khandAppearing?: string | null
        flgPortion?: string | null
        marks1?: string | null
        marks2?: string | null
        marks3?: string | null
        marks4?: string | null
        marks5?: string | null
        marks6?: string | null
        marks7?: string | null
        marks8?: string | null
        oralMarks?: string | null
        khand1TotMarks?: number | null
        khand2TotMarks?: number | null
        totMarks?: number | null
        grade?: string | null
        result?: string | null
        specialRank?: string | null
        concessionFlag?: string | null
        undFlag?: string | null
        bothKhandFlag?: string | null
      }>
    }
  },

  getMarkSheetReport: async (params?: {
    fromRoll?: number
    toRoll?: number
    variant?: string
    portion?: string
  }) => {
    const { data } = await httpClient.get('/api/pandit/reports/mark-sheet', { params })
    return data as {
      header: ReportHeader
      variant?: string
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
        marks6?: string | null
        marks7?: string | null
        marks8?: string | null
        oralMarks?: string | null
        totMarks?: number | null
        khand1TotMarks?: number | null
        khand2TotMarks?: number | null
        khandAppearing?: string | null
        flgPortion?: string | null
        grade?: string | null
        result?: string | null
        specialRank?: string | null
      }>
    }
  },

  getRanksReport: async () => {
    const { data } = await httpClient.get('/api/pandit/reports/ranks')
    return data as {
      header: ReportHeader
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        totMarks?: number | null
        grade?: string | null
        result?: string | null
        specialRank?: string | null
        formCentre?: string | null
        examCentre?: string | null
      }>
    }
  },

  getStudentsPassingReport: async (params?: {
    formCentre?: string
    regionNo?: number
    passingMode?: 'full' | 'khand1' | 'khand2'
  }) => {
    const { data } = await httpClient.get('/api/pandit/reports/students-passing', { params })
    return data as {
      header: ReportHeader
      passingMode: string
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        result?: string | null
        grade?: string | null
        totMarks?: number | null
        formCentre?: string | null
        examCentre?: string | null
        khandAppearing?: string | null
      }>
    }
  },

  getLostBy2Report: async (regionNo?: number) => {
    const { data } = await httpClient.get('/api/pandit/reports/lost-by-2', {
      params: regionNo ? { regionNo } : undefined,
    })
    return data as {
      header: ReportHeader
      class3Marks?: number | null
      minTotalKhand1?: number | null
      minTotalKhand2?: number | null
      rows: Array<{
        rollNo?: number | null
        name?: string | null
        totMarks?: number | null
        khand1TotMarks?: number | null
        khand2TotMarks?: number | null
        grade?: string | null
        result?: string | null
        nearMissReason?: string | null
        formCentre?: string | null
        examCentre?: string | null
      }>
    }
  },

  getCentreWiseStudentsReport: async (regionNo?: number): Promise<CentreWiseStudentsReport> => {
    const { data } = await httpClient.get<CentreWiseStudentsReport>(
      '/api/pandit/reports/centre-wise-students',
      { params: regionNo ? { regionNo } : undefined },
    )
    return data
  },
}
