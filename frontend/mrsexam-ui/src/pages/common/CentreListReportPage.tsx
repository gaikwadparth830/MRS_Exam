import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'

import { centreListApi, type CentreListReport } from '../../api/common/centreListClient'
import { CentreListPrint } from '../../components/reports/CentreListPrint'
import { PageFrame } from '../../layout/PageFrame'

const PRINT_ID = 'centre-list-print'

/** Common report — legacy Rpt_CentreList / केंद्र सूची. */
export const CentreListReportPage = () => {
  const [report, setReport] = useState<CentreListReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = 'MRS Exam'
    return () => {
      document.title = previous
    }
  }, [])

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    setReport(null)
    try {
      setReport(await centreListApi.getReport())
    } catch (err) {
      setError(centreListApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageFrame
      title="Centre List"
      description="केंद्र सूची — centre number, name, and address for all centres."
      actions={(
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => void onGenerate()} disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Generate'}
          </Button>
          <Button
            variant="outlined"
            disabled={!report}
            onClick={() => {
              document.title = 'MRS Exam'
              window.print()
            }}
          >
            Print
          </Button>
        </Stack>
      )}
    >
      <Stack spacing={2}>
        <Card className="no-print">
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Shared centre master list (all exams).
              </Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>

        {report ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <CentreListPrint printId={PRINT_ID} report={report} />
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" className="no-print">
            Click Generate to preview the centre list.
          </Alert>
        )}
      </Stack>
    </PageFrame>
  )
}
