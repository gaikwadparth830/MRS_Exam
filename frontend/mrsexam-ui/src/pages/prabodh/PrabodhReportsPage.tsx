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
  prabodhApi,
  type AttendanceReport,
  type CertificateReport,
  type HallTicketReport,
  type LostByTwoReport,
  type MarkSheetReport,
  type NameListReport,
  type RegisterReport,
  type ResultSheetReport,
} from '../../api/prabodh/client'
import { CentersService, RegionsService, type Center, type Region } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { AttendanceSheetPrint } from '../../components/reports/AttendanceSheetPrint'
import { ReportPrintChrome } from '../../components/reports/ReportPrintChrome'
import { PageFrame } from '../../layout/PageFrame'
import type { NavItemId } from '../../layout/navConfig'

type ReportKind =
  | 'report-attendance'
  | 'report-name-list'
  | 'report-result-sheet'
  | 'report-mark-sheet'
  | 'report-hall-ticket'
  | 'report-certificate'
  | 'report-register'
  | 'report-lost-by-2'

type Props = {
  reportId: ReportKind
  defaultSessionNo?: number
}

const titles: Record<ReportKind, { title: string; description: string }> = {
  'report-attendance': {
    title: 'Attendance Sheet',
    description: 'Select one or more centres. Each centre prints on a new page.',
  },
  'report-name-list': {
    title: 'Name List',
    description: 'Roll, name, form/exam centre, gender, region.',
  },
  'report-result-sheet': {
    title: 'Result Sheet',
    description: 'Pass/fail sheet with Marks1–3, Oral, Total, Grade, Result, Rank.',
  },
  'report-mark-sheet': {
    title: 'Mark Sheet',
    description: 'Per-student marks, oral, total, grade, result, rank.',
  },
  'report-hall-ticket': {
    title: 'Hall Ticket',
    description: 'Pre-exam admit list for assigned rolls.',
  },
  'report-certificate': {
    title: 'Certificate',
    description: 'Pass candidates for certificate print by region and roll range.',
  },
  'report-register': {
    title: 'Register',
    description: 'Rebuilds dummy centre codes and prints region/centre counts.',
  },
  'report-lost-by-2': {
    title: 'Lost by 2 Marks',
    description: 'Fail candidates within 2 marks of pass thresholds.',
  },
}

const toList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload as T[] : [])
const PRINT_ID = 'Prabodh-report-print'

export const PrabodhReportsPage = ({ reportId, defaultSessionNo }: Props) => {
  const meta = titles[reportId]
  const [centres, setCentres] = useState<Center[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [centreNo, setCentreNo] = useState('')
  const [attendanceCentreNos, setAttendanceCentreNos] = useState<string[]>([])
  const [regionNo, setRegionNo] = useState<number | ''>('')
  const [mode, setMode] = useState<'named' | 'noname'>('named')
  const [fromRoll, setFromRoll] = useState('')
  const [toRoll, setToRoll] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [attendanceSections, setAttendanceSections] = useState<AttendanceReport[]>([])
  const [nameList, setNameList] = useState<NameListReport | null>(null)
  const [resultSheet, setResultSheet] = useState<ResultSheetReport | null>(null)
  const [markSheet, setMarkSheet] = useState<MarkSheetReport | null>(null)
  const [hallTicket, setHallTicket] = useState<HallTicketReport | null>(null)
  const [certificates, setCertificates] = useState<CertificateReport | null>(null)
  const [register, setRegister] = useState<RegisterReport | null>(null)
  const [lostByTwo, setLostByTwo] = useState<LostByTwoReport | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [centrePayload, regionPayload] = await Promise.all([
          CentersService.getApiCenters(),
          RegionsService.getApiRegions(),
        ])
        if (!mounted) return
        setCentres(toList<Center>(centrePayload))
        setRegions(toList<Region>(regionPayload))
      } catch {
        if (mounted) {
          setCentres([])
          setRegions([])
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const clearResults = () => {
    setAttendanceSections([])
    setNameList(null)
    setResultSheet(null)
    setMarkSheet(null)
    setHallTicket(null)
    setCertificates(null)
    setRegister(null)
    setLostByTwo(null)
  }

  useEffect(() => {
    clearResults()
    setError(null)
  }, [reportId])

  const header = useMemo(() => {
    return attendanceSections[0]?.header
      ?? nameList?.header
      ?? resultSheet?.header
      ?? markSheet?.header
      ?? hallTicket?.header
      ?? certificates?.header
      ?? register?.header
      ?? lostByTwo?.header
      ?? null
  }, [attendanceSections, nameList, resultSheet, markSheet, hallTicket, certificates, register, lostByTwo])

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    clearResults()
    try {
      if (reportId === 'report-attendance') {
        const codes = attendanceCentreNos.map((c) => c.trim()).filter(Boolean)
        if (codes.length < 1) throw new Error('Select at least one exam centre.')
        const sections = await Promise.all(codes.map((code) => prabodhApi.getAttendanceReport(code)))
        setAttendanceSections(sections)
      } else if (reportId === 'report-name-list') {
        setNameList(await prabodhApi.getNameListReport(centreNo.trim() || undefined))
      } else if (reportId === 'report-result-sheet') {
        setResultSheet(await prabodhApi.getResultSheetReport({
          mode,
          centreNo: centreNo.trim() || undefined,
          regionNo: regionNo === '' ? undefined : Number(regionNo),
        }))
      } else if (reportId === 'report-mark-sheet') {
        setMarkSheet(await prabodhApi.getMarkSheetReport({
          regionNo: regionNo === '' ? undefined : Number(regionNo),
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
      } else if (reportId === 'report-hall-ticket') {
        setHallTicket(await prabodhApi.getHallTicketReport({
          centreNo: centreNo.trim() || undefined,
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
      } else if (reportId === 'report-certificate') {
        if (regionNo === '') throw new Error('Select region.')
        setCertificates(await prabodhApi.getCertificateReport({
          regionNo: Number(regionNo),
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
      } else if (reportId === 'report-lost-by-2') {
        setLostByTwo(await prabodhApi.getLostByTwoReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      } else {
        setRegister(await prabodhApi.getRegisterReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      }
    } catch (err) {
      setError(prabodhApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  const showCentre = reportId === 'report-attendance'
    || reportId === 'report-name-list'
    || reportId === 'report-result-sheet'
    || reportId === 'report-hall-ticket'

  const showRegion = reportId === 'report-result-sheet'
    || reportId === 'report-mark-sheet'
    || reportId === 'report-certificate'
    || reportId === 'report-register'
    || reportId === 'report-lost-by-2'

  const showRollRange = reportId === 'report-mark-sheet'
    || reportId === 'report-hall-ticket'
    || reportId === 'report-certificate'

  return (
    <PageFrame
      title={meta.title}
      description={meta.description}
      actions={(
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => void onGenerate()} disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Generate'}
          </Button>
          <Button variant="outlined" onClick={() => window.print()} disabled={!header}>
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
                Session {defaultSessionNo ?? header?.sessionNo ?? '-'}
                {header?.month ? ` · ${header.month}` : ''}
                {header?.year ? ` · ${header.year}` : ''}
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {showCentre ? (
                  <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' }, minWidth: 0 }}>
                    {reportId === 'report-attendance' ? (
                      <CentreSearchField
                        multiple
                        label="Exam Centres *"
                        centres={centres}
                        value={attendanceCentreNos}
                        helperText="Select one or more centres. Print starts a new page for each centre."
                        onChange={setAttendanceCentreNos}
                      />
                    ) : (
                      <CentreSearchField
                        label="Exam Centre"
                        centres={centres}
                        value={centreNo}
                        allowEmpty
                        helperText="Search by code, name, or city — clear for all centres"
                        onChange={setCentreNo}
                      />
                    )}
                  </Box>
                ) : null}

                {showRegion ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="report-region-label">
                      {reportId === 'report-certificate' ? 'Region *' : 'Region'}
                    </InputLabel>
                    <Select
                      labelId="report-region-label"
                      label={reportId === 'report-certificate' ? 'Region *' : 'Region'}
                      value={regionNo}
                      onChange={(e) => {
                        const next = e.target.value as number | ''
                        setRegionNo(next === '' ? '' : Number(next))
                      }}
                    >
                      {reportId !== 'report-certificate' ? <MenuItem value="">All regions</MenuItem> : null}
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
                    <InputLabel id="report-mode-label">Layout</InputLabel>
                    <Select
                      labelId="report-mode-label"
                      label="Layout"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as 'named' | 'noname')}
                    >
                      <MenuItem value="named">With names</MenuItem>
                      <MenuItem value="noname">Without names</MenuItem>
                    </Select>
                  </FormControl>
                ) : null}

                {showRollRange ? (
                  <>
                    <TextField
                      size="small"
                      label="From Roll"
                      type="number"
                      value={fromRoll}
                      onChange={(e) => setFromRoll(e.target.value)}
                    />
                    <TextField
                      size="small"
                      label="To Roll"
                      type="number"
                      value={toRoll}
                      onChange={(e) => setToRoll(e.target.value)}
                    />
                  </>
                ) : null}
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}
            </Stack>
          </CardContent>
        </Card>

        {attendanceSections.length > 0 ? (
          <Card>
            <CardContent>
              <AttendanceSheetPrint
                printId={PRINT_ID}
                sections={attendanceSections.map((section) => ({
                  header: section.header,
                  pairs: section.pairs,
                }))}
                examTitleMr="राष्ट्रभाषा प्रबोध परीक्षा"
                paperCount={3}
              />
            </CardContent>
          </Card>
        ) : null}

        {header && attendanceSections.length === 0 ? (
          <Card>
            <CardContent>
              <ReportPrintChrome
                printId={PRINT_ID}
                header={header}
                summary={register ? (
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Typography variant="body2">Total: {register.totalCandidates}</Typography>
                    <Typography variant="body2">Pass: {register.passCount}</Typography>
                    <Typography variant="body2">Fail: {register.failCount}</Typography>
                    <Typography variant="body2">Absent: {register.absentCount}</Typography>
                    <Typography variant="body2">
                      Stopped: {register.stoppedCount === 0 ? '-' : register.stoppedCount}
                    </Typography>
                    <Typography variant="body2">Pass %: {register.passPercent}</Typography>
                  </Stack>
                ) : lostByTwo?.class3Marks ? (
                  <Typography variant="body2">
                    Thresholds — Class3: {lostByTwo.class3Marks}
                    {lostByTwo.minTotalKhand1 != null ? ` · Min total: ${lostByTwo.minTotalKhand1}` : ''}
                  </Typography>
                ) : undefined}
              >
                {nameList ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Form Centre</TableCell>
                        <TableCell>Exam Centre</TableCell>
                        <TableCell>Centre Name</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Region</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {nameList.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.formCentre ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.centreName ?? '-'}</TableCell>
                          <TableCell>{row.gender ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">
                            {row.regionNo ?? '-'}{row.regionName ? ` · ${row.regionName}` : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {resultSheet ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        {resultSheet.mode === 'named' ? <TableCell>Name</TableCell> : null}
                        <TableCell>Exam Centre</TableCell>
                        <TableCell>Marks1</TableCell>
                        <TableCell>Marks2</TableCell>
                        <TableCell>Marks3</TableCell>
                        <TableCell>Oral</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Rank</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultSheet.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          {resultSheet.mode === 'named' ? (
                            <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          ) : null}
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell>{row.marks1 ?? '-'}</TableCell>
                          <TableCell>{row.marks2 ?? '-'}</TableCell>
                          <TableCell>{row.marks3 ?? '-'}</TableCell>
                          <TableCell>{row.oralMarks ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell>{row.result ?? '-'}</TableCell>
                          <TableCell>{row.specialRank ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {markSheet ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Marks1</TableCell>
                        <TableCell>Marks2</TableCell>
                        <TableCell>Marks3</TableCell>
                        <TableCell>Oral</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Rank</TableCell>
                        <TableCell>Form Centre</TableCell>
                        <TableCell>Exam Centre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {markSheet.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.marks1 ?? '-'}</TableCell>
                          <TableCell>{row.marks2 ?? '-'}</TableCell>
                          <TableCell>{row.marks3 ?? '-'}</TableCell>
                          <TableCell>{row.oralMarks ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell>{row.result ?? '-'}</TableCell>
                          <TableCell>{row.specialRank ?? '-'}</TableCell>
                          <TableCell>{row.formCentre ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {hallTicket ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Form Centre</TableCell>
                        <TableCell>Exam Centre</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Session</TableCell>
                        <TableCell>Paper 1</TableCell>
                        <TableCell>Paper 2</TableCell>
                        <TableCell>Paper 3</TableCell>
                        <TableCell>Oral</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hallTicket.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.formCentre ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell>{row.gender ?? '-'}</TableCell>
                          <TableCell>{row.sessionNo ?? '-'}</TableCell>
                          <TableCell>{row.paper1Schedule ?? ''}</TableCell>
                          <TableCell>{row.paper2Schedule ?? ''}</TableCell>
                          <TableCell>{row.paper3Schedule ?? ''}</TableCell>
                          <TableCell>{row.oralSchedule ?? ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {certificates ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Rank</TableCell>
                        <TableCell>Exam Centre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {certificates.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.gender ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell>{row.result ?? '-'}</TableCell>
                          <TableCell>{row.specialRank ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {register ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Dummy Centre</TableCell>
                        <TableCell>Exam Centre</TableCell>
                        <TableCell>Centre Name</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Count</TableCell>
                        <TableCell>Pass</TableCell>
                        <TableCell>Fail</TableCell>
                        <TableCell>Absent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {register.rows.map((row, index) => (
                        <TableRow key={`${row.dummyCentreCode}-${row.examCentre}-${index}`}>
                          <TableCell>{row.dummyCentreCode ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.centreName ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">
                            {row.regionNo ?? '-'}{row.regionName ? ` · ${row.regionName}` : ''}
                          </TableCell>
                          <TableCell>{row.candidateCount}</TableCell>
                          <TableCell>{row.passCount}</TableCell>
                          <TableCell>{row.failCount}</TableCell>
                          <TableCell>{row.absentCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {lostByTwo ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Marks1</TableCell>
                        <TableCell>Marks2</TableCell>
                        <TableCell>Marks3</TableCell>
                        <TableCell>Oral</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Centres</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lostByTwo.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.marks1 ?? '-'}</TableCell>
                          <TableCell>{row.marks2 ?? '-'}</TableCell>
                          <TableCell>{row.marks3 ?? '-'}</TableCell>
                          <TableCell>{row.oralMarks ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell>{row.nearMissReason ?? '-'}</TableCell>
                          <TableCell>
                            {row.formCentre ?? '-'} / {row.examCentre ?? '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </ReportPrintChrome>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" className="no-print">
            Choose filters and click Generate.
          </Alert>
        )}
      </Stack>
    </PageFrame>
  )
}

export const isReportNavId = (id: NavItemId): id is ReportKind =>
  id === 'report-attendance'
  || id === 'report-name-list'
  || id === 'report-result-sheet'
  || id === 'report-mark-sheet'
  || id === 'report-hall-ticket'
  || id === 'report-certificate'
  || id === 'report-register'
  || id === 'report-lost-by-2'
