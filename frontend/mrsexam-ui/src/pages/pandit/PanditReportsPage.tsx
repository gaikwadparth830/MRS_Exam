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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import {
  panditApi,
  type AttendanceReport,
  type CertificateReport,
  type NameListReport,
  type RegisterReport,
  type ResultSheetReport,
} from '../../api/pandit/client'
import { CentersService, RegionsService, type Center, type Region } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { PageFrame } from '../../layout/PageFrame'
import type { NavItemId } from '../../layout/navConfig'

type ReportKind =
  | 'report-attendance'
  | 'report-name-list'
  | 'report-result-sheet'
  | 'report-certificate'
  | 'report-register'
  | 'report-ranks'
  | 'report-students-passing'
  | 'report-lost-by-2'

type Props = {
  reportId: ReportKind
  defaultSessionNo?: number
}

const titles: Record<ReportKind, { title: string; description: string }> = {
  'report-attendance': { title: 'Attendance Sheet', description: 'Exam-centre roll pairs.' },
  'report-name-list': { title: 'Name List', description: 'Candidate name list by centre/region.' },
  'report-result-sheet': { title: 'Result Sheet', description: 'With or without names.' },
  'report-certificate': { title: 'Certificate', description: 'Pass / Khand pass candidates.' },
  'report-register': { title: 'Register', description: 'Centre counts and pass rates.' },
  'report-ranks': { title: 'Ranks', description: 'FIRST / SECOND special ranks.' },
  'report-students-passing': { title: 'Students Passing', description: 'Exam Pass / Khand pass list.' },
  'report-lost-by-2': { title: 'Lost by 2 Marks', description: 'Near-miss fail candidates.' },
}

const toList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload as T[] : [])

export const isPanditReportNavId = (id: NavItemId): id is ReportKind =>
  id === 'report-attendance'
  || id === 'report-name-list'
  || id === 'report-result-sheet'
  || id === 'report-certificate'
  || id === 'report-register'
  || id === 'report-ranks'
  || id === 'report-students-passing'
  || id === 'report-lost-by-2'

export const PanditReportsPage = ({ reportId, defaultSessionNo }: Props) => {
  const meta = titles[reportId]
  const [centres, setCentres] = useState<Center[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [centreNo, setCentreNo] = useState('')
  const [regionNo, setRegionNo] = useState<number | ''>('')
  const [mode, setMode] = useState<'named' | 'noname'>('named')
  const [fromRoll, setFromRoll] = useState('')
  const [toRoll, setToRoll] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null)
  const [nameList, setNameList] = useState<NameListReport | null>(null)
  const [resultSheet, setResultSheet] = useState<ResultSheetReport | null>(null)
  const [certificates, setCertificates] = useState<CertificateReport | null>(null)
  const [register, setRegister] = useState<RegisterReport | null>(null)
  const [genericRows, setGenericRows] = useState<Array<Record<string, unknown>>>([])

  useEffect(() => {
    void Promise.all([CentersService.getApiCenters(), RegionsService.getApiRegions()])
      .then(([c, r]) => {
        setCentres(toList<Center>(c))
        setRegions(toList<Region>(r))
      })
      .catch(() => {
        setCentres([])
        setRegions([])
      })
  }, [])

  useEffect(() => {
    setAttendance(null)
    setNameList(null)
    setResultSheet(null)
    setCertificates(null)
    setRegister(null)
    setGenericRows([])
    setError(null)
  }, [reportId])

  const header = useMemo(
    () => attendance?.header ?? nameList?.header ?? resultSheet?.header ?? certificates?.header ?? register?.header ?? null,
    [attendance, nameList, resultSheet, certificates, register],
  )

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    try {
      if (reportId === 'report-attendance') {
        if (!centreNo.trim()) throw new Error('Select exam centre.')
        setAttendance(await panditApi.getAttendanceReport(centreNo.trim()))
      } else if (reportId === 'report-name-list') {
        setNameList(await panditApi.getNameListReport(
          centreNo.trim() || undefined,
          regionNo === '' ? undefined : Number(regionNo),
        ))
      } else if (reportId === 'report-result-sheet') {
        setResultSheet(await panditApi.getResultSheetReport({
          mode,
          centreNo: centreNo.trim() || undefined,
          regionNo: regionNo === '' ? undefined : Number(regionNo),
        }))
      } else if (reportId === 'report-certificate') {
        setCertificates(await panditApi.getCertificateReport({
          regionNo: regionNo === '' ? undefined : Number(regionNo),
          formCentre: centreNo.trim() || undefined,
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
      } else if (reportId === 'report-register') {
        setRegister(await panditApi.getRegisterReport(regionNo === '' ? undefined : Number(regionNo)))
      } else if (reportId === 'report-ranks') {
        const data = await panditApi.getRanksReport() as { rows?: Array<Record<string, unknown>> }
        setGenericRows(data.rows ?? [])
      } else if (reportId === 'report-students-passing') {
        const data = await panditApi.getStudentsPassingReport(
          centreNo.trim() || undefined,
          regionNo === '' ? undefined : Number(regionNo),
        ) as { rows?: Array<Record<string, unknown>> }
        setGenericRows(data.rows ?? [])
      } else {
        const data = await panditApi.getLostBy2Report(
          regionNo === '' ? undefined : Number(regionNo),
        ) as { rows?: Array<Record<string, unknown>> }
        setGenericRows(data.rows ?? [])
      }
    } catch (err) {
      setError(panditApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageFrame
      title={meta.title}
      description={meta.description}
      actions={(
        <Button variant="contained" onClick={() => void onGenerate()} disabled={isLoading}>
          {isLoading ? 'Generating…' : 'Generate'}
        </Button>
      )}
    >
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Session {defaultSessionNo ?? header?.sessionNo ?? '-'}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {(reportId === 'report-attendance'
                  || reportId === 'report-name-list'
                  || reportId === 'report-result-sheet'
                  || reportId === 'report-certificate'
                  || reportId === 'report-students-passing') ? (
                  <CentreSearchField
                    label={reportId === 'report-attendance' ? 'Exam Centre *' : 'Centre'}
                    centres={centres}
                    value={centreNo}
                    allowEmpty={reportId !== 'report-attendance'}
                    onChange={setCentreNo}
                  />
                ) : null}

                {(reportId !== 'report-attendance' && reportId !== 'report-ranks') ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="pandit-report-region">Region</InputLabel>
                    <Select
                      labelId="pandit-report-region"
                      label="Region"
                      value={regionNo}
                      onChange={(e) => {
                        const next = e.target.value as number | ''
                        setRegionNo(next === '' ? '' : Number(next))
                      }}
                    >
                      <MenuItem value="">All regions</MenuItem>
                      {regions.map((region) => (
                        <MenuItem key={region.regionNo} value={region.regionNo}>
                          {region.regionNo}{region.regionName ? ` · ${region.regionName}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}

                {reportId === 'report-result-sheet' ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="pandit-report-mode">Layout</InputLabel>
                    <Select
                      labelId="pandit-report-mode"
                      label="Layout"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'named' | 'noname')}
                    >
                      <MenuItem value="named">With names</MenuItem>
                      <MenuItem value="noname">Without names</MenuItem>
                    </Select>
                  </FormControl>
                ) : null}

                {reportId === 'report-certificate' ? (
                  <>
                    <TextField size="small" label="From Roll" value={fromRoll} onChange={(e) => setFromRoll(e.target.value)} />
                    <TextField size="small" label="To Roll" value={toRoll} onChange={(e) => setToRoll(e.target.value)} />
                  </>
                ) : null}
              </Box>
              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>

        {attendance ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{attendance.header.title}</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll 1</TableCell>
                    <TableCell>Roll 2</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.pairs.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.rollNo1 ?? '-'}</TableCell>
                      <TableCell>{p.rollNo2 ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {nameList ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{nameList.header.title} ({nameList.rows.length})</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Centre</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nameList.rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.rollNo}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.examCentre}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {resultSheet ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{resultSheet.header.title}</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll</TableCell>
                    {resultSheet.mode === 'named' ? <TableCell>Name</TableCell> : null}
                    <TableCell>Tot</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultSheet.rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.rollNo}</TableCell>
                      {resultSheet.mode === 'named' ? <TableCell>{r.name}</TableCell> : null}
                      <TableCell>{r.totMarks ?? '-'}</TableCell>
                      <TableCell>{r.grade ?? '-'}</TableCell>
                      <TableCell>{r.result ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {certificates ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{certificates.header.title}</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Roll</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Result</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certificates.rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.rollNo}</TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.grade}</TableCell>
                      <TableCell>{r.result}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {register ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {register.header.title} · Pass {register.passCount}/{register.totalCandidates} ({register.passPercent}%)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Centre</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Pass</TableCell>
                    <TableCell>Fail</TableCell>
                    <TableCell>Absent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {register.rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.examCentre} {r.centreName ? `· ${r.centreName}` : ''}</TableCell>
                      <TableCell>{r.regionNo}</TableCell>
                      <TableCell>{r.candidateCount}</TableCell>
                      <TableCell>{r.passCount}</TableCell>
                      <TableCell>{r.failCount}</TableCell>
                      <TableCell>{r.absentCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {genericRows.length > 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{meta.title} ({genericRows.length})</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.keys(genericRows[0]).map((k) => (
                      <TableCell key={k}>{k}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {genericRows.map((row, i) => (
                    <TableRow key={i}>
                      {Object.keys(genericRows[0]).map((k) => (
                        <TableCell key={k}>{String(row[k] ?? '-')}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </Stack>
    </PageFrame>
  )
}
