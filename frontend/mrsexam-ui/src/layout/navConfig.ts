export type NavItemId =
  | 'form-entry'
  | 'marks'
  | 'set-rolls'
  | 'aur-rolls'
  | 'clear-rolls'
  | 'generate-result'
  | 'select-session'
  | 'master-region'
  | 'master-district'
  | 'master-centre'
  | 'master-exam'
  | 'master-paper'
  | 'master-session'
  | 'batch-insert'
  | 'reset-lock'
  | 'correct-marks'
  | 'report-attendance'
  | 'report-name-list'
  | 'report-result-sheet'
  | 'report-certificate'
  | 'report-register'

export type NavItem = {
  id: NavItemId
  label: string
  description?: string
  supervisorOnly?: boolean
  comingSoon?: boolean
}

export type NavGroup = {
  id: string
  label: string
  items: NavItem[]
}

export const balbodhiniNav: NavGroup[] = [
  {
    id: 'candidates',
    label: 'Candidates',
    items: [
      { id: 'form-entry', label: 'Form Entry', description: 'Register Balbodhini candidates' },
      { id: 'batch-insert', label: 'Batch Insert', description: 'Insert placeholder names', supervisorOnly: true },
    ],
  },
  {
    id: 'processing',
    label: 'Processing',
    items: [
      { id: 'marks', label: 'Marks Entry', description: 'Paper 1 and grace' },
      { id: 'set-rolls', label: 'Set Roll Numbers', description: 'Assign centre roll ranges' },
      { id: 'aur-rolls', label: 'Aur Roll Numbers', description: 'Number late null rolls' },
      { id: 'clear-rolls', label: 'Clear Roll Numbers', description: 'Blank rolls from a centre' },
      { id: 'generate-result', label: 'Generate Result', description: 'Pass, fail, grade, ranks' },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    items: [
      { id: 'master-region', label: 'Region Master' },
      { id: 'master-district', label: 'District Master' },
      { id: 'master-centre', label: 'Centre Master' },
      { id: 'master-exam', label: 'Exam Master' },
      { id: 'master-paper', label: 'Paper Master' },
      { id: 'master-session', label: 'Session Master' },
      { id: 'select-session', label: 'Select Session' },
    ],
  },
  {
    id: 'supervisor',
    label: 'Supervisor',
    items: [
      { id: 'reset-lock', label: 'Reset Result Lock', supervisorOnly: true },
      { id: 'correct-marks', label: 'Correct Marks', supervisorOnly: true, comingSoon: true },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { id: 'report-attendance', label: 'Attendance Sheet', description: 'Centre roll pairs' },
      { id: 'report-name-list', label: 'Name List', description: 'Candidate name list' },
      { id: 'report-result-sheet', label: 'Result Sheet', description: 'With or without names' },
      { id: 'report-certificate', label: 'Certificate', description: 'Pass candidates by region' },
      { id: 'report-register', label: 'Register', description: 'Dummy centre counts' },
    ],
  },
]

export const defaultNavItemId: NavItemId = 'form-entry'

export const findNavItem = (id: NavItemId): NavItem | undefined =>
  balbodhiniNav.flatMap((group) => group.items).find((item) => item.id === id)
