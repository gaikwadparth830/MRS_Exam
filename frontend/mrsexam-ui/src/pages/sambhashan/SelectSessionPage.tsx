import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'

import { SessionsService, type Session } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  currentDefaultSession: Session | null
  onDefaultSessionChanged: (session: Session | null) => void
}

const toSessionList = (payload: unknown): Session[] => {
  if (Array.isArray(payload)) return payload as Session[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Session[]
  }
  return []
}

export const SelectSessionPage = ({
  currentDefaultSession,
  onDefaultSessionChanged,
}: Props) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSessionNo, setSelectedSessionNo] = useState<number | ''>(
    currentDefaultSession?.sessionNo ?? '',
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSessions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const payload = await SessionsService.getApiSessions()
      const list = toSessionList(payload)
      setSessions(list)
      return list
    } catch {
      setSessions([])
      setError('Unable to load sessions.')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSessions()
  }, [])

  useEffect(() => {
    setSelectedSessionNo(currentDefaultSession?.sessionNo ?? '')
  }, [currentDefaultSession])

  const onSubmit = async () => {
    if (selectedSessionNo === '') {
      setError('Please select a session.')
      return
    }
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await SessionsService.postApiSessionsSetdefaultsession({ id: Number(selectedSessionNo) })
      const updated = await loadSessions()
      const next =
        updated.find((session) => session.sessionNo === Number(selectedSessionNo))
        ?? updated.find((session) => session.defa?.trim().toUpperCase() === 'Y')
        ?? null
      onDefaultSessionChanged(next)
      setSuccess('Default session updated.')
    } catch {
      setError('Unable to update default session.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageFrame
      title="Select Session"
      description="Operational entry uses the session marked as default (defa = Y)."
    >
      <Card>
        <CardContent>
          <Stack spacing={2.5} sx={{ maxWidth: 480 }}>
            <FormControl fullWidth>
              <InputLabel id="session-select-label">Session</InputLabel>
              <Select
                labelId="session-select-label"
                label="Session"
                value={selectedSessionNo}
                disabled={isLoading || isSaving}
                onChange={(event) => setSelectedSessionNo(Number(event.target.value))}
              >
                {sessions.map((session) => (
                  <MenuItem key={session.sessionNo} value={session.sessionNo}>
                    {session.sessionNo}
                    {session.month ? ` · ${session.month}` : ''}
                    {session.defa?.trim().toUpperCase() === 'Y' ? ' (current)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => void onSubmit()} disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Set as default'}
            </Button>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
