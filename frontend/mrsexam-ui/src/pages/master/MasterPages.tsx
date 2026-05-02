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
  Paper as MuiPaper,
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

import {
  CentersService,
  DistrictsService,
  ExamsService,
  PapersService,
  RegionsService,
  SessionsService,
  type Center,
  type District,
  type Exam,
  type Paper,
  type Region,
  type Session,
} from '../../api/generatedClient'
import { httpClient } from '../../api/httpClient'

type FieldType = 'text' | 'number'

type FieldConfig<T> = {
  key: keyof T & string
  label: string
  type: FieldType
  required?: boolean
}

type CrudConfig<T extends object> = {
  title: string
  description: string
  keyFields: Array<keyof T & string>
  fields: Array<FieldConfig<T>>
  createEmpty: () => T
  list: (query: PaginationQuery) => Promise<PageResult<T>>
  create: (payload: T) => Promise<void>
  update: (payload: T) => Promise<void>
  remove: (payload: T) => Promise<void>
}

type PaginationQuery = {
  pageNumber: number
  pageSize: number
}

type PageResult<T> = {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
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

const normalizePagedResponse = <T,>(payload: unknown, query: PaginationQuery): PageResult<T> => {
  if (Array.isArray(payload)) {
    const totalCount = payload.length
    const startIndex = (query.pageNumber - 1) * query.pageSize
    const endIndex = startIndex + query.pageSize

    return {
      // Some APIs return full list even on /paged route, so slice client-side.
      items: (payload as T[]).slice(startIndex, endIndex),
      totalCount,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
    }
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>
    const itemCandidates = [
      objectPayload.items,
      objectPayload.data,
      objectPayload.results,
      objectPayload.records,
    ]
    const items = (itemCandidates.find((candidate) => Array.isArray(candidate)) ?? []) as T[]

    const totalCandidates = [
      objectPayload.totalCount,
      objectPayload.totalItems,
      objectPayload.count,
      objectPayload.recordCount,
    ]
    const totalRaw = totalCandidates.find((candidate) => typeof candidate === 'number')
    const totalCount = typeof totalRaw === 'number' ? totalRaw : items.length

    const pageCandidates = [objectPayload.pageNumber, objectPayload.currentPage, objectPayload.page]
    const pageRaw = pageCandidates.find((candidate) => typeof candidate === 'number')

    const sizeCandidates = [objectPayload.pageSize, objectPayload.size, objectPayload.limit]
    const sizeRaw = sizeCandidates.find((candidate) => typeof candidate === 'number')

    const hasTotalFromApi = typeof totalRaw === 'number'
    if (!hasTotalFromApi && items.length > query.pageSize) {
      const startIndex = (query.pageNumber - 1) * query.pageSize
      const endIndex = startIndex + query.pageSize

      return {
        items: items.slice(startIndex, endIndex),
        totalCount: items.length,
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      }
    }

    return {
      items,
      totalCount,
      pageNumber: typeof pageRaw === 'number' ? pageRaw : query.pageNumber,
      pageSize: typeof sizeRaw === 'number' ? sizeRaw : query.pageSize,
    }
  }

  return {
    items: [],
    totalCount: 0,
    pageNumber: query.pageNumber,
    pageSize: query.pageSize,
  }
}

const fetchPagedList = async <T,>(path: string, query: PaginationQuery): Promise<PageResult<T>> => {
  const response = await httpClient.get(path, {
    params: {
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
    },
  })

  return normalizePagedResponse<T>(response.data, query)
}

const regionCrud: CrudConfig<Region> = {
  title: 'Region Master',
  description: 'Create, update, and remove regions.',
  keyFields: ['regionNo'],
  fields: [
    { key: 'regionNo', label: 'Region No', type: 'number', required: true },
    { key: 'regionName', label: 'Region Name', type: 'text' },
    { key: 'seatRegionNo', label: 'Seat Region No', type: 'number' },
    { key: 'regionNameEng', label: 'Region Name (Eng)', type: 'text' },
  ],
  createEmpty: () => ({ regionNo: 0, regionName: '', seatRegionNo: null, regionNameEng: '' }),
  list: async (query) => fetchPagedList<Region>('/api/Regions/paged', query),
  create: async (payload) => {
    await RegionsService.postApiRegions({ requestBody: payload })
  },
  update: async (payload) => {
    await RegionsService.putApiRegions({ id: Number(payload.regionNo), requestBody: payload })
  },
  remove: async (payload) => {
    await RegionsService.deleteApiRegions({ id: Number(payload.regionNo) })
  },
}

const districtCrud: CrudConfig<District> = {
  title: 'District Master',
  description: 'Create, update, and remove districts.',
  keyFields: ['districtName'],
  fields: [
    { key: 'districtName', label: 'District Name', type: 'text', required: true },
    { key: 'regionNo', label: 'Region No', type: 'number' },
    { key: 'districtCity', label: 'District City', type: 'text' },
    { key: 'shortName', label: 'Short Name', type: 'text' },
    { key: 'seatDistrictNo', label: 'Seat District No', type: 'number' },
  ],
  createEmpty: () => ({ districtName: '', regionNo: null, districtCity: '', shortName: '', seatDistrictNo: null }),
  list: async (query) => fetchPagedList<District>('/api/Districts/paged', query),
  create: async (payload) => {
    await DistrictsService.postApiDistricts({ requestBody: payload })
  },
  update: async (payload) => {
    await DistrictsService.putApiDistricts({ id: payload.districtName, requestBody: payload })
  },
  remove: async (payload) => {
    await DistrictsService.deleteApiDistricts({ id: payload.districtName })
  },
}

const centerCrud: CrudConfig<Center> = {
  title: 'Center Master',
  description: 'Create, update, and remove centers.',
  keyFields: ['centreNo'],
  fields: [
    { key: 'centreNo', label: 'Center No', type: 'text', required: true },
    { key: 'addressTo', label: 'Address To', type: 'text' },
    { key: 'centreName', label: 'Center Name', type: 'text' },
    { key: 'districtName', label: 'District Name', type: 'text' },
    { key: 'add1', label: 'Add1', type: 'text' },
    { key: 'add2', label: 'Add2', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'panditFlag', label: 'Pandit Flag', type: 'text' },
    { key: 'closeFlag', label: 'Close Flag', type: 'text' },
  ],
  createEmpty: () => ({
    centreNo: '',
    addressTo: '',
    centreName: '',
    districtName: '',
    add1: '',
    add2: '',
    city: '',
    pincode: '',
    phone: '',
    panditFlag: '',
    closeFlag: '',
  }),
  list: async (query) => fetchPagedList<Center>('/api/Centers/paged', query),
  create: async (payload) => {
    await CentersService.postApiCenters({ requestBody: payload })
  },
  update: async (payload) => {
    await CentersService.putApiCenters({ id: payload.centreNo, requestBody: payload })
  },
  remove: async (payload) => {
    await CentersService.deleteApiCenters({ id: payload.centreNo })
  },
}

const examCrud: CrudConfig<Exam> = {
  title: 'Exam Master',
  description: 'Create, update, and remove exams.',
  keyFields: ['examNo'],
  fields: [
    { key: 'examNo', label: 'Exam No', type: 'number', required: true },
    { key: 'examName', label: 'Exam Name', type: 'text' },
    { key: 'sessionNo', label: 'Session No', type: 'number' },
    { key: 'noOfPapers', label: 'No. Of Papers', type: 'number' },
    { key: 'fees', label: 'Fees', type: 'number' },
  ],
  createEmpty: () => ({ examNo: 0, examName: '', sessionNo: null, noOfPapers: null, fees: null }),
  list: async (query) => {
    try {
      return await fetchPagedList<Exam>('/api/Exams/paged', query)
    } catch {
      const fallback = await ExamsService.getApiExams()
      return normalizePagedResponse<Exam>(fallback, query)
    }
  },
  create: async (payload) => {
    await ExamsService.postApiExams({ requestBody: payload })
  },
  update: async (payload) => {
    await ExamsService.putApiExams({ id: payload.examNo, requestBody: payload })
  },
  remove: async (payload) => {
    await ExamsService.deleteApiExams({ id: payload.examNo })
  },
}

const paperCrud: CrudConfig<Paper> = {
  title: 'Paper Master',
  description: 'Create, update, and remove papers.',
  keyFields: ['paperNo', 'examNo'],
  fields: [
    { key: 'paperNo', label: 'Paper No', type: 'number', required: true },
    { key: 'examNo', label: 'Exam Name', type: 'number', required: true },
    { key: 'paperName', label: 'Paper Name', type: 'text' },
    { key: 'passingMarks', label: 'Passing Marks', type: 'number' },
    { key: 'exemptionMarks', label: 'Exemption Marks', type: 'number' },
    { key: 'minMarks', label: 'Min Marks', type: 'number' },
  ],
  createEmpty: () => ({
    paperNo: 0,
    examNo: 0,
    paperName: '',
    passingMarks: null,
    exemptionMarks: null,
    minMarks: null,
  }),
  list: async (query) => fetchPagedList<Paper>('/api/Papers/paged', query),
  create: async (payload) => {
    await PapersService.postApiPapers({ requestBody: payload })
  },
  update: async (payload) => {
    await PapersService.putApiPapers({ paperNo: payload.paperNo, examNo: payload.examNo, requestBody: payload })
  },
  remove: async (payload) => {
    await PapersService.deleteApiPapers({ paperNo: payload.paperNo, examNo: payload.examNo })
  },
}

const sessionCrud: CrudConfig<Session> = {
  title: 'Session Master',
  description: 'Create, update, and remove sessions.',
  keyFields: ['sessionNo'],
  fields: [
    { key: 'sessionNo', label: 'Session No', type: 'number', required: true },
    { key: 'month', label: 'Month', type: 'text' },
    { key: 'resultDate', label: 'Result Date', type: 'text' },
    { key: 'closeFlag', label: 'Close Flag', type: 'text' },
  ],
  createEmpty: () => ({ sessionNo: 0, month: '', resultDate: '', closeFlag: '' }),
  list: async (query) => fetchPagedList<Session>('/api/Sessions/paged', query),
  create: async (payload) => {
    await SessionsService.postApiSessions({ requestBody: payload })
  },
  update: async (payload) => {
    await SessionsService.putApiSessions({ id: payload.sessionNo, requestBody: payload })
  },
  remove: async (payload) => {
    await SessionsService.deleteApiSessions({ id: payload.sessionNo })
  },
}

const masterCrudConfig = {
  'Region Master': regionCrud,
  'District Master': districtCrud,
  'Center Master': centerCrud,
  'Exam Master': examCrud,
  'Paper Master': paperCrud,
  'Session Master': sessionCrud,
} as const

export type MasterPageKey = keyof typeof masterCrudConfig

type MasterMenuPageProps = {
  pageKey: MasterPageKey
}

const toKeyString = <T extends object>(row: T, keys: Array<keyof T & string>) =>
  keys.map((key) => String((row as Record<string, unknown>)[key] ?? '')).join('::')

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  return String(value)
}

const isNonEmptyRow = (row: object, fields: Array<{ key: string }>): boolean => {
  const record = row as Record<string, unknown>

  return fields.some(({ key }) => {
    const value = record[key]

    if (value === null || value === undefined) {
      return false
    }

    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    return true
  })
}

export const MasterMenuPage = ({ pageKey }: MasterMenuPageProps) => {
  const config = useMemo(() => masterCrudConfig[pageKey], [pageKey])
  const transliterationRequestId = useRef(0)
  const listRequestId = useRef(0)
  const previousConfigTitle = useRef(config.title)

  const [rows, setRows] = useState<object[]>([])
  const [form, setForm] = useState<object>(config.createEmpty())
  const [regionOptions, setRegionOptions] = useState<Region[]>([])
  const [districtNameOptions, setDistrictNameOptions] = useState<string[]>([])
  const [centerNoOptions, setCenterNoOptions] = useState<string[]>([])
  const [examOptions, setExamOptions] = useState<Exam[]>([])
  const [centerSearchValue, setCenterSearchValue] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const defaultPageNumber = 1
  const defaultPageSize = 10
  const examNameByNo = useMemo(
    () => new Map(examOptions.map((exam) => [exam.examNo, exam.examName?.trim() || String(exam.examNo)])),
    [examOptions],
  )

  const loadRows = async (query: PaginationQuery = { pageNumber, pageSize }) => {
    const requestId = ++listRequestId.current

    setLoading(true)
    setError(null)

    try {
      const result = await config.list(query)
      if (requestId !== listRequestId.current) {
        return
      }

      const filteredRows = (result.items as object[]).filter((row) => isNonEmptyRow(row, config.fields))
      setRows(filteredRows)
      setTotalCount(result.totalCount)
      setPageNumber(result.pageNumber)
      setPageSize(result.pageSize)
    } catch (requestError) {
      if (requestId !== listRequestId.current) {
        return
      }

      setError(requestError instanceof Error ? requestError.message : 'Failed to load records.')
    } finally {
      if (requestId === listRequestId.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (config.title !== 'District Master') {
      setRegionOptions([])
      return
    }

    let isMounted = true

    const loadRegionOptions = async () => {
      try {
        const payload = await RegionsService.getApiRegions()
        const normalized = normalizePagedResponse<Region>(payload, { pageNumber: 1, pageSize: 500 })

        if (isMounted) {
          setRegionOptions(normalized.items)
        }
      } catch {
        if (isMounted) {
          setRegionOptions([])
        }
      }
    }

    void loadRegionOptions()

    return () => {
      isMounted = false
    }
  }, [config.title])

  useEffect(() => {
    if (config.title !== 'Center Master') {
      setDistrictNameOptions([])
      setCenterNoOptions([])
      setCenterSearchValue('')
      return
    }

    let isMounted = true

    const loadDistrictNameOptions = async () => {
      try {
        const payload = await DistrictsService.getApiDistricts()
        const normalized = normalizePagedResponse<District>(payload, { pageNumber: 1, pageSize: 1000 })

        const districtNames = Array.from(
          new Set(
            normalized.items
              .map((district) => district.districtName?.trim() ?? '')
              .filter((name): name is string => name.length > 0),
          ),
        )

        if (isMounted) {
          setDistrictNameOptions(districtNames)
        }
      } catch {
        if (isMounted) {
          setDistrictNameOptions([])
        }
      }
    }

    const loadCenterNoOptions = async () => {
      try {
        const payload = await CentersService.getApiCenters()
        const normalized = normalizePagedResponse<Center>(payload, { pageNumber: 1, pageSize: 2000 })
        const centerNos = Array.from(
          new Set(
            normalized.items
              .map((center) => center.centreNo?.trim() ?? '')
              .filter((centerNo): centerNo is string => centerNo.length > 0),
          ),
        )

        if (isMounted) {
          setCenterNoOptions(centerNos)
        }
      } catch {
        if (isMounted) {
          setCenterNoOptions([])
        }
      }
    }

    void loadDistrictNameOptions()
    void loadCenterNoOptions()

    return () => {
      isMounted = false
    }
  }, [config.title])

  useEffect(() => {
    if (config.title !== 'Paper Master') {
      setExamOptions([])
      return
    }

    let isMounted = true

    const loadExamOptions = async () => {
      try {
        const payload = await ExamsService.getApiExams()
        const normalized = normalizePagedResponse<Exam>(payload, { pageNumber: 1, pageSize: 1000 })

        if (isMounted) {
          setExamOptions(normalized.items)
        }
      } catch {
        if (isMounted) {
          setExamOptions([])
        }
      }
    }

    void loadExamOptions()

    return () => {
      isMounted = false
    }
  }, [config.title])

  useEffect(() => {
    const didConfigChange = previousConfigTitle.current !== config.title
    if (didConfigChange) {
      previousConfigTitle.current = config.title
      setRows([])
      setForm(config.createEmpty())
      setEditingKey(null)
      setTotalCount(0)
      setSuccess(null)
      setError(null)

      if (pageNumber !== defaultPageNumber || pageSize !== defaultPageSize) {
        setPageNumber(defaultPageNumber)
        setPageSize(defaultPageSize)
        return
      }
    }

    void loadRows({ pageNumber, pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, pageNumber, pageSize])

  const transliterateRegionName = async (englishName: string) => {
    const trimmedEnglishName = englishName.trim()
    const requestId = ++transliterationRequestId.current

    if (!trimmedEnglishName) {
      setForm((current) => ({
        ...current,
        regionName: '',
      }))
      return
    }

    const byGoogle = await fetchGoogleMarathiTransliteration(trimmedEnglishName)
    const translated = byGoogle ?? transliterateEnglishToDevanagari(trimmedEnglishName)

    if (requestId !== transliterationRequestId.current) {
      return
    }

    setForm((current) => {
      const currentEnglishName = String((current as Record<string, unknown>).regionNameEng ?? '').trim()
      if (currentEnglishName !== trimmedEnglishName) {
        return current
      }

      return {
        ...current,
        regionName: translated,
      }
    })
  }

  const transliterateFormField = async (
    fieldKey: string,
    rawValue: string,
    appendSpace: boolean,
  ) => {
    const requestId = ++transliterationRequestId.current
    const normalizedValue = rawValue.trim()

    if (!normalizedValue) {
      return
    }

    const byGoogle = await fetchGoogleMarathiTransliteration(normalizedValue)
    const translated = byGoogle ?? transliterateEnglishToDevanagari(normalizedValue)

    if (requestId !== transliterationRequestId.current) {
      return
    }

    setForm((current) => {
      const currentFieldValue = String((current as Record<string, unknown>)[fieldKey] ?? '')
      if (currentFieldValue !== rawValue) {
        return current
      }

      return {
        ...current,
        [fieldKey]: appendSpace ? `${translated} ` : translated,
      }
    })
  }

  const onFieldKeyDown = (key: string, event: React.KeyboardEvent<HTMLElement>) => {
    const isDistrictMaster = config.title === 'District Master'
    const isCenterMaster = config.title === 'Center Master'
    const isExamMaster = config.title === 'Exam Master'
    const isPaperMaster = config.title === 'Paper Master'
    const isSessionMaster = config.title === 'Session Master'
    const isDistrictNameField = key === 'districtName'
    const isShortNameField = key === 'shortName'
    const isExamNameField = key === 'examName'
    const isPaperNameField = key === 'paperName'
    const isSessionMonthField = key === 'month'

    const centerTransliterationFields = new Set([
      'centreNo',
      'addressTo',
      'centreName',
      'add1',
      'add2',
      'city',
    ])

    const isCenterTransliterationField = centerTransliterationFields.has(key)

    if (!isDistrictMaster && !isCenterMaster && !isExamMaster && !isPaperMaster && !isSessionMaster) {
      return
    }

    if (isDistrictMaster && !isDistrictNameField && !isShortNameField) {
      return
    }

    if (isCenterMaster && !isCenterTransliterationField) {
      return
    }

    if (isExamMaster && !isExamNameField) {
      return
    }

    if (isPaperMaster && !isPaperNameField) {
      return
    }

    if (isSessionMaster && !isSessionMonthField) {
      return
    }

    const shouldTransliterate = isDistrictMaster
      ? event.key === 'Enter' || event.key === ' '
      : event.key === 'Enter' || event.key === ' '

    if (!shouldTransliterate) {
      return
    }

    event.preventDefault()
    const inputTarget = event.target as HTMLInputElement | null
    const rawValue = inputTarget?.value ?? ''
    const appendSpace = event.key === ' '

    const targetField = isDistrictMaster
      ? (isShortNameField ? 'shortName' : 'districtName')
      : key

    void transliterateFormField(targetField, rawValue, appendSpace)
  }

  const onChange = (key: string, type: FieldType, rawValue: string) => {
    const value = type === 'number' ? (rawValue === '' ? null : Number(rawValue)) : rawValue

    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      } as Record<string, unknown>

      if (config.title === 'Region Master' && key === 'regionNameEng') {
        void transliterateRegionName(rawValue)
      }

      return next
    })
  }

  const resetForm = () => {
    setForm(config.createEmpty())
    setEditingKey(null)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    for (const field of config.fields) {
      if (!field.required) {
        continue
      }

      const value = (form as Record<string, unknown>)[field.key]
      const isEmptyPaperExamSelection = config.title === 'Paper Master' && field.key === 'examNo' && Number(value) <= 0

      if (value === null || value === undefined || value === '' || isEmptyPaperExamSelection) {
        setError(`${field.label} is required.`)
        return
      }
    }

    setLoading(true)
    try {
      if (editingKey) {
        await config.update(form as never)
        setSuccess(`${config.title} record updated.`)
      } else {
        await config.create(form as never)
        setSuccess(`${config.title} record created.`)
      }

      resetForm()
      await loadRows({ pageNumber, pageSize })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Save operation failed.')
    } finally {
      setLoading(false)
    }
  }

  const onEdit = (row: object) => {
    setForm(row)
    setEditingKey(toKeyString(row, config.keyFields as never))
    setError(null)
    setSuccess(null)
  }

  const onDelete = async (row: object) => {
    setError(null)
    setSuccess(null)

    const confirmDelete = window.confirm('Do you want to delete this record?')
    if (!confirmDelete) {
      return
    }

    setLoading(true)
    try {
      await config.remove(row as never)
      setSuccess(`${config.title} record deleted.`)

      if (editingKey === toKeyString(row, config.keyFields as never)) {
        resetForm()
      }

      await loadRows({ pageNumber, pageSize })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Delete operation failed.')
    } finally {
      setLoading(false)
    }
  }

  const searchCenterByNo = async (rawCenterNo: string) => {
    const centerNo = rawCenterNo.trim()

    if (!centerNo) {
      await loadRows({ pageNumber, pageSize })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = await CentersService.getApiCenters1({ id: centerNo })
      let foundItems: Center[] = []

      if (Array.isArray(payload)) {
        foundItems = payload as Center[]
      } else if (payload && typeof payload === 'object') {
        const objectPayload = payload as Record<string, unknown>

        if (typeof objectPayload.centreNo === 'string') {
          foundItems = [payload as Center]
        } else {
          foundItems = normalizePagedResponse<Center>(payload, { pageNumber: 1, pageSize: 10 }).items
        }
      }

      setRows(foundItems as object[])
      setTotalCount(foundItems.length)
      setPageNumber(1)
    } catch {
      setRows([])
      setTotalCount(0)
      setPageNumber(1)
      setError('No center found for the given Center No.')
    } finally {
      setLoading(false)
    }
  }

  const onCenterSearch = async () => {
    if (config.title !== 'Center Master') {
      return
    }

    await searchCenterByNo(centerSearchValue)
  }

  const onClearCenterSearch = async () => {
    setCenterSearchValue('')
    await loadRows({ pageNumber, pageSize })
  }

  return (
    <Box sx={{ maxWidth: 1200 }} aria-label={`${config.title} page`}>
      <Card elevation={1}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h2" fontWeight={700}>
                {config.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {config.description}
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                {config.fields.map((field) => {
                  const value = (form as Record<string, unknown>)[field.key]
                  const isKeyField = config.keyFields.includes(field.key as never)
                  const isDistrictRegionField = config.title === 'District Master' && field.key === 'regionNo'
                  const isCenterDistrictField = config.title === 'Center Master' && field.key === 'districtName'
                  const isPaperExamField = config.title === 'Paper Master' && field.key === 'examNo'
                  const isCenterFlagField =
                    config.title === 'Center Master'
                    && (field.key === 'panditFlag' || field.key === 'closeFlag')

                  return (
                    <Box key={field.key}>
                      {isDistrictRegionField ? (
                        <FormControl fullWidth>
                          <InputLabel id="district-region-no-label">Region No</InputLabel>
                          <Select
                            labelId="district-region-no-label"
                            label="Region No"
                            value={value === null || value === undefined ? '' : Number(value)}
                            onChange={(event) => onChange(field.key, 'number', String(event.target.value))}
                            disabled={Boolean(editingKey && isKeyField)}
                          >
                            <MenuItem value="">Select Region</MenuItem>
                            {regionOptions.map((region) => (
                              <MenuItem key={region.regionNo} value={region.regionNo}>
                                {`${region.regionNo} - ${region.regionName?.trim() || '-'}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : isCenterDistrictField ? (
                        <FormControl fullWidth>
                          <InputLabel id="center-district-name-label">District Name</InputLabel>
                          <Select
                            labelId="center-district-name-label"
                            label="District Name"
                            value={value === null || value === undefined ? '' : String(value)}
                            onChange={(event) => onChange(field.key, 'text', String(event.target.value))}
                            disabled={Boolean(editingKey && isKeyField)}
                          >
                            <MenuItem value="">Select District</MenuItem>
                            {districtNameOptions.map((districtName) => (
                              <MenuItem key={districtName} value={districtName}>
                                {districtName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : isCenterFlagField ? (
                        <FormControl fullWidth>
                          <InputLabel id={`center-flag-${field.key}-label`}>{field.label}</InputLabel>
                          <Select
                            labelId={`center-flag-${field.key}-label`}
                            label={field.label}
                            value={value === null || value === undefined ? '' : String(value)}
                            onChange={(event) => onChange(field.key, 'text', String(event.target.value))}
                            disabled={Boolean(editingKey && isKeyField)}
                          >
                            <MenuItem value="">Select Option</MenuItem>
                            <MenuItem value="Y">Yes</MenuItem>
                            <MenuItem value="N">No</MenuItem>
                          </Select>
                        </FormControl>
                      ) : isPaperExamField ? (
                        <FormControl fullWidth>
                          <InputLabel id="paper-exam-no-label">{field.label}</InputLabel>
                          <Select
                            labelId="paper-exam-no-label"
                            label={field.label}
                            value={typeof value === 'number' && value > 0 ? Number(value) : ''}
                            onChange={(event) => onChange(field.key, 'number', String(event.target.value))}
                            disabled={Boolean(editingKey && isKeyField)}
                          >
                            <MenuItem value="">Select Exam</MenuItem>
                            {examOptions.map((exam) => {
                              const examLabel = exam.examName?.trim() || String(exam.examNo)

                              return (
                                <MenuItem key={exam.examNo} value={exam.examNo}>
                                  {`${examLabel} (${exam.examNo})`}
                                </MenuItem>
                              )
                            })}
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          type={field.type === 'number' ? 'number' : 'text'}
                          label={field.label}
                          value={value === null || value === undefined ? '' : String(value)}
                          onChange={(event) => onChange(field.key, field.type, event.target.value)}
                          onKeyDown={
                            field.type === 'text'
                              ? (event) => onFieldKeyDown(field.key, event)
                              : undefined
                          }
                          disabled={Boolean(editingKey && isKeyField)}
                          fullWidth
                        />
                      )}
                    </Box>
                  )
                })}
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {editingKey ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outlined" onClick={resetForm} disabled={loading}>
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => void loadRows({ pageNumber, pageSize })}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>

            {config.title === 'Center Master' ? (
              <MuiPaper variant="outlined" sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                >
                  <TextField
                    label="Search by Center No"
                    value={centerSearchValue}
                    onChange={(event) => setCenterSearchValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        void onCenterSearch()
                      }
                    }}
                    sx={{ minWidth: { xs: '100%', md: 260 } }}
                  />

                  <FormControl sx={{ minWidth: { xs: '100%', md: 260 } }}>
                    <InputLabel id="center-search-no-label">Center No List</InputLabel>
                    <Select
                      labelId="center-search-no-label"
                      label="Center No List"
                      value={centerSearchValue}
                      onChange={(event) => {
                        const selected = String(event.target.value)
                        setCenterSearchValue(selected)
                        void searchCenterByNo(selected)
                      }}
                    >
                      <MenuItem value="">Select Center No</MenuItem>
                      {centerNoOptions.map((centerNo) => (
                        <MenuItem key={centerNo} value={centerNo}>
                          {centerNo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={1.5}>
                    <Button type="button" variant="contained" onClick={() => void onCenterSearch()} disabled={loading}>
                      Search
                    </Button>
                    <Button type="button" variant="outlined" onClick={() => void onClearCenterSearch()} disabled={loading}>
                      Clear
                    </Button>
                  </Stack>
                </Stack>
              </MuiPaper>
            ) : null}

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <MuiPaper variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {config.fields.map((field) => (
                        <TableCell key={field.key} sx={{ fontWeight: 700 }}>{field.label}</TableCell>
                      ))}
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.map((row) => {
                        const rowKey = toKeyString(row, config.keyFields as never)

                        return (
                          <TableRow key={rowKey} hover>
                            {config.fields.map((field) => {
                              const rawValue = (row as Record<string, unknown>)[field.key]
                              const isPaperExamField = config.title === 'Paper Master' && field.key === 'examNo'

                              if (isPaperExamField) {
                                const examNo = Number(rawValue)
                                const examName = examNameByNo.get(examNo)
                                const displayValue = examName ? `${examName} (${examNo})` : formatValue(rawValue)

                                return <TableCell key={field.key}>{displayValue}</TableCell>
                              }

                              return <TableCell key={field.key}>{formatValue(rawValue)}</TableCell>
                            })}
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                <Button type="button" size="small" onClick={() => onEdit(row)}>
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  size="small"
                                  color="error"
                                  onClick={() => void onDelete(row)}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={config.fields.length + 1}>
                          <Typography variant="body2" color="text.secondary">
                            No records found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </MuiPaper>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
              aria-label="Master list pagination"
            >
              <Typography variant="body2" color="text.secondary">
                Showing page {pageNumber} of {totalPages} ({totalCount} records)
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="page-size-select-label">Page Size</InputLabel>
                  <Select
                    labelId="page-size-select-label"
                    value={String(pageSize)}
                    label="Page Size"
                    onChange={(event) => {
                      setPageSize(Number(event.target.value))
                      setPageNumber(1)
                    }}
                    disabled={loading}
                  >
                    <MenuItem value="10">10</MenuItem>
                    <MenuItem value="25">25</MenuItem>
                    <MenuItem value="50">50</MenuItem>
                    <MenuItem value="100">100</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
                  disabled={loading || pageNumber <= 1}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
                  disabled={loading || pageNumber >= totalPages}
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
