import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

import { balbodhiniApi, type MarksRow } from '../../api/balbodhini/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
  isLocked?: boolean
}

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) return payload as Region[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Region[]
  }
  return []
}

export const BalbodhiniMarksPage = ({ defaultSessionNo, isLocked = false }: Props) => {
  const [regionNo, setRegionNo] = useState('')
  const [fromRoll, setFromRoll] = useState('1')
  const [regions, setRegions] = useState<Region[]>([])
  const [rows, setRows] = useState<MarksRow[]>([])
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [gracePrompt, setGracePrompt] = useState<{ srNo: number; paper1: string; amount: number; message: string } | null>(null)

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
      const list = await balbodhiniApi.listMarks(region, roll)
      setRows(list)
      setDrafts(Object.fromEntries(list.map((row) => [row.srNo, row.marks1 ?? ''])))
      setSuccess(`Loaded ${list.length} candidates without result.`)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Unable to load marks.'))
    }
  }

  const saveMark = async (srNo: number, paper1: string, acceptGrace: boolean) => {
    setError(null)
    setSuccess(null)
    try {
      const response = await balbodhiniApi.updateMarks(srNo, paper1, acceptGrace)
      if (response.graceOffered && response.graceAmount) {
        setGracePrompt({
          srNo,
          paper1,
          amount: response.graceAmount,
          message: response.message ?? `Accept ${response.graceAmount} grace mark(s)?`,
        })
        return
      }
      setRows((current) => current.map((row) => (
        row.srNo === srNo
          ? { ...row, marks1: response.marks1, totMarks: response.totMarks }
          : row
      )))
      setDrafts((current) => ({ ...current, [srNo]: response.marks1 ?? '' }))
      setSuccess(`Saved marks for Sr No ${srNo}.`)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Unable to save marks.'))
    }
  }

  return (
    <PageFrame
      title="Marks Entry"
      description={`Session ${defaultSessionNo ?? '-'}. Enter Paper 1 (0–100 or A). Grace is offered near grade boundaries.`}
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
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Save</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6}>No rows. Click Show.</TableCell></TableRow>
                  ) : rows.map((row) => (
                    <TableRow key={row.srNo} hover>
                      <TableCell>{row.rollNo ?? '-'}</TableCell>
                      <TableCell>{row.name ?? '-'}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={drafts[row.srNo] ?? ''}
                          disabled={isLocked}
                          onChange={(e) => setDrafts((c) => ({ ...c, [row.srNo]: e.target.value }))}
                          onBlur={() => {
                            if (isLocked) return
                            const value = (drafts[row.srNo] ?? '').trim()
                            if (value === (row.marks1 ?? '')) return
                            void saveMark(row.srNo, value, false)
                          }}
                          helperText="0-100 or A"
                        />
                      </TableCell>
                      <TableCell>{row.totMarks ?? '-'}</TableCell>
                      <TableCell>{row.regionNo ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          disabled={isLocked}
                          onClick={() => void saveMark(row.srNo, drafts[row.srNo] ?? '', false)}
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </CardContent>
      </Card>

      <Dialog open={Boolean(gracePrompt)} onClose={() => setGracePrompt(null)}>
        <DialogTitle>Grace marks</DialogTitle>
        <DialogContent>
          <DialogContentText>{gracePrompt?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (!gracePrompt) return
            void saveMark(gracePrompt.srNo, gracePrompt.paper1, false).then(() => setGracePrompt(null))
          }}>
            No
          </Button>
          <Button variant="contained" onClick={() => {
            if (!gracePrompt) return
            void saveMark(gracePrompt.srNo, gracePrompt.paper1, true).then(() => setGracePrompt(null))
          }}>
            Yes, add grace
          </Button>
        </DialogActions>
      </Dialog>
    </PageFrame>
  )
}
