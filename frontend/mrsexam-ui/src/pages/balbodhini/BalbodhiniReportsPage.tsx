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
  balbodhiniApi,
  type AttendanceReport,
  type CertificateReport,
  type NameListReport,
  type RegisterReport,
  type ResultSheetReport,
} from '../../api/balbodhini/client'
import { CentersService, RegionsService, type Center, type Region } from '../../api/generatedClient'
import { PageFrame } from '../../layout/PageFrame'
import { marathiNameFieldSx } from '../../utils/marathiTransliterate'
import type { NavItemId } from '../../layout/navConfig'

type ReportKind =
  | 'report-attendance'
  | 'report-name-list'
  | 'report-result-sheet'
  | 'report-certificate'
  | 'report-register'

type Props = {
  reportId: ReportKind
  defaultSessionNo?: number
}

const titles: Record<ReportKind, { title: string; description: string }> = {
  'report-attendance': {
    title: 'Attendance Sheet',
    description: 'Exam-centre roll pairs for the default session.',
  },
  'report-name-list': {
    title: 'Name List',
    description: 'Roll number, name, and centre details for the default session.',
  },
  'report-result-sheet': {
    title: 'Result Sheet',
    description: 'Pass/fail sheet with or without candidate names.',
  },
  'report-certificate': {
    title: 'Certificate',
    description: 'Pass candidates for certificate print by region and roll range.',
  },
  'report-register': {
    title: 'Register',
    description: 'Rebuilds dummy centre codes and prints region/centre counts.',
  },
}

const toList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload as T[] : [])

export const BalbodhiniReportsPage = ({ reportId, defaultSessionNo }: Props) => {
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

  useEffect(() => {
    setAttendance(null)
    setNameList(null)
    setResultSheet(null)
    setCertificates(null)
    setRegister(null)
    setError(null)
  }, [reportId])

  const header = useMemo(() => {
    return attendance?.header
      ?? nameList?.header
      ?? resultSheet?.header
      ?? certificates?.header
      ?? register?.header
      ?? null
  }, [attendance, nameList, resultSheet, certificates, register])

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    try {
      if (reportId === 'report-attendance') {
        if (!centreNo.trim()) throw new Error('Select exam centre.')
        setAttendance(await balbodhiniApi.getAttendanceReport(centreNo.trim()))
        setNameList(null); setResultSheet(null); setCertificates(null); setRegister(null)
      } else if (reportId === 'report-name-list') {
        setNameList(await balbodhiniApi.getNameListReport(centreNo.trim() || undefined))
        setAttendance(null); setResultSheet(null); setCertificates(null); setRegister(null)
      } else if (reportId === 'report-result-sheet') {
        setResultSheet(await balbodhiniApi.getResultSheetReport({
          mode,
          centreNo: centreNo.trim() || undefined,
          regionNo: regionNo === '' ? undefined : Number(regionNo),
        }))
        setAttendance(null); setNameList(null); setCertificates(null); setRegister(null)
      } else if (reportId === 'report-certificate') {
        if (regionNo === '') throw new Error('Select region.')
        setCertificates(await balbodhiniApi.getCertificateReport({
          regionNo: Number(regionNo),
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
        setAttendance(null); setNameList(null); setResultSheet(null); setRegister(null)
      } else {
        setRegister(await balbodhiniApi.getRegisterReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
        setAttendance(null); setNameList(null); setResultSheet(null); setCertificates(null)
      }
    } catch (err) {
      setError(balbodhiniApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  const onPrint = () => window.print()

  return (
    <PageFrame
      title={meta.title}
      description={meta.description}
      actions={(
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => void onGenerate()} disabled={isLoading}>
            {isLoading ? 'Generating…' : 'Generate'}
          </Button>
          <Button variant="outlined" onClick={onPrint} disabled={!header}>
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
                {(reportId === 'report-attendance'
                  || reportId === 'report-name-list'
                  || reportId === 'report-result-sheet') ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="report-centre-label">
                      {reportId === 'report-attendance' ? 'Exam Centre *' : 'Exam Centre'}
                    </InputLabel>
                    <Select
                      labelId="report-centre-label"
                      label={reportId === 'report-attendance' ? 'Exam Centre *' : 'Exam Centre'}
                      value={centreNo}
                      onChange={(e) => setCentreNo(String(e.target.value))}
                    >
                      {reportId !== 'report-attendance' ? <MenuItem value="">All centres</MenuItem> : null}
                      {centres.map((centre) => (
                        <MenuItem key={centre.centreNo} value={centre.centreNo}>
                          {centre.centreNo}{centre.centreName ? ` · ${centre.centreName}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}

                {(reportId === 'report-result-sheet'
                  || reportId === 'report-certificate'
                  || reportId === 'report-register') ? (
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

                {reportId === 'report-certificate' ? (
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

        {header ? (
          <Card>
            <CardContent>
              <Box id="balbodhini-report-print" sx={{ overflowX: 'auto' }}>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Typography variant="h5" fontWeight={700}>{header.title}</Typography>
                  <Typography variant="body2">
                    Session {header.sessionNo}
                    {header.month ? ` · Month: ${header.month}` : ''}
                    {header.year ? ` · Year: ${header.year}` : ''}
                  </Typography>
                  {header.centreNo ? (
                    <Typography variant="body2">
                      Centre: {header.centreNo}{header.centreName ? ` · ${header.centreName}` : ''}
                    </Typography>
                  ) : null}
                  {header.regionName ? (
                    <Typography variant="body2" sx={marathiNameFieldSx['& .MuiInputBase-input']}>
                      Region: {header.regionName}
                    </Typography>
                  ) : null}
                  {header.resultDate ? (
                    <Typography variant="body2">
                      Result date: {new Date(header.resultDate).toLocaleDateString()}
                    </Typography>
                  ) : null}
                  <Typography variant="body2">Rows: {header.rowCount ?? '-'}</Typography>
                </Stack>

                {attendance ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Max roll: {attendance.maxRollNo ?? '-'}
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Roll 1</TableCell>
                          <TableCell>Roll 2</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendance.pairs.map((pair, index) => (
                          <TableRow key={`${pair.rollNo1}-${index}`}>
                            <TableCell>{pair.rollNo1 ?? '-'}</TableCell>
                            <TableCell>{pair.rollNo2 ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : null}

                {nameList ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Exam Centre</TableCell>
                        <TableCell>Centre Name</TableCell>
                        <TableCell>District</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {nameList.rows.map((row, index) => (
                        <TableRow key={`${row.rollNo}-${index}`}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.name ?? '-'}</TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.centreName ?? '-'}</TableCell>
                          <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.districtName ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {resultSheet ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        {resultSheet.mode === 'named' ? <TableCell>Name</TableCell> : null}
                        <TableCell>Exam Centre</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Total</TableCell>
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
                            <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.name ?? '-'}</TableCell>
                          ) : null}
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
                          <TableCell>{row.marks1 ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell>{row.result ?? '-'}</TableCell>
                          <TableCell>{row.specialRank ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {certificates ? (
                  <Table size="small">
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
                          <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.name ?? '-'}</TableCell>
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
                  <>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                      <Typography variant="body2">Total: {register.totalCandidates}</Typography>
                      <Typography variant="body2">Pass: {register.passCount}</Typography>
                      <Typography variant="body2">Fail: {register.failCount}</Typography>
                      <Typography variant="body2">Absent: {register.absentCount}</Typography>
                      <Typography variant="body2">
                        Stopped: {register.stoppedCount === 0 ? '-' : register.stoppedCount}
                      </Typography>
                      <Typography variant="body2">Pass %: {register.passPercent}</Typography>
                    </Stack>
                    <Table size="small">
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
                            <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>{row.centreName ?? '-'}</TableCell>
                            <TableCell sx={marathiNameFieldSx['& .MuiInputBase-input']}>
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
                  </>
                ) : null}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" className="no-print">
            Choose filters and click Generate.
          </Alert>
        )}
      </Stack>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #balbodhini-report-print, #balbodhini-report-print * { visibility: visible !important; }
          #balbodhini-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 16px;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </PageFrame>
  )
}

export const isReportNavId = (id: NavItemId): id is ReportKind =>
  id === 'report-attendance'
  || id === 'report-name-list'
  || id === 'report-result-sheet'
  || id === 'report-certificate'
  || id === 'report-register'
