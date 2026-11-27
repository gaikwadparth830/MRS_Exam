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
  panditApi,
  type AttendanceReport,
  type CentreWiseStudentsReport,
  type CertificateReport,
  type NameListReport,
  type RegisterReport,
  type ReportHeader,
  type ResultSheetReport,
} from '../../api/pandit/client'
import { CentersService, DistrictsService, RegionsService, type Center, type District, type Region } from '../../api/generatedClient'
import { CentreSearchField } from '../../components/CentreSearchField'
import { AttendanceSheetPrint } from '../../components/reports/AttendanceSheetPrint'
import { CentreWiseStudentsPrint } from '../../components/reports/CentreWiseStudentsPrint'
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
  | 'report-result-details'
  | 'report-mark-sheet'
  | 'report-certificate'
  | 'report-register'
  | 'report-ranks'
  | 'report-students-passing'
  | 'report-lost-by-2'
  | 'report-centre-wise-students'

type ResultDetailsData = Awaited<ReturnType<typeof panditApi.getResultDetailsReport>>
type MarkSheetData = Awaited<ReturnType<typeof panditApi.getMarkSheetReport>>
type RanksData = Awaited<ReturnType<typeof panditApi.getRanksReport>>
type PassingData = Awaited<ReturnType<typeof panditApi.getStudentsPassingReport>>
type LostData = Awaited<ReturnType<typeof panditApi.getLostBy2Report>>

type Props = {
  reportId: ReportKind
  defaultSessionNo?: number
}

const titles: Record<ReportKind, { title: string; description: string }> = {
  'report-attendance': { title: 'Attendance Sheet', description: 'Select one or more centres. Each centre prints on a new page.' },
  'report-name-list': { title: 'Name List', description: 'Candidate name list by centre/region.' },
  'report-result-sheet': { title: 'Result Sheet', description: 'Khand tots, grade, result, rank.' },
  'report-result-details': { title: 'Result Details', description: 'Papers 1–8, oral, khand tots, flags.' },
  'report-mark-sheet': { title: 'Mark Sheet', description: 'Variant new with optional portion filter.' },
  'report-certificate': { title: 'Certificate', description: 'Pass / Khand pass candidates.' },
  'report-register': { title: 'Register', description: 'Centre counts and pass rates.' },
  'report-ranks': { title: 'Ranks', description: 'FIRST / SECOND among Exam Pass.' },
  'report-students-passing': { title: 'Students Passing', description: 'Full / Khand1 / Khand2 pass list.' },
  'report-lost-by-2': { title: 'Lost by 2 Marks', description: 'Near-miss fail candidates.' },
  'report-centre-wise-students': {
    title: 'Centre-wise Students Appearing',
    description: 'Contiguous roll from–to ranges per exam centre (optional region filter).',
  },
}

const toList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload as T[] : [])
const PRINT_ID = 'Pandit-report-print'

export const isPanditReportNavId = (id: NavItemId): id is ReportKind =>
  id === 'report-attendance'
  || id === 'report-name-list'
  || id === 'report-result-sheet'
  || id === 'report-result-details'
  || id === 'report-mark-sheet'
  || id === 'report-certificate'
  || id === 'report-register'
  || id === 'report-ranks'
  || id === 'report-students-passing'
  || id === 'report-lost-by-2'
  || id === 'report-centre-wise-students'

export const PanditReportsPage = ({ reportId, defaultSessionNo }: Props) => {
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
  const [portion, setPortion] = useState<'ALL' | 'N' | 'O'>('ALL')
  const [passingMode, setPassingMode] = useState<'full' | 'khand1' | 'khand2'>('full')
  const [nameListScope, setNameListScope] = useState<'all' | 'centre'>('all')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [attendanceSections, setAttendanceSections] = useState<AttendanceReport[]>([])
  const [nameList, setNameList] = useState<NameListReport | null>(null)
  const [resultSheetSections, setResultSheetSections] = useState<ResultSheetReport[]>([])
  const [resultDetails, setResultDetails] = useState<ResultDetailsData | null>(null)
  const [markSheet, setMarkSheet] = useState<MarkSheetData | null>(null)
  const [certificates, setCertificates] = useState<CertificateReport | null>(null)
  const [register, setRegister] = useState<RegisterReport | null>(null)
  const [ranks, setRanks] = useState<RanksData | null>(null)
  const [passing, setPassing] = useState<PassingData | null>(null)
  const [lostByTwo, setLostByTwo] = useState<LostData | null>(null)
  const [centreWiseStudents, setCentreWiseStudents] = useState<CentreWiseStudentsReport | null>(null)

  useEffect(() => {
    void Promise.all([
      CentersService.getApiCenters(),
      DistrictsService.getApiDistricts(),
      RegionsService.getApiRegions(),
    ])
      .then(([c, d, r]) => {
        setCentres(toList<Center>(c))
        setDistricts(toList<District>(d))
        setRegions(toList<Region>(r))
      })
      .catch(() => {
        setCentres([])
        setDistricts([])
        setRegions([])
      })
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
    setResultDetails(null)
    setMarkSheet(null)
    setCertificates(null)
    setRegister(null)
    setRanks(null)
    setPassing(null)
    setLostByTwo(null)
    setCentreWiseStudents(null)
  }

  useEffect(() => {
    clearResults()
    setError(null)
  }, [reportId])

  const header = useMemo((): ReportHeader | null => {
    return attendanceSections[0]?.header
      ?? nameList?.header
      ?? resultSheetSections[0]?.header
      ?? resultDetails?.header
      ?? markSheet?.header
      ?? certificates?.header
      ?? register?.header
      ?? ranks?.header
      ?? passing?.header
      ?? lostByTwo?.header
      ?? centreWiseStudents?.header
      ?? null
  }, [attendanceSections, nameList, resultSheetSections, resultDetails, markSheet, certificates, register, ranks, passing, lostByTwo, centreWiseStudents])

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    clearResults()
    try {
      if (reportId === 'report-attendance') {
        const codes = attendanceCentreNos.map((c) => c.trim()).filter(Boolean)
        if (codes.length < 1) throw new Error('Select at least one exam centre.')
        const sections = await Promise.all(codes.map((code) => panditApi.getAttendanceReport(code)))
        setAttendanceSections(sections)
      } else if (reportId === 'report-name-list') {
        if (nameListScope === 'centre' && !centreNo.trim()) {
          throw new Error('Select exam centre.')
        }
        setNameList(await panditApi.getNameListReport(
          nameListScope === 'centre' ? centreNo.trim() : undefined,
          regionNo === '' ? undefined : Number(regionNo),
        ))
      } else if (reportId === 'report-result-sheet') {
        if (regionNo === '') throw new Error('Select region.')
        const selected = resultSheetAllCentres
          ? []
          : resultSheetCentreNos.map((code) => code.trim()).filter(Boolean)
        if (!resultSheetAllCentres && selected.length === 0) {
          throw new Error('Select at least one centre, or choose All centres.')
        }
        if (selected.length === 0) {
          const report = await panditApi.getResultSheetReport({
            mode,
            regionNo: Number(regionNo),
          })
          setResultSheetSections(splitResultSheetByCentre(report, centres) as ResultSheetReport[])
        } else {
          const sections = await Promise.all(
            selected.map((code) =>
              panditApi.getResultSheetReport({
                mode,
                centreNo: code,
                regionNo: Number(regionNo),
              }),
            ),
          )
          setResultSheetSections(sections)
        }
      } else if (reportId === 'report-result-details') {
        setResultDetails(await panditApi.getResultDetailsReport({
          centreNo: centreNo.trim() || undefined,
          regionNo: regionNo === '' ? undefined : Number(regionNo),
        }))
      } else if (reportId === 'report-mark-sheet') {
        setMarkSheet(await panditApi.getMarkSheetReport({
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
          variant: 'new',
          portion: portion === 'ALL' ? undefined : portion,
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
        setRanks(await panditApi.getRanksReport())
      } else if (reportId === 'report-students-passing') {
        setPassing(await panditApi.getStudentsPassingReport({
          formCentre: centreNo.trim() || undefined,
          regionNo: regionNo === '' ? undefined : Number(regionNo),
          passingMode,
        }))
      } else if (reportId === 'report-centre-wise-students') {
        setCentreWiseStudents(await panditApi.getCentreWiseStudentsReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      } else if (reportId === 'report-lost-by-2') {
        setLostByTwo(await panditApi.getLostBy2Report(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      }
    } catch (err) {
      setError(panditApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  const showCentre = reportId === 'report-attendance'
    || reportId === 'report-name-list'
    || reportId === 'report-result-sheet'
    || reportId === 'report-result-details'
    || reportId === 'report-certificate'
    || reportId === 'report-students-passing'

  const showRegion = reportId !== 'report-attendance' && reportId !== 'report-ranks' && reportId !== 'report-mark-sheet'

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
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                }}
              >
                {showRegion ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="pandit-report-region">
                      {reportId === 'report-result-sheet' ? 'Region *' : 'Region'}
                    </InputLabel>
                    <Select
                      labelId="pandit-report-region"
                      label={reportId === 'report-result-sheet' ? 'Region *' : 'Region'}
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
                      {reportId === 'report-result-sheet'
                        ? <MenuItem value="" disabled>Select region</MenuItem>
                        : <MenuItem value="">All regions</MenuItem>}
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
                        label="Centre"
                        centres={centres}
                        value={centreNo}
                        allowEmpty
                        onChange={setCentreNo}
                      />
                    )}
                  </Box>
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

                {reportId === 'report-mark-sheet' ? (
                  <>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="pandit-portion">Portion</InputLabel>
                      <Select
                        labelId="pandit-portion"
                        label="Portion"
                        value={portion}
                        onChange={(e) => setPortion(e.target.value as 'ALL' | 'N' | 'O')}
                      >
                        <MenuItem value="ALL">All</MenuItem>
                        <MenuItem value="N">NEW (N)</MenuItem>
                        <MenuItem value="O">OLD (O)</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField size="small" label="From Roll" value={fromRoll} onChange={(e) => setFromRoll(e.target.value)} />
                    <TextField size="small" label="To Roll" value={toRoll} onChange={(e) => setToRoll(e.target.value)} />
                  </>
                ) : null}

                {reportId === 'report-students-passing' ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="pandit-passing-mode">Passing mode</InputLabel>
                    <Select
                      labelId="pandit-passing-mode"
                      label="Passing mode"
                      value={passingMode}
                      onChange={(e) => setPassingMode(e.target.value as 'full' | 'khand1' | 'khand2')}
                    >
                      <MenuItem value="full">Full Exam Pass</MenuItem>
                      <MenuItem value="khand1">Khand I Pass</MenuItem>
                      <MenuItem value="khand2">Khand II Pass</MenuItem>
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

        {attendanceSections.length > 0 ? (
          <Card>
            <CardContent>
              <AttendanceSheetPrint
                printId={PRINT_ID}
                sections={attendanceSections.map((section) => ({
                  header: section.header,
                  pairs: section.pairs,
                }))}
                examTitleMr="राष्ट्रभाषा पंडित परीक्षा"
                paperCount={5}
              />
            </CardContent>
          </Card>
        ) : null}

        {resultSheetSections.length > 0 ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <ResultSheetPrint
                printId={PRINT_ID}
                examTitleMr="राष्ट्रभाषा पंडित परीक्षा"
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
                      optionalSubject: row.flgPortion ?? null,
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

        {centreWiseStudents ? (
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 2 } }}>
              <CentreWiseStudentsPrint
                printId={PRINT_ID}
                header={centreWiseStudents.header}
                examLabel="Pandit"
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
                examTitleMr="राष्ट्रभाषा पंडित परीक्षा"
                sections={splitNameListByCentre(nameList.rows).map((section) => ({
                  centreName: section.centreName
                    ?? centres.find((c) => (c.centreNo ?? '').trim() === (section.centreNo ?? '').trim())?.centreName
                    ?? null,
                  districtName: section.districtName
                    ?? centres.find((c) => (c.centreNo ?? '').trim() === (section.centreNo ?? '').trim())?.districtName
                    ?? null,
                  rows: section.rows.map((row) => ({ rollNo: row.rollNo, name: row.name })),
                }))}
              />
            </CardContent>
          </Card>
        ) : null}

        {header && attendanceSections.length === 0 && resultSheetSections.length === 0 && !centreWiseStudents && !nameList ? (
          <Card>
            <CardContent>
              <ReportPrintChrome
                printId={PRINT_ID}
                header={header}
                summary={register ? (
                  <Typography variant="body2">
                    Pass {register.passCount}/{register.totalCandidates} ({register.passPercent}%)
                  </Typography>
                ) : undefined}
              >
                {resultDetails ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>M1</TableCell>
                        <TableCell>M2</TableCell>
                        <TableCell>M3</TableCell>
                        <TableCell>M4</TableCell>
                        <TableCell>M5</TableCell>
                        <TableCell>M6</TableCell>
                        <TableCell>M7</TableCell>
                        <TableCell>M8</TableCell>
                        <TableCell>Oral</TableCell>
                        <TableCell>K1</TableCell>
                        <TableCell>K2</TableCell>
                        <TableCell>Conc</TableCell>
                        <TableCell>UND</TableCell>
                        <TableCell>Both</TableCell>
                        <TableCell>Result</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultDetails.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{r.name ?? '-'}</TableCell>
                          <TableCell>{r.marks1 ?? '-'}</TableCell>
                          <TableCell>{r.marks2 ?? '-'}</TableCell>
                          <TableCell>{r.marks3 ?? '-'}</TableCell>
                          <TableCell>{r.marks4 ?? '-'}</TableCell>
                          <TableCell>{r.marks5 ?? '-'}</TableCell>
                          <TableCell>{r.marks6 ?? '-'}</TableCell>
                          <TableCell>{r.marks7 ?? '-'}</TableCell>
                          <TableCell>{r.marks8 ?? '-'}</TableCell>
                          <TableCell>{r.oralMarks ?? '-'}</TableCell>
                          <TableCell>{r.khand1TotMarks ?? '-'}</TableCell>
                          <TableCell>{r.khand2TotMarks ?? '-'}</TableCell>
                          <TableCell>{r.concessionFlag ?? '-'}</TableCell>
                          <TableCell>{r.undFlag ?? '-'}</TableCell>
                          <TableCell>{r.bothKhandFlag ?? '-'}</TableCell>
                          <TableCell>{r.result ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {markSheet ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Portion</TableCell>
                        <TableCell>Khand</TableCell>
                        <TableCell>M1–4</TableCell>
                        <TableCell>M5–8</TableCell>
                        <TableCell>Oral</TableCell>
                        <TableCell>K1</TableCell>
                        <TableCell>K2</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {markSheet.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{r.name ?? '-'}</TableCell>
                          <TableCell>{r.flgPortion ?? '-'}</TableCell>
                          <TableCell>{r.khandAppearing ?? '-'}</TableCell>
                          <TableCell>{[r.marks1, r.marks2, r.marks3, r.marks4].map((m) => m ?? '-').join('/')}</TableCell>
                          <TableCell>{[r.marks5, r.marks6, r.marks7, r.marks8].map((m) => m ?? '-').join('/')}</TableCell>
                          <TableCell>{r.oralMarks ?? '-'}</TableCell>
                          <TableCell>{r.khand1TotMarks ?? '-'}</TableCell>
                          <TableCell>{r.khand2TotMarks ?? '-'}</TableCell>
                          <TableCell>{r.totMarks ?? '-'}</TableCell>
                          <TableCell>{r.grade ?? '-'}</TableCell>
                          <TableCell>{r.result ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {certificates ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Rank</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {certificates.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{r.name ?? '-'}</TableCell>
                          <TableCell>{r.grade ?? '-'}</TableCell>
                          <TableCell>{r.result ?? '-'}</TableCell>
                          <TableCell>{r.specialRank ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {register ? (
                  <Table size="small" className="report-print-table">
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
                          <TableCell className="marathi-cell">
                            {r.examCentre}{r.centreName ? ` · ${r.centreName}` : ''}
                          </TableCell>
                          <TableCell>{r.regionNo ?? '-'}</TableCell>
                          <TableCell>{r.candidateCount}</TableCell>
                          <TableCell>{r.passCount}</TableCell>
                          <TableCell>{r.failCount}</TableCell>
                          <TableCell>{r.absentCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {ranks ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Centre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ranks.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.specialRank ?? '-'}</TableCell>
                          <TableCell>{r.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{r.name ?? '-'}</TableCell>
                          <TableCell>{r.totMarks ?? '-'}</TableCell>
                          <TableCell>{r.result ?? '-'}</TableCell>
                          <TableCell>{r.formCentre ?? '-'} / {r.examCentre ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {passing ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Khand</TableCell>
                        <TableCell>Centre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {passing.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{r.name ?? '-'}</TableCell>
                          <TableCell>{r.result ?? '-'}</TableCell>
                          <TableCell>{r.grade ?? '-'}</TableCell>
                          <TableCell>{r.totMarks ?? '-'}</TableCell>
                          <TableCell>{r.khandAppearing ?? '-'}</TableCell>
                          <TableCell>{r.formCentre ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}

                {lostByTwo ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>K1</TableCell>
                        <TableCell>K2</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lostByTwo.rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{r.name ?? '-'}</TableCell>
                          <TableCell>{r.totMarks ?? '-'}</TableCell>
                          <TableCell>{r.khand1TotMarks ?? '-'}</TableCell>
                          <TableCell>{r.khand2TotMarks ?? '-'}</TableCell>
                          <TableCell>{r.nearMissReason ?? '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : null}
              </ReportPrintChrome>
            </CardContent>
          </Card>
        ) : !header && !centreWiseStudents && !nameList ? (
          <Alert severity="info" className="no-print">Choose filters and click Generate.</Alert>
        ) : null}
      </Stack>
    </PageFrame>
  )
}
