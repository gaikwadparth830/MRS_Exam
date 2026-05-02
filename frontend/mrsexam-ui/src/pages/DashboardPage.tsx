import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { ChevronRightRounded, ExpandMoreRounded } from '@mui/icons-material'

import {
  type Center,
  CentersService,
  type District,
  DistrictsService,
  type FormPrathamik,
  FormPrathamikService,
  type Session,
  SessionsService,
} from '../api/generatedClient'
import monoLogo from '../assets/MONO.png'
import { httpClient } from '../api/httpClient'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'

type SubMenuItem = {
  label: string
  children?: string[]
}

const formEntryExamItems = ['Pandit', 'Praveshika', 'Prathamik', 'Prabodh', 'Praveen', 'Subodh', 'Balbodhini']

const mainMenuItems = [
  'Master',
  'Supervisor',
  'Processing',
  'Transaction',
  'Query',
  'Utilities',
  'Reports',
  'Help',
] as const

type MainMenu = (typeof mainMenuItems)[number]

const menuConfig: Record<MainMenu, SubMenuItem[]> = {
  Master: [
    { label: 'Region Master' },
    { label: 'District Master' },
    { label: 'Center Master' },
    { label: 'Exam Master' },
    { label: 'Paper Master' },
    { label: 'Session Master' },
  ],
  Supervisor: [
    { label: 'User Management' },
    { label: 'Reset Result Generated Flag' },
    { label: 'Update Marks' },
    { label: 'Insert record with name "-"' },
  ],
  Processing: [
    { label: 'Cross Reference' },
    { label: 'Generate Resdult' },
    { label: 'Export Center Data to Foxpro' },
    { label: 'Set Roll Nos' },
    { label: 'Aur Forms - Set Roll Numbsers' },
  ],
  Transaction: [
    { label: 'Form Entry', children: formEntryExamItems },
    { label: 'Marks Entry', children: formEntryExamItems },
  ],
  Query: [
    { label: 'List of Students losing grade by 2 marks' },
  ],
  Utilities: [
    { label: 'Select Session' },
    { label: 'Print Lables for centers' },
    { label: 'Print Center Address Only' },
  ],
  Reports: [
    { label: 'Attendence Sheet' },
    { label: 'Result Sheet' },
    { label: 'Marks Sheet' },
    { label: 'Certificate' },
    { label: 'Center wise No of Students Appearing' },
    { label: 'Userwise Examwise Total No of Forms Entered' },
    { label: 'List of Centres' },
    { label: 'Name List' },
    { label: 'Hall Ticket Prining' },
    { label: 'Register' },
  ],
  Help: [],
}
const defaultMasterPage: MasterPageKey = 'Region Master'
const defaultFormEntryExam = formEntryExamItems[0]
const defaultMarksEntryExam = formEntryExamItems[0]

const toSessionList = (payload: unknown): Session[] => {
  if (Array.isArray(payload)) {
    return payload as Session[]
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>
    const candidates = [
      objectPayload.items,
      objectPayload.data,
      objectPayload.results,
      objectPayload.records,
    ]
    const list = candidates.find((candidate) => Array.isArray(candidate))
    return (list ?? []) as Session[]
  }

  return []
}

const getDefaultSessionFromList = (sessions: Session[]): Session | null =>
  sessions.find((session) => session.defa?.trim().toUpperCase() === 'Y') ?? null

const toCenterList = (payload: unknown): Center[] => {
  if (Array.isArray(payload)) {
    return payload as Center[]
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>
    const candidates = [
      objectPayload.items,
      objectPayload.data,
      objectPayload.results,
      objectPayload.records,
    ]
    const list = candidates.find((candidate) => Array.isArray(candidate))
    return (list ?? []) as Center[]
  }

  return []
}

const toFormPrathamikList = (payload: unknown): FormPrathamik[] => {
  if (Array.isArray(payload)) {
    return payload as FormPrathamik[]
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>
    const candidates = [
      objectPayload.items,
      objectPayload.data,
      objectPayload.results,
      objectPayload.records,
    ]
    const list = candidates.find((candidate) => Array.isArray(candidate))
    return (list ?? []) as FormPrathamik[]
  }

  return []
}

const transliterateEnglishToDevanagari = (input: string): string => {
  const text = input.toLowerCase()

  const vowels: Record<string, string> = {
    ai: '\u0910',
    au: '\u0914',
    aa: '\u0906',
    ee: '\u0908',
    ii: '\u0908',
    oo: '\u090A',
    uu: '\u090A',
    ri: '\u090B',
    a: '\u0905',
    i: '\u0907',
    u: '\u0909',
    e: '\u090F',
    o: '\u0913',
  }

  const matras: Record<string, string> = {
    ai: '\u0948',
    au: '\u094C',
    aa: '\u093E',
    ee: '\u0940',
    ii: '\u0940',
    oo: '\u0942',
    uu: '\u0942',
    ri: '\u0943',
    a: '',
    i: '\u093F',
    u: '\u0941',
    e: '\u0947',
    o: '\u094B',
  }

  const consonants: Record<string, string> = {
    ksh: '\u0915\u094D\u0937',
    chh: '\u091B',
    th: '\u0925',
    dh: '\u0927',
    ph: '\u092B',
    bh: '\u092D',
    sh: '\u0936',
    kh: '\u0916',
    gh: '\u0918',
    ch: '\u091A',
    jh: '\u091D',
    ng: '\u0919',
    ny: '\u091E',
    tr: '\u0924\u094D\u0930',
    gy: '\u091C\u094D\u091E',
    k: '\u0915',
    g: '\u0917',
    c: '\u0915',
    j: '\u091C',
    t: '\u0924',
    d: '\u0926',
    n: '\u0928',
    p: '\u092A',
    b: '\u092C',
    m: '\u092E',
    y: '\u092F',
    r: '\u0930',
    l: '\u0932',
    v: '\u0935',
    w: '\u0935',
    s: '\u0938',
    h: '\u0939',
    q: '\u0915',
    x: '\u0915\u094D\u0938',
    f: '\u092B',
    z: '\u091C',
  }

  const vowelTokens = ['ai', 'au', 'aa', 'ee', 'ii', 'oo', 'uu', 'ri', 'a', 'i', 'u', 'e', 'o']
  const consonantTokens = [
    'ksh',
    'chh',
    'th',
    'dh',
    'ph',
    'bh',
    'sh',
    'kh',
    'gh',
    'ch',
    'jh',
    'ng',
    'ny',
    'tr',
    'gy',
    'k',
    'g',
    'c',
    'j',
    't',
    'd',
    'n',
    'p',
    'b',
    'm',
    'y',
    'r',
    'l',
    'v',
    'w',
    's',
    'h',
    'q',
    'x',
    'f',
    'z',
  ]

  let output = ''
  let index = 0

  while (index < text.length) {
    const current = text[index]

    if (!/[a-z]/.test(current)) {
      output += input[index]
      index += 1
      continue
    }

    const consonantToken = consonantTokens.find((token) => text.startsWith(token, index))
    if (consonantToken) {
      const base = consonants[consonantToken]
      const nextIndex = index + consonantToken.length
      const vowelToken = vowelTokens.find((token) => text.startsWith(token, nextIndex))

      if (vowelToken) {
        output += `${base}${matras[vowelToken]}`
        index = nextIndex + vowelToken.length
      } else {
        output += base
        index = nextIndex
      }

      continue
    }

    const vowelToken = vowelTokens.find((token) => text.startsWith(token, index))
    if (vowelToken) {
      output += vowels[vowelToken]
      index += vowelToken.length
      continue
    }

    output += input[index]
    index += 1
  }

  return output
}

const fetchGoogleMarathiTransliteration = async (input: string): Promise<string | null> => {
  const query = input.trim()
  if (!query) {
    return ''
  }

  const url = `https://inputtools.google.com/request?itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage&text=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as unknown
    if (!Array.isArray(payload) || payload[0] !== 'SUCCESS') {
      return null
    }

    const data = payload[1]
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
      return null
    }

    const firstEntry = data[0] as unknown[]
    const suggestions = firstEntry[1]
    if (!Array.isArray(suggestions) || suggestions.length === 0 || typeof suggestions[0] !== 'string') {
      return null
    }

    return suggestions[0]
  } catch {
    return null
  }
}

const createEmptyPrathamikForm = (sessionNo?: number): FormPrathamik => ({
  srNo: 0,
  rollNo: null,
  regionNo: null,
  name: '',
  sessionNo: sessionNo ?? null,
  gender: '',
  formCentre: '',
  examCentre: '',
  marks1: '',
  totMarks: null,
  grade: '',
  undFlag: '',
  undClass: '',
  specialRank: '',
  result: '',
  dummyCentreCode: null,
  resgenRun: null,
  userId: '',
})

const toGenderCode = (value?: string | null): string => {
  const normalized = (value ?? '').trim().toUpperCase()

  if (normalized === 'M' || normalized === 'MALE') {
    return 'M'
  }

  if (normalized === 'F' || normalized === 'FEMALE') {
    return 'F'
  }

  return ''
}

const formatGender = (value?: string | null): string => {
  const normalized = toGenderCode(value)

  if (normalized === 'M') {
    return 'Male'
  }

  if (normalized === 'F') {
    return 'Female'
  }

  return '-'
}

type PrathamikFormEntryPanelProps = {
  defaultSessionNo?: number
}

const CURRENT_USER_ID_KEY = 'currentUserId'

const PrathamikFormEntryPanel = ({ defaultSessionNo }: PrathamikFormEntryPanelProps) => {
  const [centers, setCenters] = useState<Center[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [rows, setRows] = useState<FormPrathamik[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormPrathamik>(() => createEmptyPrathamikForm(defaultSessionNo))
  const transliterationRequestId = useRef(0)

  const regionNoByDistrictName = useMemo(() => {
    return new Map(
      districts
        .filter((district) => district.districtName.trim().length > 0)
        .map((district) => [district.districtName.trim(), district.regionNo ?? null]),
    )
  }, [districts])

  const selectedFormCenterName = useMemo(() => {
    const selected = centers.find((center) => center.centreNo === formData.formCentre)
    return selected?.centreName?.trim() || selected?.city?.trim() || ''
  }, [centers, formData.formCentre])

  const selectedExamCenterName = useMemo(() => {
    const selected = centers.find((center) => center.centreNo === formData.examCentre)
    return selected?.centreName?.trim() || selected?.city?.trim() || ''
  }, [centers, formData.examCentre])

  const currentLoginUserId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''

  const loadRows = async () => {
    if (typeof defaultSessionNo !== 'number') {
      setRows([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload = await FormPrathamikService.getApiFormPrathamikPaged({
        pageNumber: 1,
        pageSize: 300,
        sessionNo: defaultSessionNo,
      })

      setRows(toFormPrathamikList(payload))
    } catch {
      setError('Unable to load Prathamik records.')
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [defaultSessionNo])

  useEffect(() => {
    let isMounted = true

    const loadCenters = async () => {
      try {
        const payload = await CentersService.getApiCenters()

        if (isMounted) {
          setCenters(toCenterList(payload))
        }
      } catch {
        if (isMounted) {
          setCenters([])
        }
      }
    }

    void loadCenters()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadDistricts = async () => {
      try {
        const payload = await DistrictsService.getApiDistricts()

        if (isMounted) {
          const list = Array.isArray(payload)
            ? (payload as District[])
            : (((payload as Record<string, unknown>)?.items ?? []) as District[])
          setDistricts(list)
        }
      } catch {
        if (isMounted) {
          setDistricts([])
        }
      }
    }

    void loadDistricts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      sessionNo: typeof defaultSessionNo === 'number' ? defaultSessionNo : null,
    }))
  }, [defaultSessionNo])

  const onChangeNumber = (key: keyof FormPrathamik, value: string) => {
    setFormData((current) => ({
      ...current,
      [key]: value.trim() === '' ? null : Number(value),
    }))
  }

  const onChangeText = (key: keyof FormPrathamik, value: string) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const transliterateName = async (rawValue: string, appendSpace: boolean) => {
    const normalizedValue = rawValue.trim()
    const requestId = ++transliterationRequestId.current

    if (!normalizedValue) {
      return
    }

    const byGoogle = await fetchGoogleMarathiTransliteration(normalizedValue)
    const translated = byGoogle ?? transliterateEnglishToDevanagari(normalizedValue)

    if (requestId !== transliterationRequestId.current) {
      return
    }

    setFormData((current) => {
      if ((current.name ?? '') !== rawValue) {
        return current
      }

      return {
        ...current,
        name: appendSpace ? `${translated} ` : translated,
      }
    })
  }

  const onNameKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    const inputTarget = event.target as HTMLInputElement | null
    const rawValue = inputTarget?.value ?? ''
    const appendSpace = event.key === ' '

    void transliterateName(rawValue, appendSpace)
  }

  const onChangeFormCentre = (value: string) => {
    const selectedCenter = centers.find((center) => center.centreNo === value)
    const districtName = selectedCenter?.districtName?.trim() ?? ''
    const regionNo = districtName ? (regionNoByDistrictName.get(districtName) ?? null) : null

    setFormData((current) => ({
      ...current,
      formCentre: value,
      examCentre: value,
      regionNo,
    }))
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData(createEmptyPrathamikForm(defaultSessionNo))
  }

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (typeof defaultSessionNo !== 'number') {
      setError('Default session is not available.')
      return
    }

    if (!formData.regionNo || !formData.name?.trim()) {
      setError('Region No and Name are required.')
      return
    }

    if (!formData.formCentre?.trim()) {
      setError('Form Centre is required.')
      return
    }

    const payload: FormPrathamik = {
      ...formData,
      sessionNo: defaultSessionNo,
      name: formData.name?.trim() ?? '',
      undClass: editingId === null ? null : formData.undClass,
      userId: currentLoginUserId || formData.userId?.trim() || '',
    }

    try {
      if (editingId === null) {
        await FormPrathamikService.postApiFormPrathamik({ requestBody: payload })
        setSuccessMessage('Prathamik record created.')
      } else {
        await FormPrathamikService.putApiFormPrathamik({
          id: editingId,
          requestBody: payload,
        })
        setSuccessMessage('Prathamik record updated.')
      }

      resetForm()
      await loadRows()
    } catch {
      setError('Unable to save Prathamik record.')
    }
  }

  const onEdit = (row: FormPrathamik) => {
    setEditingId(row.srNo)
    setError(null)
    setSuccessMessage(null)
    setFormData({
      ...row,
      gender: toGenderCode(row.gender),
      sessionNo: typeof defaultSessionNo === 'number' ? defaultSessionNo : row.sessionNo,
    })
  }

  const onDelete = async (id: number) => {
    setError(null)
    setSuccessMessage(null)

    try {
      await FormPrathamikService.deleteApiFormPrathamik({ id })
      setSuccessMessage('Prathamik record deleted.')

      if (editingId === id) {
        resetForm()
      }

      await loadRows()
    } catch {
      setError('Unable to delete Prathamik record.')
    }
  }

  return (
    <Box aria-label="Prathamik form entry">
      <Card elevation={1}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h2" fontWeight={700}>
                Form Entry - Prathamik
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Showing records from form_prathamik where sessionNo = {defaultSessionNo ?? '-'}.
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSave}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                }}
              >
                <TextField
                  type="number"
                  label="Roll No"
                  value={formData.rollNo ?? ''}
                  onChange={(event) => onChangeNumber('rollNo', event.target.value)}
                  disabled
                />

                <TextField
                  type="number"
                  label="Region No *"
                  value={formData.regionNo ?? ''}
                  onChange={(event) => onChangeNumber('regionNo', event.target.value)}
                  required
                  disabled
                />

                <TextField
                  type="text"
                  label="Name *"
                  value={formData.name ?? ''}
                  onChange={(event) => onChangeText('name', event.target.value)}
                  onKeyDown={onNameKeyDown}
                  required
                />

                <FormControl>
                  <InputLabel id="gender-select-label">Gender</InputLabel>
                  <Select
                    labelId="gender-select-label"
                    label="Gender"
                    value={formData.gender ?? ''}
                    onChange={(event) => onChangeText('gender', String(event.target.value))}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                  </Select>
                </FormControl>

                <FormControl required>
                  <InputLabel id="form-centre-select-label">Form Centre</InputLabel>
                  <Select
                    labelId="form-centre-select-label"
                    label="Form Centre"
                    value={formData.formCentre ?? ''}
                    onChange={(event) => onChangeFormCentre(String(event.target.value))}
                  >
                    <MenuItem value="">Select center</MenuItem>
                    {centers.map((center) => (
                      <MenuItem key={center.centreNo} value={center.centreNo}>
                        {center.centreNo}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, ml: 1.5 }}>
                    Name: {selectedFormCenterName || '-'}
                  </Typography>
                </FormControl>

                <FormControl disabled>
                  <InputLabel id="exam-centre-select-label">Exam Centre</InputLabel>
                  <Select
                    labelId="exam-centre-select-label"
                    label="Exam Centre"
                    value={formData.examCentre ?? ''}
                    onChange={(event) => onChangeText('examCentre', String(event.target.value))}
                  >
                    <MenuItem value="">Select center</MenuItem>
                    {centers.map((center) => (
                      <MenuItem key={center.centreNo} value={center.centreNo}>
                        {center.centreNo}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, ml: 1.5 }}>
                    Name: {selectedExamCenterName || '-'}
                  </Typography>
                </FormControl>

              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained">{editingId === null ? 'Create' : 'Update'}</Button>
                <Button type="button" variant="outlined" onClick={resetForm}>Reset</Button>
              </Stack>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

            <Paper variant="outlined">
              <TableContainer>
                <Table size="small" aria-label="Prathamik list">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Sr No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Region No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Session No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Gender</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Form Centre</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Exam Centre</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Total Marks</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={11}>Loading...</TableCell>
                      </TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11}>No records found.</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow key={row.srNo} hover>
                          <TableCell>{row.srNo}</TableCell>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell>{row.regionNo ?? '-'}</TableCell>
                          <TableCell>{row.name ?? '-'}</TableCell>
                          <TableCell>{row.sessionNo ?? '-'}</TableCell>
                          <TableCell>{formatGender(row.gender)}</TableCell>
                          <TableCell>{row.formCentre ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button type="button" size="small" onClick={() => onEdit(row)}>Edit</Button>
                              <Button type="button" size="small" color="error" onClick={() => onDelete(row.srNo)}>
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

type SelectSessionPanelProps = {
  currentDefaultSession: Session | null
  onDefaultSessionChanged: (session: Session | null) => void
  onExit: () => void
}

const SelectSessionPanel = ({
  currentDefaultSession,
  onDefaultSessionChanged,
  onExit,
}: SelectSessionPanelProps) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessionNo, setSelectedSessionNo] = useState<number | ''>(currentDefaultSession?.sessionNo ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadSessions = async (): Promise<Session[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const payload = await SessionsService.getApiSessions()
      const list = toSessionList(payload)
      setSessions(list)
      return list
    } catch {
      setSessions([])
      setError('Unable to load sessions.')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSessions()
  }, [])

  useEffect(() => {
    setSelectedSessionNo(currentDefaultSession?.sessionNo ?? '')
  }, [currentDefaultSession])

  const onSubmit = async () => {
    if (selectedSessionNo === '') {
      setError('Please select a session.')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await SessionsService.postApiSessionsSetdefaultsession({ id: Number(selectedSessionNo) })

      const updatedSessions = await loadSessions()
      const updatedDefault =
        updatedSessions.find((session) => session.sessionNo === Number(selectedSessionNo))
        ?? getDefaultSessionFromList(updatedSessions)

      onDefaultSessionChanged(updatedDefault ?? null)
      setSelectedSessionNo(updatedDefault?.sessionNo ?? Number(selectedSessionNo))
      setSuccessMessage('Default session updated successfully.')
    } catch {
      setError('Unable to update default session.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: 320,
        bgcolor: '#e7e9b8',
        border: '1px solid #9a9a9a',
      }}
      aria-label="Select session page"
    >
      <Typography
        variant="h5"
        sx={{
          color: '#8b0000',
          textAlign: 'center',
          textDecoration: 'underline',
          fontWeight: 700,
          mb: 5,
        }}
      >
        Select Session ( Current Session is {currentDefaultSession?.sessionNo ?? '-'} )
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 560, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center">
          <Typography sx={{ minWidth: 140, color: '#8b0000', fontWeight: 600 }}>
            Select Session :
          </Typography>
          <FormControl size="small" sx={{ minWidth: 240, bgcolor: '#ffffff' }}>
            <InputLabel id="select-session-label">Session No</InputLabel>
            <Select
              labelId="select-session-label"
              value={selectedSessionNo}
              label="Session No"
              onChange={(event) => {
                setSelectedSessionNo(Number(event.target.value))
              }}
              disabled={isLoading || isSaving}
            >
              {sessions.map((session) => (
                <MenuItem key={session.sessionNo} value={session.sessionNo}>
                  {session.sessionNo}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            type="button"
            variant="contained"
            onClick={() => void onSubmit()}
            disabled={isLoading || isSaving}
          >
            OK
          </Button>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={onExit}
            disabled={isSaving}
          >
            Exit
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
      </Stack>
    </Paper>
  )
}

const getDefaultSubMenuItem = (menu: MainMenu): string | null => {
  return menuConfig[menu][0]?.label ?? null
}

export const DashboardPage = () => {
  const [activeMainMenu, setActiveMainMenu] = useState<MainMenu>('Master')
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false)
  const [activeMasterPage, setActiveMasterPage] = useState<MasterPageKey | null>(null)
  const [activeFormEntryExam, setActiveFormEntryExam] = useState(defaultFormEntryExam)
  const [activeMarksEntryExam, setActiveMarksEntryExam] = useState(defaultMarksEntryExam)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [activeSubMenuByMain, setActiveSubMenuByMain] = useState<Record<MainMenu, string | null>>(
    () => ({
      Master: null,
      Supervisor: getDefaultSubMenuItem('Supervisor'),
      Processing: getDefaultSubMenuItem('Processing'),
      Transaction: getDefaultSubMenuItem('Transaction'),
      Query: getDefaultSubMenuItem('Query'),
      Utilities: null,
      Reports: getDefaultSubMenuItem('Reports'),
      Help: getDefaultSubMenuItem('Help'),
    }),
  )

  useEffect(() => {
    let isMounted = true

    const loadDefaultSession = async () => {
      try {
        const directPayload = await SessionsService.getApiSessions()
        const directMatch = getDefaultSessionFromList(toSessionList(directPayload))

        if (directMatch) {
          if (isMounted) {
            setDefaultSession(directMatch)
          }
          return
        }

        const pagedResponse = await httpClient.get('/api/Sessions/paged', {
          params: {
            pageNumber: 1,
            pageSize: 500,
          },
        })
        const pagedMatch = getDefaultSessionFromList(toSessionList(pagedResponse.data))

        if (isMounted) {
          setDefaultSession(pagedMatch)
        }
      } catch {
        if (isMounted) {
          setDefaultSession(null)
        }
      }
    }

    void loadDefaultSession()

    return () => {
      isMounted = false
    }
  }, [])

  const activeSubMenuItems = useMemo(
    () => menuConfig[activeMainMenu],
    [activeMainMenu],
  )

  const onSelectMainMenu = (item: MainMenu) => {
    setActiveMainMenu(item)
    setIsSubMenuOpen(true)

    if (item === 'Master') {
      setActiveMasterPage(defaultMasterPage)
      setActiveSubMenuByMain((current) => ({
        ...current,
        Master: defaultMasterPage,
      }))
      return
    }

    if (item === 'Utilities') {
      setActiveSubMenuByMain((current) => ({
        ...current,
        Utilities: null,
      }))
      return
    }

    const defaultItem = getDefaultSubMenuItem(item)
    setActiveSubMenuByMain((current) => ({
      ...current,
      [item]: defaultItem,
    }))

    if (item === 'Transaction' && defaultItem === 'Form Entry') {
      setActiveFormEntryExam(defaultFormEntryExam)
    }

    if (item === 'Transaction' && defaultItem === 'Marks Entry') {
      setActiveMarksEntryExam(defaultMarksEntryExam)
    }
  }

  const onSelectSubMenu = (item: string) => {
    if (activeMainMenu === 'Master') {
      setActiveMasterPage(item as MasterPageKey)
      setActiveSubMenuByMain((current) => ({
        ...current,
        Master: item,
      }))
      // Close submenu immediately for Master items
      setIsSubMenuOpen(false)
      return
    }

    setActiveSubMenuByMain((current) => ({
      ...current,
      [activeMainMenu]: item,
    }))

    if (activeMainMenu === 'Transaction' && item === 'Form Entry') {
      setActiveFormEntryExam(defaultFormEntryExam)
      // Keep submenu open for items with children to allow exam selection
      return
    }

    if (activeMainMenu === 'Transaction' && item === 'Marks Entry') {
      setActiveMarksEntryExam(defaultMarksEntryExam)
      // Keep submenu open for items with children to allow exam selection
      return
    }

    // Close submenu for all other items
    setIsSubMenuOpen(false)
  }

  const onSelectTransactionExam = (parentItem: 'Form Entry' | 'Marks Entry', exam: string) => {
    setActiveSubMenuByMain((current) => ({
      ...current,
      Transaction: parentItem,
    }))

    if (parentItem === 'Form Entry') {
      setActiveFormEntryExam(exam)
    } else {
      setActiveMarksEntryExam(exam)
    }

    // Close submenu after exam selection
    setIsSubMenuOpen(false)
  }

  const selectedSubMenu = activeSubMenuByMain[activeMainMenu]

  const onExitSelectSession = () => {
    setActiveSubMenuByMain((current) => ({
      ...current,
      Utilities: null,
    }))
  }

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 1.5, md: 2.5 }, pr: 0, bgcolor: '#e8edf5' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: isSubMenuOpen
            ? { xs: '1fr', md: '220px 260px 1fr' }
            : { xs: '1fr', md: '220px 1fr' },
          alignItems: 'start',
        }}
      >
        <Paper elevation={2} sx={{ p: 2, bgcolor: '#22354e', color: '#e2ebf6' }} aria-label="Main menu panel">
          <Box
            component="img"
            src={monoLogo}
            alt="MRS Mono logo"
            sx={{ width: 72, height: 72, objectFit: 'contain', mb: 1 }}
          />
          <Typography variant="h5" component="h1" sx={{ mb: 2, color: '#ffffff', fontWeight: 700 }}>
            MRS Exam
          </Typography>
          <Stack spacing={1} aria-label="Primary navigation">
            {mainMenuItems.map((item) => {
              const isActive = item === activeMainMenu

              return (
                <Button
                  key={item}
                  type="button"
                  fullWidth
                  onClick={() => onSelectMainMenu(item)}
                  variant={isActive ? 'contained' : 'text'}
                  color={isActive ? 'primary' : 'inherit'}
                  endIcon={isActive && isSubMenuOpen ? <ExpandMoreRounded /> : <ChevronRightRounded />}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item}
                </Button>
              )
            })}
          </Stack>
        </Paper>

        {isSubMenuOpen ? (
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#425f84', color: '#f2f6fc' }} aria-label="Sub menu panel">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h6" sx={{ color: 'inherit', fontWeight: 700 }}>
                {activeMainMenu}
              </Typography>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => setIsSubMenuOpen(false)}
                aria-label="Close submenu"
              >
                Close
              </Button>
            </Stack>

            <Stack spacing={1} id="active-submenu-list">
              {activeSubMenuItems.length > 0 ? (
                activeSubMenuItems.map((item) => {
                  const isActive = activeMainMenu === 'Master'
                    ? item.label === activeMasterPage
                    : item.label === selectedSubMenu
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0
                  const showChildren = activeMainMenu === 'Transaction' && hasChildren && isActive

                  return (
                    <Box key={item.label}>
                      <Button
                        type="button"
                        fullWidth
                        variant={isActive ? 'contained' : 'text'}
                        color={isActive ? 'primary' : 'inherit'}
                        onClick={() => onSelectSubMenu(item.label)}
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        {item.label}
                      </Button>

                      {showChildren ? (
                        <Stack spacing={0.75} sx={{ mt: 1, pl: 2 }} aria-label={`${item.label} exam submenu`}>
                          {(item.children ?? []).map((child) => {
                            const isChildActive = item.label === 'Form Entry'
                              ? child === activeFormEntryExam
                              : child === activeMarksEntryExam

                            return (
                              <Button
                                key={child}
                                type="button"
                                size="small"
                                variant={isChildActive ? 'contained' : 'outlined'}
                                color="inherit"
                                onClick={() => onSelectTransactionExam(item.label as 'Form Entry' | 'Marks Entry', child)}
                                sx={{ justifyContent: 'flex-start' }}
                              >
                                {child}
                              </Button>
                            )
                          })}
                        </Stack>
                      ) : null}
                    </Box>
                  )
                })
              ) : (
                <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.85 }}>
                  No submenu items configured.
                </Typography>
              )}
            </Stack>
          </Paper>
        ) : null}

        <Box aria-label="Workspace area">
          <Paper
            elevation={2}
            sx={{
              mb: 2,
              px: 2.5,
              py: 1.5,
              bgcolor: '#22354e',
              color: '#e2ebf6',
            }}
            aria-label="Top navigation bar"
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              spacing={1.5}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: 'inherit', opacity: 0.78, letterSpacing: 1.1 }}
                >
                  Workspace
                </Typography>
                <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                  {activeMainMenu}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                {!isSubMenuOpen ? (
                  <Button
                    type="button"
                    variant="outlined"
                    color="inherit"
                    onClick={() => setIsSubMenuOpen(true)}
                    sx={{ borderColor: 'rgba(226, 235, 246, 0.4)' }}
                  >
                    Open {activeMainMenu} Menu
                  </Button>
                ) : null}

                {defaultSession ? (
                  <Stack direction="row" spacing={3} alignItems="center" aria-label="Default session info">
                    <Box>
                      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.78, display: 'block' }}>
                        Session No
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700 }}>
                        {defaultSession.sessionNo}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.78, display: 'block' }}>
                        Month
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700 }}>
                        {defaultSession.month?.trim() || '-'}
                      </Typography>
                    </Box>
                  </Stack>
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          {activeMainMenu === 'Master' && activeMasterPage ? (
            <MasterMenuPage pageKey={activeMasterPage} />
          ) : activeMainMenu === 'Utilities' && selectedSubMenu === 'Select Session' ? (
            <SelectSessionPanel
              currentDefaultSession={defaultSession}
              onDefaultSessionChanged={setDefaultSession}
              onExit={onExitSelectSession}
            />
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Form Entry' && activeFormEntryExam === 'Prathamik' ? (
            <PrathamikFormEntryPanel defaultSessionNo={defaultSession?.sessionNo} />
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Form Entry' ? (
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Form Entry - {activeFormEntryExam}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {activeFormEntryExam} form entry page will be available soon.
                </Typography>
              </CardContent>
            </Card>
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Marks Entry' ? (
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Marks Entry - {activeMarksEntryExam}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  {activeMarksEntryExam} marks entry page will be available soon.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" fontWeight={700}>
                  {selectedSubMenu ?? activeMainMenu}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Page for {selectedSubMenu ?? activeMainMenu} will be available soon.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}