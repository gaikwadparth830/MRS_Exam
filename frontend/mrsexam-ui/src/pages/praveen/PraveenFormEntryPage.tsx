import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
} from '@mui/material'

import {
  praveenApi,
  type Candidate,
  type CandidateWriteRequest,
  type CentreResolve,
} from '../../api/praveen/client'
import { CentersService, type Center } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { MarathiNameField, MarathiPhoneticToggle } from '../../components/MarathiNameField'
import { CandidateNameSearchDialog } from '../../components/CandidateNameSearchDialog'
import { PageFrame } from '../../layout/PageFrame'
import {
  containsDevanagari,
  marathiNameFieldSx,
  normalizeCentreCode,
  toAsciiDigits,
} from '../../utils/marathiTransliterate'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

const emptyForm = (sessionNo?: number): Candidate => ({
  rollNo: 0,
  regionNo: 0,
  name: '',
  sessionNo: sessionNo ?? null,
  formCentre: '',
  examCentre: '',
  userId: '',
})

const CURRENT_USER_ID_KEY = 'currentUserId'
const PHONETIC_ASSIST_KEY = 'PraveenPhoneticNameAssist'

const toCenterList = (payload: unknown): Center[] => {
  if (Array.isArray(payload)) return payload as Center[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Center[]
  }
  return []
}

const pick = <T,>(row: Record<string, unknown>, camel: string, pascal: string): T | undefined =>
  (row[camel] as T | undefined) ?? (row[pascal] as T | undefined)

const normalizeCandidate = (row: Candidate): Candidate => {
  const raw = row as unknown as Record<string, unknown>
  const rollRaw = pick<number>(raw, 'rollNo', 'RollNo')
  const regionRaw = pick<number>(raw, 'regionNo', 'RegionNo')
  const rollNo = typeof rollRaw === 'number' ? rollRaw : Number(rollRaw)
  const regionNo = typeof regionRaw === 'number' ? regionRaw : Number(regionRaw)
  return {
    ...row,
    rollNo: Number.isFinite(rollNo) ? rollNo : 0,
    regionNo: Number.isFinite(regionNo) ? regionNo : 0,
    name: pick<string | null>(raw, 'name', 'Name') ?? '',
    sessionNo: pick<number | null>(raw, 'sessionNo', 'SessionNo') ?? null,
    formCentre: pick<string | null>(raw, 'formCentre', 'FormCentre') ?? '',
    examCentre: pick<string | null>(raw, 'examCentre', 'ExamCentre') ?? '',
    userId: pick<string | null>(raw, 'userId', 'UserId') ?? '',
  }
}

const resolveCentreCode = async (code: string): Promise<CentreResolve> => {
  try {
    return await praveenApi.resolveCentre(code)
  } catch (first) {
    const ascii = toAsciiDigits(code)
    if (ascii !== code) {
      return await praveenApi.resolveCentre(ascii)
    }
    throw first
  }
}

const rowKey = (row: Candidate) => `${row.rollNo}-${row.regionNo}`

export const PraveenFormEntryPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [rows, setRows] = useState<Candidate[]>([])
  const [index, setIndex] = useState(0)
  const [form, setForm] = useState<Candidate>(() => emptyForm(defaultSessionNo))
  const [originalKey, setOriginalKey] = useState<{ rollNo: number; regionNo: number } | null>(null)
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view')
  const [centres, setCentres] = useState<Center[]>([])
  const [formCentreInfo, setFormCentreInfo] = useState<CentreResolve | null>(null)
  const [examCentreInfo, setExamCentreInfo] = useState<CentreResolve | null>(null)
  const [centreCount, setCentreCount] = useState(0)
  const [searchName, setSearchName] = useState('')
  const [nameSearchOpen, setNameSearchOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionNo, setSessionNo] = useState<number | undefined>(
    typeof defaultSessionNo === 'number' ? defaultSessionNo : undefined,
  )
  const [phoneticAssist, setPhoneticAssist] = useState<boolean>(() => {
    const stored = localStorage.getItem(PHONETIC_ASSIST_KEY)
    return stored == null ? true : stored === 'Y'
  })

  const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const readOnly = isLocked || mode === 'view'
  const activeSessionNo = typeof defaultSessionNo === 'number' ? defaultSessionNo : sessionNo

  const onPhoneticAssistChange = (enabled: boolean) => {
    setPhoneticAssist(enabled)
    localStorage.setItem(PHONETIC_ASSIST_KEY, enabled ? 'Y' : 'N')
  }

  const loadRows = async (forSession?: number) => {
    const targetSession = typeof forSession === 'number' ? forSession : activeSessionNo
    if (typeof targetSession !== 'number') {
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const list = (await praveenApi.listCandidates()).map(normalizeCandidate)
      setRows(list)
      if (list.length > 0) {
        setIndex(0)
        setForm(list[0])
        setOriginalKey({ rollNo: list[0].rollNo, regionNo: list[0].regionNo })
        setMode('view')
      } else {
        setForm(emptyForm(targetSession))
        setOriginalKey(null)
      }
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Unable to load Praveen candidates.'))
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (typeof defaultSessionNo === 'number') {
      setSessionNo(defaultSessionNo)
      return
    }
    let cancelled = false
    void praveenApi.getCurrentSession().then((current) => {
      if (cancelled) return
      const next = current?.sessionNo
      if (typeof next === 'number') setSessionNo(next)
    })
    return () => {
      cancelled = true
    }
  }, [defaultSessionNo])

  useEffect(() => {
    if (typeof activeSessionNo !== 'number') return
    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const list = (await praveenApi.listCandidates()).map(normalizeCandidate)
        if (cancelled) return
        setRows(list)
        if (list.length > 0) {
          setIndex(0)
          setForm(list[0])
          setOriginalKey({ rollNo: list[0].rollNo, regionNo: list[0].regionNo })
          setMode('view')
        } else {
          setForm(emptyForm(activeSessionNo))
          setOriginalKey(null)
        }
      } catch (err) {
        if (cancelled) return
        setError(praveenApi.messageFromError(err, 'Unable to load Praveen candidates.'))
        setRows([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [activeSessionNo])

  useEffect(() => {
    void CentersService.getApiCenters()
      .then((payload) => setCentres(toCenterList(payload)))
      .catch(() => setCentres([]))
  }, [])

  useEffect(() => {
    const centre = form.formCentre?.trim()
    if (!centre) {
      setCentreCount(0)
      return
    }
    void praveenApi.countForCentre(centre)
      .then(setCentreCount)
      .catch(() => setCentreCount(0))
  }, [form.formCentre, rows])

  const centreOptions = useMemo(
    () => centres.slice().sort((a, b) => a.centreNo.localeCompare(b.centreNo)),
    [centres],
  )

  const findCentre = (centreNo: string): Center | undefined => {
    const wanted = normalizeCentreCode(centreNo)
    if (!wanted) return undefined
    return centres.find((item) => normalizeCentreCode(item.centreNo) === wanted)
  }

  const centreDisplayFromList = (centreNo: string): CentreResolve | null => {
    const code = centreNo.trim()
    if (!code) return null
    const centre = findCentre(code)
    if (!centre) return null
    const name = centre.centreName?.trim() || ''
    const city = centre.city?.trim() || '-'
    return {
      centreNo: centre.centreNo,
      centreName: centre.centreName,
      city: centre.city,
      display: name ? `${name}, ${city}` : city,
      districtName: centre.districtName,
      regionNo: null,
      regionName: null,
      isClosed: (centre.closeFlag ?? '').trim().toUpperCase() === 'Y',
    }
  }

  const selectCentreValue = (stored: string | null | undefined): string => {
    const code = (stored ?? '').trim()
    if (!code) return ''
    return findCentre(code)?.centreNo ?? code
  }

  useEffect(() => {
    const formCode = form.formCentre?.trim() ?? ''
    setFormCentreInfo(formCode ? centreDisplayFromList(formCode) : null)
    if (!formCode) return
    void resolveCentreCode(formCode)
      .then((resolved) => {
        setFormCentreInfo(resolved)
        setForm((current) => (
          current.formCentre?.trim() === formCode
            ? {
                ...current,
                formCentre: resolved.centreNo,
                regionNo: resolved.regionNo ?? current.regionNo ?? 0,
              }
            : current
        ))
      })
      .catch(() => {
        // Keep local display if API resolve fails.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formCentre, centres])

  useEffect(() => {
    const examCode = form.examCentre?.trim() ?? ''
    setExamCentreInfo(examCode ? centreDisplayFromList(examCode) : null)
    if (!examCode) return
    void resolveCentreCode(examCode)
      .then((resolved) => {
        setExamCentreInfo(resolved)
        setForm((current) => (
          current.examCentre?.trim() === examCode
            ? { ...current, examCentre: resolved.centreNo }
            : current
        ))
      })
      .catch(() => {
        // Keep local display if API resolve fails.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.examCentre, centres])

  const showRow = (nextIndex: number) => {
    if (rows.length === 0) return
    const safe = Math.max(0, Math.min(rows.length - 1, nextIndex))
    setIndex(safe)
    setForm(rows[safe])
    setOriginalKey({ rollNo: rows[safe].rollNo, regionNo: rows[safe].regionNo })
    setMode('view')
    setError(null)
    setSuccess(null)
  }

  const onFormCentreChange = async (value: string) => {
    const code = value.trim()
    const local = code ? centreDisplayFromList(code) : null
    setFormCentreInfo(local)
    setForm((current) => ({
      ...current,
      formCentre: value,
      examCentre: mode === 'new' || mode === 'edit' ? value : current.examCentre,
    }))
    if (mode === 'new' || mode === 'edit') {
      setExamCentreInfo(local)
    }
    if (!code) return

    try {
      const resolved = await resolveCentreCode(code)
      setFormCentreInfo(resolved)
      setForm((current) => ({
        ...current,
        formCentre: resolved.centreNo,
        regionNo: resolved.regionNo ?? 0,
        examCentre: mode === 'new' || mode === 'edit' ? resolved.centreNo : current.examCentre,
      }))
      if (mode === 'new' || mode === 'edit') {
        setExamCentreInfo(resolved)
      }
    } catch (err) {
      if (!local) {
        setFormCentreInfo(null)
        setError(praveenApi.messageFromError(err, 'Invalid form centre.'))
      }
    }
  }

  const onExamCentreChange = async (value: string) => {
    const code = value.trim()
    const local = code ? centreDisplayFromList(code) : null
    setExamCentreInfo(local)
    setForm((current) => ({ ...current, examCentre: value }))
    if (!code) return

    try {
      const resolved = await resolveCentreCode(code)
      setExamCentreInfo(resolved)
      setForm((current) => ({ ...current, examCentre: resolved.centreNo }))
    } catch (err) {
      if (!local) {
        setExamCentreInfo(null)
        setError(praveenApi.messageFromError(err, 'Invalid exam centre.'))
      }
    }
  }

  const onNew = () => {
    if (isLocked) return
    setMode('new')
    setOriginalKey(null)
    setForm((current) => ({
      ...emptyForm(activeSessionNo),
      formCentre: current.formCentre ?? '',
      examCentre: current.formCentre ?? '',
      regionNo: current.regionNo ?? 0,
    }))
    setError(null)
    setSuccess(null)
  }

  const onEdit = () => {
    if (isLocked || !form.rollNo || !form.regionNo) return
    setMode('edit')
    setOriginalKey({ rollNo: form.rollNo, regionNo: form.regionNo })
    setError(null)
    setSuccess(null)
  }

  const onUndo = () => {
    if (rows[index]) {
      setForm(rows[index])
      setOriginalKey({ rollNo: rows[index].rollNo, regionNo: rows[index].regionNo })
      setMode('view')
    } else {
      setForm(emptyForm(activeSessionNo))
      setOriginalKey(null)
      setMode('view')
    }
    setError(null)
    setSuccess(null)
  }

  const buildPayload = (): CandidateWriteRequest => ({
    name: form.name?.trim() ?? '',
    rollNo: Number(form.rollNo),
    formCentre: form.formCentre?.trim() ?? '',
    examCentre: form.examCentre?.trim() ?? '',
    userId: currentUserId || undefined,
  })

  const onSave = async () => {
    setError(null)
    setSuccess(null)
    if (typeof activeSessionNo !== 'number') {
      setError('Session not selected.')
      return
    }

    const payload = buildPayload()
    if (!payload.name || !payload.formCentre || !payload.examCentre || !payload.rollNo) {
      setError('Name, roll no, form centre, and exam centre are required.')
      return
    }

    if (!containsDevanagari(payload.name)) {
      setError('Name should be in Marathi (Devanagari). Use Marathi keyboard or turn on phonetic assist and press Space after each English word.')
      return
    }

    try {
      if (mode === 'new') {
        const created = normalizeCandidate(await praveenApi.createCandidate(payload))
        setSuccess(`Created roll ${created.rollNo} in region ${created.regionNo}.`)
      } else if (mode === 'edit' && originalKey) {
        await praveenApi.updateCandidate(originalKey.rollNo, originalKey.regionNo, payload)
        setSuccess(`Updated roll ${payload.rollNo}.`)
      }
      await loadRows(activeSessionNo)
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Unable to save candidate.'))
    }
  }

  const onDelete = async () => {
    if (isLocked || !form.rollNo || !form.regionNo) return
    if (!window.confirm(`Delete roll ${form.rollNo} (region ${form.regionNo})?`)) return
    try {
      await praveenApi.deleteCandidate(form.rollNo, form.regionNo)
      setSuccess('Candidate deleted.')
      await loadRows()
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Unable to delete candidate.'))
    }
  }

  const onSearch = async () => {
    if (!searchName.trim()) return
    try {
      const matches = (await praveenApi.searchByName(searchName.trim())).map(normalizeCandidate)
      if (matches.length === 0) {
        setError('No matching name found.')
        return
      }
      setRows(matches)
      setIndex(0)
      setForm(matches[0])
      setOriginalKey({ rollNo: matches[0].rollNo, regionNo: matches[0].regionNo })
      setMode('view')
      setSuccess(`Found ${matches.length} name match(es).`)
      setError(null)
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Search failed.'))
    }
  }

  return (
    <PageFrame
      title="Form Entry"
      description="Add, update, search, and delete Praveen candidates for the default session. Roll number is required (no Sr No / gender)."
      actions={(
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Session ${activeSessionNo ?? '-'}`} color="primary" variant="outlined" />
          <Chip label={`Centre forms ${centreCount}`} variant="outlined" />
          {isLocked ? <Chip label="Result lock ON" color="warning" /> : null}
        </Stack>
      )}
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          {typeof activeSessionNo !== 'number' ? (
            <Alert severity="warning">Session not selected. Waiting for default session…</Alert>
          ) : null}

          <MarathiPhoneticToggle
            enabled={phoneticAssist}
            onChange={onPhoneticAssistChange}
          />

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              alignItems: 'start',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <TextField
              size="small"
              label="Roll No *"
              type="number"
              value={form.rollNo || ''}
              disabled={readOnly}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setForm((c) => ({ ...c, rollNo: Number(e.target.value) || 0 }))}
            />
            <TextField
              size="small"
              label="Session"
              value={form.sessionNo ?? activeSessionNo ?? ''}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' }, minWidth: 0 }}>
              <MarathiNameField
                value={form.name ?? ''}
                disabled={readOnly}
                phoneticAssist={phoneticAssist}
                showAssistControls={false}
                onChange={(name) => setForm((c) => ({ ...c, name }))}
                helperText={phoneticAssist ? 'Type English (e.g. hemalata), then Space to convert to Marathi.' : 'Enter Marathi with keyboard.'}
              />
            </Box>
            <TextField size="small" label="Region" value={form.regionNo || ''} InputProps={{ readOnly: true }} />
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' }, minWidth: 0 }}>
              <CentreSearchField
                label="Form Centre *"
                centres={centreOptions}
                value={selectCentreValue(form.formCentre)}
                disabled={readOnly}
                onChange={(centreNo) => void onFormCentreChange(centreNo)}
              />
            </Box>
            <TextField
              size="small"
              label="Form Centre Name"
              value={formCentreInfo?.display ?? ''}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              sx={marathiNameFieldSx}
            />
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' }, minWidth: 0 }}>
              <CentreSearchField
                label="Exam Centre *"
                centres={centreOptions}
                value={selectCentreValue(form.examCentre)}
                disabled={readOnly}
                onChange={(centreNo) => void onExamCentreChange(centreNo)}
              />
            </Box>
            <TextField
              size="small"
              label="Exam Centre Name"
              value={examCentreInfo?.display ?? ''}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              sx={marathiNameFieldSx}
            />
            <TextField
              size="small"
              label="Entered By"
              value={form.userId ?? currentUserId}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button disabled={isLocked} variant="contained" onClick={onNew}>New</Button>
            <Button disabled={isLocked || !form.rollNo || !form.regionNo} variant="outlined" onClick={onEdit}>Update</Button>
            <Button disabled={isLocked || mode === 'view'} variant="contained" color="success" onClick={() => void onSave()}>Save</Button>
            <Button disabled={mode === 'view'} variant="outlined" onClick={onUndo}>Undo</Button>
            <Button disabled={isLocked || !form.rollNo || !form.regionNo} color="error" variant="outlined" onClick={() => void onDelete()}>Delete</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(0)}>First</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(index - 1)}>Prev</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(index + 1)}>Next</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(rows.length - 1)}>Last</Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button size="small" variant="outlined" onClick={() => setNameSearchOpen(true)}>Search by name</Button>
            <Button size="small" variant="text" onClick={() => void loadRows(activeSessionNo)}>{isLoading ? 'Loading...' : 'Reload'}</Button>
          </Stack>

          <CandidateNameSearchDialog
            open={nameSearchOpen}
            onClose={() => setNameSearchOpen(false)}
            phoneticAssist={phoneticAssist}
            onPhoneticAssistChange={onPhoneticAssistChange}
            searchFn={async (q) => (await praveenApi.searchByName(q)).map(normalizeCandidate)}
            getRowKey={(row) => `${row.rollNo}-${row.regionNo}`}
            columns={[
              { id: 'name', label: 'Name', render: (r) => r.name || '-' },
              { id: 'rollNo', label: 'Roll', width: 80, render: (r) => r.rollNo ?? '-' },
              { id: 'region', label: 'Region', width: 80, render: (r) => r.regionNo ?? '-' },
              { id: 'centre', label: 'Form Centre', render: (r) => r.formCentre || '-' },
            ]}
            onSelect={(row) => {
              setRows([row])
              setIndex(0)
              setForm(row)
              setMode('view')
              setSearchName(row.name ?? '')
              setSuccess(`Selected: ${row.name ?? ''}`)
              setError(null)
            }}
          />

          {rows.length > 0 ? (
            <Chip size="small" variant="outlined" label={`Showing ${rowKey(form)} (${index + 1}/${rows.length})`} />
          ) : null}
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
