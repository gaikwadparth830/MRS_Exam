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

import { prabodhApi, type MarksRow } from '../../api/prabodh/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

type DraftMarks = { paper1: string; paper2: string; paper3: string; oral: string }

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
  paper1: string,
  paper2: string,
  paper3: string,
  serverTotal?: number | null,
): string | number => {
  if (typeof serverTotal === 'number') return serverTotal
  const a = markNumeric(paper1)
  const b = markNumeric(paper2)
  const c = markNumeric(paper3)
  if (a == null || b == null || c == null) return '-'
  return a + b + c
}

const rowToDraft = (row: MarksRow): DraftMarks => ({
  paper1: row.marks1 ?? '',
  paper2: row.marks2 ?? '',
  paper3: row.marks3 ?? '',
  oral: row.oralMarks ?? '',
})

export const PrabodhMarksPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [regionNo, setRegionNo] = useState('')
  const [fromRoll, setFromRoll] = useState('1')
  const [regions, setRegions] = useState<Region[]>([])
  const [rows, setRows] = useState<MarksRow[]>([])
  const [drafts, setDrafts] = useState<Record<number, DraftMarks>>({})
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
      const list = await prabodhApi.listMarks(region, roll)
      setRows(list)
      setDrafts(Object.fromEntries(list.map((row) => [row.srNo, rowToDraft(row)])))
      setSuccess(`Loaded ${list.length} candidates without result.`)
    } catch (err) {
      setError(prabodhApi.messageFromError(err, 'Unable to load marks.'))
    }
  }

  const saveMark = async (srNo: number, draft: DraftMarks) => {
    setError(null)
    setSuccess(null)
    const paper1 = draft.paper1.trim()
    const paper2 = draft.paper2.trim()
    const paper3 = draft.paper3.trim()
    const oral = draft.oral.trim()
    try {
      const response = await prabodhApi.updateMarks(srNo, paper1, paper2, paper3, oral)
      setRows((current) => current.map((row) => (
        row.srNo === srNo
          ? {
              ...row,
              marks1: response.marks1,
              marks2: response.marks2,
              marks3: response.marks3,
              oralMarks: response.oralMarks,
              totMarks: response.totMarks,
            }
          : row
      )))
      setDrafts((current) => ({
        ...current,
        [srNo]: {
          paper1: response.marks1 ?? '',
          paper2: response.marks2 ?? '',
          paper3: response.marks3 ?? '',
          oral: response.oralMarks ?? '',
        },
      }))
      setSuccess(`Saved marks for Sr No ${srNo}.`)
    } catch (err) {
      setError(prabodhApi.messageFromError(err, 'Unable to save marks.'))
    }
  }

  const rowBySr = useMemo(() => Object.fromEntries(rows.map((r) => [r.srNo, r])), [rows])

  const draftChanged = (row: MarksRow, draft: DraftMarks) => (
    draft.paper1.trim() !== (row.marks1 ?? '')
    || draft.paper2.trim() !== (row.marks2 ?? '')
    || draft.paper3.trim() !== (row.marks3 ?? '')
    || draft.oral.trim() !== (row.oralMarks ?? '')
  )

  const trySaveRow = (srNo: number) => {
    if (isLocked) return
    const row = rowBySr[srNo]
    const draft = drafts[srNo]
    if (!row || !draft || !draftChanged(row, draft)) return
    void saveMark(srNo, draft)
  }

  return (
    <PageFrame
      title="Marks Entry"
      description={`Session ${defaultSessionNo ?? '-'}. Enter Paper 1, Paper 2, Paper 3, and Oral (0–100 or A). Total shows the sum of the three papers only (oral excluded).`}
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paper 1</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paper 2</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paper 3</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Oral</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Save</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={9}>No rows. Click Show.</TableCell></TableRow>
                  ) : rows.map((row) => {
                    const draft = drafts[row.srNo] ?? { paper1: '', paper2: '', paper3: '', oral: '' }
                    const total = displayPaperTotal(draft.paper1, draft.paper2, draft.paper3, row.totMarks)
                    return (
                      <TableRow key={row.srNo} hover>
                        <TableCell>{row.rollNo ?? '-'}</TableCell>
                        <TableCell>{row.name ?? '-'}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={draft.paper1}
                            disabled={isLocked}
                            onChange={(e) => setDrafts((c) => ({
                              ...c,
                              [row.srNo]: { ...draft, paper1: e.target.value },
                            }))}
                            onBlur={() => trySaveRow(row.srNo)}
                            helperText="0-100 or A"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={draft.paper2}
                            disabled={isLocked}
                            onChange={(e) => setDrafts((c) => ({
                              ...c,
                              [row.srNo]: { ...draft, paper2: e.target.value },
                            }))}
                            onBlur={() => trySaveRow(row.srNo)}
                            helperText="0-100 or A"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={draft.paper3}
                            disabled={isLocked}
                            onChange={(e) => setDrafts((c) => ({
                              ...c,
                              [row.srNo]: { ...draft, paper3: e.target.value },
                            }))}
                            onBlur={() => trySaveRow(row.srNo)}
                            helperText="0-100 or A"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={draft.oral}
                            disabled={isLocked}
                            onChange={(e) => setDrafts((c) => ({
                              ...c,
                              [row.srNo]: { ...draft, oral: e.target.value },
                            }))}
                            onBlur={() => trySaveRow(row.srNo)}
                            helperText="0-100 or A"
                          />
                        </TableCell>
                        <TableCell>{total}</TableCell>
                        <TableCell>{row.regionNo ?? '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            disabled={isLocked}
                            onClick={() => void saveMark(row.srNo, draft)}
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