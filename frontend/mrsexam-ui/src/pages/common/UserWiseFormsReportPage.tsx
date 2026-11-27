import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from '@mui/material'

import { userWiseFormsApi, type UserWiseFormsReport } from '../../api/common/userWiseFormsClient'
import { UserWiseFormsPrint } from '../../components/reports/UserWiseFormsPrint'
import { PageFrame } from '../../layout/PageFrame'

type Props = {
  defaultSessionNo?: number
}

const PRINT_ID = 'userwise-forms-print'

/**
 * Common supervisor report (legacy Frm_Userwiselist_Totforms).
 * Counts forms entered in the default session for every exam, All or one user.
 */
export const UserWiseFormsReportPage = ({ defaultSessionNo }: Props) => {
  const [scope, setScope] = useState<'all' | 'user'>('all')
  const [userId, setUserId] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [report, setReport] = useState<UserWiseFormsReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Common report — keep browser/print chrome title neutral (title is already in the report body).
    const previous = document.title
    document.title = 'MRS Exam'
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    let mounted = true
    void userWiseFormsApi.listUsers()
      .then((list) => {
        if (mounted) setUsers(list)
      })
      .catch(() => {
        if (mounted) setUsers([])
      })
    return () => {
      mounted = false
    }
  }, [])

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    setReport(null)
    try {
      if (scope === 'user' && !userId.trim()) {
        throw new Error('Select a user.')
      }
      setReport(await userWiseFormsApi.getReport(
        scope === 'user' ? userId.trim() : undefined,
      ))
    } catch (err) {
      setError(userWiseFormsApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageFrame
      title="UserWise Total Number Of Forms"
      description="Common supervisor report — forms entered in the default session for all exams."
      actions={(
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => void onGenerate()} disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Print Preview'}
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
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Session {defaultSessionNo ?? report?.header.sessionNo ?? '-'}
                {report?.header.month ? ` · ${report.header.month}` : ''}
              </Typography>

              <Typography variant="subtitle1" fontWeight={700}>
                UserWise Total Number Of Forms Entered in the session
              </Typography>

              <RadioGroup
                row
                value={scope}
                onChange={(e) => {
                  const next = e.target.value as 'all' | 'user'
                  setScope(next)
                  setReport(null)
                  if (next === 'all') setUserId('')
                }}
              >
                <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                <FormControlLabel value="user" control={<Radio size="small" />} label="UserWise" />
              </RadioGroup>

              {scope === 'user' ? (
                <Box sx={{ maxWidth: 360 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="userwise-user-label">User</InputLabel>
                    <Select
                      labelId="userwise-user-label"
                      label="User"
                      value={userId}
                      onChange={(e) => {
                        setUserId(String(e.target.value))
                        setReport(null)
                      }}
                    >
                      <MenuItem value="" disabled>Select user</MenuItem>
                      {users.map((id) => (
                        <MenuItem key={id} value={id}>{id}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : null}

              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>

        {report ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <UserWiseFormsPrint printId={PRINT_ID} report={report} />
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" className="no-print">
            Choose All or UserWise, then Print Preview.
          </Alert>
        )}
      </Stack>
    </PageFrame>
  )
}
