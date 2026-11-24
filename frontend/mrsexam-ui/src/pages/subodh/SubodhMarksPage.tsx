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

import { subodhApi, type MarksRow } from '../../api/subodh/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

type DraftPair = { paper1: string; paper2: string }

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

const displayTotal = (paper1: string, paper2: string, serverTotal?: number | null): string | number => {
  if (typeof serverTotal === 'number') return serverTotal
  const a = markNumeric(paper1)
  const b = markNumeric(paper2)
  if (a == null || b == null) return '-'
  return a + b
}

export const SubodhMarksPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [regionNo, setRegionNo] = useState('')
  const [fromRoll, setFromRoll] = useState('1')
  const [regions, setRegions] = useState<Region[]>([])
  const [rows, setRows] = useState<MarksRow[]>([])
  const [drafts, setDrafts] = useState<Record<number, DraftPair>>({})
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
      const list = await subodhApi.listMarks(region, roll)
      setRows(list)
      setDrafts(Object.fromEntries(
        list.map((row) => [row.srNo, { paper1: row.marks1 ?? '', paper2: row.marks2 ?? '' }]),
      ))
      setSuccess(`Loaded ${list.length} candidates without result.`)
    } catch (err) {
      setError(subodhApi.messageFromError(err, 'Unable to load marks.'))
    }
  }

  const saveMark = async (srNo: number, paper1: string, paper2: string) => {
    setError(null)
    setSuccess(null)
    try {
      const response = await subodhApi.updateMarks(srNo, paper1, paper2)
      setRows((current) => current.map((row) => (
        row.srNo === srNo
          ? { ...row, marks1: response.marks1, marks2: response.marks2, totMarks: response.totMarks }
          : row
      )))
      setDrafts((current) => ({
        ...current,
        [srNo]: { paper1: response.marks1 ?? '', paper2: response.marks2 ?? '' },
      }))
      setSuccess(`Saved marks for Sr No ${srNo}.`)
    } catch (err) {
      setError(subodhApi.messageFromError(err, 'Unable to save marks.'))
    }
  }

  const rowBySr = useMemo(() => Object.fromEntries(rows.map((r) => [r.srNo, r])), [rows])

  const trySaveRow = (srNo: number) => {
    if (isLocked) return
    const row = rowBySr[srNo]
    const draft = drafts[srNo]
    if (!row || !draft) return
    const p1 = draft.paper1.trim()
    const p2 = draft.paper2.trim()
    if (p1 === (row.marks1 ?? '') && p2 === (row.marks2 ?? '')) return
    void saveMark(srNo, p1, p2)
  }

  return (
    <PageFrame
      title="Marks Entry"
      description={`Session ${defaultSessionNo ?? '-'}. Enter Paper 1 and Paper 2 (0–100 or A). Total is the sum of both papers.`}
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
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Save</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={7}>No rows. Click Show.</TableCell></TableRow>
                  ) : rows.map((row) => {
                    const draft = drafts[row.srNo] ?? { paper1: '', paper2: '' }
                    const total = displayTotal(draft.paper1, draft.paper2, row.totMarks)
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
                        <TableCell>{total}</TableCell>
                        <TableCell>{row.regionNo ?? '-'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            disabled={isLocked}
                            onClick={() => void saveMark(row.srNo, draft.paper1.trim(), draft.paper2.trim())}
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