import { Box, Typography } from '@mui/material'

import monoLogo from '../../assets/MONO.png'
import { marathiNameFieldSx } from '../../utils/marathiTransliterate'
import type { ReportPrintHeader } from './ReportPrintChrome'

export type MarkSheetPrintRow = {
  rollNo?: number | null
  name?: string | null
  examCentre?: string | null
  centreName?: string | null
  centreCity?: string | null
  marks1?: string | null
  marks2?: string | null
  marks3?: string | null
  oralMarks?: string | null
  totMarks?: number | null
  grade?: string | null
  result?: string | null
  specialRank?: string | null
}

type Props = {
  printId: string
  header: ReportPrintHeader
  rows: MarkSheetPrintRow[]
  examTitleMr?: string
  recognitionLine?: string
  cardsPerPage?: number
  paperMax?: number
  oralMax?: number
  gradeBands?: { third: string; second: string; first: string }
  notice?: string
  signatoryTitle?: string
}

const MONTH_HI: Record<string, string> = {
  january: 'जनवरी',
  february: 'फरवरी',
  march: 'मार्च',
  april: 'अप्रैल',
  may: 'मई',
  june: 'जून',
  july: 'जुलाई',
  august: 'अगस्त',
  september: 'सितंबर',
  october: 'अक्टूबर',
  november: 'नवंबर',
  december: 'दिसंबर',
  jan: 'जनवरी',
  feb: 'फरवरी',
  mar: 'मार्च',
  apr: 'अप्रैल',
  jun: 'जून',
  jul: 'जुलाई',
  aug: 'अगस्त',
  sep: 'सितंबर',
  oct: 'अक्टूबर',
  nov: 'नवंबर',
  dec: 'दिसंबर',
}

const marathiSx = marathiNameFieldSx['& .MuiInputBase-input']

const toDevanagariDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)] ?? d)

const hasDevanagari = (value: string) => /[\u0900-\u097F]/.test(value)

const toMarathiMonth = (month?: string | null): string | null => {
  const raw = (month ?? '').trim()
  if (!raw) return null
  if (hasDevanagari(raw)) return raw === 'अक्तूबर' ? 'अक्टूबर' : raw
  return MONTH_HI[raw.toLowerCase()] ?? raw
}

const formatSessionLine = (month?: string | null, year?: string | null) => {
  const monthHi = toMarathiMonth(month)
  const yearText = year?.trim() ? toDevanagariDigits(year.trim()) : null
  if (monthHi && yearText) return `${monthHi} - ${yearText}`
  if (monthHi) return monthHi
  if (yearText) return yearText
  return null
}

const formatDate = (value?: string | null) => {
  if (value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0')
      const mm = String(parsed.getMonth() + 1).padStart(2, '0')
      return `${dd}/${mm}/${parsed.getFullYear()}`
    }
  }
  const now = new Date()
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
}

const parseMark = (value?: string | number | null): number | null => {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isFinite(n) ? n : null
}

const formatGradeLabel = (grade?: string | null): string => {
  const g = (grade ?? '').trim()
  if (g === '1') return 'पहली'
  if (g === '2') return 'दूसरी'
  if (g === '3') return 'तीसरी'
  if (g.toUpperCase() === 'X') return '—'
  return g
}

const formatSpecialPlace = (specialRank?: string | null): string => {
  const rank = (specialRank ?? '').trim()
  if (!rank) return ''
  if (/^first\b/i.test(rank)) return 'वि.यो'
  return rank
}

const formatResultLine = (result?: string | null): string => {
  const r = (result ?? '').trim().toLowerCase()
  if (r === 'pass') return 'प्रबोध परीक्षा उत्तीर्ण'
  if (r === 'fail') return 'प्रबोध परीक्षा अनुत्तीर्ण'
  if (r === 'absent' || r === 'a') return 'अनुपस्थित'
  return (result ?? '').trim() || '—'
}

const centreDisplay = (row: MarkSheetPrintRow): string => {
  const name = (row.centreName ?? '').trim()
  const city = (row.centreCity ?? '').trim()
  if (name && city) return `${name},${city}`
  if (name) return name
  return (row.examCentre ?? '').trim() || '—'
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  if (items.length === 0) return [[]]
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages
}

/** Small empty checkbox square as in legacy DataReport. */
const CheckBox = () => (
  <Box
    component="span"
    sx={{
      display: 'inline-block',
      width: '9px',
      height: '9px',
      border: '1px solid #000',
      verticalAlign: 'middle',
      mx: 0.5,
      mb: '1px',
    }}
  />
)

const MarkCard = ({
  row,
  examTitleMr,
  recognitionLine,
  sessionLine,
  resultDate,
  paperMax,
  oralMax,
  gradeBands,
  notice,
  signatoryTitle,
  showDivider,
}: {
  row: MarkSheetPrintRow
  examTitleMr: string
  recognitionLine: string
  sessionLine: string | null
  resultDate: string
  paperMax: number
  oralMax: number
  gradeBands: { third: string; second: string; first: string }
  notice: string
  signatoryTitle: string
  showDivider: boolean
}) => {
  const m1 = parseMark(row.marks1)
  const m2 = parseMark(row.marks2)
  const m3 = parseMark(row.marks3)
  const written =
    m1 != null || m2 != null || m3 != null
      ? (m1 ?? 0) + (m2 ?? 0) + (m3 ?? 0)
      : row.totMarks ?? null
  const oral = parseMark(row.oralMarks)
  const special = formatSpecialPlace(row.specialRank)
  const paperMaxHi = toDevanagariDigits(paperMax)
  const oralMaxHi = toDevanagariDigits(oralMax)
  const papers = [
    { label: 'प्रश्नपत्र - १', obtained: m1 ?? row.marks1 ?? '' },
    { label: 'प्रश्नपत्र - २', obtained: m2 ?? row.marks2 ?? '' },
    { label: 'प्रश्नपत्र - ३', obtained: m3 ?? row.marks3 ?? '' },
  ]

  return (
    <Box
      className="mark-sheet-card"
      sx={{
        boxSizing: 'border-box',
        // Shorter card so top + L/R page margins still leave room for 2 records
        height: '132mm',
        maxHeight: '132mm',
        overflow: 'hidden',
        pb: 0.35,
        mb: showDivider ? '4mm' : 0,
        borderBottom: showDivider ? '1px solid #000' : 'none',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
      }}
    >
      {/* Header */}
      <Typography sx={{ textAlign: 'center', fontSize: '12pt', fontWeight: 700, lineHeight: 1.1 }}>
        महाराष्ट्र राष्ट्रभाषा सभा, पुणे
      </Typography>
      <Typography sx={{ textAlign: 'center', fontSize: '11.5pt', fontWeight: 800, lineHeight: 1.1, mt: 0.1 }}>
        {examTitleMr}
      </Typography>
      <Typography sx={{ textAlign: 'center', fontSize: '7pt', fontWeight: 600, lineHeight: 1.15, mt: 0.1 }}>
        {recognitionLine}
      </Typography>
      <Typography sx={{ textAlign: 'center', fontSize: '11.5pt', fontWeight: 800, mt: 0.25, mb: 0.5 }}>
        अंक - सूची
      </Typography>

      {/* Student details — open two-column lines (no boxes) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.45fr 0.55fr',
          columnGap: 2,
          rowGap: 0.25,
          mb: 0.65,
          fontSize: '10pt',
          fontWeight: 600,
        }}
      >
        <Box>
          <Box component="span" sx={{ fontWeight: 600 }}>परीक्षार्थी का नाम : </Box>
          <Box component="span" sx={{ fontWeight: 700 }}>{row.name?.trim() || '—'}</Box>
        </Box>
        <Box>
          <Box component="span" sx={{ fontWeight: 600 }}>क्रमांक : </Box>
          <Box component="span" sx={{ fontWeight: 700 }}>{row.rollNo != null ? row.rollNo : '—'}</Box>
        </Box>
        <Box>
          <Box component="span" sx={{ fontWeight: 600 }}>परीक्षा केंद्र : </Box>
          <Box component="span" sx={{ fontWeight: 700 }}>{centreDisplay(row)}</Box>
        </Box>
        <Box>
          <Box component="span" sx={{ fontWeight: 600 }}>सत्र : </Box>
          <Box component="span" sx={{ fontWeight: 700 }}>{sessionLine ?? '—'}</Box>
        </Box>
      </Box>

      <Typography sx={{ textAlign: 'center', fontSize: '8.5pt', fontWeight: 700, mb: 0.45 }}>
        {examTitleMr} में प्राप्त किए अंकों का प्रश्नपत्र के अनुसार विवरण
      </Typography>

      {/* Paper rows — open layout with checkbox squares (not a bordered grid) */}
      <Box sx={{ width: '100%', mb: 0.15 }}>
        {papers.map((paper) => (
          <Box
            key={paper.label}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1.15fr 1.1fr 0.85fr 0.55fr',
              alignItems: 'center',
              py: 0.15,
              fontSize: '10pt',
              fontWeight: 600,
            }}
          >
            <Box>{paper.label}</Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              कुल अंक {paperMaxHi}
              <CheckBox />
            </Box>
            <Box>प्राप्त अंक</Box>
            <Box sx={{ textAlign: 'right', fontWeight: 700, pr: 1 }}>
              {paper.obtained}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Rule under papers */}
      <Box sx={{ borderTop: '1px solid #000', my: 0.3 }} />

      {/* कुल — 300/ left, total right */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1.1fr 0.85fr 0.55fr',
          alignItems: 'center',
          py: 0.15,
          fontSize: '10pt',
          fontWeight: 700,
        }}
      >
        <Box>कुल</Box>
        <Box>{paperMax * 3}/</Box>
        <Box />
        <Box sx={{ textAlign: 'right', pr: 1 }}>{written ?? ''}</Box>
      </Box>

      {/* मौखिक */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1.1fr 1.4fr',
          alignItems: 'center',
          py: 0.2,
          mt: 0.2,
          fontSize: '10pt',
          fontWeight: 600,
        }}
      >
        <Box>मौखिक परीक्षा</Box>
        <Box>कुल अंक {oralMaxHi}</Box>
        <Box>
          प्राप्त अंक{' '}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {oral ?? row.oralMarks ?? ''}
          </Box>
        </Box>
      </Box>

      {/* श्रेणी / विशेष स्थान */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          mt: 0.45,
          fontSize: '10pt',
          fontWeight: 600,
        }}
      >
        <Box>
          श्रेणी{' '}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {formatGradeLabel(row.grade)}
          </Box>
        </Box>
        <Box>
          विशेष स्थान{' '}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {special || ''}
          </Box>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '10pt', fontWeight: 700, mt: 0.4 }}>
        परीक्षा फल {formatResultLine(row.result)}
      </Typography>

      {/* Date / logo / signature */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'flex-end',
          mt: 0.9,
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: '9.5pt', fontWeight: 600 }}>
          परीक्षा फल ता. {resultDate}
        </Typography>
        <Box
          component="img"
          src={monoLogo}
          alt=""
          sx={{ width: 34, height: 34, objectFit: 'contain' }}
        />
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ borderBottom: '1px solid #000', height: '14pt', mb: 0.25, mx: '10%' }} />
          <Typography sx={{ fontSize: '9pt', fontWeight: 600 }}>{signatoryTitle}</Typography>
        </Box>
      </Box>

      {/* Bottom rule + grade key */}
      <Box sx={{ borderTop: '1px solid #000', mt: 0.7, pt: 0.35 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            fontSize: '7.5pt',
            fontWeight: 600,
          }}
        >
          <Box>तीसरी श्रेणी {gradeBands.third}</Box>
          <Box>दूसरी श्रेणी {gradeBands.second}</Box>
          <Box>पहली श्रेणी {gradeBands.first}</Box>
        </Box>
        <Typography sx={{ fontSize: '7pt', fontWeight: 600, mt: 0.2 }}>
          सूचना - {notice}
        </Typography>
      </Box>
    </Box>
  )
}

/**
 * Legacy Prabodh mark sheet (अंक - सूची) matching screen snap layout.
 * Open lines + checkboxes (not a bordered grid). Two records per page.
 */
export const MarkSheetPrint = ({
  printId,
  header,
  rows,
  examTitleMr = 'राष्ट्रभाषा प्रबोध परीक्षा',
  recognitionLine = '(भारत सरकार द्वारा मान्य, मैट्रिक स्तर की हिंदी के समकक्ष)',
  cardsPerPage = 2,
  paperMax = 100,
  oralMax = 100,
  gradeBands = {
    third: '१०५ से १४९',
    second: '१५० से १७९',
    first: '१८० से ऊपर',
  },
  notice = 'रा. भा. प्रवीण परीक्षा के आवेदनपत्र के साथ इसकी प्रमाणित प्रतिलिपि भेजी जाए।',
  signatoryTitle = 'सचिव, परीक्षा विभाग',
}: Props) => {
  const sessionLine = formatSessionLine(header.month, header.year)
  const resultDate = formatDate(header.resultDate)
  const ordered = [...rows].sort((a, b) => (a.rollNo ?? 0) - (b.rollNo ?? 0))
  const pages = chunk(ordered, Math.max(1, cardsPerPage))

  return (
    <>
      <Box
        id={printId}
        className="report-print-root mark-sheet"
        sx={{
          ...marathiSx,
          color: '#000',
          bgcolor: '#fff',
          fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif',
        }}
      >
        {pages.map((pageRows, pageIndex) => (
          <Box
            key={`mark-page-${pageIndex}`}
            className={`mark-sheet-page${pageIndex === pages.length - 1 ? ' mark-sheet-page-last' : ''}`}
            sx={{
              width: '100%',
              maxWidth: '210mm',
              height: '297mm',
              minHeight: '297mm',
              maxHeight: '297mm',
              mx: 'auto',
              // Page margins: left/right + top; cards shortened to keep 2/page
              px: '22mm',
              pt: '10mm',
              pb: '7mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
              pageBreakAfter: pageIndex === pages.length - 1 ? 'auto' : 'always',
              breakAfter: pageIndex === pages.length - 1 ? 'auto' : 'page',
            }}
          >
            {pageRows.map((row, index) => (
              <MarkCard
                key={`${row.rollNo ?? 'r'}-${pageIndex}-${index}`}
                row={row}
                examTitleMr={examTitleMr}
                recognitionLine={recognitionLine}
                sessionLine={sessionLine}
                resultDate={resultDate}
                paperMax={paperMax}
                oralMax={oralMax}
                gradeBands={gradeBands}
                notice={notice}
                signatoryTitle={signatoryTitle}
                showDivider={index < pageRows.length - 1}
              />
            ))}
          </Box>
        ))}
      </Box>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body * { visibility: hidden !important; }
          #${printId}, #${printId} * { visibility: visible !important; }
          #${printId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            margin: 0;
            padding: 0;
            color: #000 !important;
            background: #fff !important;
            font-family: "Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #${printId} .mark-sheet-page {
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 10mm 22mm 7mm 22mm !important;
            overflow: hidden !important;
            page-break-after: always;
            break-after: page;
          }
          #${printId} .mark-sheet-page-last {
            page-break-after: auto;
            break-after: auto;
          }
          #${printId} .mark-sheet-card {
            height: 132mm !important;
            max-height: 132mm !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          #${printId} .mark-sheet-card:not(:last-child) {
            margin-bottom: 4mm !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}
