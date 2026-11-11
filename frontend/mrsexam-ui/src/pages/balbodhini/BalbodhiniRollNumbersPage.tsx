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
  TextField,
} from '@mui/material'

import { balbodhiniApi } from '../../api/balbodhini/client'
import { RegionsService, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
  mode?: 'regular' | 'aur' | 'clear'
}

const toRegionList = (payload: unknown): Region[] => {
  if (Array.isArray(payload)) return payload as Region[]
  if (payload && typeof payload === 'object') {
    const data = (payload as Record<string, unknown>).data
    if (Array.isArray(data)) return data as Region[]
  }
  return []
}

export const BalbodhiniRollNumbersPage = ({ defaultSessionNo, mode = 'regular' }: Props) => {
  const [regions, setRegions] = useState<Region[]>([])
  const [seatRegionNo, setSeatRegionNo] = useState('')
  const [formCentre, setFormCentre] = useState('')
  const [firstRollNo, setFirstRollNo] = useState('')
  const [lastRollNo, setLastRollNo] = useState('')
  const [suggestedFirst, setSuggestedFirst] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmName, setConfirmName] = useState<string | null>(null)
  const [pendingPayload, setPendingPayload] = useState<{
    seatRegionNo: number
    formCentre: string
    firstRollNo: number
    lastRollNo: number
  } | null>(null)

  useEffect(() => {
    void RegionsService.getApiRegions()
      .then((payload) => setRegions(toRegionList(payload)))
      .catch(() => setRegions([]))
  }, [])

  const seatRegions = Array.from(
    new Map(
      regions
        .filter((region) => region.seatRegionNo != null)
        .map((region) => [region.seatRegionNo as number, region.seatRegionNo as number]),
    ).values(),
  ).sort((a, b) => a - b)

  const loadNextCentre = async (seat: number) => {
    try {
      const next = await balbodhiniApi.nextCentre(seat)
      if (next.formCentre) setFormCentre(next.formCentre)
      if (typeof next.suggestedFirstRollNo === 'number') {
        setSuggestedFirst(next.suggestedFirstRollNo)
        setFirstRollNo(String(next.suggestedFirstRollNo))
      }
    } catch {
      // optional helper
    }
  }

  const onPreviewAndConfirm = async () => {
    setError(null)
    setSuccess(null)
    const seat = Number(seatRegionNo)
    const first = Number(firstRollNo)
    const last = Number(lastRollNo)
    if (!Number.isFinite(seat) || !formCentre.trim()) {
      setError('Seat region and form centre are required.')
      return
    }
    if (!Number.isFinite(first) || !Number.isFinite(last) || last < first) {
      setError('Enter a valid inclusive roll range.')
      return
    }
    try {
      const preview = await balbodhiniApi.previewRolls({
        seatRegionNo: seat,
        formCentre: formCentre.trim(),
        firstRollNo: first,
        lastRollNo: last,
      })
      setPendingPayload({
        seatRegionNo: seat,
        formCentre: formCentre.trim(),
        firstRollNo: first,
        lastRollNo: last,
      })
      setConfirmName(preview.lastCandidateName ?? '-')
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Preview failed.'))
    }
  }

  const onCommit = async () => {
    if (!pendingPayload) return
    try {
      await balbodhiniApi.commitRolls({ ...pendingPayload, confirmed: true })
      setSuccess(`Assigned rolls ${pendingPayload.firstRollNo}-${pendingPayload.lastRollNo}.`)
      setConfirmName(null)
      setPendingPayload(null)
      await loadNextCentre(pendingPayload.seatRegionNo)
      setLastRollNo('')
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Commit failed.'))
    }
  }

  const onClear = async () => {
    if (!formCentre.trim()) {
      setError('Form centre is required.')
      return
    }
    if (!window.confirm('Clear roll numbers from this centre onward in its region?')) return
    try {
      const data = await balbodhiniApi.clearRolls(formCentre.trim())
      setSuccess(`Cleared ${data.cleared ?? 0} roll numbers.`)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Clear failed.'))
    }
  }

  const onAur = async () => {
    setError(null)
    setSuccess(null)
    const seat = Number(seatRegionNo)
    if (!Number.isFinite(seat) || !formCentre.trim()) {
      setError('Seat region and form centre are required.')
      return
    }
    try {
      const preview = await balbodhiniApi.aurPreview(seat, formCentre.trim())
      if (!window.confirm(`Assign ${preview.rollCount} Aur roll numbers ending with ${preview.lastCandidateName ?? '-'}?`)) {
        return
      }
      await balbodhiniApi.aurCommit(seat, formCentre.trim())
      setSuccess(`Assigned ${preview.rollCount} Aur roll numbers.`)
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, 'Aur assignment failed.'))
    }
  }

  const title = mode === 'aur'
    ? 'Aur Roll Numbers'
    : mode === 'clear'
      ? 'Clear Roll Numbers'
      : 'Set Roll Numbers'

  const description = mode === 'aur'
    ? `Session ${defaultSessionNo ?? '-'}. Numbers only rows with null roll numbers.`
    : mode === 'clear'
      ? `Session ${defaultSessionNo ?? '-'}. Clears rolls from the selected centre onward in its region.`
      : `Session ${defaultSessionNo ?? '-'}. Confirm the last candidate name (Bitti) before commit.`

  return (
    <PageFrame title={title} description={description}>
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            <TextField
              select
              label="Seat Region"
              value={seatRegionNo}
              onChange={(e) => {
                setSeatRegionNo(e.target.value)
                const seat = Number(e.target.value)
                if (Number.isFinite(seat)) void loadNextCentre(seat)
              }}
              SelectProps={{ native: true }}
              sx={{ minWidth: 180 }}
            >
              <option value="" />
              {seatRegions.map((seat) => (
                <option key={seat} value={seat}>{seat}</option>
              ))}
            </TextField>
            <TextField
              label="Form Centre"
              value={formCentre}
              onChange={(e) => setFormCentre(e.target.value)}
            />
            {mode === 'regular' ? (
              <>
                <TextField
                  label="First Roll"
                  type="number"
                  value={firstRollNo}
                  onChange={(e) => setFirstRollNo(e.target.value)}
                  helperText={suggestedFirst != null ? `Suggested: ${suggestedFirst}` : undefined}
                />
                <TextField
                  label="Last Roll"
                  type="number"
                  value={lastRollNo}
                  onChange={(e) => setLastRollNo(e.target.value)}
                />
                <Button variant="contained" onClick={() => void onPreviewAndConfirm()}>Preview / Set</Button>
              </>
            ) : null}
            {mode === 'aur' ? (
              <Button variant="contained" onClick={() => void onAur()}>Assign Aur Rolls</Button>
            ) : null}
            {mode === 'clear' ? (
              <Button color="warning" variant="contained" onClick={() => void onClear()}>Clear Rolls</Button>
            ) : null}
          </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={Boolean(confirmName)} onClose={() => setConfirmName(null)}>
        <DialogTitle>Confirm last candidate (Bitti)</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Last candidate name is <strong>{confirmName}</strong>. Keep these roll numbers?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmName(null); setPendingPayload(null) }}>Reject</Button>
          <Button variant="contained" onClick={() => void onCommit()}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </PageFrame>
  )
}
