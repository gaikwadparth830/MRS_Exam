import { Box, Typography } from '@mui/material'

import type { ReportPrintHeader } from './ReportPrintChrome'
import { marathiNameFieldSx } from '../../utils/marathiTransliterate'

type Pair = { rollNo1?: number | null; rollNo2?: number | null }

export type AttendanceCentreSection = {
  header: ReportPrintHeader
  pairs: Pair[]
}

type Props = {
  printId: string
  /** One or more centres — each centre starts on a new printed page. */
  sections: AttendanceCentreSection[]
  /** Devanagari exam title, e.g. राष्ट्रभाषा प्रबोध परीक्षा */
  examTitleMr: string
  /** Signature columns (Praveen=5, Prabodh=3, …) */
  paperCount?: number
  /** Rolls per printed page (legacy A4 fit with header + footer) */
  rowsPerPage?: number
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

const PAPER_LABELS = [
  'पहला प्रश्नपत्र',
  'दूसरा प्रश्नपत्र',
  'तीसरा प्रश्नपत्र',
  'चौथा प्रश्नपत्र',
  'पांचवा प्रश्नपत्र',
  'छठा प्रश्नपत्र',
  'सातवां प्रश्नपत्र',
  'आठवां प्रश्नपत्र',
]

/** Exact notice text from legacy attendance MS Data Report. */
const INSTRUCTIONS =
  '(सूचना : (1) उपस्थितिपत्र भरते समय देख लिया जाए कि परीक्षार्थी के प्रवेशपत्र का क्रमांक और उसको दी गई '
  + 'उत्तर-पुस्तक का क्रमांक एक ही है। (2) उपस्थितिपत्र पर परीक्षार्थी से हस्ताक्षर कराना जरूरी है। (3) प्रवेशपत्र पर '
  + 'किए गए हस्ताक्षर इस पत्र पर किए गए हस्ताक्षर से न मिलें या कोई अन्य आशंका हो तो सब तरह से निश्चित कर '
  + 'लिया जाए कि असली परीक्षार्थी ही परीक्षा में सम्मिलित हुआ है।)'

const marathiSx = marathiNameFieldSx['& .MuiInputBase-input']

const toDevanagariDigits = (value: string) =>
  value.replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)] ?? d)

/** Known DV-TTAakash month spellings from SESSION.MONTH (fallback if API not yet normalized). */
const MONTH_DV: Record<string, string> = {
  '¡ò®ú´É®úÒ': 'फरवरी',
  '¨ÉÉSÉÇ': 'मार्च',
  '+CiÉÚ¤É®ú': 'अक्टूबर',
  'ÊºÉiÉÆ¤É®ú': 'सितंबर',
}

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

const flattenRolls = (pairs: Pair[]): number[] => {
  const rolls: number[] = []
  for (const pair of pairs) {
    if (pair.rollNo1 != null) rolls.push(pair.rollNo1)
    if (pair.rollNo2 != null) rolls.push(pair.rollNo2)
  }
  return rolls
}

const chunk = <T,>(items: T[], size: number): T[][] => {
  if (items.length === 0) return [[]]
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}

type SheetPageProps = {
  papers: string[]
  rolls: number[]
  examTitleMr: string
  sessionLine: string | null
  centreLine: string | null
  isLast: boolean
}

const SheetPage = ({
  papers,
  rolls,
  examTitleMr,
  sessionLine,
  centreLine,
  isLast,
}: SheetPageProps) => {
  const fromRoll = rolls.length > 0 ? rolls[0] : null
  const toRoll = rolls.length > 0 ? rolls[rolls.length - 1] : null

  return (
    <Box
      className={`attendance-sheet-page${isLast ? ' attendance-sheet-page-last' : ''}`}
      sx={{
        width: '100%',
        maxWidth: '210mm',
        minHeight: '297mm',
        mx: 'auto',
        px: '14mm',
        pt: '10mm',
        pb: '12mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        color: '#000',
        bgcolor: '#fff',
        pageBreakAfter: isLast ? 'auto' : 'always',
        breakAfter: isLast ? 'auto' : 'page',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 2,
          mb: 0.75,
        }}
      >
        <Typography sx={{ fontSize: '15pt', fontWeight: 700, lineHeight: 1.2 }}>
          महाराष्ट्र राष्ट्रभाषा सभा, पुणे
        </Typography>
        <Typography sx={{ fontSize: '15pt', fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          उपस्थिति पत्र
        </Typography>
      </Box>

      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '16pt',
          fontWeight: 800,
          lineHeight: 1.25,
          mb: 0.75,
        }}
      >
        {examTitleMr}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 2.2fr 0.6fr',
          alignItems: 'baseline',
          columnGap: 1,
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: '11pt', fontWeight: 600 }}>
          {sessionLine ?? '\u00a0'}
        </Typography>
        <Typography sx={{ fontSize: '11pt', fontWeight: 600, textAlign: 'center' }}>
          {centreLine ?? '\u00a0'}
        </Typography>
        <Box />
      </Box>

      <Typography
        sx={{
          fontSize: '9pt',
          lineHeight: 1.45,
          mb: 1.5,
          textAlign: 'justify',
        }}
      >
        {INSTRUCTIONS}
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
            fontSize: '10pt',
            fontWeight: 600,
            padding: '2px 4px',
          },
          '& th': {
            textAlign: 'center',
            fontWeight: 700,
            lineHeight: 1.25,
            height: '28pt',
          },
          '& td.roll-cell': {
            textAlign: 'center',
            width: '18%',
            height: '22pt',
            fontSize: '11pt',
          },
          '& td.sign-cell': {
            height: '22pt',
          },
        }}
      >
        <thead>
          <tr>
            <th>
              <Box component="span" sx={{ display: 'block', lineHeight: 1.2 }}>
                परीक्षार्थी की
              </Box>
              <Box component="span" sx={{ display: 'block', lineHeight: 1.2 }}>
                क्रमसंख्या
              </Box>
            </th>
            {papers.map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rolls.map((roll) => (
            <tr key={roll}>
              <td className="roll-cell">{roll}</td>
              {papers.map((label) => (
                <td key={label} className="sign-cell" />
              ))}
            </tr>
          ))}
        </tbody>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `18% repeat(${papers.length}, 1fr)`,
          alignItems: 'center',
          mt: 0.75,
          mb: 1,
          fontSize: '11pt',
          fontWeight: 700,
        }}
      >
        <Typography sx={{ fontSize: '11pt', fontWeight: 700, pl: 0.5 }}>
          क्रमसंख्या
        </Typography>
        <Typography
          sx={{
            fontSize: '11pt',
            fontWeight: 700,
            gridColumn: `2 / span ${papers.length}`,
            pl: 0.5,
          }}
        >
          {fromRoll != null && toRoll != null ? `${fromRoll} से ${toRoll}` : '\u00a0'}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: '18mm' }} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 4,
          pt: 1,
        }}
      >
        <Box sx={{ width: '46%' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <Typography sx={{ fontSize: '11pt', fontWeight: 600, whiteSpace: 'nowrap', pb: '1px' }}>
              तारीख
            </Typography>
            <Box sx={{ flex: 1, borderBottom: '1px solid #000', height: '18pt' }} />
          </Box>
        </Box>
        <Box sx={{ width: '46%', textAlign: 'right' }}>
          <Box sx={{ borderBottom: '1px solid #000', height: '18pt', mb: 0.5 }} />
          <Typography sx={{ fontSize: '11pt', fontWeight: 600 }}>
            परीक्षा-संचालक का हस्ताक्षर
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

type BuiltPage = {
  key: string
  rolls: number[]
  sessionLine: string | null
  centreLine: string | null
}

/**
 * Legacy attendance sheet (उपस्थिति पत्र).
 * Multiple centres: each centre starts on a new page (page-break between centres).
 */
export const AttendanceSheetPrint = ({
  printId,
  sections,
  examTitleMr,
  paperCount = 5,
  rowsPerPage = 22,
}: Props) => {
  const papers = PAPER_LABELS.slice(0, Math.max(1, Math.min(paperCount, PAPER_LABELS.length)))
  const pageSize = Math.max(1, rowsPerPage)

  const pages: BuiltPage[] = []
  sections.forEach((section, sectionIndex) => {
    const rolls = flattenRolls(section.pairs)
    const rollPages = chunk(rolls, pageSize)
    const sessionLine = formatSessionLine(section.header.month, section.header.year)
    const centreLine = section.header.centreName
      ? `केंद्र : ${section.header.centreName}`
      : section.header.centreNo
        ? `केंद्र : ${section.header.centreNo}`
        : null

    rollPages.forEach((pageRolls, pageIndex) => {
      pages.push({
        key: `att-${sectionIndex}-${pageIndex}-${section.header.centreNo ?? 'centre'}`,
        rolls: pageRolls,
        sessionLine,
        centreLine,
      })
    })
  })

  const sheetPages = pages.length > 0
    ? pages
    : [{ key: 'att-empty', rolls: [] as number[], sessionLine: null, centreLine: null }]

  return (
    <>
      <Box
        id={printId}
        className="report-print-root attendance-sheet"
        sx={{
          ...marathiSx,
          color: '#000',
          bgcolor: '#fff',
          fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif',
        }}
      >
        {sheetPages.map((page, pageIndex) => (
          <SheetPage
            key={page.key}
            papers={papers}
            rolls={page.rolls}
            examTitleMr={examTitleMr}
            sessionLine={page.sessionLine}
            centreLine={page.centreLine}
            isLast={pageIndex === sheetPages.length - 1}
          />
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
          #${printId} .attendance-sheet-page {
            page-break-after: always;
            break-after: page;
          }
          #${printId} .attendance-sheet-page-last {
            page-break-after: auto;
            break-after: auto;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}
