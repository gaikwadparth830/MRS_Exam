import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
} from '@mui/material'

import { praveenApi, type MarksRow } from '../../api/praveen/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

type DraftMarks = {
  paper1: string
  paper2: string
  paper3: string
  paper4: string
  paper5: string
  oral: string
  regLang: string
}

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) return payload as Region[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Region[]
  }
  return []
}

const markNumeric = (value: string): number | null => {
  const trimmed = value.trim()
  if (!trimmed || trimmed.toUpperCase() === 'A') return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

const displayPaperTotal = (
  papers: string[],
  serverTotal?: number | null,
): string | number => {
  if (typeof serverTotal === 'number') return serverTotal
  const values = papers.map(markNumeric)
  if (values.some((v) => v == null)) return '-'
  return values.reduce((sum, v) => sum + (v ?? 0), 0)
}

const rowToDraft = (row: MarksRow): DraftMarks => ({
  paper1: row.marks1 ?? '',
  paper2: row.marks2 ?? '',
  paper3: row.marks3 ?? '',
  paper4: row.marks4 ?? '',
  paper5: row.marks5 ?? '',
  oral: row.oralMarks ?? '',
  regLang: row.regLang ?? '',
})

const draftKey = (row: MarksRow) => `${row.rollNo}-${row.regionNo}`

export const PraveenMarksPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [regionNo, setRegionNo] = useState('')
  const [fromRoll, setFromRoll] = useState('1')
  const [regions, setRegions] = useState<Region[]>([])
  const [rows, setRows] = useState<MarksRow[]>([])
  const [drafts, setDrafts] = useState<Record<string, DraftMarks>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void RegionsService.getApiRegions()
      .then((payload) => setRegions(toRegionList(payload)))
      .catch(() => setRegions([]))
  }, [])

  const onShow = async () => {
    setError(null)
    setSuccess(null)
    const region = Number(regionNo)
    const roll = Number(fromRoll)
    if (!Number.isFinite(region) || region <= 0) {
      setError('Select a region.')
      return
    }
    if (!Number.isFinite(roll) || roll < 0) {
      setError('From roll must be numeric and not negative.')
      return
    }
    try {
      const list = await praveenApi.listMarks(region, roll)
      setRows(list)
      setDrafts(Object.fromEntries(list.map((row) => [draftKey(row), rowToDraft(row)])))
      setSuccess(`Loaded ${list.length} candidates without result.`)
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Unable to load marks.'))
    }
  }

  const saveMark = async (row: MarksRow, draft: DraftMarks) => {
    setError(null)
    setSuccess(null)
    try {
      const response = await praveenApi.updateMarks(
        row.rollNo,
        row.regionNo,
        draft.paper1.trim(),
        draft.paper2.trim(),
        draft.paper3.trim(),
        draft.paper4.trim(),
        draft.paper5.trim(),
        draft.oral.trim(),
        draft.regLang.trim(),
      )
      const key = draftKey(row)
      setRows((current) => current.map((item) => (
        draftKey(item) === key
          ? {
              ...item,
              marks1: response.marks1,
              marks2: response.marks2,
              marks3: response.marks3,
              marks4: response.marks4,
              marks5: response.marks5,
              oralMarks: response.oralMarks,
              regLang: response.regLang,
              totMarks: response.totMarks,
            }
          : item
      )))
      setDrafts((current) => ({
        ...current,
        [key]: rowToDraft({
          ...row,
          marks1: response.marks1,
          marks2: response.marks2,
          marks3: response.marks3,
          marks4: response.marks4,
          marks5: response.marks5,
          oralMarks: response.oralMarks,
          regLang: response.regLang,
        }),
      }))
      setSuccess(`Saved marks for roll ${row.rollNo}.`)
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Unable to save marks.'))
    }
  }

  const rowByKey = useMemo(() => Object.fromEntries(rows.map((r) => [draftKey(r), r])), [rows])

  const draftChanged = (row: MarksRow, draft: DraftMarks) => (
    draft.paper1.trim() !== (row.marks1 ?? '')
    || draft.paper2.trim() !== (row.marks2 ?? '')
    || draft.paper3.trim() !== (row.marks3 ?? '')
    || draft.paper4.trim() !== (row.marks4 ?? '')
    || draft.paper5.trim() !== (row.marks5 ?? '')
    || draft.oral.trim() !== (row.oralMarks ?? '')
    || draft.regLang.trim() !== (row.regLang ?? '')
  )

  const trySaveRow = (row: MarksRow) => {
    if (isLocked) return
    const key = draftKey(row)
    const draft = drafts[key]
    if (!draft || !draftChanged(row, draft)) return
    void saveMark(row, draft)
  }

  const emptyDraft: DraftMarks = {
    paper1: '', paper2: '', paper3: '', paper4: '', paper5: '', oral: '', regLang: '',
  }

  return (
    <PageFrame
      title="Marks Entry"
      description={`Session ${defaultSessionNo ?? '-'}. Enter Papers 1–5, Oral, and Project/Reg Lang (0–100 or A). Total is the sum of the five papers only.`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
          {isLocked ? <Alert severity="warning">Result lock is on. Marks cannot be edited.</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Region"
              value={regionNo}
              onChange={(e) => setRegionNo(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 220 }}
            >
              <option value="" />
              {regions.map((region) => (
                <option key={region.regionNo} value={region.regionNo}>
                  {region.regionNo}{region.regionName ? ` - ${region.regionName}` : ''}
                </option>
              ))}
            </TextField>
            <TextField
              label="From Roll No"
              type="number"
              value={fromRoll}
              onChange={(e) => setFromRoll(e.target.value)}
            />
            <Button variant="contained" onClick={() => void onShow()}>Show</Button>
          </Stack>

          <Paper variant="outlined">
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>P1</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>P2</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>P3</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>P4</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>P5</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Oral</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Project/Reg Lang</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Save</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={11}>No rows. Click Show.</TableCell></TableRow>
                  ) : rows.map((row) => {
                    const key = draftKey(row)
                    const draft = drafts[key] ?? emptyDraft
                    const total = displayPaperTotal(
                      [draft.paper1, draft.paper2, draft.paper3, draft.paper4, draft.paper5],
                      row.totMarks,
                    )
                    const setField = (field: keyof DraftMarks, value: string) => {
                      setDrafts((c) => ({ ...c, [key]: { ...draft, [field]: value } }))
                    }
                    return (
                      <TableRow key={key} hover>
                        <TableCell>{row.rollNo}</TableCell>
                        <TableCell>{row.name ?? '-'}</TableCell>
                        {(['paper1', 'paper2', 'paper3', 'paper4', 'paper5'] as const).map((field) => (
                          <TableCell key={field}>
                            <TextField
                              size="small"
                              value={draft[field]}
                              disabled={isLocked}
                              onChange={(e) => setField(field, e.target.value)}
                              onBlur={() => trySaveRow(rowByKey[key] ?? row)}
                              helperText="0-100/A"
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <TextField
                            size="small"
                            value={draft.oral}
                            disabled={isLocked}
                            onChange={(e) => setField('oral', e.target.value)}
                            onBlur={() => trySaveRow(rowByKey[key] ?? row)}
                            helperText="0-100/A"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={draft.regLang}
                            disabled={isLocked}
                            onChange={(e) => setField('regLang', e.target.value)}
                            onBlur={() => trySaveRow(rowByKey[key] ?? row)}
                            helperText="0-100/A"
                          />
                        </TableCell>
                        <TableCell>{total}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            disabled={isLocked}
                            onClick={() => void saveMark(row, draft)}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </CardContent>
      </Card>
    </PageFrame>
  )
}
