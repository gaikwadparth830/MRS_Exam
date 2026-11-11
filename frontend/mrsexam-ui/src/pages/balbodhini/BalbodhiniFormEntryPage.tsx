import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import {
  balbodhiniApi,
  type Candidate,
  type CandidateWriteRequest,
  type CentreResolve,
} from '../../api/balbodhini/client'
import { CentersService, type Center } from '../../api/generatedClient'
import { MarathiNameField, MarathiPhoneticToggle } from '../../components/MarathiNameField'
import { PageFrame } from '../../layout/PageFrame'
import { containsDevanagari, marathiNameFieldSx } from '../../utils/marathiTransliterate'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

const emptyForm = (sessionNo?: number): Candidate => ({
  srNo: 0,
  rollNo: null,
  regionNo: null,
  name: '',
  sessionNo: sessionNo ?? null,
  gender: '',
  formCentre: '',
  examCentre: '',
  userId: '',
})

const CURRENT_USER_ID_KEY = 'currentUserId'
const PHONETIC_ASSIST_KEY = 'balbodhiniPhoneticNameAssist'

const toCenterList = (payload: unknown): Center[] => {
  if (Array.isArray(payload)) return payload as Center[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Center[]
  }
  return []
}

export const BalbodhiniFormEntryPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [rows, setRows] = useState<Candidate[]>([])
  const [index, setIndex] = useState(0)
  const [form, setForm] = useState<Candidate>(() => emptyForm(defaultSessionNo))
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view')
  const [centres, setCentres] = useState<Center[]>([])
  const [formCentreInfo, setFormCentreInfo] = useState<CentreResolve | null>(null)
  const [examCentreInfo, setExamCentreInfo] = useState<CentreResolve | null>(null)
  const [centreCount, setCentreCount] = useState(0)
  const [searchName, setSearchName] = useState('')
  const [insertPreviousSrNo, setInsertPreviousSrNo] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneticAssist, setPhoneticAssist] = useState<boolean>(() => {
    const stored = localStorage.getItem(PHONETIC_ASSIST_KEY)
    return stored == null ? true : stored === 'Y'
  })

  const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const readOnly = isLocked || mode === 'view'

  const onPhoneticAssistChange = (enabled: boolean) => {
    setPhoneticAssist(enabled)
    localStorage.setItem(PHONETIC_ASSIST_KEY, enabled ? 'Y' : 'N')
  }

  const loadRows = async () => {
    if (typeof defaultSessionNo !== 'number') {
      setRows([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const list = await balbodhiniApi.listCandidates()
      setRows(list)
      if (list.length > 0) {
        setIndex(0)
        setForm(list[0])
        setMode('view')
      } else {
        setForm(emptyForm(defaultSessionNo))
      }
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Unable to load Balbodhini candidates.'))
      setRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [defaultSessionNo])

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
    void balbodhiniApi.countForCentre(centre)
      .then(setCentreCount)
      .catch(() => setCentreCount(0))
  }, [form.formCentre, rows])

  const centreOptions = useMemo(
    () => centres.slice().sort((a, b) => a.centreNo.localeCompare(b.centreNo)),
    [centres],
  )

  const showRow = (nextIndex: number) => {
    if (rows.length === 0) return
    const safe = Math.max(0, Math.min(rows.length - 1, nextIndex))
    setIndex(safe)
    setForm(rows[safe])
    setMode('view')
    setInsertPreviousSrNo('')
    setError(null)
    setSuccess(null)
  }

  const onFormCentreChange = async (value: string) => {
    setForm((current) => ({
      ...current,
      formCentre: value,
      examCentre: mode === 'new' || mode === 'edit' ? value : current.examCentre,
    }))
    if (!value.trim()) {
      setFormCentreInfo(null)
      return
    }
    try {
      const resolved = await balbodhiniApi.resolveCentre(value.trim())
      setFormCentreInfo(resolved)
      setForm((current) => ({
        ...current,
        formCentre: resolved.centreNo,
        regionNo: resolved.regionNo ?? null,
        examCentre: mode === 'new' || mode === 'edit' ? resolved.centreNo : current.examCentre,
      }))
      if (mode === 'new' || mode === 'edit') {
        setExamCentreInfo(resolved)
      }
    } catch (err) {
      setFormCentreInfo(null)
      setError(balbodhiniApi.messageFromError(err, 'Invalid form centre.'))
    }
  }

  const onExamCentreChange = async (value: string) => {
    setForm((current) => ({ ...current, examCentre: value }))
    if (!value.trim()) {
      setExamCentreInfo(null)
      return
    }
    try {
      const resolved = await balbodhiniApi.resolveCentre(value.trim())
      setExamCentreInfo(resolved)
      setForm((current) => ({ ...current, examCentre: resolved.centreNo }))
    } catch (err) {
      setExamCentreInfo(null)
      setError(balbodhiniApi.messageFromError(err, 'Invalid exam centre.'))
    }
  }

  const onNew = () => {
    if (isLocked) return
    setMode('new')
    setInsertPreviousSrNo('')
    setForm((current) => ({
      ...emptyForm(defaultSessionNo),
      formCentre: current.formCentre ?? '',
      examCentre: current.formCentre ?? '',
      regionNo: current.regionNo ?? null,
    }))
    setError(null)
    setSuccess(null)
  }

  const onEdit = () => {
    if (isLocked || !form.srNo) return
    setMode('edit')
    setInsertPreviousSrNo('')
    setError(null)
    setSuccess(null)
  }

  const onUndo = () => {
    if (rows[index]) {
      setForm(rows[index])
      setMode('view')
    } else {
      setForm(emptyForm(defaultSessionNo))
      setMode('view')
    }
    setInsertPreviousSrNo('')
    setError(null)
    setSuccess(null)
  }

  const buildPayload = (): CandidateWriteRequest => ({
    name: form.name?.trim() ?? '',
    gender: (form.gender ?? '').trim().toUpperCase(),
    formCentre: form.formCentre?.trim() ?? '',
    examCentre: form.examCentre?.trim() ?? '',
    userId: currentUserId || undefined,
  })

  const onSave = async () => {
    setError(null)
    setSuccess(null)
    if (typeof defaultSessionNo !== 'number') {
      setError('Session not selected.')
      return
    }

    const payload = buildPayload()
    if (!payload.name || !payload.formCentre || !payload.examCentre || !payload.gender) {
      setError('Name, gender, form centre, and exam centre are required.')
      return
    }

    if (!containsDevanagari(payload.name)) {
      setError('Name should be in Marathi (Devanagari). Use Marathi keyboard or turn on phonetic assist and press Space after each English word.')
      return
    }

    try {
      if (mode === 'new' && insertPreviousSrNo !== '') {
        const created = await balbodhiniApi.insertBetween(Number(insertPreviousSrNo), payload)
        setSuccess(`Inserted between records as Sr No ${created.srNo}.`)
      } else if (mode === 'new') {
        const created = await balbodhiniApi.createCandidate(payload)
        setSuccess(`Created Sr No ${created.srNo}.`)
      } else if (mode === 'edit' && form.srNo) {
        await balbodhiniApi.updateCandidate(form.srNo, payload)
        setSuccess(`Updated Sr No ${form.srNo}.`)
      }
      await loadRows()
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Unable to save candidate.'))
    }
  }

  const onDelete = async () => {
    if (isLocked || !form.srNo) return
    if (!window.confirm(`Delete Sr No ${form.srNo}?`)) return
    try {
      await balbodhiniApi.deleteCandidate(form.srNo)
      setSuccess('Candidate deleted.')
      await loadRows()
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Unable to delete candidate.'))
    }
  }

  const onSearch = async () => {
    if (!searchName.trim()) return
    try {
      const matches = await balbodhiniApi.searchByName(searchName.trim())
      if (matches.length === 0) {
        setError('No matching name found.')
        return
      }
      setRows(matches)
      setIndex(0)
      setForm(matches[0])
      setMode('view')
      setSuccess(`Found ${matches.length} name match(es).`)
      setError(null)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Search failed.'))
    }
  }

  return (
    <PageFrame
      title="Form Entry"
      description="Add, update, search, and delete Balbodhini candidates for the default session. Roll numbers are assigned later."
      actions={(
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Session ${defaultSessionNo ?? '-'}`} color="primary" variant="outlined" />
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

          <MarathiPhoneticToggle
            enabled={phoneticAssist}
            disabled={readOnly}
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
            <TextField size="small" label="Sr No" value={form.srNo || ''} InputProps={{ readOnly: true }} />
            <TextField size="small" label="Roll No" value={form.rollNo ?? ''} InputProps={{ readOnly: true }} />
            <TextField size="small" label="Session" value={form.sessionNo ?? defaultSessionNo ?? ''} InputProps={{ readOnly: true }} />
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' }, minWidth: 0 }}>
              <MarathiNameField
                value={form.name ?? ''}
                disabled={readOnly}
                phoneticAssist={phoneticAssist}
                showAssistControls={false}
                onChange={(name) => setForm((c) => ({ ...c, name }))}
                helperText=""
              />
            </Box>
            <FormControl size="small" disabled={readOnly} sx={{ justifyContent: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.25 }}>Gender *</Typography>
              <RadioGroup
                row
                value={(form.gender ?? '').toUpperCase()}
                onChange={(e) => setForm((c) => ({ ...c, gender: e.target.value }))}
              >
                <FormControlLabel value="M" control={<Radio size="small" />} label="Male" />
                <FormControlLabel value="F" control={<Radio size="small" />} label="Female" />
              </RadioGroup>
            </FormControl>
            <TextField size="small" label="Region" value={form.regionNo ?? ''} InputProps={{ readOnly: true }} />
            <FormControl size="small" disabled={readOnly} fullWidth>
              <InputLabel id="form-centre-label">Form Centre *</InputLabel>
              <Select
                labelId="form-centre-label"
                label="Form Centre *"
                value={form.formCentre ?? ''}
                onChange={(e) => void onFormCentreChange(String(e.target.value))}
              >
                {centreOptions.map((centre) => (
                  <MenuItem key={centre.centreNo} value={centre.centreNo}>{centre.centreNo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Form Centre Name" value={formCentreInfo?.display ?? ''} InputProps={{ readOnly: true }} />
            <FormControl size="small" disabled={readOnly} fullWidth>
              <InputLabel id="exam-centre-label">Exam Centre *</InputLabel>
              <Select
                labelId="exam-centre-label"
                label="Exam Centre *"
                value={form.examCentre ?? ''}
                onChange={(e) => void onExamCentreChange(String(e.target.value))}
              >
                {centreOptions.map((centre) => (
                  <MenuItem key={centre.centreNo} value={centre.centreNo}>{centre.centreNo}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField size="small" label="Exam Centre Name" value={examCentreInfo?.display ?? ''} InputProps={{ readOnly: true }} />
            <TextField size="small" label="Entered By" value={form.userId ?? currentUserId} InputProps={{ readOnly: true }} />
            <FormControl size="small" disabled={isLocked || mode !== 'new'} fullWidth>
              <InputLabel id="insert-between-label">Insert After Sr No</InputLabel>
              <Select
                labelId="insert-between-label"
                label="Insert After Sr No"
                value={insertPreviousSrNo}
                onChange={(e) => {
                  const next = e.target.value as number | ''
                  setInsertPreviousSrNo(next === '' ? '' : Number(next))
                }}
              >
                <MenuItem value="">Append (srno + 3)</MenuItem>
                {rows.map((row) => (
                  <MenuItem key={row.srNo} value={row.srNo}>{row.srNo} - {row.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button disabled={isLocked} variant="contained" onClick={onNew}>New</Button>
            <Button disabled={isLocked || !form.srNo} variant="outlined" onClick={onEdit}>Update</Button>
            <Button disabled={isLocked || mode === 'view'} variant="contained" color="success" onClick={() => void onSave()}>Save</Button>
            <Button disabled={mode === 'view'} variant="outlined" onClick={onUndo}>Undo</Button>
            <Button disabled={isLocked || !form.srNo} color="error" variant="outlined" onClick={() => void onDelete()}>Delete</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(0)}>First</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(index - 1)}>Prev</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(index + 1)}>Next</Button>
            <Button disabled={rows.length === 0} onClick={() => showRow(rows.length - 1)}>Last</Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              size="small"
              label="Search name (Marathi)"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              fullWidth
              sx={marathiNameFieldSx}
              inputProps={{ lang: 'mr', spellCheck: false }}
            />
            <Button size="small" variant="outlined" onClick={() => void onSearch()}>Search</Button>
            <Button size="small" variant="text" onClick={() => void loadRows()}>{isLoading ? 'Loading...' : 'Reload'}</Button>
          </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
