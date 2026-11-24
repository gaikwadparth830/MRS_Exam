import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
} from '@mui/material'

import { panditApi } from '../../api/pandit/client'
import { CentersService, type Center } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { MarathiNameField, MarathiPhoneticToggle } from '../../components/MarathiNameField'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
}

const toList = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as T[]
  }
  return []
}

export const PanditBatchInsertPage = ({ defaultSessionNo }: Props) => {
  const [centres, setCentres] = useState<Center[]>([])
  const [centreCode, setCentreCode] = useState('')
  const [startRollNo, setStartRollNo] = useState('')
  const [endRollNo, setEndRollNo] = useState('')
  const [startName, setStartName] = useState('')
  const [endName, setEndName] = useState('')
  const [phoneticAssist, setPhoneticAssist] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void CentersService.getApiCenters()
      .then((payload) => setCentres(toList<Center>(payload)))
      .catch(() => setCentres([]))
  }, [])

  const onSubmit = async () => {
    setError(null)
    setSuccess(null)
    if (typeof defaultSessionNo !== 'number') {
      setError('Select a default session first.')
      return
    }
    if (!centreCode || !startRollNo || !endRollNo) {
      setError('Centre and roll range are required.')
      return
    }
    setIsSaving(true)
    try {
      const result = await panditApi.batchInsert({
        centreCode,
        startRollNo: Number(startRollNo),
        endRollNo: Number(endRollNo),
        startName: startName.trim() || undefined,
        endName: endName.trim() || undefined,
        userId: localStorage.getItem('currentUserId') ?? undefined,
      })
      setSuccess(`Inserted ${result.inserted} rows (Und=N, Khand=I, Portion=N).`)
      setStartRollNo('')
      setEndRollNo('')
      setStartName('')
      setEndName('')
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Batch insert failed.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageFrame
      title="Batch Insert"
      description="Insert roll range with centre, Und=N, Khand I, Portion N. Middle names stored as '-'."
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <MarathiPhoneticToggle enabled={phoneticAssist} onChange={setPhoneticAssist} />
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <CentreSearchField
                label="Centre"
                value={centreCode}
                centres={centres}
                onChange={setCentreCode}
              />
              <TextField label="Start roll" value={startRollNo} onChange={(e) => setStartRollNo(e.target.value)} />
              <TextField label="End roll" value={endRollNo} onChange={(e) => setEndRollNo(e.target.value)} />
              <MarathiNameField
                label="Start name"
                value={startName}
                phoneticAssist={phoneticAssist}
                onChange={setStartName}
              />
              <MarathiNameField
                label="End name"
                value={endName}
                phoneticAssist={phoneticAssist}
                onChange={setEndName}
              />
            </Box>
            <Button variant="contained" disabled={isSaving} onClick={() => void onSubmit()} sx={{ alignSelf: 'flex-start' }}>
              Insert
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
