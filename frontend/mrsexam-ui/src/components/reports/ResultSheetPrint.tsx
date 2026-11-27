import { Box, Typography } from '@mui/material'

import type { ReportPrintHeader } from './ReportPrintChrome'
import { marathiNameFieldSx } from '../../utils/marathiTransliterate'

export type ResultSheetPrintRow = {
  rollNo?: number | null
  name?: string | null
  /** Optional subject (मराठी ऐच्छिक) — Praveen regLang; usually blank for Prabodh */
  optionalSubject?: string | null
  totMarks?: number | null
  oralMarks?: string | null
  grade?: string | null
  specialRank?: string | null
}

export type ResultSheetCentreSection = {
  header: ReportPrintHeader
  mode: string
  rows: ResultSheetPrintRow[]
}

type Props = {
  printId: string
  sections: ResultSheetCentreSection[]
  /** Devanagari exam title, e.g. राष्ट्रभाषा प्रबोध परीक्षा */
  examTitleMr: string
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

const MONTH_DV: Record<string, string> = {
  '¡ò®ú´É®úÒ': 'फरवरी',
  '¨ÉÉSÉÇ': 'मार्च',
  '+CiÉÚ¤É®ú': 'अक्टूबर',
  'ÊºÉiÉÆ¤É®ú': 'सितंबर',
}

const GRADE_NOTE = 'श्रेणी कुल लिखित प्राप्तांक के आधार पर दी गई है।'

const marathiSx = marathiNameFieldSx['& .MuiInputBase-input']

const toDevanagariDigits = (value: string) =>
  value.replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)] ?? d)

const hasDevanagari = (value: string) => /[\u0900-\u097F]/.test(value)

const toMarathiMonth = (month?: string | null): string | null => {
  const raw = (month ?? '').trim()
  if (!raw) return null
  if (hasDevanagari(raw)) {
    return raw === 'अक्तूबर' ? 'अक्टूबर' : raw
  }
  const fromEnglish = MONTH_HI[raw.toLowerCase()]
  if (fromEnglish) return fromEnglish
  const fromDv = MONTH_DV[raw]
  if (fromDv) return fromDv
  return raw
}

const formatSessionLine = (month?: string | null, year?: string | null) => {
  const monthHi = toMarathiMonth(month)
  const yearText = year?.trim() ? toDevanagariDigits(year.trim()) : null
  if (monthHi && yearText) return `${monthHi} - ${yearText}`
  if (monthHi) return monthHi
  if (yearText) return yearText
  return null
}

const formatPrintDate = (value?: string | null) => {
  if (value) {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0')
      const mm = String(parsed.getMonth() + 1).padStart(2, '0')
      const yyyy = parsed.getFullYear()
      return `${dd}-${mm}-${yyyy}`
    }
  }
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

/** Legacy श्रेणी: FIRST → वि.यो, else GRADE (1/2/3/X). */
const formatCategory = (row: ResultSheetPrintRow): string => {
  const rank = (row.specialRank ?? '').trim()
  if (rank) {
    if (/^first\b/i.test(rank)) return 'वि.यो'
    return rank
  }
  return (row.grade ?? '').trim()
}

type CentreBlockProps = {
  examTitleMr: string
  sessionLine: string | null
  centreName: string | null
  rows: ResultSheetPrintRow[]
  showNames: boolean
  dateText: string
  signatoryTitle: string
  isLast: boolean
}

const CentreBlock = ({
  examTitleMr,
  sessionLine,
  centreName,
  rows,
  showNames,
  dateText,
  signatoryTitle,
  isLast,
}: CentreBlockProps) => {
  const rolls = rows
    .map((row) => row.rollNo)
    .filter((roll): roll is number => roll != null)
  const fromRoll = rolls.length > 0 ? Math.min(...rolls) : null
  const toRoll = rolls.length > 0 ? Math.max(...rolls) : null

  return (
    <Box
      className={`result-sheet-centre${isLast ? ' result-sheet-centre-last' : ''}`}
      sx={{
        width: '100%',
        maxWidth: '210mm',
        mx: 'auto',
        px: '14mm',
        pt: '12mm',
        pb: '12mm',
        boxSizing: 'border-box',
        color: '#000',
        bgcolor: '#fff',
        pageBreakAfter: isLast ? 'auto' : 'always',
        breakAfter: isLast ? 'auto' : 'page',
      }}
    >
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '16pt',
          fontWeight: 700,
          lineHeight: 1.25,
          mb: 0.35,
        }}
      >
        महाराष्ट्र राष्ट्रभाषा सभा, पुणे
      </Typography>
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '15pt',
          fontWeight: 800,
          lineHeight: 1.25,
          mb: 0.25,
        }}
      >
        {examTitleMr}
      </Typography>
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '13pt',
          fontWeight: 700,
          lineHeight: 1.3,
          mb: 0.25,
        }}
      >
        परीक्षा - फल
      </Typography>
      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '12pt',
          fontWeight: 700,
          lineHeight: 1.3,
          mb: 1.5,
        }}
      >
        {sessionLine ?? '\u00a0'}
      </Typography>

      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          '& th, & td': {
            border: '1px solid #000',
            verticalAlign: 'middle',
            fontSize: '10.5pt',
            fontWeight: 600,
            padding: '3px 5px',
            lineHeight: 1.25,
          },
          '& th': {
            textAlign: 'center',
            fontWeight: 700,
            height: '30pt',
          },
          '& td.roll-cell': {
            textAlign: 'center',
            width: '12%',
          },
          '& td.name-cell': {
            textAlign: 'left',
            width: '36%',
            fontWeight: 600,
          },
          '& td.opt-cell': {
            textAlign: 'center',
            width: '14%',
          },
          '& td.num-cell': {
            textAlign: 'center',
            width: '12%',
          },
          '& td.grade-cell': {
            textAlign: 'center',
            width: '14%',
          },
        }}
      >
        <thead>
          <tr>
            <th>
              <Box component="span" sx={{ display: 'block' }}>बैठक</Box>
              <Box component="span" sx={{ display: 'block' }}>संख्या</Box>
            </th>
            <th>परीक्षार्थी का नाम</th>
            <th>
              <Box component="span" sx={{ display: 'block' }}>मराठी</Box>
              <Box component="span" sx={{ display: 'block' }}>ऐच्छिक</Box>
            </th>
            <th>
              <Box component="span" sx={{ display: 'block' }}>कुल</Box>
              <Box component="span" sx={{ display: 'block' }}>प्राप्तांक</Box>
            </th>
            <th>मौखिक</th>
            <th>श्रेणी</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.rollNo ?? 'x'}-${index}`}>
              <td className="roll-cell">{row.rollNo ?? ''}</td>
              <td className="name-cell">
                {showNames ? (row.name ?? '') : ''}
              </td>
              <td className="opt-cell">{row.optionalSubject ?? ''}</td>
              <td className="num-cell">{row.totMarks ?? ''}</td>
              <td className="num-cell">{row.oralMarks ?? ''}</td>
              <td className="grade-cell">{formatCategory(row)}</td>
            </tr>
          ))}
        </tbody>
      </Box>

      {/* Footer immediately after table (not pinned to page bottom) */}
      <Box sx={{ mt: 1.75, fontSize: '11pt', fontWeight: 600, lineHeight: 1.55 }}>
        <Typography sx={{ fontSize: '11pt', fontWeight: 600 }}>
          परीक्षा केंद्र : {centreName?.trim() || '—'}
        </Typography>
        <Typography sx={{ fontSize: '11pt', fontWeight: 600 }}>
          बैठक संख्या :{' '}
          {fromRoll != null && toRoll != null ? `${fromRoll} से ${toRoll}` : '—'}
        </Typography>
        <Typography sx={{ fontSize: '10.5pt', fontWeight: 600, mt: 0.35 }}>
          {GRADE_NOTE}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 3,
          mt: 2.5,
        }}
      >
        <Typography sx={{ fontSize: '11pt', fontWeight: 600 }}>
          परीक्षा की तारीख : {dateText}
        </Typography>
        <Box sx={{ textAlign: 'center', minWidth: '42%' }}>
          <Box sx={{ borderBottom: '1px solid #000', height: '22pt', mb: 0.5, mx: '12%' }} />
          <Typography sx={{ fontSize: '11pt', fontWeight: 600 }}>
            {signatoryTitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

/**
 * Legacy result sheet (परीक्षा - फल).
 * One centre per print section; footer sits right after that centre’s rows; page-break between centres.
 */
export const ResultSheetPrint = ({
  printId,
  sections,
  examTitleMr,
  signatoryTitle = 'सचिव, परीक्षा विभाग',
}: Props) => {
  const blocks = sections.length > 0
    ? sections.map((section, sectionIndex) => {
        const code = section.header.centreNo ?? 'centre'
        return {
          key: `res-${sectionIndex}-${code}`,
          rows: section.rows,
          sessionLine: formatSessionLine(section.header.month, section.header.year),
          centreName: section.header.centreName?.trim()
            || section.header.centreNo?.trim()
            || null,
          showNames: section.mode !== 'noname',
          dateText: formatPrintDate(section.header.resultDate),
        }
      })
    : [{
        key: 'res-empty',
        rows: [] as ResultSheetPrintRow[],
        sessionLine: null as string | null,
        centreName: null as string | null,
        showNames: true,
        dateText: formatPrintDate(null),
      }]

  return (
    <>
      <Box
        id={printId}
        className="report-print-root result-sheet"
        sx={{
          ...marathiSx,
          color: '#000',
          bgcolor: '#fff',
          fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif',
        }}
      >
        {blocks.map((block, index) => (
          <CentreBlock
            key={block.key}
            examTitleMr={examTitleMr}
            sessionLine={block.sessionLine}
            centreName={block.centreName}
            rows={block.rows}
            showNames={block.showNames}
            dateText={block.dateText}
            signatoryTitle={signatoryTitle}
            isLast={index === blocks.length - 1}
          />
        ))}
      </Box>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm 0; }
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
          #${printId} .result-sheet-centre {
            page-break-after: always;
            break-after: page;
          }
          #${printId} .result-sheet-centre-last {
            page-break-after: auto;
            break-after: auto;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}
