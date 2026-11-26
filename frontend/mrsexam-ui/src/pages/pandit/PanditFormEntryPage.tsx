import { useEffect, useMemo, useState } from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import {
  panditApi,
  type Candidate,
  type CandidateWriteRequest,
  type CentreResolve,
} from '../../api/pandit/client'
import { CentersService, type Center } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { CURRENT_USER_ID_KEY } from '../../auth/permissions'
import { useCentreScope } from '../../auth/useCentreScope'
import { MarathiNameField, MarathiPhoneticToggle } from '../../components/MarathiNameField'
import { CandidateNameSearchDialog } from '../../components/CandidateNameSearchDialog'
import { PageFrame } from '../../layout/PageFrame'
import {
  containsDevanagari,
  marathiNameFieldSx,
  toAsciiDigits,
} from '../../utils/marathiTransliterate'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

const PHONETIC_ASSIST_KEY = 'PanditPhoneticNameAssist'

const emptyForm = (sessionNo?: number): Candidate => ({
  rollNo: 0,
  sessionNo: sessionNo ?? null,
  name: '',
  formCentre: '',
  examCentre: '',
  undFlag: 'N',
  undClass: '',
  khandAppearing: 'I',
  flgPortion: 'N',
  concessionFlag: 'N',
  add1: '',
  add2: '',
  add3: '',
})

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
  const rollNo = typeof rollRaw === 'number' ? rollRaw : Number(rollRaw)
  return {
    ...row,
    rollNo: Number.isFinite(rollNo) ? rollNo : 0,
    name: pick<string | null>(raw, 'name', 'Name') ?? '',
    sessionNo: pick<number | null>(raw, 'sessionNo', 'SessionNo') ?? null,
    formCentre: pick<string | null>(raw, 'formCentre', 'FormCentre') ?? '',
    examCentre: pick<string | null>(raw, 'examCentre', 'ExamCentre') ?? '',
    undFlag: pick<string | null>(raw, 'undFlag', 'UndFlag') ?? 'N',
    undClass: pick<string | null>(raw, 'undClass', 'UndClass') ?? '',
    khandAppearing: pick<string | null>(raw, 'khandAppearing', 'KhandAppearing') ?? 'I',
    flgPortion: pick<string | null>(raw, 'flgPortion', 'FlgPortion') ?? 'N',
    concessionFlag: pick<string | null>(raw, 'concessionFlag', 'ConcessionFlag') ?? 'N',
    add1: pick<string | null>(raw, 'add1', 'Add1') ?? '',
    add2: pick<string | null>(raw, 'add2', 'Add2') ?? '',
    add3: pick<string | null>(raw, 'add3', 'Add3') ?? '',
    rollNo1: pick<number | null>(raw, 'rollNo1', 'RollNo1') ?? null,
    sessionNo1: pick<number | null>(raw, 'sessionNo1', 'SessionNo1') ?? null,
    marks1: pick<string | null>(raw, 'marks1', 'Marks1') ?? null,
    rollNo2: pick<number | null>(raw, 'rollNo2', 'RollNo2') ?? null,
    sessionNo2: pick<number | null>(raw, 'sessionNo2', 'SessionNo2') ?? null,
    marks2: pick<string | null>(raw, 'marks2', 'Marks2') ?? null,
    rollNo3: pick<number | null>(raw, 'rollNo3', 'RollNo3') ?? null,
    sessionNo3: pick<number | null>(raw, 'sessionNo3', 'SessionNo3') ?? null,
    marks3: pick<string | null>(raw, 'marks3', 'Marks3') ?? null,
    rollNo4: pick<number | null>(raw, 'rollNo4', 'RollNo4') ?? null,
    sessionNo4: pick<number | null>(raw, 'sessionNo4', 'SessionNo4') ?? null,
    marks4: pick<string | null>(raw, 'marks4', 'Marks4') ?? null,
    rollNo5: pick<number | null>(raw, 'rollNo5', 'RollNo5') ?? null,
    sessionNo5: pick<number | null>(raw, 'sessionNo5', 'SessionNo5') ?? null,
    marks5: pick<string | null>(raw, 'marks5', 'Marks5') ?? null,
    rollNo6: pick<number | null>(raw, 'rollNo6', 'RollNo6') ?? null,
    sessionNo6: pick<number | null>(raw, 'sessionNo6', 'SessionNo6') ?? null,
    marks6: pick<string | null>(raw, 'marks6', 'Marks6') ?? null,
    rollNo7: pick<number | null>(raw, 'rollNo7', 'RollNo7') ?? null,
    sessionNo7: pick<number | null>(raw, 'sessionNo7', 'SessionNo7') ?? null,
    marks7: pick<string | null>(raw, 'marks7', 'Marks7') ?? null,
    rollNo8: pick<number | null>(raw, 'rollNo8', 'RollNo8') ?? null,
    sessionNo8: pick<number | null>(raw, 'sessionNo8', 'SessionNo8') ?? null,
    marks8: pick<string | null>(raw, 'marks8', 'Marks8') ?? null,
    oralRollNo: pick<number | null>(raw, 'oralRollNo', 'OralRollNo') ?? null,
    oralSessionNo: pick<number | null>(raw, 'oralSessionNo', 'OralSessionNo') ?? null,
    oralMarks: pick<string | null>(raw, 'oralMarks', 'OralMarks') ?? null,
  }
}

const resolveCentreCode = async (code: string): Promise<CentreResolve> => {
  try {
    return await panditApi.resolveCentre(code)
  } catch (first) {
    const ascii = toAsciiDigits(code)
    if (ascii !== code) return await panditApi.resolveCentre(ascii)
    throw first
  }
}

const numOrUndef = (v: number | null | undefined): number | undefined =>
  v == null || Number(v) <= 0 ? undefined : Number(v)

type PaperSlotProps = {
  label: string
  roll?: number | null
  session?: number | null
  marks?: string | null
  readOnly: boolean
  onChange: (field: 'roll' | 'session' | 'marks', value: string) => void
}

const PaperSlot = ({ label, roll, session, marks, readOnly, onChange }: PaperSlotProps) => (
  <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' } }}>
    <Typography variant="body2" sx={{ gridColumn: '1 / -1', fontWeight: 600 }}>{label}</Typography>
    <TextField
      label="Roll"
      size="small"
      value={roll ?? ''}
      disabled={readOnly}
      onChange={(e) => onChange('roll', e.target.value)}
    />
    <TextField
      label="Session"
      size="small"
      value={session ?? ''}
      disabled={readOnly}
      onChange={(e) => onChange('session', e.target.value)}
    />
    <TextField
      label="Marks"
      size="small"
      value={marks ?? ''}
      disabled={readOnly}
      onChange={(e) => onChange('marks', e.target.value)}
      helperText="Prior session only; 0–100 or A"
    />
  </Box>
)

export const PanditFormEntryPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [rows, setRows] = useState<Candidate[]>([])
  const [index, setIndex] = useState(0)
  const [form, setForm] = useState<Candidate>(() => emptyForm(defaultSessionNo))
  const [originalRoll, setOriginalRoll] = useState<number | null>(null)
  const [mode, setMode] = useState<'view' | 'new' | 'edit'>('view')
  const [centres, setCentres] = useState<Center[]>([])
  // filtered below
  const [formCentreInfo, setFormCentreInfo] = useState<CentreResolve | null>(null)
  const [examCentreInfo, setExamCentreInfo] = useState<CentreResolve | null>(null)
  const [centreCount, setCentreCount] = useState(0)
  const [searchName, setSearchName] = useState('')
  const [nameSearchOpen, setNameSearchOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneticAssist, setPhoneticAssist] = useState(
    () => localStorage.getItem(PHONETIC_ASSIST_KEY) !== 'N',
  )
  const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const { centreLimited, defaultCentre, filterOptions } = useCentreScope()
  const centreOptions = useMemo(() => filterOptions(centres), [centres, filterOptions])
  const centreFieldLocked = centreLimited && centreOptions.length <= 1
  const activeSessionNo = defaultSessionNo
  const readOnly = isLocked || mode === 'view'

  const loadRows = async () => {
    setIsLoading(true)
    try {
      const list = (await panditApi.listCandidates()).map(normalizeCandidate)
      setRows(list)
      if (list.length > 0) {
        setIndex(0)
        setForm(list[0])
        setOriginalRoll(list[0].rollNo)
        setMode('view')
      } else {
        setForm(emptyForm(activeSessionNo))
        setOriginalRoll(null)
      }
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to load Pandit candidates.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void CentersService.getApiCenters()
      .then((payload) => setCentres(toCenterList(payload)))
      .catch(() => setCentres([]))
    void loadRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const centre = form.formCentre?.trim()
    if (!centre) {
      setCentreCount(0)
      return
    }
    void panditApi.countForCentre(centre).then((c) => setCentreCount(c)).catch(() => setCentreCount(0))
  }, [form.formCentre])

  const onPhoneticAssistChange = (enabled: boolean) => {
    setPhoneticAssist(enabled)
    localStorage.setItem(PHONETIC_ASSIST_KEY, enabled ? 'Y' : 'N')
  }

  const centreDisplayFromList = (code: string): CentreResolve | null => {
    const match = centres.find((c) => c.centreNo === code)
    if (!match) return null
    return {
      centreNo: match.centreNo ?? code,
      centreName: match.centreName,
      city: match.city,
      display: match.centreName ?? code,
      districtName: match.districtName,
      isClosed: match.closeFlag?.trim().toUpperCase() === 'Y',
    }
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
    if (mode === 'new' || mode === 'edit') setExamCentreInfo(local)
    if (!code) return
    try {
      const resolved = await resolveCentreCode(code)
      setFormCentreInfo(resolved)
      setForm((current) => ({
        ...current,
        formCentre: resolved.centreNo,
        examCentre: mode === 'new' || mode === 'edit' ? resolved.centreNo : current.examCentre,
      }))
      if (mode === 'new' || mode === 'edit') setExamCentreInfo(resolved)
    } catch (err) {
      if (!local) {
        setFormCentreInfo(null)
        setError(panditApi.messageFromError(err, 'Invalid form centre.'))
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
        setError(panditApi.messageFromError(err, 'Invalid exam centre.'))
      }
    }
  }

  const showRow = (nextIndex: number) => {
    if (rows.length === 0) return
    const safe = Math.max(0, Math.min(rows.length - 1, nextIndex))
    setIndex(safe)
    setForm(rows[safe])
    setOriginalRoll(rows[safe].rollNo)
    setMode('view')
    setError(null)
    setSuccess(null)
  }

  const setSlot = (
    paper: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'oral',
    field: 'roll' | 'session' | 'marks',
    value: string,
  ) => {
    setForm((current) => {
      const next = { ...current }
      if (paper === 'oral') {
        if (field === 'roll') next.oralRollNo = value === '' ? null : Number(value)
        if (field === 'session') next.oralSessionNo = value === '' ? null : Number(value)
        if (field === 'marks') next.oralMarks = value
        return next
      }
      const rollKey = `rollNo${paper}` as keyof Candidate
      const sessKey = `sessionNo${paper}` as keyof Candidate
      const marksKey = `marks${paper}` as keyof Candidate
      if (field === 'roll') (next as Record<string, unknown>)[rollKey] = value === '' ? null : Number(value)
      if (field === 'session') (next as Record<string, unknown>)[sessKey] = value === '' ? null : Number(value)
      if (field === 'marks') (next as Record<string, unknown>)[marksKey] = value
      return next
    })
  }

  const buildPayload = (): CandidateWriteRequest => ({
    rollNo: Number(form.rollNo),
    name: form.name?.trim() ?? '',
    formCentre: form.formCentre?.trim() ?? '',
    examCentre: form.examCentre?.trim() ?? '',
    undFlag: (form.undFlag ?? 'N').trim().toUpperCase(),
    undClass: form.undClass?.trim() || undefined,
    khandAppearing: (form.khandAppearing ?? 'I').trim().toUpperCase(),
    flgPortion: (form.flgPortion ?? 'N').trim().toUpperCase(),
    add1: form.add1?.trim() || undefined,
    add2: form.add2?.trim() || undefined,
    add3: form.add3?.trim() || undefined,
    rollNo1: numOrUndef(form.rollNo1),
    sessionNo1: numOrUndef(form.sessionNo1),
    marks1: form.marks1 || undefined,
    rollNo2: numOrUndef(form.rollNo2),
    sessionNo2: numOrUndef(form.sessionNo2),
    marks2: form.marks2 || undefined,
    rollNo3: numOrUndef(form.rollNo3),
    sessionNo3: numOrUndef(form.sessionNo3),
    marks3: form.marks3 || undefined,
    rollNo4: numOrUndef(form.rollNo4),
    sessionNo4: numOrUndef(form.sessionNo4),
    marks4: form.marks4 || undefined,
    rollNo5: numOrUndef(form.rollNo5),
    sessionNo5: numOrUndef(form.sessionNo5),
    marks5: form.marks5 || undefined,
    rollNo6: numOrUndef(form.rollNo6),
    sessionNo6: numOrUndef(form.sessionNo6),
    marks6: form.marks6 || undefined,
    rollNo7: numOrUndef(form.rollNo7),
    sessionNo7: numOrUndef(form.sessionNo7),
    marks7: form.marks7 || undefined,
    rollNo8: numOrUndef(form.rollNo8),
    sessionNo8: numOrUndef(form.sessionNo8),
    marks8: form.marks8 || undefined,
    oralRollNo: numOrUndef(form.oralRollNo),
    oralSessionNo: numOrUndef(form.oralSessionNo),
    oralMarks: form.oralMarks || undefined,
    userId: currentUserId || undefined,
  })

  const onSave = async () => {
    setError(null)
    setSuccess(null)
    const payload = buildPayload()
    if (!payload.name || !payload.formCentre || !payload.examCentre || !payload.rollNo) {
      setError('Roll No, Name, Form Centre, Exam Centre, UndFlag, and Khand are required.')
      return
    }
    if (!containsDevanagari(payload.name)) {
      setError('Name should be in Marathi (Devanagari).')
      return
    }
    try {
      if (mode === 'new') {
        const created = normalizeCandidate(await panditApi.createCandidate(payload))
        setSuccess(`Created roll ${created.rollNo}. Concession: ${created.concessionFlag ?? 'N'}`)
      } else if (mode === 'edit' && originalRoll != null) {
        const updated = normalizeCandidate(await panditApi.updateCandidate(originalRoll, payload))
        setSuccess(`Updated roll ${updated.rollNo}. Concession: ${updated.concessionFlag ?? 'N'}`)
      }
      await loadRows()
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to save candidate.'))
    }
  }

  const onCheckConcession = async () => {
    if (!form.rollNo) return
    try {
      const result = await panditApi.checkConcession(form.rollNo)
      setForm((current) => ({ ...current, concessionFlag: result.concessionFlag }))
      setSuccess(result.message)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Concession check failed.'))
    }
  }

  const onDelete = async () => {
    if (isLocked || !form.rollNo) return
    if (!window.confirm(`Delete roll ${form.rollNo}?`)) return
    try {
      await panditApi.deleteCandidate(form.rollNo)
      setSuccess('Candidate deleted.')
      await loadRows()
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to delete candidate.'))
    }
  }

  const onSearch = async () => {
    if (!searchName.trim()) return
    try {
      const matches = (await panditApi.searchByName(searchName.trim())).map(normalizeCandidate)
      if (matches.length === 0) {
        setError('No matching name found.')
        return
      }
      setRows(matches)
      setIndex(0)
      setForm(matches[0])
      setOriginalRoll(matches[0].rollNo)
      setMode('view')
      setSuccess(`Found ${matches.length} name match(es).`)
      setError(null)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Search failed.'))
    }
  }

  const portion = (form.flgPortion ?? 'N').toUpperCase()
  const khand = (form.khandAppearing ?? 'I').toUpperCase()

  return (
    <PageFrame
      title="Form Entry"
      description="Pandit candidates (Roll No + Session PK). No gender / Sr No. Region comes from form centre."
      actions={(
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`Session ${activeSessionNo ?? '-'}`} color="primary" variant="outlined" />
          <Chip label={`Centre forms ${centreCount}`} variant="outlined" />
          <Chip label={`Concession ${form.concessionFlag ?? 'N'}`} variant="outlined" />
          {centreLimited ? <Chip label="Centre-limited user" color="info" /> : null}
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
              onChange={onPhoneticAssistChange}
            />

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              }}
            >
              <TextField
                label="Roll No"
                value={form.rollNo || ''}
                disabled={readOnly && mode !== 'new'}
                onChange={(e) => setForm((c) => ({ ...c, rollNo: Number(e.target.value) || 0 }))}
                required
              />
              <MarathiNameField
                label="Name"
                value={form.name ?? ''}
                disabled={readOnly}
                phoneticAssist={phoneticAssist}
                sx={marathiNameFieldSx}
                onChange={(value) => setForm((c) => ({ ...c, name: value }))}
              />
              <TextField
                select
                label="Khand Appearing"
                value={form.khandAppearing ?? 'I'}
                disabled={readOnly}
                SelectProps={{ native: true }}
                onChange={(e) => setForm((c) => ({ ...c, khandAppearing: e.target.value }))}
              >
                <option value="I">I</option>
                <option value="II">II</option>
              </TextField>
              <TextField
                select
                label="Portion"
                value={form.flgPortion ?? 'N'}
                disabled={readOnly}
                SelectProps={{ native: true }}
                onChange={(e) => setForm((c) => ({ ...c, flgPortion: e.target.value }))}
              >
                <option value="N">NEW (N)</option>
                <option value="O">OLD (O)</option>
              </TextField>
              <TextField
                select
                label="Und Flag"
                value={form.undFlag ?? 'N'}
                disabled={readOnly}
                SelectProps={{ native: true }}
                onChange={(e) => setForm((c) => ({ ...c, undFlag: e.target.value }))}
              >
                <option value="N">N</option>
                <option value="Y">Y</option>
              </TextField>
              <TextField
                label="Und Class"
                value={form.undClass ?? ''}
                disabled={readOnly || (form.undFlag ?? 'N').toUpperCase() !== 'Y'}
                onChange={(e) => setForm((c) => ({ ...c, undClass: e.target.value }))}
              />
              <CentreSearchField
                label="Form Centre"
                value={form.formCentre ?? ''}
                centres={centreOptions}
                disabled={readOnly || centreFieldLocked}
                allowEmpty={!centreLimited}
                helperText={centreLimited ? 'Limited to your assigned centre(s).' : formCentreInfo?.display ?? (formCentreInfo?.isClosed ? 'Closed' : undefined)}
                onChange={(v) => void onFormCentreChange(v)}
              />
              <CentreSearchField
                label="Exam Centre"
                value={form.examCentre ?? ''}
                centres={centreOptions}
                disabled={readOnly || centreFieldLocked}
                allowEmpty={!centreLimited}
                helperText={examCentreInfo?.display}
                onChange={(v) => void onExamCentreChange(v)}
              />
              <TextField
                label="Concession Flag"
                value={form.concessionFlag ?? 'N'}
                disabled
                helperText="Set on save / check"
              />
            </Box>

            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Address</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  <TextField label="Add1" value={form.add1 ?? ''} disabled={readOnly} onChange={(e) => setForm((c) => ({ ...c, add1: e.target.value }))} />
                  <TextField label="Add2" value={form.add2 ?? ''} disabled={readOnly} onChange={(e) => setForm((c) => ({ ...c, add2: e.target.value }))} />
                  <TextField label="Add3" value={form.add3 ?? ''} disabled={readOnly} onChange={(e) => setForm((c) => ({ ...c, add3: e.target.value }))} />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Paper slots (prior roll / session / marks)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {(portion === 'N' && khand === 'I') || (portion === 'O' && khand === 'I') ? (
                    <>
                      <PaperSlot label="Paper 1" roll={form.rollNo1} session={form.sessionNo1} marks={form.marks1} readOnly={readOnly} onChange={(f, v) => setSlot(1, f, v)} />
                      <PaperSlot label="Paper 2" roll={form.rollNo2} session={form.sessionNo2} marks={form.marks2} readOnly={readOnly} onChange={(f, v) => setSlot(2, f, v)} />
                      <PaperSlot label="Paper 3" roll={form.rollNo3} session={form.sessionNo3} marks={form.marks3} readOnly={readOnly} onChange={(f, v) => setSlot(3, f, v)} />
                      {portion === 'N' ? (
                        <PaperSlot label="Paper 4" roll={form.rollNo4} session={form.sessionNo4} marks={form.marks4} readOnly={readOnly} onChange={(f, v) => setSlot(4, f, v)} />
                      ) : null}
                    </>
                  ) : null}
                  {portion === 'N' && khand === 'II' ? (
                    <>
                      <PaperSlot label="Paper 5" roll={form.rollNo5} session={form.sessionNo5} marks={form.marks5} readOnly={readOnly} onChange={(f, v) => setSlot(5, f, v)} />
                      <PaperSlot label="Paper 6" roll={form.rollNo6} session={form.sessionNo6} marks={form.marks6} readOnly={readOnly} onChange={(f, v) => setSlot(6, f, v)} />
                      <PaperSlot label="Paper 7" roll={form.rollNo7} session={form.sessionNo7} marks={form.marks7} readOnly={readOnly} onChange={(f, v) => setSlot(7, f, v)} />
                      <PaperSlot label="Paper 8" roll={form.rollNo8} session={form.sessionNo8} marks={form.marks8} readOnly={readOnly} onChange={(f, v) => setSlot(8, f, v)} />
                      <PaperSlot label="Oral" roll={form.oralRollNo} session={form.oralSessionNo} marks={form.oralMarks} readOnly={readOnly} onChange={(f, v) => setSlot('oral', f, v)} />
                    </>
                  ) : null}
                  {portion === 'O' && khand === 'II' ? (
                    <>
                      <PaperSlot label="Paper 4" roll={form.rollNo4} session={form.sessionNo4} marks={form.marks4} readOnly={readOnly} onChange={(f, v) => setSlot(4, f, v)} />
                      <PaperSlot label="Paper 5" roll={form.rollNo5} session={form.sessionNo5} marks={form.marks5} readOnly={readOnly} onChange={(f, v) => setSlot(5, f, v)} />
                      <PaperSlot label="Paper 6" roll={form.rollNo6} session={form.sessionNo6} marks={form.marks6} readOnly={readOnly} onChange={(f, v) => setSlot(6, f, v)} />
                      <PaperSlot label="Oral" roll={form.oralRollNo} session={form.oralSessionNo} marks={form.oralMarks} readOnly={readOnly} onChange={(f, v) => setSlot('oral', f, v)} />
                    </>
                  ) : null}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="outlined" disabled={rows.length === 0} onClick={() => showRow(index - 1)}>Prev</Button>
              <Button variant="outlined" disabled={rows.length === 0} onClick={() => showRow(index + 1)}>Next</Button>
              <Button variant="contained" disabled={isLocked} onClick={() => {
                setMode('new')
                setOriginalRoll(null)
                const preferred = centreLimited ? defaultCentre : ''
                setForm({
                  ...emptyForm(activeSessionNo),
                  formCentre: preferred,
                  examCentre: preferred,
                })
              }}>New</Button>
              <Button variant="outlined" disabled={isLocked || !form.rollNo} onClick={() => {
                setMode('edit')
                setOriginalRoll(form.rollNo)
              }}>Edit</Button>
              <Button variant="contained" color="success" disabled={readOnly || mode === 'view'} onClick={() => void onSave()}>Save</Button>
              <Button variant="text" onClick={() => {
                if (rows[index]) {
                  setForm(rows[index])
                  setOriginalRoll(rows[index].rollNo)
                }
                setMode('view')
              }}>Undo</Button>
              <Button variant="outlined" color="error" disabled={isLocked || !form.rollNo} onClick={() => void onDelete()}>Delete</Button>
              <Button variant="outlined" disabled={!form.rollNo} onClick={() => void onCheckConcession()}>Check Concession</Button>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button size="small" variant="outlined" onClick={() => setNameSearchOpen(true)}>Search by name</Button>
            <Button size="small" variant="text" onClick={() => void loadRows()}>{isLoading ? 'Loading...' : 'Reload'}</Button>
          </Stack>

          <CandidateNameSearchDialog
            open={nameSearchOpen}
            onClose={() => setNameSearchOpen(false)}
            phoneticAssist={phoneticAssist}
            onPhoneticAssistChange={onPhoneticAssistChange}
            searchFn={async (q) => (await panditApi.searchByName(q)).map(normalizeCandidate)}
            getRowKey={(row) => String(row.rollNo)}
            columns={[
              { id: 'name', label: 'Name', render: (r) => r.name || '-' },
              { id: 'rollNo', label: 'Roll', width: 80, render: (r) => r.rollNo ?? '-' },
              { id: 'khand', label: 'Khand', width: 80, render: (r) => r.khandAppearing || '-' },
              { id: 'centre', label: 'Form Centre', render: (r) => r.formCentre || '-' },
            ]}
            onSelect={(row) => {
              setRows([row])
              setIndex(0)
              setForm(row)
              setOriginalRoll(row.rollNo)
              setMode('view')
              setSearchName(row.name ?? '')
              setSuccess(`Selected: ${row.name ?? ''}`)
              setError(null)
            }}
          />

          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
