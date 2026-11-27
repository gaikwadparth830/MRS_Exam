import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
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
  type CentreWiseStudentsReport,
  type CertificateReport,
  type HallTicketReport,
  type LostByTwoReport,
  type MarkSheetReport,
  type NameListReport,
  type RegisterReport,
  type ResultSheetReport,
} from '../../api/prabodh/client'
import { CentersService, DistrictsService, RegionsService, type Center, type District, type Region } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { AttendanceSheetPrint } from '../../components/reports/AttendanceSheetPrint'
import { CentreWiseStudentsPrint } from '../../components/reports/CentreWiseStudentsPrint'
import { MarkSheetPrint } from '../../components/reports/MarkSheetPrint'
import { NameListPrint } from '../../components/reports/NameListPrint'
import { ReportPrintChrome } from '../../components/reports/ReportPrintChrome'
import { ResultSheetPrint } from '../../components/reports/ResultSheetPrint'
import { PageFrame } from '../../layout/PageFrame'
import type { NavItemId } from '../../layout/navConfig'
import { filterCentresByRegion } from '../../utils/filterCentresByRegion'
import { splitNameListByCentre } from '../../utils/splitNameListByCentre'
import { splitResultSheetByCentre } from '../../utils/splitResultSheetByCentre'

type ReportKind =
  | 'report-attendance'
  | 'report-name-list'
  | 'report-result-sheet'
  | 'report-mark-sheet'
  | 'report-hall-ticket'
  | 'report-certificate'
  | 'report-register'
  | 'report-lost-by-2'
  | 'report-centre-wise-students'

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
  'report-centre-wise-students': {
    title: 'Centre-wise Students Appearing',
    description: 'Contiguous roll from–to ranges per exam centre (optional region filter).',
  },
}

const toList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload as T[] : [])
const PRINT_ID = 'Prabodh-report-print'

export const PrabodhReportsPage = ({ reportId, defaultSessionNo }: Props) => {
  const meta = titles[reportId]
  const [centres, setCentres] = useState<Center[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [centreNo, setCentreNo] = useState('')
  const [attendanceCentreNos, setAttendanceCentreNos] = useState<string[]>([])
  const [resultSheetCentreNos, setResultSheetCentreNos] = useState<string[]>([])
  const [resultSheetAllCentres, setResultSheetAllCentres] = useState(true)
  const [regionNo, setRegionNo] = useState<number | ''>('')
  const [mode, setMode] = useState<'named' | 'noname'>('named')
  const [fromRoll, setFromRoll] = useState('')
  const [toRoll, setToRoll] = useState('')
  /** Mark sheet: For All vs selected roll range (legacy Frm_MarkSheet). */
  const [markSheetScope, setMarkSheetScope] = useState<'all' | 'selected'>('selected')
  /** Name list: All centres vs one centre. */
  const [nameListScope, setNameListScope] = useState<'all' | 'centre'>('all')
  /** Override printed result date on mark sheet (dd/mm/yyyy stored as ISO date input). */
  const [markSheetResultDate, setMarkSheetResultDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [attendanceSections, setAttendanceSections] = useState<AttendanceReport[]>([])
  const [nameList, setNameList] = useState<NameListReport | null>(null)
  const [resultSheetSections, setResultSheetSections] = useState<ResultSheetReport[]>([])
  const [markSheet, setMarkSheet] = useState<MarkSheetReport | null>(null)
  const [hallTicket, setHallTicket] = useState<HallTicketReport | null>(null)
  const [certificates, setCertificates] = useState<CertificateReport | null>(null)
  const [register, setRegister] = useState<RegisterReport | null>(null)
  const [lostByTwo, setLostByTwo] = useState<LostByTwoReport | null>(null)
  const [centreWiseStudents, setCentreWiseStudents] = useState<CentreWiseStudentsReport | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [centrePayload, districtPayload, regionPayload] = await Promise.all([
          CentersService.getApiCenters(),
          DistrictsService.getApiDistricts(),
          RegionsService.getApiRegions(),
        ])
        if (!mounted) return
        setCentres(toList<Center>(centrePayload))
        setDistricts(toList<District>(districtPayload))
        setRegions(toList<Region>(regionPayload))
      } catch {
        if (mounted) {
          setCentres([])
          setDistricts([])
          setRegions([])
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const centresForPicker = useMemo(() => {
    if (reportId !== 'report-result-sheet') return centres
    return filterCentresByRegion(centres, districts, regionNo)
  }, [centres, districts, regionNo, reportId])

  useEffect(() => {
    if (reportId !== 'report-result-sheet') return
    setResultSheetCentreNos((prev) =>
      prev.filter((code) =>
        centresForPicker.some((centre) => (centre.centreNo ?? '').trim() === code.trim()),
      ),
    )
  }, [centresForPicker, reportId])

  const clearResults = () => {
    setAttendanceSections([])
    setNameList(null)
    setResultSheetSections([])
    setMarkSheet(null)
    setHallTicket(null)
    setCertificates(null)
    setRegister(null)
    setLostByTwo(null)
    setCentreWiseStudents(null)
  }

  useEffect(() => {
    clearResults()
    setError(null)
  }, [reportId])

  const header = useMemo(() => {
    return attendanceSections[0]?.header
      ?? nameList?.header
      ?? resultSheetSections[0]?.header
      ?? markSheet?.header
      ?? hallTicket?.header
      ?? certificates?.header
      ?? register?.header
      ?? lostByTwo?.header
      ?? centreWiseStudents?.header
      ?? null
  }, [
    attendanceSections,
    nameList,
    resultSheetSections,
    markSheet,
    hallTicket,
    certificates,
    register,
    lostByTwo,
    centreWiseStudents,
  ])

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
        if (nameListScope === 'centre') {
          if (!centreNo.trim()) throw new Error('Select exam centre.')
          setNameList(await prabodhApi.getNameListReport(centreNo.trim()))
        } else {
          setNameList(await prabodhApi.getNameListReport(undefined))
        }
      } else if (reportId === 'report-result-sheet') {
        if (regionNo === '') throw new Error('Select region.')
        const selected = resultSheetAllCentres
          ? []
          : resultSheetCentreNos.map((code) => code.trim()).filter(Boolean)
        if (!resultSheetAllCentres && selected.length === 0) {
          throw new Error('Select at least one centre, or choose All centres.')
        }
        if (selected.length === 0) {
          const report = await prabodhApi.getResultSheetReport({
            mode,
            regionNo: Number(regionNo),
          })
          setResultSheetSections(splitResultSheetByCentre(report, centres) as ResultSheetReport[])
        } else {
          const sections = await Promise.all(
            selected.map((code) =>
              prabodhApi.getResultSheetReport({
                mode,
                centreNo: code,
                regionNo: Number(regionNo),
              }),
            ),
          )
          setResultSheetSections(sections)
        }
      } else if (reportId === 'report-mark-sheet') {
        if (regionNo === '') throw new Error('Select region (location).')
        if (markSheetScope === 'selected') {
          if (!fromRoll.trim() || !toRoll.trim()) {
            throw new Error('Enter From and To roll for selected students.')
          }
          const from = Number(fromRoll)
          const to = Number(toRoll)
          if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
            throw new Error('Invalid From / To roll range.')
          }
        }
        setMarkSheet(await prabodhApi.getMarkSheetReport({
          regionNo: Number(regionNo),
          fromRoll: markSheetScope === 'selected' && fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: markSheetScope === 'selected' && toRoll.trim() ? Number(toRoll) : undefined,
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
      } else if (reportId === 'report-centre-wise-students') {
        setCentreWiseStudents(await prabodhApi.getCentreWiseStudentsReport(
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
    || reportId === 'report-centre-wise-students'

  const showRollRange = (reportId === 'report-mark-sheet' && markSheetScope === 'selected')
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
                {reportId === 'report-mark-sheet' ? (
                  <FormControl component="fieldset" sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
                    <FormLabel component="legend">Mark sheet scope</FormLabel>
                    <RadioGroup
                      row
                      value={markSheetScope}
                      onChange={(e) => {
                        const next = e.target.value as 'all' | 'selected'
                        setMarkSheetScope(next)
                        if (next === 'all') {
                          setFromRoll('')
                          setToRoll('')
                        }
                      }}
                    >
                      <FormControlLabel value="all" control={<Radio size="small" />} label="For All" />
                      <FormControlLabel
                        value="selected"
                        control={<Radio size="small" />}
                        label="For Selected Students"
                      />
                    </RadioGroup>
                  </FormControl>
                ) : null}

                {showRegion ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="report-region-label">
                      {reportId === 'report-certificate'
                        || reportId === 'report-result-sheet'
                        || reportId === 'report-mark-sheet'
                        ? 'Region *'
                        : 'Region'}
                    </InputLabel>
                    <Select
                      labelId="report-region-label"
                      label={
                        reportId === 'report-certificate'
                          || reportId === 'report-result-sheet'
                          || reportId === 'report-mark-sheet'
                          ? 'Region *'
                          : 'Region'
                      }
                      value={regionNo}
                      onChange={(e) => {
                        const next = e.target.value as number | ''
                        setRegionNo(next === '' ? '' : Number(next))
                        if (reportId === 'report-result-sheet') {
                          setResultSheetCentreNos([])
                          setResultSheetAllCentres(true)
                        }
                      }}
                    >
                      {reportId === 'report-result-sheet' || reportId === 'report-mark-sheet'
                        ? <MenuItem value="" disabled>Select region</MenuItem>
                        : reportId !== 'report-certificate'
                          ? <MenuItem value="">All regions</MenuItem>
                          : null}
                      {regions.map((region) => (
                        <MenuItem key={region.regionNo} value={region.regionNo}>
                          {region.regionNo}{region.regionName ? ` · ${region.regionName}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}

                {reportId === 'report-name-list' ? (
                  <FormControl component="fieldset" sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
                    <FormLabel component="legend">Name list scope</FormLabel>
                    <RadioGroup
                      row
                      value={nameListScope}
                      onChange={(e) => {
                        const next = e.target.value as 'all' | 'centre'
                        setNameListScope(next)
                        setNameList(null)
                        if (next === 'all') setCentreNo('')
                      }}
                    >
                      <FormControlLabel value="all" control={<Radio size="small" />} label="All" />
                      <FormControlLabel value="centre" control={<Radio size="small" />} label="Centre-wise" />
                    </RadioGroup>
                  </FormControl>
                ) : null}

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
                    ) : reportId === 'report-result-sheet' ? (
                      <Stack spacing={1}>
                        <FormControlLabel
                          control={(
                            <Checkbox
                              checked={resultSheetAllCentres}
                              disabled={regionNo === ''}
                              onChange={(e) => {
                                const all = e.target.checked
                                setResultSheetAllCentres(all)
                                if (all) setResultSheetCentreNos([])
                              }}
                            />
                          )}
                          label={`All centres in region${centresForPicker.length ? ` (${centresForPicker.length})` : ''}`}
                        />
                        <CentreSearchField
                          multiple
                          label="Exam Centres"
                          centres={centresForPicker}
                          value={resultSheetCentreNos}
                          disabled={regionNo === '' || resultSheetAllCentres}
                          helperText={
                            regionNo === ''
                              ? 'Select a region first'
                              : resultSheetAllCentres
                                ? 'All centres selected — uncheck to pick specific centres. Print starts a new page per centre.'
                                : 'Select one or more centres. Print starts a new page per centre.'
                          }
                          onChange={(codes) => {
                            setResultSheetAllCentres(false)
                            setResultSheetCentreNos(codes)
                          }}
                        />
                      </Stack>
                    ) : reportId === 'report-name-list' ? (
                      nameListScope === 'centre' ? (
                        <CentreSearchField
                          label="Exam Centre *"
                          centres={centres}
                          value={centreNo}
                          helperText="Search by code, name, or city"
                          onChange={setCentreNo}
                        />
                      ) : null
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
                      label={reportId === 'report-mark-sheet' ? 'From *' : 'From Roll'}
                      type="number"
                      value={fromRoll}
                      onChange={(e) => setFromRoll(e.target.value)}
                    />
                    <TextField
                      size="small"
                      label={reportId === 'report-mark-sheet' ? 'To *' : 'To Roll'}
                      type="number"
                      value={toRoll}
                      onChange={(e) => setToRoll(e.target.value)}
                    />
                  </>
                ) : null}

                {reportId === 'report-mark-sheet' ? (
                  <TextField
                    size="small"
                    label="Date of Result"
                    type="date"
                    value={markSheetResultDate}
                    onChange={(e) => setMarkSheetResultDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Printed on mark sheet (blank = session result date)"
                  />
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

        {resultSheetSections.length > 0 ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <ResultSheetPrint
                printId={PRINT_ID}
                examTitleMr="राष्ट्रभाषा प्रबोध परीक्षा"
                sections={resultSheetSections.map((section) => {
                  const code = (section.header.centreNo ?? '').trim()
                  const centreName = section.header.centreName
                    ?? centres.find((centre) => (centre.centreNo ?? '').trim() === code)?.centreName
                    ?? null
                  return {
                    header: { ...section.header, centreName },
                    mode: section.mode,
                    rows: section.rows.map((row) => ({
                      rollNo: row.rollNo,
                      name: row.name,
                      optionalSubject: null,
                      totMarks: row.totMarks,
                      oralMarks: row.oralMarks,
                      grade: row.grade,
                      specialRank: row.specialRank,
                    })),
                  }
                })}
              />
            </CardContent>
          </Card>
        ) : null}

        {markSheet ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <MarkSheetPrint
                printId={PRINT_ID}
                header={{
                  ...markSheet.header,
                  resultDate: markSheetResultDate.trim()
                    ? markSheetResultDate.trim()
                    : markSheet.header.resultDate,
                }}
                rows={markSheet.rows.map((row) => {
                  const code = (row.examCentre ?? '').trim()
                  const centre = centres.find((item) => (item.centreNo ?? '').trim() === code)
                  return {
                    rollNo: row.rollNo,
                    name: row.name,
                    examCentre: row.examCentre,
                    centreName: centre?.centreName ?? null,
                    centreCity: centre?.city ?? null,
                    marks1: row.marks1,
                    marks2: row.marks2,
                    marks3: row.marks3,
                    oralMarks: row.oralMarks,
                    totMarks: row.totMarks,
                    grade: row.grade,
                    result: row.result,
                    specialRank: row.specialRank,
                  }
                })}
              />
            </CardContent>
          </Card>
        ) : null}

        {centreWiseStudents ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <CentreWiseStudentsPrint
                printId={PRINT_ID}
                header={centreWiseStudents.header}
                examLabel="Prabodh"
                rows={centreWiseStudents.rows.map((row) => ({
                  centreNo: row.centreNo,
                  centreName: row.centreName
                    ?? centres.find((c) => (c.centreNo ?? '').trim() === (row.centreNo ?? '').trim())?.centreName
                    ?? null,
                  rollFrom: row.rollFrom,
                  rollTo: row.rollTo,
                  rollFrom2: row.rollFrom2,
                  rollTo2: row.rollTo2,
                }))}
              />
            </CardContent>
          </Card>
        ) : null}

        {nameList ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <NameListPrint
                printId={PRINT_ID}
                header={nameList.header}
                examTitleMr="राष्ट्रभाषा प्रबोध परीक्षा"
                sections={splitNameListByCentre(nameList.rows).map((section) => {
                  const centre = centres.find(
                    (c) => (c.centreNo ?? '').trim() === (section.centreNo ?? '').trim(),
                  )
                  return {
                    centreName: section.centreName ?? centre?.centreName ?? null,
                    districtName: section.districtName ?? centre?.districtName ?? null,
                    rows: section.rows.map((row) => ({
                      rollNo: row.rollNo,
                      name: row.name,
                    })),
                  }
                })}
              />
            </CardContent>
          </Card>
        ) : null}

        {header
          && attendanceSections.length === 0
          && resultSheetSections.length === 0
          && !markSheet
          && !centreWiseStudents
          && !nameList ? (
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
        ) : null}

        {!header
          && attendanceSections.length === 0
          && resultSheetSections.length === 0
          && !markSheet
          && !centreWiseStudents
          && !nameList ? (
          <Alert severity="info" className="no-print">
            Choose filters and click Generate.
          </Alert>
        ) : null}
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
  || id === 'report-centre-wise-students'
