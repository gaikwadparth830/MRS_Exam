export type UserRole = 'SUPER' | 'OPERATOR' | 'CENTRE'

export type FeatureCode =
  | 'form-entry'
  | 'marks'
  | 'set-rolls'
  | 'generate-result'
  | 'reports'
  | 'masters'
  | 'select-session'
  | 'batch-insert'
  | 'reset-lock'
  | 'cross-reference'
  | 'correct-marks'
  | 'user-admin'

export type ExamModuleCode =
  | 'balbodhini'
  | 'prathamik'
  | 'praveshika'
  | 'subodh'
  | 'prabodh'
  | 'praveen'
  | 'pandit'
  | 'sambhashan'

export type AuthClaims = {
  userId: string
  role: UserRole
  isSupervisor: boolean
  exams: ExamModuleCode[]
  /** null = all centres */
  centres: string[] | null
  features: FeatureCode[]
}

export const ACCESS_TOKEN_KEY = 'accessToken'
export const CURRENT_USER_ID_KEY = 'currentUserId'
export const IS_SUPERVISOR_KEY = 'isSupervisor'
export const AUTH_ROLE_KEY = 'authRole'
export const AUTH_EXAMS_KEY = 'authExams'
export const AUTH_CENTRES_KEY = 'authCentres'
export const AUTH_FEATURES_KEY = 'authFeatures'

export const ALL_EXAMS: ExamModuleCode[] = [
  'balbodhini',
  'prathamik',
  'praveshika',
  'subodh',
  'prabodh',
  'praveen',
  'pandit',
  'sambhashan',
]

const asRole = (value: unknown): UserRole => {
  const role = String(value ?? '').trim().toUpperCase()
  if (role === 'SUPER' || role === 'OPERATOR' || role === 'CENTRE') return role
  return 'OPERATOR'
}

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
}

const asExamArray = (value: unknown): ExamModuleCode[] => {
  const allowed = new Set<string>(ALL_EXAMS)
  return asStringArray(value)
    .map((item) => item.toLowerCase())
    .filter((item): item is ExamModuleCode => allowed.has(item))
}

const asFeatureArray = (value: unknown): FeatureCode[] =>
  asStringArray(value).map((item) => item.toLowerCase() as FeatureCode)

export const saveAuthClaims = (claims: Partial<AuthClaims> & { userId?: string; isSupervisor?: boolean }): void => {
  const userId = (claims.userId ?? '').trim().toUpperCase()
  if (userId) localStorage.setItem(CURRENT_USER_ID_KEY, userId)

  const role = asRole(claims.role ?? (claims.isSupervisor ? 'SUPER' : 'OPERATOR'))
  localStorage.setItem(AUTH_ROLE_KEY, role)
  localStorage.setItem(IS_SUPERVISOR_KEY, role === 'SUPER' || claims.isSupervisor ? 'Y' : 'N')
  localStorage.setItem(AUTH_EXAMS_KEY, JSON.stringify(claims.exams ?? []))
  localStorage.setItem(
    AUTH_CENTRES_KEY,
    claims.centres === null || claims.centres === undefined
      ? JSON.stringify(null)
      : JSON.stringify(claims.centres),
  )
  localStorage.setItem(AUTH_FEATURES_KEY, JSON.stringify(claims.features ?? []))
}

export const clearAuthClaims = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(CURRENT_USER_ID_KEY)
  localStorage.removeItem(IS_SUPERVISOR_KEY)
  localStorage.removeItem(AUTH_ROLE_KEY)
  localStorage.removeItem(AUTH_EXAMS_KEY)
  localStorage.removeItem(AUTH_CENTRES_KEY)
  localStorage.removeItem(AUTH_FEATURES_KEY)
}

export const loadAuthClaims = (): AuthClaims => {
  const userId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim().toUpperCase() ?? ''
  const role = asRole(localStorage.getItem(AUTH_ROLE_KEY) ?? (localStorage.getItem(IS_SUPERVISOR_KEY) === 'Y' ? 'SUPER' : 'OPERATOR'))

  let exams: ExamModuleCode[] = []
  let centres: string[] | null = null
  let features: FeatureCode[] = []

  try {
    exams = asExamArray(JSON.parse(localStorage.getItem(AUTH_EXAMS_KEY) || '[]'))
  } catch {
    exams = role === 'SUPER' ? [...ALL_EXAMS] : []
  }

  try {
    const raw = JSON.parse(localStorage.getItem(AUTH_CENTRES_KEY) || 'null')
    centres = raw === null ? null : asStringArray(raw)
  } catch {
    centres = role === 'CENTRE' ? [] : null
  }

  try {
    features = asFeatureArray(JSON.parse(localStorage.getItem(AUTH_FEATURES_KEY) || '[]'))
  } catch {
    features = []
  }

  if (role === 'SUPER' && exams.length === 0) exams = [...ALL_EXAMS]
  // Legacy OPERATOR with no USER_EXAM rows: allow all exams until assignments are set.
  if (role === 'OPERATOR' && exams.length === 0) exams = [...ALL_EXAMS]

  return {
    userId,
    role,
    isSupervisor: role === 'SUPER' || localStorage.getItem(IS_SUPERVISOR_KEY) === 'Y',
    exams,
    centres,
    features,
  }
}

export const hasExam = (exam: string, claims: AuthClaims = loadAuthClaims()): boolean => {
  if (claims.role === 'SUPER') return true
  if (claims.role === 'OPERATOR' && claims.exams.length === 0) return true
  return claims.exams.includes(exam.trim().toLowerCase() as ExamModuleCode)
}

export const hasFeature = (feature: string, claims: AuthClaims = loadAuthClaims()): boolean => {
  if (claims.role === 'SUPER') return true
  return claims.features.includes(feature.trim().toLowerCase() as FeatureCode)
}

export const canAccessCentre = (centreNo: string, claims: AuthClaims = loadAuthClaims()): boolean => {
  if (claims.centres === null) return true
  const code = centreNo.trim()
  if (!code) return false
  return claims.centres.some((item) => item.trim().localeCompare(code, undefined, { sensitivity: 'accent' }) === 0
    || item.trim().toUpperCase() === code.toUpperCase())
}

export const isCentreUser = (claims: AuthClaims = loadAuthClaims()): boolean =>
  claims.role === 'CENTRE' || claims.centres !== null

export const filterCentres = <T extends { centreNo?: string | null }>(
  centres: T[],
  claims: AuthClaims = loadAuthClaims(),
): T[] => {
  if (claims.centres === null) return centres
  const allowed = new Set(claims.centres.map((c) => c.trim().toUpperCase()))
  return centres.filter((c) => allowed.has((c.centreNo ?? '').trim().toUpperCase()))
}

export const defaultAllowedCentre = (claims: AuthClaims = loadAuthClaims()): string => {
  if (claims.centres === null || claims.centres.length === 0) return ''
  return claims.centres[0]?.trim() ?? ''
}

/** Map nav item ids to feature codes used by AuthClaims.features */
export const featureForNavId = (navId: string): FeatureCode | null => {
  if (navId === 'form-entry') return 'form-entry'
  if (navId === 'marks') return 'marks'
  if (navId === 'set-rolls' || navId === 'aur-rolls' || navId === 'clear-rolls') return 'set-rolls'
  if (navId === 'generate-result') return 'generate-result'
  if (navId.startsWith('report-')) return 'reports'
  if (navId === 'master-user') return 'user-admin'
  if (navId.startsWith('master-')) return 'masters'
  if (navId === 'select-session') return 'select-session'
  if (navId === 'batch-insert') return 'batch-insert'
  if (navId === 'reset-lock') return 'reset-lock'
  if (navId === 'cross-reference') return 'cross-reference'
  if (navId === 'correct-marks') return 'correct-marks'
  return null
}
