import { useEffect, useMemo, useRef, useState } from 'react'

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
    { key: 'centreName', label: 'Center Name', type: 'text' },
    { key: 'districtName', label: 'District Name', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'pincode', label: 'Pincode', type: 'text' },
  ],
  createEmpty: () => ({ centreNo: '', centreName: '', districtName: '', city: '', pincode: '' }),
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
    { key: 'examNo', label: 'Exam No', type: 'number', required: true },
    { key: 'paperName', label: 'Paper Name', type: 'text' },
    { key: 'passingMarks', label: 'Passing Marks', type: 'number' },
    { key: 'minMarks', label: 'Min Marks', type: 'number' },
  ],
  createEmpty: () => ({ paperNo: 0, examNo: 0, paperName: '', passingMarks: null, minMarks: null }),
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
      if (value === null || value === undefined || value === '') {
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

  return (
    <section className="master-page" aria-label={`${config.title} page`}>
      <header className="master-page-head">
        <h2>{config.title}</h2>
        <p>{config.description}</p>
      </header>

      <form className="crud-form" onSubmit={onSubmit}>
        {config.fields.map((field) => {
          const value = (form as Record<string, unknown>)[field.key]
          const isKeyField = config.keyFields.includes(field.key as never)

          return (
            <label key={field.key} className="crud-field">
              <span>{field.label}</span>
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={value === null || value === undefined ? '' : String(value)}
                onChange={(event) => onChange(field.key, field.type, event.target.value)}
                disabled={Boolean(editingKey && isKeyField)}
              />
            </label>
          )
        })}

        <div className="crud-actions">
          <button type="submit" disabled={loading}>
            {editingKey ? 'Update' : 'Create'}
          </button>
          <button type="button" className="secondary" onClick={resetForm} disabled={loading}>
            Reset
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => void loadRows({ pageNumber, pageSize })}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </form>

      {error ? <p className="crud-message error">{error}</p> : null}
      {success ? <p className="crud-message success">{success}</p> : null}

      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              {config.fields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => {
                const rowKey = toKeyString(row, config.keyFields as never)

                return (
                  <tr key={rowKey}>
                    {config.fields.map((field) => (
                      <td key={field.key}>{formatValue((row as Record<string, unknown>)[field.key])}</td>
                    ))}
                    <td className="row-actions">
                      <button type="button" className="link-btn" onClick={() => onEdit(row)}>
                        Edit
                      </button>
                      <button type="button" className="link-btn danger" onClick={() => void onDelete(row)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={config.fields.length + 1}>No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar" aria-label="Master list pagination">
        <div className="pagination-meta">
          Showing page {pageNumber} of {totalPages} ({totalCount} records)
        </div>
        <div className="pagination-controls">
          <label>
            Page Size
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPageNumber(1)
              }}
              disabled={loading}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button
            type="button"
            className="secondary"
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            disabled={loading || pageNumber <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setPageNumber((current) => Math.min(totalPages, current + 1))}
            disabled={loading || pageNumber >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
