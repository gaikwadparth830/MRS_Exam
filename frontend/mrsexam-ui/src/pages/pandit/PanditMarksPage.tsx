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

import { panditApi, type MarksRow } from '../../api/pandit/client'
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
  paper6: string
  paper7: string
  paper8: string
  oral: string
}

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) return payload as Region[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Region[]
  }
  return []
}

const rowToDraft = (row: MarksRow): DraftMarks => ({
  paper1: row.marks1 ?? '',
  paper2: row.marks2 ?? '',
  paper3: row.marks3 ?? '',
  paper4: row.marks4 ?? '',
  paper5: row.marks5 ?? '',
  paper6: row.marks6 ?? '',
  paper7: row.marks7 ?? '',
  paper8: row.marks8 ?? '',
  oral: row.oralMarks ?? '',
})

const editablePapers = (row: MarksRow): Array<keyof DraftMarks> => {
  const portion = (row.flgPortion ?? 'N').toUpperCase()
  let khand = (row.khandAppearing ?? 'I').toUpperCase()
  if (khand === '1') khand = 'I'
  if (khand === '2') khand = 'II'
  if (portion === 'N' && khand === 'I') return ['paper1', 'paper2', 'paper3', 'paper4']
  if (portion === 'N' && khand === 'II') return ['paper5', 'paper6', 'paper7', 'paper8', 'oral']
  if (portion === 'O' && khand === 'I') return ['paper1', 'paper2', 'paper3']
  return ['paper4', 'paper5', 'paper6', 'oral']
}

export const PanditMarksPage = ({ defaultSessionNo, isLocked = false }: Props) => {
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
    try {
      const list = await panditApi.listMarks(region, roll)
      setRows(list)
      setDrafts(Object.fromEntries(list.map((row) => [row.rollNo, rowToDraft(row)])))
      setSuccess(`Loaded ${list.length} candidates without result.`)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to load marks.'))
    }
  }

  const saveMark = async (row: MarksRow, draft: DraftMarks) => {
    setError(null)
    setSuccess(null)
    try {
      const response = await panditApi.updateMarks(row.rollNo, {
        paper1: draft.paper1,
        paper2: draft.paper2,
        paper3: draft.paper3,
        paper4: draft.paper4,
        paper5: draft.paper5,
        paper6: draft.paper6,
        paper7: draft.paper7,
        paper8: draft.paper8,
        oralMarks: draft.oral,
      }) as MarksRow & { totMarks?: number }
      setRows((current) => current.map((item) => (
        item.rollNo === row.rollNo
          ? {
              ...item,
              marks1: response.marks1,
              marks2: response.marks2,
              marks3: response.marks3,
              marks4: response.marks4,
              marks5: response.marks5,
              marks6: response.marks6,
              marks7: response.marks7,
              marks8: response.marks8,
              oralMarks: response.oralMarks,
              totMarks: response.totMarks,
            }
          : item
      )))
      setDrafts((current) => ({
        ...current,
        [row.rollNo]: rowToDraft({ ...row, ...response }),
      }))
      setSuccess(`Saved marks for roll ${row.rollNo}.`)
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Unable to save marks.'))
    }
  }

  return (
    <PageFrame
      title="Marks Entry"
      description={`Session ${defaultSessionNo ?? '-'}. Editable papers follow khand/portion (NEW I: 1–4; NEW II: 5–7+oral; OLD I: 1–3; OLD II: 4–6+oral). Tot ≈ P1–P7.`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            {isLocked ? <Alert severity="warning">Result lock is ON.</Alert> : null}

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
              <TextField label="From roll" value={fromRoll} onChange={(e) => setFromRoll(e.target.value)} />
              <Button variant="contained" onClick={() => void onShow()}>Show</Button>
            </Stack>

            <Paper variant="outlined">
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Roll</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Khand</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P1</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P2</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P3</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P4</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P5</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P6</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P7</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>P8</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oral</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tot</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow><TableCell colSpan={14}>No rows.</TableCell></TableRow>
                    ) : rows.map((row) => {
                      const draft = drafts[row.rollNo] ?? rowToDraft(row)
                      const editable = new Set(editablePapers(row))
                      const cell = (key: keyof DraftMarks) => (
                        <TextField
                          size="small"
                          value={draft[key]}
                          disabled={isLocked || !editable.has(key)}
                          onChange={(e) => setDrafts((c) => ({
                            ...c,
                            [row.rollNo]: { ...draft, [key]: e.target.value },
                          }))}
                          sx={{ width: 64 }}
                        />
                      )
                      return (
                        <TableRow key={row.rollNo} hover>
                          <TableCell>{row.rollNo}</TableCell>
                          <TableCell>{row.khandAppearing ?? '-'}</TableCell>
                          <TableCell>{row.flgPortion ?? 'N'}</TableCell>
                          <TableCell>{cell('paper1')}</TableCell>
                          <TableCell>{cell('paper2')}</TableCell>
                          <TableCell>{cell('paper3')}</TableCell>
                          <TableCell>{cell('paper4')}</TableCell>
                          <TableCell>{cell('paper5')}</TableCell>
                          <TableCell>{cell('paper6')}</TableCell>
                          <TableCell>{cell('paper7')}</TableCell>
                          <TableCell>{cell('paper8')}</TableCell>
                          <TableCell>{cell('oral')}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
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
