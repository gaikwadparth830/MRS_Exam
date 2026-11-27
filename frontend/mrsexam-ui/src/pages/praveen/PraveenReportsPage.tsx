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
  praveenApi,
  type AttendanceReport,
  type CentreWiseStudentsReport,
  type CertificateReport,
  type NameListReport,
  type RegisterReport,
  type ReportHeader,
  type ResultSheetReport,
} from '../../api/praveen/client'
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
  | 'report-mark-sheet'
  | 'report-certificate'
  | 'report-register'
  | 'report-ranks'
  | 'report-lost-by-2'
  | 'report-centre-wise-students'

type MarkSheetData = Awaited<ReturnType<typeof praveenApi.getMarkSheetReport>>
type RanksData = Awaited<ReturnType<typeof praveenApi.getRanksReport>>
type LostData = Awaited<ReturnType<typeof praveenApi.getLostByTwoReport>>

type Props = {
  reportId: ReportKind
  defaultSessionNo?: number
}

const titles: Record<ReportKind, { title: string; description: string }> = {
  'report-attendance': { title: 'Attendance Sheet', description: 'Select one or more centres. Each centre prints on a new page.' },
  'report-name-list': { title: 'Name List', description: 'Roll number, name, and centre details.' },
  'report-result-sheet': { title: 'Result Sheet', description: 'Marks1–5, Oral, Project/RegLang, Tot, Grade, Result, Rank.' },
  'report-mark-sheet': { title: 'Mark Sheet', description: 'Per-student marks including Project/RegLang.' },
  'report-certificate': { title: 'Certificate', description: 'Pass candidates by region and roll range.' },
  'report-register': { title: 'Register', description: 'Dummy centre codes and region/centre counts.' },
  'report-ranks': { title: 'Ranks', description: 'FIRST / SECOND among Pass candidates.' },
  'report-lost-by-2': { title: 'Lost by 2 Marks', description: 'Fail candidates within 2 of pass thresholds.' },
  'report-centre-wise-students': {
    title: 'Centre-wise Students Appearing',
    description: 'Contiguous roll from–to ranges per exam centre (optional region filter).',
  },
}

const toList = <T,>(payload: unknown): T[] => (Array.isArray(payload) ? payload as T[] : [])
const PRINT_ID = 'Praveen-report-print'

export const PraveenReportsPage = ({ reportId, defaultSessionNo }: Props) => {
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
  const [nameListScope, setNameListScope] = useState<'all' | 'centre'>('all')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [attendanceSections, setAttendanceSections] = useState<AttendanceReport[]>([])
  const [nameList, setNameList] = useState<NameListReport | null>(null)
  const [resultSheetSections, setResultSheetSections] = useState<ResultSheetReport[]>([])
  const [markSheet, setMarkSheet] = useState<MarkSheetData | null>(null)
  const [certificates, setCertificates] = useState<CertificateReport | null>(null)
  const [register, setRegister] = useState<RegisterReport | null>(null)
  const [ranks, setRanks] = useState<RanksData | null>(null)
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
    setMarkSheet(null)
    setCertificates(null)
    setRegister(null)
    setRanks(null)
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
      ?? markSheet?.header
      ?? certificates?.header
      ?? register?.header
      ?? ranks?.header
      ?? lostByTwo?.header
      ?? centreWiseStudents?.header
      ?? null
  }, [attendanceSections, nameList, resultSheetSections, markSheet, certificates, register, ranks, lostByTwo, centreWiseStudents])

  const onGenerate = async () => {
    setError(null)
    setIsLoading(true)
    clearResults()
    try {
      if (reportId === 'report-attendance') {
        const codes = attendanceCentreNos.map((c) => c.trim()).filter(Boolean)
        if (codes.length < 1) throw new Error('Select at least one exam centre.')
        const sections = await Promise.all(codes.map((code) => praveenApi.getAttendanceReport(code)))
        setAttendanceSections(sections)
      } else if (reportId === 'report-name-list') {
        if (nameListScope === 'centre') {
          if (!centreNo.trim()) throw new Error('Select exam centre.')
          setNameList(await praveenApi.getNameListReport(centreNo.trim()))
        } else {
          setNameList(await praveenApi.getNameListReport(undefined))
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
          const report = await praveenApi.getResultSheetReport({
            mode,
            regionNo: Number(regionNo),
          })
          setResultSheetSections(splitResultSheetByCentre(report, centres) as ResultSheetReport[])
        } else {
          const sections = await Promise.all(
            selected.map((code) =>
              praveenApi.getResultSheetReport({
                mode,
                centreNo: code,
                regionNo: Number(regionNo),
              }),
            ),
          )
          setResultSheetSections(sections)
        }
      } else if (reportId === 'report-mark-sheet') {
        setMarkSheet(await praveenApi.getMarkSheetReport({
          regionNo: regionNo === '' ? undefined : Number(regionNo),
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
      } else if (reportId === 'report-certificate') {
        if (regionNo === '') throw new Error('Select region.')
        setCertificates(await praveenApi.getCertificateReport({
          regionNo: Number(regionNo),
          fromRoll: fromRoll.trim() ? Number(fromRoll) : undefined,
          toRoll: toRoll.trim() ? Number(toRoll) : undefined,
        }))
      } else if (reportId === 'report-ranks') {
        setRanks(await praveenApi.getRanksReport())
      } else if (reportId === 'report-lost-by-2') {
        setLostByTwo(await praveenApi.getLostByTwoReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      } else if (reportId === 'report-centre-wise-students') {
        setCentreWiseStudents(await praveenApi.getCentreWiseStudentsReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      } else {
        setRegister(await praveenApi.getRegisterReport(
          regionNo === '' ? undefined : Number(regionNo),
        ))
      }
    } catch (err) {
      setError(praveenApi.messageFromError(err, err instanceof Error ? err.message : 'Report failed.'))
    } finally {
      setIsLoading(false)
    }
  }

  const showCentre = reportId === 'report-attendance'
    || reportId === 'report-name-list'
    || reportId === 'report-result-sheet'

  const showRegion = reportId === 'report-result-sheet'
    || reportId === 'report-mark-sheet'
    || reportId === 'report-certificate'
    || reportId === 'report-register'
    || reportId === 'report-lost-by-2'
    || reportId === 'report-centre-wise-students'

  const showRollRange = reportId === 'report-mark-sheet' || reportId === 'report-certificate'

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
                    <InputLabel id="praveen-report-region">
                      {reportId === 'report-certificate' || reportId === 'report-result-sheet'
                        ? 'Region *'
                        : 'Region'}
                    </InputLabel>
                    <Select
                      labelId="praveen-report-region"
                      label={
                        reportId === 'report-certificate' || reportId === 'report-result-sheet'
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
                      {reportId === 'report-result-sheet'
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
                        onChange={setCentreNo}
                      />
                    )}
                  </Box>
                ) : null}

                {reportId === 'report-result-sheet' ? (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="praveen-report-mode">Layout</InputLabel>
                    <Select
                      labelId="praveen-report-mode"
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
                    <TextField size="small" label="From Roll" type="number" value={fromRoll} onChange={(e) => setFromRoll(e.target.value)} />
                    <TextField size="small" label="To Roll" type="number" value={toRoll} onChange={(e) => setToRoll(e.target.value)} />
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
                examTitleMr="राष्ट्रभाषा प्रवीण परीक्षा"
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
                examTitleMr="राष्ट्रभाषा प्रवीण परीक्षा"
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
                      optionalSubject: row.regLang ?? null,
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
                examLabel="Praveen"
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
                examTitleMr="राष्ट्रभाषा प्रवीण परीक्षा"
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
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Typography variant="body2">Total: {register.totalCandidates}</Typography>
                    <Typography variant="body2">Pass: {register.passCount}</Typography>
                    <Typography variant="body2">Fail: {register.failCount}</Typography>
                    <Typography variant="body2">Absent: {register.absentCount}</Typography>
                    <Typography variant="body2">Pass %: {register.passPercent}</Typography>
                  </Stack>
                ) : undefined}
              >
                {markSheet ? (
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
                        <TableCell>Oral</TableCell>
                        <TableCell>Project</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Rank</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {markSheet.rows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.marks1 ?? '-'}</TableCell>
                          <TableCell>{row.marks2 ?? '-'}</TableCell>
                          <TableCell>{row.marks3 ?? '-'}</TableCell>
                          <TableCell>{row.marks4 ?? '-'}</TableCell>
                          <TableCell>{row.marks5 ?? '-'}</TableCell>
                          <TableCell>{row.oralMarks ?? '-'}</TableCell>
                          <TableCell>{row.regLang ?? '-'}</TableCell>
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
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Rank</TableCell>
                        <TableCell>Exam Centre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {certificates.rows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
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
                      {register.rows.map((row, i) => (
                        <TableRow key={i}>
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

                {ranks ? (
                  <Table size="small" className="report-print-table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Roll</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Centre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ranks.rows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.specialRank ?? '-'}</TableCell>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.grade ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">
                            {row.regionNo ?? '-'}{row.regionName ? ` · ${row.regionName}` : ''}
                          </TableCell>
                          <TableCell>{row.examCentre ?? '-'}</TableCell>
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
                        <TableCell>M1</TableCell>
                        <TableCell>M2</TableCell>
                        <TableCell>M3</TableCell>
                        <TableCell>M4</TableCell>
                        <TableCell>M5</TableCell>
                        <TableCell>Tot</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lostByTwo.rows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.rollNo ?? '-'}</TableCell>
                          <TableCell className="marathi-cell">{row.name ?? '-'}</TableCell>
                          <TableCell>{row.marks1 ?? '-'}</TableCell>
                          <TableCell>{row.marks2 ?? '-'}</TableCell>
                          <TableCell>{row.marks3 ?? '-'}</TableCell>
                          <TableCell>{row.marks4 ?? '-'}</TableCell>
                          <TableCell>{row.marks5 ?? '-'}</TableCell>
                          <TableCell>{row.totMarks ?? '-'}</TableCell>
                          <TableCell>{row.nearMissReason ?? '-'}</TableCell>
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

export const isReportNavId = (id: NavItemId): id is ReportKind =>
  id === 'report-attendance'
  || id === 'report-name-list'
  || id === 'report-result-sheet'
  || id === 'report-mark-sheet'
  || id === 'report-certificate'
  || id === 'report-register'
  || id === 'report-ranks'
  || id === 'report-lost-by-2'
  || id === 'report-centre-wise-students'
