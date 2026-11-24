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

import { panditApi } from '../../api/pandit/client'
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

export const PanditRollNumbersPage = ({ defaultSessionNo }: Props) => {
  const [regions, setRegions] = useState<Region[]>([])
  const [regionNo, setRegionNo] = useState('')
  const [formCentre, setFormCentre] = useState('')
  const [nextRoll, setNextRoll] = useState<number | null>(null)
  const [rows, setRows] = useState<Array<{
    rollNo: number
    name?: string | null
    formCentre?: string | null
    examCentre?: string | null
    khandAppearing?: string | null
  }>>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void RegionsService.getApiRegions()
      .then((payload) => setRegions(toRegionList(payload)))
      .catch(() => setRegions([]))
  }, [])

  const onLoad = async () => {
    setError(null)
    try {
      const [next, list] = await Promise.all([
        panditApi.nextRoll(),
        panditApi.listRolls({
          formCentre: formCentre.trim() || undefined,
          regionNo: regionNo ? Number(regionNo) : undefined,
        }),
      ])
      setNextRoll(next.nextRollNo)
      setRows(list)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to load roll numbers.'))
    }
  }

  return (
    <PageFrame
      title="Roll Numbers"
      description={`Session ${defaultSessionNo ?? '-'}. Next roll = max(RollNo)+1. List by form centre or region (via centre).`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
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
              <TextField label="Form centre" value={formCentre} onChange={(e) => setFormCentre(e.target.value)} />
              <Button variant="contained" onClick={() => void onLoad()}>Load</Button>
            </Stack>
            <Alert severity="info">Next suggested roll: {nextRoll ?? '-'}</Alert>
            <Paper variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Roll</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Form Centre</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Exam Centre</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Khand</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow><TableCell colSpan={5}>No rows.</TableCell></TableRow>
                    ) : rows.map((row) => (
                      <TableRow key={row.rollNo}>
                        <TableCell>{row.rollNo}</TableCell>
                        <TableCell>{row.name ?? '-'}</TableCell>
                        <TableCell>{row.formCentre ?? '-'}</TableCell>
                        <TableCell>{row.examCentre ?? '-'}</TableCell>
                        <TableCell>{row.khandAppearing ?? '-'}</TableCell>
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
