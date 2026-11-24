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

import { panditApi, type ResultRow } from '../../api/pandit/client'
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

export const PanditGenerateResultPage = ({ defaultSessionNo }: Props) => {
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

  const loadGrid = async (region?: number) => {
    const list = await panditApi.listResults(region)
    setRows(list)
  }

  const onGenerate = async () => {
    setError(null)
    setSuccess(null)
    try {
      const result = await panditApi.generateResults() as { processed?: number }
      await loadGrid(regionNo ? Number(regionNo) : undefined)
      setSuccess(`Processed ${result.processed ?? 0} rows. Lock set (resgen_pandit = Y).`)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Result generation failed.'))
    }
  }

  const onFindRanks = async () => {
    setError(null)
    setSuccess(null)
    try {
      const result = await panditApi.findRanks() as { first?: number; second?: number }
      await loadGrid(regionNo ? Number(regionNo) : undefined)
      setSuccess(`Ranks set. FIRST=${result.first ?? 0}, SECOND=${result.second ?? 0}.`)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Find ranks failed.'))
    }
  }

  return (
    <PageFrame
      title="Generate Result"
      description={`Session ${defaultSessionNo ?? '-'}. Generates for whole session (NEW primary; OLD supported). Sets RESGEN_PANDIT=Y.`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                select
                label="Region (grid filter)"
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
                  void loadGrid(regionNo ? Number(regionNo) : undefined).catch((err) => {
                    setError(panditApi.messageFromError(err, 'Unable to load results.'))
                  })
                }}
              >
                Refresh Grid
              </Button>
            </Stack>

            <Paper variant="outlined">
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Roll</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Khand</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tot</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow><TableCell colSpan={6}>No rows.</TableCell></TableRow>
                    ) : rows.map((row) => (
                      <TableRow key={row.rollNo} hover>
                        <TableCell>{row.rollNo}</TableCell>
                        <TableCell>{row.khandAppearing ?? '-'}</TableCell>
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

export const PanditResetLockPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onReset = async () => {
    setError(null)
    setSuccess(null)
    if (!window.confirm('Reset resgen_pandit to N for the default session?')) return
    try {
      await panditApi.resetLock()
      setSuccess('Result lock reset to N.')
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to reset lock.'))
    }
  }

  return (
    <PageFrame
      title="Reset Result Lock"
      description="Supervisor action. Sets session.resgen_pandit = N so forms and marks can be edited again."
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <Button variant="contained" color="warning" onClick={() => void onReset()} sx={{ alignSelf: 'flex-start' }}>
              Reset Pandit Lock
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
