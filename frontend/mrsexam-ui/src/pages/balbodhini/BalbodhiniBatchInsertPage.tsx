import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'

import { balbodhiniApi } from '../../api/balbodhini/client'
import { CentersService, RegionsService, type Center, type Region } from '../../api/generatedClient'
import { httpClient } from '../../api/httpClient'
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

export const BalbodhiniBatchInsertPage = ({ defaultSessionNo }: Props) => {
  const [centres, setCentres] = useState<Center[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [centreCode, setCentreCode] = useState('')
  const [regionNo, setRegionNo] = useState<number | ''>('')
  const [startRollNo, setStartRollNo] = useState('')
  const [endRollNo, setEndRollNo] = useState('')
  const [startName, setStartName] = useState('')
  const [endName, setEndName] = useState('')
  const [phoneticAssist, setPhoneticAssist] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void Promise.all([
      CentersService.getApiCenters(),
      RegionsService.getApiRegions(),
    ]).then(([centresPayload, regionsPayload]) => {
      setCentres(toList<Center>(centresPayload))
      setRegions(toList<Region>(regionsPayload))
    }).catch(() => {
      setCentres([])
      setRegions([])
    })
  }, [])

  const selectedCentre = useMemo(
    () => centres.find((centre) => centre.centreNo === centreCode) ?? null,
    [centres, centreCode],
  )

  useEffect(() => {
    if (!selectedCentre?.districtName) return
    // Region is derived on the server for candidates; for batch the BRD stores entered region.
    // Keep region selectable and prefilled when possible via region list only.
  }, [selectedCentre])

  const onSubmit = async () => {
    setError(null)
    setSuccess(null)
    if (typeof defaultSessionNo !== 'number') {
      setError('Select a default session first.')
      return
    }
    if (!centreCode || regionNo === '' || !startRollNo || !endRollNo) {
      setError('Centre, region, and roll range are required.')
      return
    }
    setIsSaving(true)
    try {
      await httpClient.post('/api/candidates/batch', {
        centreCode,
        regionNo: Number(regionNo),
        startRollNo: Number(startRollNo),
        endRollNo: Number(endRollNo),
        startName: startName.trim() || undefined,
        endName: endName.trim() || undefined,
        userId: localStorage.getItem('currentUserId') ?? undefined,
      })
      setSuccess(`Inserted rolls ${startRollNo} to ${endRollNo}. Middle names stored as "-".`)
      setStartRollNo('')
      setEndRollNo('')
      setStartName('')
      setEndName('')
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Batch insert failed.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageFrame
      title="Batch Insert"
      description="Supervisor insert for a roll range. Start and end names are stored; names in between are '-'."
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              }}
            >
              <TextField size="small" label="Session" value={defaultSessionNo ?? ''} InputProps={{ readOnly: true }} fullWidth />
              <FormControl size="small" fullWidth>
                <InputLabel id="batch-centre-label">Centre</InputLabel>
                <Select
                  labelId="batch-centre-label"
                  label="Centre"
                  value={centreCode}
                  onChange={(e) => setCentreCode(String(e.target.value))}
                >
                  {centres.map((centre) => (
                    <MenuItem key={centre.centreNo} value={centre.centreNo}>
                      {centre.centreNo}{centre.centreName ? ` · ${centre.centreName}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="batch-region-label">Region</InputLabel>
                <Select
                  labelId="batch-region-label"
                  label="Region"
                  value={regionNo}
                  onChange={(e) => setRegionNo(Number(e.target.value))}
                >
                  {regions.map((region) => (
                    <MenuItem key={region.regionNo} value={region.regionNo}>
                      {region.regionNo}{region.regionName ? ` · ${region.regionName}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <TextField size="small" label="Start Roll" type="number" value={startRollNo} onChange={(e) => setStartRollNo(e.target.value)} fullWidth />
              <TextField size="small" label="End Roll" type="number" value={endRollNo} onChange={(e) => setEndRollNo(e.target.value)} fullWidth />
            </Box>

            <MarathiPhoneticToggle
              enabled={phoneticAssist}
              disabled={isSaving}
              onChange={setPhoneticAssist}
            />

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <MarathiNameField
                label="Start Name (Marathi)"
                value={startName}
                required={false}
                phoneticAssist={phoneticAssist}
                showAssistControls={false}
                onChange={setStartName}
                helperText=""
              />
              <MarathiNameField
                label="End Name (Marathi)"
                value={endName}
                required={false}
                phoneticAssist={phoneticAssist}
                showAssistControls={false}
                onChange={setEndName}
                helperText=""
              />
            </Box>

            <Button variant="contained" onClick={() => void onSubmit()} disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
              {isSaving ? 'Inserting...' : 'Insert batch'}
            </Button>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
