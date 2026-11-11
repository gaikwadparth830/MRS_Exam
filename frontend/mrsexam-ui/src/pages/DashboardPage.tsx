import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  type BatchInsertRequest,
  type Center,
  CentersService,
  type District,
  DistrictsService,
  type FormBalbodhini,
  FormBalbodhiniService,
  type FormPandit,
  FormPanditService,
  type FormPrabodh,
  FormPrabodhService,
  type FormPrathamik,
  FormPrathamikService,
  type FormPraveen,
  FormPraveenService,
  type FormPraveshika,
  FormPraveshikaService,
  type FormSubodh,
  FormSubodhService,
  type Region,
  RegionsService,
  type Session,
  SessionsService,
} from '../api/generatedClient'
import { ApiError } from '../api/generated/core/ApiError'
import monoLogo from '../assets/MONO.png'
import { httpClient } from '../api/httpClient'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { BalbodhiniFormEntryPage } from './balbodhini/BalbodhiniFormEntryPage'
import { BalbodhiniMarksPage } from './balbodhini/BalbodhiniMarksPage'
import { BalbodhiniRollNumbersPage } from './balbodhini/BalbodhiniRollNumbersPage'
import {
  BalbodhiniGenerateResultPage,
  BalbodhiniResetLockPage,
} from './balbodhini/BalbodhiniGenerateResultPage'
import { balbodhiniApi, type CurrentSession } from '../api/balbodhini/client'

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
type MarksEntryExam = (typeof formEntryExamItems)[number]
type SupervisorBatchInsertExam = (typeof formEntryExamItems)[number]

type SupervisorBatchInsertFormState = {
  exam: SupervisorBatchInsertExam | ''
  centreCode: string
  regionNo: number | ''
  startRollNo: number | ''
  startName: string
  endRollNo: number | ''
  endName: string
}

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
    { label: 'Generate Result - Balbodhini' },
    { label: 'Set Roll Nos - Balbodhini' },
    { label: 'Aur Forms - Set Roll Numbers - Balbodhini' },
    { label: 'Clear Roll Numbers - Balbodhini' },
    { label: 'Export Center Data to Foxpro' },
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
const defaultFormEntryExam = 'Balbodhini'
const defaultMarksEntryExam = 'Balbodhini'

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

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) {
    return payload as Region[]
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
    return (list ?? []) as Region[]
  }

  return []
}

const toDistrictList = (payload: unknown): District[] => {
  if (Array.isArray(payload)) {
    return payload as District[]
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
    return (list ?? []) as District[]
  }

  return []
}

const toFormList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[]
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
    return (list ?? []) as T[]
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

const toFormPrathamikRecord = (payload: unknown): FormPrathamik | null => {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const objectPayload = payload as Record<string, unknown>

    if ('srNo' in objectPayload || 'rollNo' in objectPayload || 'name' in objectPayload) {
      return payload as FormPrathamik
    }
  }

  const records = toFormPrathamikList(payload)
  return records[0] ?? null
}

const getNextPrathamikSrNo = (rows: FormPrathamik[]): number => {
  return rows.reduce((maxSrNo, row) => Math.max(maxSrNo, row.srNo), 0) + 1
}

const createEmptySupervisorBatchInsertForm = (): SupervisorBatchInsertFormState => ({
  exam: '',
  centreCode: '',
  regionNo: '',
  startRollNo: '',
  startName: '-',
  endRollNo: '',
  endName: '-',
})

const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof ApiError) {
    const body = error.body as unknown

    if (typeof body === 'string' && body.trim()) {
      return body
    }

    if (body && typeof body === 'object') {
      const payload = body as Record<string, unknown>
      const detail = typeof payload.detail === 'string' ? payload.detail.trim() : ''
      const title = typeof payload.title === 'string' ? payload.title.trim() : ''

      if (detail) {
        return title ? `${title}: ${detail}` : detail
      }

      if (title) {
        return title
      }

      if ('errors' in payload && payload.errors && typeof payload.errors === 'object') {
        const fieldErrors = Object.entries(payload.errors as Record<string, unknown>)
          .flatMap(([field, value]) => {
            if (!Array.isArray(value)) {
              return []
            }

            return value
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
              .map((item) => `${field}: ${item}`)
          })

        if (fieldErrors.length > 0) {
          return fieldErrors.join(' | ')
        }
      }
    }

    return `${fallbackMessage} (${error.status} ${error.statusText})`
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallbackMessage
}

const submitSupervisorBatchInsert = async ({
  exam,
  payload,
}: {
  exam: SupervisorBatchInsertExam
  payload: BatchInsertRequest
}) => {
  const postBatchInsertFallback = async (path: string) => {
    await httpClient.post(path, payload)
  }

  switch (exam) {
    case 'Pandit':
      if (typeof FormPanditService.postApiFormPanditBatchInsert === 'function') {
        await FormPanditService.postApiFormPanditBatchInsert({ requestBody: payload })
        return
      }

      await postBatchInsertFallback('/api/FormPandit/batch-insert')
      return
    case 'Praveshika':
      if (typeof FormPraveshikaService.postApiFormPraveshikaBatchInsert === 'function') {
        await FormPraveshikaService.postApiFormPraveshikaBatchInsert({ requestBody: payload })
        return
      }

      await postBatchInsertFallback('/api/FormPraveshika/batch-insert')
      return
    case 'Prathamik':
      if (typeof FormPrathamikService.postApiFormPrathamikBatchInsert === 'function') {
        await FormPrathamikService.postApiFormPrathamikBatchInsert({ requestBody: payload })
        return
      }

      await postBatchInsertFallback('/api/FormPrathamik/batch-insert')
      return
    case 'Prabodh':
      if (typeof FormPrabodhService.postApiFormPrabodhBatchInsert === 'function') {
        await FormPrabodhService.postApiFormPrabodhBatchInsert({ requestBody: payload })
        return
      }

      await postBatchInsertFallback('/api/FormPrabodh/batch-insert')
      return
    case 'Praveen':
      if (typeof FormPraveenService.postApiFormPraveenBatchInsert === 'function') {
        await FormPraveenService.postApiFormPraveenBatchInsert({
          regionNo: payload.regionNo,
          sessionNo: payload.sessionNo,
          requestBody: payload,
        })
        return
      }

      await postBatchInsertFallback(`/api/FormPraveen/batch-insert/${payload.regionNo}/${payload.sessionNo}`)
      return
    case 'Subodh':
      if (typeof FormSubodhService.postApiFormSubodhBatchInsert === 'function') {
        await FormSubodhService.postApiFormSubodhBatchInsert({ requestBody: payload })
        return
      }

      await postBatchInsertFallback('/api/FormSubodh/batch-insert')
      return
    case 'Balbodhini':
      if (typeof FormBalbodhiniService.postApiFormBalbodhiniBatchInsert === 'function') {
        await FormBalbodhiniService.postApiFormBalbodhiniBatchInsert({ requestBody: payload })
        return
      }

      await postBatchInsertFallback('/api/FormBalbodhini/batch-insert')
      return
  }
}

const applyOptimisticPrathamikCreate = ({
  currentRows,
  createdRow,
  createMode,
}: {
  currentRows: FormPrathamik[]
  createdRow: FormPrathamik
  createMode: CreatePlacementMode
}): FormPrathamik[] => {
  const rowsWithoutCreated = currentRows.filter((row) => row.srNo !== createdRow.srNo)

  if (createMode === 'insert-after') {
    return [...rowsWithoutCreated.map((row) => {
      if (row.srNo >= createdRow.srNo) {
        return {
          ...row,
          srNo: row.srNo + 1,
        }
      }

      return row
    }), createdRow].sort((left, right) => left.srNo - right.srNo)
  }

  return [...rowsWithoutCreated, createdRow].sort((left, right) => left.srNo - right.srNo)
}

const applyOptimisticPrathamikUpdate = ({
  currentRows,
  updatedRow,
  editingId,
}: {
  currentRows: FormPrathamik[]
  updatedRow: FormPrathamik
  editingId: number
}): FormPrathamik[] => {
  return currentRows.map((row) => (row.srNo === editingId ? updatedRow : row))
}

const applyOptimisticMarksUpdate = ({
  currentRows,
  updatedRow,
  editingId,
}: {
  currentRows: MarksEntryRecord[]
  updatedRow: MarksEntryRecord
  editingId: number
}): MarksEntryRecord[] => {
  return currentRows.map((row) => (getMarksEntryRecordId(row) === editingId ? updatedRow : row))
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

const createNextPrathamikForm = ({
  currentForm,
  defaultSessionNo,
}: {
  currentForm: FormPrathamik
  defaultSessionNo?: number
}): FormPrathamik => ({
  ...createEmptyPrathamikForm(defaultSessionNo),
  regionNo: currentForm.regionNo ?? null,
  formCentre: currentForm.formCentre ?? '',
  examCentre: currentForm.examCentre ?? '',
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

type MarksEntryPanelProps = {
  defaultSessionNo?: number
  title: string
  fixedExam?: MarksEntryExam
  showExamSelector?: boolean
}

type MarksEntryRecord = {
  srNo?: number
  rollNo?: number | null
  sessionNo?: number | null
  name?: string | null
  formCentre?: string | null
  examCentre?: string | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  marks4?: string | null
  marks5?: string | null
  marks6?: string | null
  oralMarks?: string | null
  optMarks?: string | null
  khand1TotMarks?: number | null
  khand2TotMarks?: number | null
  totMarks?: number | null
  grade?: string | null
  userId?: string | null
  [key: string]: unknown
}

type MarksFieldKey =
  | 'marks1'
  | 'marks2'
  | 'marks3'
  | 'marks4'
  | 'marks5'
  | 'marks6'
  | 'oralMarks'
  | 'optMarks'
  | 'khand1TotMarks'
  | 'khand2TotMarks'
  | 'totMarks'
  | 'grade'

type MarksFieldConfig = {
  key: MarksFieldKey
  label: string
  inputType: 'text' | 'number'
}

type MarksEntryConfig = {
  fields: MarksFieldConfig[]
  loadRows: (sessionNo: number) => Promise<MarksEntryRecord[]>
  updateRow: (row: MarksEntryRecord) => Promise<unknown>
  getRowId: (row: MarksEntryRecord) => number
}

const marksFieldCatalog: Record<MarksFieldKey, MarksFieldConfig> = {
  marks1: { key: 'marks1', label: 'Marks 1', inputType: 'text' },
  marks2: { key: 'marks2', label: 'Marks 2', inputType: 'text' },
  marks3: { key: 'marks3', label: 'Marks 3', inputType: 'text' },
  marks4: { key: 'marks4', label: 'Marks 4', inputType: 'text' },
  marks5: { key: 'marks5', label: 'Marks 5', inputType: 'text' },
  marks6: { key: 'marks6', label: 'Marks 6', inputType: 'text' },
  oralMarks: { key: 'oralMarks', label: 'Oral Marks', inputType: 'text' },
  optMarks: { key: 'optMarks', label: 'Optional Marks', inputType: 'text' },
  khand1TotMarks: { key: 'khand1TotMarks', label: 'Khand 1 Total', inputType: 'number' },
  khand2TotMarks: { key: 'khand2TotMarks', label: 'Khand 2 Total', inputType: 'number' },
  totMarks: { key: 'totMarks', label: 'Total Marks', inputType: 'number' },
  grade: { key: 'grade', label: 'Grade', inputType: 'text' },
}

const numericMarksFieldKeys = new Set<MarksFieldKey>(['khand1TotMarks', 'khand2TotMarks', 'totMarks'])
const subtotalMarksFieldKeys: MarksFieldKey[] = ['khand1TotMarks', 'khand2TotMarks']
const componentMarksFieldKeys: MarksFieldKey[] = ['marks1', 'marks2', 'marks3', 'marks4', 'marks5', 'marks6', 'oralMarks', 'optMarks']

const parseMarksValue = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) {
      return 0
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

const calculateAutoTotal = (fields: Partial<Record<MarksFieldKey, string>>): number | '' => {
  const subtotalValues = subtotalMarksFieldKeys
    .map((fieldKey) => parseMarksValue(fields[fieldKey]))
    .filter((value) => value > 0)

  if (subtotalValues.length > 0) {
    return subtotalValues.reduce((sum, value) => sum + value, 0)
  }

  const total = componentMarksFieldKeys.reduce((sum, fieldKey) => sum + parseMarksValue(fields[fieldKey]), 0)
  return total > 0 ? total : ''
}

const getMarksEntryRecordId = (row: MarksEntryRecord): number => {
  const srNo = typeof row.srNo === 'number' ? row.srNo : null
  if (srNo !== null) {
    return srNo
  }

  const rollNo = typeof row.rollNo === 'number' ? row.rollNo : null
  if (rollNo !== null) {
    return rollNo
  }

  return 0
}

const marksEntryConfigByExam: Record<MarksEntryExam, MarksEntryConfig> = {
  Pandit: {
    fields: [
      marksFieldCatalog.marks1,
      marksFieldCatalog.marks2,
      marksFieldCatalog.marks3,
      marksFieldCatalog.marks4,
      marksFieldCatalog.marks5,
      marksFieldCatalog.marks6,
      marksFieldCatalog.oralMarks,
      marksFieldCatalog.optMarks,
      marksFieldCatalog.khand1TotMarks,
      marksFieldCatalog.khand2TotMarks,
      marksFieldCatalog.totMarks,
    ],
    loadRows: async (sessionNo) => {
      const payload = await FormPanditService.getApiFormPanditPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormPandit>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormPanditService.putApiFormPandit({
      rollNo: Number(row.rollNo),
      sessionNo: Number(row.sessionNo),
      requestBody: row as FormPandit,
    }),
    getRowId: getMarksEntryRecordId,
  },
  Praveshika: {
    fields: [marksFieldCatalog.marks1, marksFieldCatalog.marks2, marksFieldCatalog.totMarks],
    loadRows: async (sessionNo) => {
      const payload = await FormPraveshikaService.getApiFormPraveshikaPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormPraveshika>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormPraveshikaService.putApiFormPraveshika({
      id: getMarksEntryRecordId(row),
      requestBody: row as FormPraveshika,
    }),
    getRowId: getMarksEntryRecordId,
  },
  Prathamik: {
    fields: [marksFieldCatalog.marks1, marksFieldCatalog.totMarks],
    loadRows: async (sessionNo) => {
      const payload = await FormPrathamikService.getApiFormPrathamikPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormPrathamik>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormPrathamikService.putApiFormPrathamik({
      id: getMarksEntryRecordId(row),
      requestBody: row as FormPrathamik,
    }),
    getRowId: getMarksEntryRecordId,
  },
  Prabodh: {
    fields: [
      marksFieldCatalog.marks1,
      marksFieldCatalog.marks2,
      marksFieldCatalog.marks3,
      marksFieldCatalog.oralMarks,
      marksFieldCatalog.totMarks,
    ],
    loadRows: async (sessionNo) => {
      const payload = await FormPrabodhService.getApiFormPrabodhPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormPrabodh>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormPrabodhService.putApiFormPrabodh({
      id: getMarksEntryRecordId(row),
      requestBody: row as FormPrabodh,
    }),
    getRowId: getMarksEntryRecordId,
  },
  Praveen: {
    fields: [
      marksFieldCatalog.marks1,
      marksFieldCatalog.marks2,
      marksFieldCatalog.marks3,
      marksFieldCatalog.marks4,
      marksFieldCatalog.oralMarks,
      marksFieldCatalog.totMarks,
    ],
    loadRows: async (sessionNo) => {
      const payload = await FormPraveenService.getApiFormPraveenPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormPraveen>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormPraveenService.putApiFormPraveen({
      rollNo: Number(row.rollNo),
      regionNo: Number(row.regionNo),
      sessionNo: Number(row.sessionNo),
      requestBody: row as FormPraveen,
    }),
    getRowId: getMarksEntryRecordId,
  },
  Subodh: {
    fields: [marksFieldCatalog.marks1, marksFieldCatalog.marks2, marksFieldCatalog.totMarks],
    loadRows: async (sessionNo) => {
      const payload = await FormSubodhService.getApiFormSubodhPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormSubodh>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormSubodhService.putApiFormSubodh({
      id: getMarksEntryRecordId(row),
      requestBody: row as FormSubodh,
    }),
    getRowId: getMarksEntryRecordId,
  },
  Balbodhini: {
    fields: [marksFieldCatalog.marks1, marksFieldCatalog.totMarks],
    loadRows: async (sessionNo) => {
      const payload = await FormBalbodhiniService.getApiFormBalbodhiniPaged({ pageNumber: 1, pageSize: 300, sessionNo })
      return toFormList<FormBalbodhini>(payload) as MarksEntryRecord[]
    },
    updateRow: (row) => FormBalbodhiniService.putApiFormBalbodhini({
      id: getMarksEntryRecordId(row),
      requestBody: row as FormBalbodhini,
    }),
    getRowId: getMarksEntryRecordId,
  },
}

type CreatePlacementMode = 'append' | 'insert-after'

type PrathamikRowsTableProps = {
  isLoading: boolean
  rows: FormPrathamik[]
  onEdit: (row: FormPrathamik) => void
  onStartInsertAfter: (row: FormPrathamik) => void
  onDelete: (id: number) => void
}

const PrathamikRowsTable = memo(({
  isLoading,
  rows,
  onEdit,
  onStartInsertAfter,
  onDelete,
}: PrathamikRowsTableProps) => {
  return (
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
                      <Button type="button" size="small" onClick={() => onStartInsertAfter(row)}>
                        Insert After
                      </Button>
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
  )
})

type MarksRowsTableProps = {
  isLoading: boolean
  rows: MarksEntryRecord[]
  editingId: number | null
  fields: MarksFieldConfig[]
  onEdit: (row: MarksEntryRecord) => void
}

const MarksRowsTable = memo(({
  isLoading,
  rows,
  editingId,
  fields,
  onEdit,
}: MarksRowsTableProps) => {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small" aria-label="Marks list">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Sr No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Form Centre</TableCell>
              {fields.map((field) => (
                <TableCell key={field.key} sx={{ fontWeight: 700 }}>{field.label}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5 + fields.length}>Loading...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5 + fields.length}>No records found.</TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={getMarksEntryRecordId(row)} hover selected={editingId === getMarksEntryRecordId(row)}>
                  <TableCell>{row.srNo ?? '-'}</TableCell>
                  <TableCell>{row.rollNo ?? '-'}</TableCell>
                  <TableCell>{row.name ?? '-'}</TableCell>
                  <TableCell>{row.formCentre ?? '-'}</TableCell>
                  {fields.map((field) => {
                    const fieldValue = row[field.key]
                    return (
                      <TableCell key={field.key}>
                        {typeof fieldValue === 'string' ? fieldValue.trim() || '-' : (fieldValue ?? '-')}
                      </TableCell>
                    )
                  })}
                  <TableCell>
                    <Button type="button" size="small" onClick={() => onEdit(row)}>Edit Marks</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
})

const CURRENT_USER_ID_KEY = 'currentUserId'

const MarksEntryPanel = ({
  defaultSessionNo,
  title,
  fixedExam,
  showExamSelector = false,
}: MarksEntryPanelProps) => {
  const [selectedExam, setSelectedExam] = useState<MarksEntryExam>(fixedExam ?? defaultMarksEntryExam)
  const [selectedCenterCode, setSelectedCenterCode] = useState('ALL')
  const [rows, setRows] = useState<MarksEntryRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingRow, setEditingRow] = useState<MarksEntryRecord | null>(null)
  const [fieldValues, setFieldValues] = useState<Partial<Record<MarksFieldKey, string>>>({})

  useEffect(() => {
    if (fixedExam) {
      setSelectedExam(fixedExam)
    }
  }, [fixedExam])

  const currentExam = fixedExam ?? selectedExam
  const currentConfig = marksEntryConfigByExam[currentExam]
  const autoCalculatedTotal = useMemo(() => calculateAutoTotal(fieldValues), [fieldValues])
  const centerOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.formCentre?.trim() ?? '').filter((value) => value.length > 0))).sort(),
    [rows],
  )
  const filteredRows = useMemo(() => {
    if (selectedCenterCode === 'ALL') {
      return rows
    }

    return rows.filter((row) => (row.formCentre?.trim() ?? '') === selectedCenterCode)
  }, [rows, selectedCenterCode])

  const loadRows = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (typeof defaultSessionNo !== 'number') {
      setRows([])
      return
    }

    if (!silent) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const payload = await currentConfig.loadRows(defaultSessionNo)
      setRows(payload)
    } catch {
      if (!silent) {
        setError(`Unable to load ${currentExam} records for marks update.`)
        setRows([])
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadRows()
  }, [currentConfig, currentExam, defaultSessionNo])

  const resetEditor = () => {
    setEditingRow(null)
    setFieldValues({})
  }

  const onEdit = (row: MarksEntryRecord) => {
    setError(null)
    setSuccessMessage(null)
    setEditingRow(row)
    setFieldValues(
      Object.fromEntries(
        currentConfig.fields.map((field) => {
          const rawValue = row[field.key]
          return [field.key, rawValue == null ? '' : String(rawValue)]
        }),
      ) as Partial<Record<MarksFieldKey, string>>,
    )
  }

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (editingRow === null) {
      setError(`Select a ${currentExam} record to update marks.`)
      return
    }

    const payload: MarksEntryRecord = {
      ...editingRow,
      sessionNo: typeof defaultSessionNo === 'number' ? defaultSessionNo : editingRow.sessionNo,
    }
    const payloadRecord = payload as Record<string, unknown>

    currentConfig.fields.forEach((field) => {
      const rawValue = field.key === 'totMarks'
        ? String(autoCalculatedTotal === '' ? '' : autoCalculatedTotal)
        : (fieldValues[field.key] ?? '')

      if (numericMarksFieldKeys.has(field.key)) {
        payloadRecord[field.key] = rawValue.trim() === '' ? null : Number(rawValue)
      } else {
        payloadRecord[field.key] = rawValue
      }
    })

    setIsSaving(true)

    try {
      const editingId = currentConfig.getRowId(editingRow)
      const response = await currentConfig.updateRow(payload)
      const updatedRow = (response && typeof response === 'object' && !Array.isArray(response)
        ? (response as MarksEntryRecord)
        : payload)

      setRows((currentRows) => applyOptimisticMarksUpdate({
        currentRows,
        updatedRow,
        editingId,
      }))
      setSuccessMessage(`${currentExam} marks updated.`)
      resetEditor()
      void loadRows({ silent: true })
    } catch {
      setError(`Unable to update ${currentExam} marks.`)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    resetEditor()
    setSelectedCenterCode('ALL')
    setError(null)
    setSuccessMessage(null)
  }, [currentExam])

  useEffect(() => {
    if (editingRow === null) {
      return
    }

    if (selectedCenterCode === 'ALL') {
      return
    }

    const editingCenter = editingRow.formCentre?.trim() ?? ''
    if (editingCenter !== selectedCenterCode) {
      resetEditor()
    }
  }, [editingRow, selectedCenterCode])

  return (
    <Box aria-label={`${currentExam} marks entry`}>
      <Card elevation={1}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h2" fontWeight={700}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Update marks for {currentExam} records in the current default session.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Chip label={`Session No: ${defaultSessionNo ?? '-'}`} color="primary" variant="outlined" />
              {showExamSelector ? (
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="marks-entry-exam-label">Exam</InputLabel>
                  <Select
                    labelId="marks-entry-exam-label"
                    value={currentExam}
                    label="Exam"
                    disabled={isSaving}
                    onChange={(event) => setSelectedExam(event.target.value as MarksEntryExam)}
                  >
                    {formEntryExamItems.map((exam) => (
                      <MenuItem key={exam} value={exam}>{exam}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="marks-entry-center-label">Center No</InputLabel>
                <Select
                  labelId="marks-entry-center-label"
                  value={selectedCenterCode}
                  label="Center No"
                  disabled={isSaving}
                  onChange={(event) => setSelectedCenterCode(String(event.target.value))}
                >
                  <MenuItem value="ALL">All Centers</MenuItem>
                  {centerOptions.map((centerCode) => (
                    <MenuItem key={centerCode} value={centerCode}>{centerCode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip label={`Records: ${filteredRows.length}`} variant="outlined" />
            </Stack>

            <Box
              component="form"
              onSubmit={onSave}
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <TextField
                label="Roll No"
                value={editingRow?.rollNo ?? ''}
                disabled
                InputProps={{ readOnly: true }}
                placeholder="Choose a row below"
              />

              <TextField
                label="Student Name"
                value={editingRow?.name ?? ''}
                disabled
                InputProps={{ readOnly: true }}
              />

              <TextField
                label="Form Centre"
                value={editingRow?.formCentre ?? ''}
                disabled
                InputProps={{ readOnly: true }}
              />

              {currentConfig.fields.map((field) => (
                <TextField
                  key={field.key}
                  label={field.label}
                  type={field.inputType}
                  value={field.key === 'totMarks' ? autoCalculatedTotal : (fieldValues[field.key] ?? '')}
                  disabled={field.key === 'totMarks' || isSaving || editingRow === null}
                  InputProps={field.key === 'totMarks' ? { readOnly: true } : undefined}
                  onChange={(event) => {
                    if (field.key === 'totMarks') {
                      return
                    }

                    const nextValue = event.target.value
                    setFieldValues((current) => ({
                      ...current,
                      [field.key]: nextValue,
                    }))
                  }}
                />
              ))}

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button type="submit" variant="contained" disabled={isSaving || editingRow === null}>
                  {isSaving ? 'Saving...' : 'Update Marks'}
                </Button>
                <Button type="button" variant="outlined" disabled={isSaving} onClick={resetEditor}>
                  Clear
                </Button>
              </Stack>
            </Box>

            <MarksRowsTable
              isLoading={isLoading}
              rows={filteredRows}
              editingId={editingRow ? currentConfig.getRowId(editingRow) : null}
              fields={currentConfig.fields}
              onEdit={onEdit}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

const PrathamikFormEntryPanel = ({ defaultSessionNo }: PrathamikFormEntryPanelProps) => {
  const [centers, setCenters] = useState<Center[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [rows, setRows] = useState<FormPrathamik[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [createPlacementMode, setCreatePlacementMode] = useState<CreatePlacementMode>('append')
  const [insertAfterSrNo, setInsertAfterSrNo] = useState<number | ''>('')
  const [formData, setFormData] = useState<FormPrathamik>(() => createEmptyPrathamikForm(defaultSessionNo))
  const transliterationRequestId = useRef(0)

  const regionNoByDistrictName = useMemo(() => {
    return new Map(
      districts
        .filter((district) => district.districtName.trim().length > 0)
        .map((district) => [district.districtName.trim(), district.regionNo ?? null]),
    )
  }, [districts])

  const centerByNo = useMemo(() => {
    return new Map(centers.map((center) => [center.centreNo, center]))
  }, [centers])

  const centerOptions = useMemo(() => {
    return centers.map((center) => ({
      value: center.centreNo,
      label: center.centreNo,
    }))
  }, [centers])

  const centerOptionByValue = useMemo(() => {
    return new Map(centerOptions.map((center) => [center.value, center]))
  }, [centerOptions])

  const selectedFormCenter = useMemo(() => {
    return centerByNo.get(formData.formCentre ?? '') ?? null
  }, [centerByNo, formData.formCentre])

  const selectedExamCenter = useMemo(() => {
    return centerByNo.get(formData.examCentre ?? '') ?? null
  }, [centerByNo, formData.examCentre])

  const selectedFormCenterName = useMemo(() => {
    return selectedFormCenter?.centreName?.trim() || selectedFormCenter?.city?.trim() || ''
  }, [selectedFormCenter])

  const selectedExamCenterName = useMemo(() => {
    return selectedExamCenter?.centreName?.trim() || selectedExamCenter?.city?.trim() || ''
  }, [selectedExamCenter])

  const currentLoginUserId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''

  const loadRows = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (typeof defaultSessionNo !== 'number') {
      setRows([])
      return
    }

    if (!silent) {
      setIsLoading(true)
      setError(null)
    }

    try {
      const payload = await FormPrathamikService.getApiFormPrathamikPaged({
        pageNumber: 1,
        pageSize: 300,
        sessionNo: defaultSessionNo,
      })

      setRows(toFormPrathamikList(payload))
    } catch {
      if (!silent) {
        setError('Unable to load Prathamik records.')
        setRows([])
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
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
    const selectedCenter = centerByNo.get(value)
    const districtName = selectedCenter?.districtName?.trim() ?? ''
    const regionNo = districtName ? (regionNoByDistrictName.get(districtName) ?? null) : null

    setFormData((current) => ({
      ...current,
      formCentre: value,
      examCentre: value,
      regionNo,
    }))
  }

  const resetForm = ({ preserveCenterDetails = false }: { preserveCenterDetails?: boolean } = {}) => {
    setEditingId(null)
    setCreatePlacementMode('append')
    setInsertAfterSrNo('')
    setFormData((current) => (
      preserveCenterDetails
        ? createNextPrathamikForm({ currentForm: current, defaultSessionNo })
        : createEmptyPrathamikForm(defaultSessionNo)
    ))
  }

  const onStartInsertAfter = (row: FormPrathamik) => {
    setEditingId(null)
    setCreatePlacementMode('insert-after')
    setInsertAfterSrNo(row.srNo)
    setError(null)
    setSuccessMessage(null)
    setFormData((current) => ({
      ...createEmptyPrathamikForm(defaultSessionNo),
      formCentre: row.formCentre ?? current.formCentre ?? '',
      examCentre: row.examCentre ?? current.examCentre ?? '',
      regionNo: row.regionNo ?? current.regionNo ?? null,
    }))
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

    if (editingId === null && createPlacementMode === 'insert-after' && insertAfterSrNo === '') {
      setError('Select the Sr No after which the new record should be inserted.')
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
        if (createPlacementMode === 'insert-after' && insertAfterSrNo !== '') {
          const response = await FormPrathamikService.postApiFormPrathamikInsertAfter({
            previousSrNo: Number(insertAfterSrNo),
            requestBody: payload,
          })
          const createdRow = toFormPrathamikRecord(response) ?? {
            ...payload,
            srNo: Number(insertAfterSrNo) + 1,
          }

          setRows((currentRows) => applyOptimisticPrathamikCreate({
            currentRows,
            createdRow,
            createMode: 'insert-after',
          }))
          setSuccessMessage(`Prathamik record inserted after Sr No ${insertAfterSrNo}.`)
        } else {
          const response = await FormPrathamikService.postApiFormPrathamik({ requestBody: payload })
          const createdRow = toFormPrathamikRecord(response) ?? {
            ...payload,
            srNo: getNextPrathamikSrNo(rows),
          }

          setRows((currentRows) => applyOptimisticPrathamikCreate({
            currentRows,
            createdRow,
            createMode: 'append',
          }))
          setSuccessMessage('Prathamik record created.')
        }
      } else {
        const response = await FormPrathamikService.putApiFormPrathamik({
          id: editingId,
          requestBody: payload,
        })
        const updatedRow = toFormPrathamikRecord(response) ?? {
          ...payload,
          srNo: editingId,
        }

        setRows((currentRows) => applyOptimisticPrathamikUpdate({
          currentRows,
          updatedRow,
          editingId,
        }))
        setSuccessMessage('Prathamik record updated.')
      }

      resetForm({ preserveCenterDetails: editingId === null })
      void loadRows({ silent: true })
    } catch {
      setError('Unable to save Prathamik record.')
    }
  }

  const onEdit = (row: FormPrathamik) => {
    setEditingId(row.srNo)
    setCreatePlacementMode('append')
    setInsertAfterSrNo('')
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
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ mt: 0.75 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing records from form_prathamik where sessionNo = {defaultSessionNo ?? '-'}.
                </Typography>
                <Chip
                  size="small"
                  color="primary"
                  label={`Total Records: ${rows.length}`}
                />
              </Stack>
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

                <Autocomplete
                  options={centerOptions}
                  value={centerOptionByValue.get(formData.formCentre ?? '') ?? null}
                  onChange={(_, option) => onChangeFormCentre(option?.value ?? '')}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Form Centre"
                      required
                    />
                  )}
                />

                <TextField
                  label="Form Centre Name"
                  value={selectedFormCenterName || ''}
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Exam Centre"
                  value={formData.examCentre ?? ''}
                  InputProps={{ readOnly: true }}
                />

                <TextField
                  label="Exam Centre Name"
                  value={selectedExamCenterName || ''}
                  InputProps={{ readOnly: true }}
                />

                <FormControl disabled={editingId !== null}>
                  <InputLabel id="prathamik-create-mode-label">Create Mode</InputLabel>
                  <Select
                    labelId="prathamik-create-mode-label"
                    label="Create Mode"
                    value={createPlacementMode}
                    onChange={(event) => {
                      const nextMode = event.target.value as CreatePlacementMode
                      setCreatePlacementMode(nextMode)

                      if (nextMode === 'append') {
                        setInsertAfterSrNo('')
                      }
                    }}
                  >
                    <MenuItem value="append">Append at end</MenuItem>
                    <MenuItem value="insert-after">Insert after existing Sr No</MenuItem>
                  </Select>
                </FormControl>

                <FormControl required={createPlacementMode === 'insert-after' && editingId === null} disabled={editingId !== null || createPlacementMode !== 'insert-after'}>
                  <InputLabel id="prathamik-insert-after-label">Insert After Sr No</InputLabel>
                  <Select
                    labelId="prathamik-insert-after-label"
                    label="Insert After Sr No"
                    value={insertAfterSrNo}
                    onChange={(event) => {
                      const nextValue = event.target.value as number | string
                      setInsertAfterSrNo(nextValue === '' ? '' : Number(nextValue))
                    }}
                  >
                    <MenuItem value="">Select Sr No</MenuItem>
                    {rows.map((row) => (
                      <MenuItem key={row.srNo} value={row.srNo}>
                        {row.srNo} - {row.name?.trim() || 'Unnamed'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </Box>

              {editingId === null && createPlacementMode === 'insert-after' ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  The new record will be inserted immediately after Sr No {insertAfterSrNo === '' ? '-' : insertAfterSrNo}.
                </Alert>
              ) : null}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained">{editingId === null ? 'Create' : 'Update'}</Button>
                <Button type="button" variant="outlined" onClick={() => resetForm()}>Reset</Button>
              </Stack>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

            <PrathamikRowsTable
              isLoading={isLoading}
              rows={rows}
              onEdit={onEdit}
              onStartInsertAfter={onStartInsertAfter}
              onDelete={onDelete}
            />
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

type SupervisorBatchInsertPanelProps = {
  defaultSessionNo?: number
  onExit: () => void
}

const SupervisorBatchInsertPanel = ({ defaultSessionNo, onExit }: SupervisorBatchInsertPanelProps) => {
  const [formState, setFormState] = useState<SupervisorBatchInsertFormState>(createEmptySupervisorBatchInsertForm)
  const [centers, setCenters] = useState<Center[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedCenterNameMarathi, setSelectedCenterNameMarathi] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const regionNoByDistrictName = useMemo(() => {
    return new Map(
      districts
        .filter((district) => district.districtName.trim().length > 0)
        .map((district) => [district.districtName.trim(), district.regionNo ?? null]),
    )
  }, [districts])

  useEffect(() => {
    let isMounted = true

    const loadOptions = async () => {
      setIsLoadingOptions(true)

      try {
        const [centersPayload, districtsPayload, regionsPayload] = await Promise.all([
          CentersService.getApiCenters(),
          DistrictsService.getApiDistricts(),
          RegionsService.getApiRegions(),
        ])

        if (!isMounted) {
          return
        }

        setCenters(
          toCenterList(centersPayload).slice().sort((left, right) => left.centreNo.localeCompare(right.centreNo)),
        )
        setDistricts(toDistrictList(districtsPayload))
        setRegions(
          toRegionList(regionsPayload).slice().sort((left, right) => left.regionNo - right.regionNo),
        )
      } catch {
        if (isMounted) {
          setError('Unable to load center and region options.')
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedCenter = useMemo(
    () => centers.find((center) => center.centreNo === formState.centreCode) ?? null,
    [centers, formState.centreCode],
  )

  const centerCodeOptions = useMemo(() => centers.map((center) => center.centreNo), [centers])

  const autoSelectedRegionNo = useMemo(() => {
    const districtName = selectedCenter?.districtName?.trim() ?? ''

    if (!districtName) {
      return '' as const
    }

    return regionNoByDistrictName.get(districtName) ?? ''
  }, [regionNoByDistrictName, selectedCenter])

  useEffect(() => {
    let isMounted = true

    const updateMarathiCenterName = async () => {
      const sourceName = selectedCenter?.centreName?.trim() || selectedCenter?.city?.trim() || ''

      if (!sourceName) {
        setSelectedCenterNameMarathi('')
        return
      }

      const byGoogle = await fetchGoogleMarathiTransliteration(sourceName)
      const translated = byGoogle ?? transliterateEnglishToDevanagari(sourceName)

      if (isMounted) {
        setSelectedCenterNameMarathi(translated)
      }
    }

    void updateMarathiCenterName()

    return () => {
      isMounted = false
    }
  }, [selectedCenter])

  const resetMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const onChangeCentreCode = (value: string) => {
    const centreCode = value.trim()
    const nextCenter = centers.find((center) => center.centreNo === centreCode) ?? null
    const districtName = nextCenter?.districtName?.trim() ?? ''
    const nextRegionNo = districtName ? (regionNoByDistrictName.get(districtName) ?? '') : ''

    resetMessages()
    setFormState((current) => ({
      ...current,
      centreCode,
      regionNo: nextRegionNo,
    }))
  }

  const onSubmit = async () => {
    resetMessages()

    if (typeof defaultSessionNo !== 'number') {
      setError('Select a default session before inserting placeholder records.')
      return
    }

    if (formState.exam === '') {
      setError('Select an exam.')
      return
    }

    if (!formState.centreCode) {
      setError('Select a centre code.')
      return
    }

    if (formState.regionNo === '') {
      setError('Select a region.')
      return
    }

    if (formState.startRollNo === '' || formState.endRollNo === '') {
      setError('Enter both start and end roll numbers.')
      return
    }

    if (Number(formState.startRollNo) > Number(formState.endRollNo)) {
      setError('Start roll number must be less than or equal to end roll number.')
      return
    }

    const payload: BatchInsertRequest = {
      sessionNo: defaultSessionNo,
      centreCode: formState.centreCode,
      regionNo: Number(formState.regionNo),
      startRollNo: Number(formState.startRollNo),
      startName: formState.startName.trim() || '-',
      endRollNo: Number(formState.endRollNo),
      endName: formState.endName.trim() || '-',
    }

    setIsSaving(true)

    try {
      await submitSupervisorBatchInsert({
        exam: formState.exam,
        payload,
      })

      setSuccessMessage(`Inserted placeholder records for ${formState.exam} from roll no ${payload.startRollNo} to ${payload.endRollNo}.`)
      setFormState((current) => ({
        ...current,
        startRollNo: '',
        startName: '-',
        endRollNo: '',
        endName: '-',
      }))
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to insert placeholder records.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }} aria-label="Supervisor insert record panel">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" component="h2" fontWeight={700}>
            Insert Record With Name '-'
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create placeholder records through the supervisor menu using the generated batch-insert APIs.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <TextField
            label="Session"
            value={defaultSessionNo ?? ''}
            InputProps={{ readOnly: true }}
            helperText={typeof defaultSessionNo === 'number' ? 'Uses the current default session.' : 'No default session selected.'}
          />

          <FormControl fullWidth>
            <InputLabel id="supervisor-batch-exam-label">Exam</InputLabel>
            <Select
              labelId="supervisor-batch-exam-label"
              value={formState.exam}
              label="Exam"
              disabled={isSaving}
              onChange={(event) => {
                resetMessages()
                setFormState((current) => ({
                  ...current,
                  exam: event.target.value as SupervisorBatchInsertExam | '',
                }))
              }}
            >
              <MenuItem value="">Select Exam</MenuItem>
              {formEntryExamItems.map((exam) => (
                <MenuItem key={exam} value={exam}>
                  {exam}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            freeSolo
            options={centerCodeOptions}
            value={formState.centreCode}
            inputValue={formState.centreCode}
            disabled={isLoadingOptions || isSaving}
            onChange={(_, value) => {
              onChangeCentreCode(typeof value === 'string' ? value : '')
            }}
            onInputChange={(_, value, reason) => {
              if (reason === 'input' || reason === 'clear') {
                onChangeCentreCode(value)
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Centre Code"
                placeholder="Select or type centre code"
              />
            )}
          />

          <TextField
            label="Centre Name (Marathi)"
            value={selectedCenterNameMarathi}
            InputProps={{ readOnly: true }}
            placeholder="Auto-filled in Marathi from centre code"
          />

          <FormControl
            fullWidth
            disabled={isLoadingOptions || isSaving || (formState.centreCode !== '' && autoSelectedRegionNo !== '')}
          >
            <InputLabel id="supervisor-batch-region-label">Region</InputLabel>
            <Select
              labelId="supervisor-batch-region-label"
              value={formState.regionNo}
              label="Region"
              onChange={(event) => {
                const nextValue = String(event.target.value)
                resetMessages()
                setFormState((current) => ({
                  ...current,
                  regionNo: nextValue === '' ? '' : Number(nextValue),
                }))
              }}
            >
              <MenuItem value="">Select Region</MenuItem>
              {regions.map((region) => (
                <MenuItem key={region.regionNo} value={region.regionNo}>
                  {region.regionNo}{region.regionName?.trim() ? ` - ${region.regionName.trim()}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box />

          <TextField
            label="Start Roll No"
            type="number"
            value={formState.startRollNo}
            disabled={isSaving}
            onChange={(event) => {
              const nextValue = event.target.value
              resetMessages()
              setFormState((current) => ({
                ...current,
                startRollNo: nextValue === '' ? '' : Number(nextValue),
              }))
            }}
          />

          <TextField
            label="Start Name"
            value={formState.startName}
            disabled={isSaving}
            onChange={(event) => {
              resetMessages()
              setFormState((current) => ({
                ...current,
                startName: event.target.value,
              }))
            }}
            helperText="Defaults to '-'."
          />

          <TextField
            label="End Roll No"
            type="number"
            value={formState.endRollNo}
            disabled={isSaving}
            onChange={(event) => {
              const nextValue = event.target.value
              resetMessages()
              setFormState((current) => ({
                ...current,
                endRollNo: nextValue === '' ? '' : Number(nextValue),
              }))
            }}
          />

          <TextField
            label="End Name"
            value={formState.endName}
            disabled={isSaving}
            onChange={(event) => {
              resetMessages()
              setFormState((current) => ({
                ...current,
                endName: event.target.value,
              }))
            }}
            helperText="Defaults to '-'."
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button type="button" variant="contained" onClick={() => void onSubmit()} disabled={isSaving || isLoadingOptions}>
            Insert
          </Button>
          <Button type="button" variant="outlined" color="inherit" onClick={onExit} disabled={isSaving}>
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
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const isSupervisor = (localStorage.getItem('isSupervisor') ?? 'N') === 'Y'
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
        const current = await balbodhiniApi.getCurrentSession()
        if (current && isMounted) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenBalbodhini: current.resgenBalbodhini,
            resultDate: current.resultDate,
          } as Session)
          return
        }

        const directPayload = await SessionsService.getApiSessions()
        const directMatch = getDefaultSessionFromList(toSessionList(directPayload))

        if (directMatch) {
          if (isMounted) {
            setDefaultSession(directMatch)
            setCurrentSessionMeta(null)
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
          setCurrentSessionMeta(null)
        }
      } catch {
        if (isMounted) {
          setDefaultSession(null)
          setCurrentSessionMeta(null)
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

  const onExitSupervisorInsertRecord = () => {
    setActiveSubMenuByMain((current) => ({
      ...current,
      Supervisor: null,
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
                    <Box>
                      <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.78, display: 'block' }}>
                        Result Lock
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700 }}>
                        {(currentSessionMeta?.isLocked
                          ?? (defaultSession.resgenBalbodhini?.trim().toUpperCase() === 'Y'))
                          ? 'ON'
                          : 'OFF'}
                      </Typography>
                    </Box>
                  </Stack>
                ) : null}
              </Stack>
            </Stack>
          </Paper>

          {activeMainMenu === 'Master' && activeMasterPage ? (
            <MasterMenuPage pageKey={activeMasterPage} />
          ) : activeMainMenu === 'Supervisor' && selectedSubMenu === 'Insert record with name "-"' ? (
            isSupervisor ? (
              <SupervisorBatchInsertPanel
                defaultSessionNo={defaultSession?.sessionNo}
                onExit={onExitSupervisorInsertRecord}
              />
            ) : (
              <Card><CardContent><Alert severity="warning">Supervisor only.</Alert></CardContent></Card>
            )
          ) : activeMainMenu === 'Supervisor' && selectedSubMenu === 'Reset Result Generated Flag' ? (
            isSupervisor ? <BalbodhiniResetLockPage /> : (
              <Card><CardContent><Alert severity="warning">Supervisor only.</Alert></CardContent></Card>
            )
          ) : activeMainMenu === 'Utilities' && selectedSubMenu === 'Select Session' ? (
            <SelectSessionPanel
              currentDefaultSession={defaultSession}
              onDefaultSessionChanged={setDefaultSession}
              onExit={onExitSelectSession}
            />
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Form Entry' && activeFormEntryExam === 'Balbodhini' ? (
            <BalbodhiniFormEntryPage
              defaultSessionNo={defaultSession?.sessionNo}
              isLocked={currentSessionMeta?.isLocked
                ?? (defaultSession?.resgenBalbodhini?.trim().toUpperCase() === 'Y')}
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
                  {activeFormEntryExam} form entry page will be available soon. Balbodhini is implemented per BRD.
                </Typography>
              </CardContent>
            </Card>
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Marks Entry' && activeMarksEntryExam === 'Balbodhini' ? (
            <BalbodhiniMarksPage
              defaultSessionNo={defaultSession?.sessionNo}
              isLocked={currentSessionMeta?.isLocked
                ?? (defaultSession?.resgenBalbodhini?.trim().toUpperCase() === 'Y')}
            />
          ) : activeMainMenu === 'Supervisor' && selectedSubMenu === 'Update Marks' ? (
            isSupervisor ? (
              <MarksEntryPanel
                defaultSessionNo={defaultSession?.sessionNo}
                title="Update Marks"
                showExamSelector
              />
            ) : (
              <Card><CardContent><Alert severity="warning">Supervisor only.</Alert></CardContent></Card>
            )
          ) : activeMainMenu === 'Transaction' && selectedSubMenu === 'Marks Entry' ? (
            <MarksEntryPanel
              defaultSessionNo={defaultSession?.sessionNo}
              title={`Marks Entry - ${activeMarksEntryExam}`}
              fixedExam={activeMarksEntryExam}
            />
          ) : activeMainMenu === 'Processing' && selectedSubMenu === 'Generate Result - Balbodhini' ? (
            <BalbodhiniGenerateResultPage defaultSessionNo={defaultSession?.sessionNo} />
          ) : activeMainMenu === 'Processing' && selectedSubMenu === 'Set Roll Nos - Balbodhini' ? (
            <BalbodhiniRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="regular" />
          ) : activeMainMenu === 'Processing' && selectedSubMenu === 'Aur Forms - Set Roll Numbers - Balbodhini' ? (
            <BalbodhiniRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="aur" />
          ) : activeMainMenu === 'Processing' && selectedSubMenu === 'Clear Roll Numbers - Balbodhini' ? (
            <BalbodhiniRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="clear" />
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