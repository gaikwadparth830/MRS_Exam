import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'

import { balbodhiniApi, type ResultRow } from '../../api/balbodhini/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
}

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) return payload as Region[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Region[]
  }
  return []
}

export const BalbodhiniGenerateResultPage = ({ defaultSessionNo }: Props) => {
  const [regions, setRegions] = useState<Region[]>([])
  const [regionNo, setRegionNo] = useState('')
  const [rows, setRows] = useState<ResultRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void RegionsService.getApiRegions()
      .then((payload) => setRegions(toRegionList(payload)))
      .catch(() => setRegions([]))
  }, [])

  const loadGrid = async (region: number) => {
    const list = await balbodhiniApi.listResults(region)
    setRows(list)
  }

  const onGenerate = async () => {
    setError(null)
    setSuccess(null)
    const region = Number(regionNo)
    if (!Number.isFinite(region) || region <= 0) {
      setError('Select a region number.')
      return
    }
    try {
      const result = await balbodhiniApi.generateResults(region) as { processed?: number; resgenRun?: number }
      await loadGrid(region)
      setSuccess(`Processed ${result.processed ?? 0} rows. Run ${result.resgenRun ?? '-'}.`)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Result generation failed.'))
    }
  }

  const onFindRanks = async () => {
    setError(null)
    setSuccess(null)
    try {
      const result = await balbodhiniApi.findRanks() as { first?: number; second?: number }
      if (regionNo) await loadGrid(Number(regionNo))
      setSuccess(`Ranks set. FIRST=${result.first ?? 0}, SECOND=${result.second ?? 0}.`)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Find ranks failed.'))
    }
  }

  return (
    <PageFrame
      title="Generate Result"
      description={`Session ${defaultSessionNo ?? '-'}. Region is submitted as an integer. Apply pass/fail, grade, and region ranks.`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Region"
              value={regionNo}
              onChange={(e) => setRegionNo(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 240 }}
            >
              <option value="" />
              {regions.map((region) => (
                <option key={region.regionNo} value={region.regionNo}>
                  {region.regionNo}{region.regionName ? ` - ${region.regionName}` : ''}
                </option>
              ))}
            </TextField>
            <Button variant="contained" onClick={() => void onGenerate()}>Generate Result</Button>
            <Button variant="outlined" onClick={() => void onFindRanks()}>Find Ranks</Button>
            <Button
              variant="text"
              onClick={() => {
                if (!regionNo) return
                void loadGrid(Number(regionNo)).catch((err) => {
                  setError(balbodhiniApi.messageFromError(err, 'Unable to load results.'))
                })
              }}
            >
              Refresh Grid
            </Button>
          </Stack>

          <Paper variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paper 1</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6}>No rows.</TableCell></TableRow>
                  ) : rows.map((row) => (
                    <TableRow key={row.srNo} hover>
                      <TableCell>{row.rollNo ?? '-'}</TableCell>
                      <TableCell>{row.marks1 ?? '-'}</TableCell>
                      <TableCell>{row.totMarks ?? '-'}</TableCell>
                      <TableCell>{row.grade ?? '-'}</TableCell>
                      <TableCell>{row.specialRank ?? '-'}</TableCell>
                      <TableCell>{row.result ?? '-'}</TableCell>
                    </TableRow>
                  ))}
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

export const BalbodhiniResetLockPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onReset = async () => {
    setError(null)
    setSuccess(null)
    if (!window.confirm('Reset resgen_balbodhini to N for the default session?')) return
    try {
      await balbodhiniApi.resetLock()
      setSuccess('Result lock reset to N.')
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Unable to reset lock.'))
    }
  }

  return (
    <PageFrame
      title="Reset Result Lock"
      description="Supervisor action. Sets session.resgen_balbodhini = N so forms and marks can be edited again."
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <Button variant="contained" color="warning" onClick={() => void onReset()} sx={{ alignSelf: 'flex-start' }}>
              Reset Balbodhini Lock
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
