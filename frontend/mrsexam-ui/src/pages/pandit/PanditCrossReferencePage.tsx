import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

import { panditApi } from '../../api/pandit/client'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
}

export const PanditCrossReferencePage = ({ defaultSessionNo }: Props) => {
  const [status, setStatus] = useState<{
    total: number
    bothKhand: number
    resDecl: number
    withOthRoll: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadStatus = async () => {
    const data = await panditApi.crossReferenceStatus()
    setStatus({
      total: data.total,
      bothKhand: data.bothKhand,
      resDecl: data.resDecl,
      withOthRoll: data.withOthRoll,
    })
  }

  useEffect(() => {
    void loadStatus().catch(() => setStatus(null))
  }, [])

  const onRun = async () => {
    setError(null)
    setSuccess(null)
    try {
      const result = await panditApi.runCrossReference()
      await loadStatus()
      setSuccess(
        `Linked ${result.pairsLinked} pair update(s). Khand I=${result.khand1Count}, Khand II=${result.khand2Count}.`,
      )
    } catch (err) {
      setError(panditApi.messageFromError(err, 'Cross reference failed.'))
    }
  }

  return (
    <PageFrame
      title="Cross Reference"
      description={`Session ${defaultSessionNo ?? '-'}. Conservatively links Khand I/II by same name+centres or OthKhandRollNo; sets BothKhandFlag and ResDeclFlag.`}
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            {status ? (
              <Typography color="text.secondary">
                Total {status.total} · BothKhand {status.bothKhand} · ResDecl {status.resDecl} · With OthRoll {status.withOthRoll}
              </Typography>
            ) : null}
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => void onRun()}>Run Cross Reference</Button>
              <Button variant="outlined" onClick={() => void loadStatus()}>Refresh Status</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </PageFrame>
  )
}
