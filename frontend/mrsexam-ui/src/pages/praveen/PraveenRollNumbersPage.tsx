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
  Typography,
} from '@mui/material'

import { praveenApi } from '../../api/praveen/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
}

type RollRow = {
  rollNo: number
  regionNo: number
  sessionNo: number
  name?: string | null
  formCentre?: string | null
  examCentre?: string | null
}

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) return payload as Region[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Region[]
  }
  return []
}

export const PraveenRollNumbersPage = ({ defaultSessionNo }: Props) => {
  const [regions, setRegions] = useState<Region[]>([])
  const [regionNo, setRegionNo] = useState('')
  const [nextRollNo, setNextRollNo] = useState<number | null>(null)
  const [rows, setRows] = useState<RollRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void RegionsService.getApiRegions()
      .then((payload) => setRegions(toRegionList(payload)))
      .catch(() => setRegions([]))
  }, [])

  const onLoad = async () => {
    setError(null)
    setSuccess(null)
    const region = Number(regionNo)
    if (!Number.isFinite(region) || region <= 0) {
      setError('Select a region.')
      return
    }
    try {
      const [next, list] = await Promise.all([
        praveenApi.nextRoll(region),
        praveenApi.listRolls(region),
      ])
      setNextRollNo(next.nextRollNo)
      setRows(list)
      setSuccess(`Loaded ${list.length} assigned rolls. Next roll = ${next.nextRollNo}.`)
    } catch (err) {
      setError(praveenApi.messageFromError(err, 'Unable to load roll numbers.'))
    }
  }

  return (
    <PageFrame
      title="Roll Numbers"
      description={`Session ${defaultSessionNo ?? '-'}. Praveen rolls are entered with the form. This screen shows the next suggested roll and existing rolls for a region.`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
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
              <Button variant="contained" onClick={() => void onLoad()}>Show</Button>
              {nextRollNo != null ? (
                <Typography variant="body1" fontWeight={700}>
                  Next roll: {nextRollNo}
                </Typography>
              ) : null}
            </Stack>

            <Paper variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Form Centre</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Exam Centre</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow><TableCell colSpan={4}>No rows. Select a region and click Show.</TableCell></TableRow>
                    ) : rows.map((row) => (
                      <TableRow key={`${row.rollNo}-${row.regionNo}`} hover>
                        <TableCell>{row.rollNo}</TableCell>
                        <TableCell>{row.name ?? '-'}</TableCell>
                        <TableCell>{row.formCentre ?? '-'}</TableCell>
                        <TableCell>{row.examCentre ?? '-'}</TableCell>
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
