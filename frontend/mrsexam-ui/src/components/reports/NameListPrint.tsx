import { Box, Typography } from '@mui/material'

import { marathiNameFieldSx } from '../../utils/marathiTransliterate'
import type { ReportPrintHeader } from './ReportPrintChrome'

export type NameListPrintRow = {
  rollNo?: number | null
  name?: string | null
}

export type NameListPrintSection = {
  centreName?: string | null
  districtName?: string | null
  rows: NameListPrintRow[]
}

type Props = {
  printId: string
  header: ReportPrintHeader
  examTitleMr: string
  sections: NameListPrintSection[]
}

const MONTH_HI: Record<string, string> = {
  january: 'जनवरी',
  february: 'फेब्रुवारी',
  march: 'मार्च',
  april: 'एप्रिल',
  may: 'मे',
  june: 'जून',
  july: 'जुलै',
  august: 'ऑगस्ट',
  september: 'सप्टेंबर',
  october: 'ऑक्टोबर',
  november: 'नोव्हेंबर',
  december: 'डिसेंबर',
  jan: 'जनवरी',
  feb: 'फेब्रुवारी',
  mar: 'मार्च',
  apr: 'एप्रिल',
  jun: 'जून',
  jul: 'जुलै',
  aug: 'ऑगस्ट',
  sep: 'सप्टेंबर',
  oct: 'ऑक्टोबर',
  nov: 'नोव्हेंबर',
  dec: 'डिसेंबर',
  फरवरी: 'फेब्रुवारी',
}

const marathiSx = marathiNameFieldSx['& .MuiInputBase-input']

const toDevanagariDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)] ?? d)

const hasDevanagari = (value: string) => /[\u0900-\u097F]/.test(value)

const toMonthMr = (month?: string | null): string | null => {
  const raw = (month ?? '').trim()
  if (!raw) return null
  if (hasDevanagari(raw)) {
    return MONTH_HI[raw] ?? (raw === 'अक्तूबर' ? 'ऑक्टोबर' : raw)
  }
  return MONTH_HI[raw.toLowerCase()] ?? raw
}

const formatSessionLine = (month?: string | null, year?: string | null) => {
  const monthMr = toMonthMr(month)
  const yearText = year?.trim() ? toDevanagariDigits(year.trim()) : null
  if (monthMr && yearText) return `${monthMr} - ${yearText}`
  if (monthMr) return monthMr
  if (yearText) return yearText
  return null
}

const rollRangeLabel = (rows: NameListPrintRow[]) => {
  const rolls = rows
    .map((r) => r.rollNo)
    .filter((n): n is number => n != null && Number.isFinite(n))
  if (rolls.length === 0) return null
  const from = Math.min(...rolls)
  const to = Math.max(...rolls)
  return `क्रमसंख्या ${from} से ${to}`
}

/**
 * Legacy name list — परीक्षार्थियों की नामसूची (roll + name per centre).
 */
export const NameListPrint = ({ printId, header, examTitleMr, sections }: Props) => {
  const sessionLine = formatSessionLine(header.month, header.year)

  return (
    <>
      <Box
        id={printId}
        className="report-print-root name-list"
        sx={{
          ...marathiSx,
          color: '#000',
          bgcolor: '#fff',
          fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif',
          width: '100%',
          maxWidth: '210mm',
          mx: 'auto',
          px: '12mm',
          pt: '10mm',
          pb: '10mm',
          boxSizing: 'border-box',
        }}
      >
        {sections.map((section, sectionIndex) => {
          const range = rollRangeLabel(section.rows)
          return (
            <Box
              key={`nl-${sectionIndex}`}
              className="name-list-section"
              sx={{
                pageBreakAfter: sectionIndex < sections.length - 1 ? 'always' : 'auto',
                breakAfter: sectionIndex < sections.length - 1 ? 'page' : 'auto',
                mb: sectionIndex < sections.length - 1 ? 4 : 0,
              }}
            >
              <Typography sx={{ textAlign: 'center', fontSize: '13.5pt', fontWeight: 800, lineHeight: 1.3 }}>
                महाराष्ट्र राष्ट्रभाषा सभा,पुणे
              </Typography>
              <Typography sx={{ textAlign: 'center', fontSize: '12.5pt', fontWeight: 700, mt: 0.25 }}>
                {examTitleMr}
              </Typography>
              <Typography sx={{ textAlign: 'center', fontSize: '12pt', fontWeight: 700, mt: 0.25 }}>
                परीक्षार्थियों की नामसूची
              </Typography>

              {sessionLine ? (
                <Typography sx={{ fontSize: '11pt', fontWeight: 600, mt: 1.25 }}>
                  {sessionLine}
                </Typography>
              ) : null}

              <Box sx={{ borderTop: '1.5px solid #000', mt: 0.5 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 0.75,
                  fontSize: '11pt',
                  fontWeight: 600,
                }}
              >
                <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                  केंद्र का नाम : {section.centreName?.trim() || '—'}
                </Typography>
                <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', textAlign: 'right' }}>
                  जिला : {section.districtName?.trim() || '—'}
                </Typography>
              </Box>

              <Box sx={{ borderTop: '1.5px solid #000' }} />

              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  mt: 0.25,
                  '& th, & td': {
                    padding: '4px 6px',
                    fontSize: '11pt',
                    fontWeight: 600,
                    verticalAlign: 'top',
                    lineHeight: 1.3,
                    textAlign: 'left',
                  },
                  '& th': {
                    fontWeight: 800,
                  },
                  '& tbody td': {
                    borderBottom: '1px solid #000',
                  },
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>परीक्षार्थी की क्रमसंख्या</th>
                    <th style={{ width: '72%' }}>परीक्षार्थी का नाम</th>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ padding: 0, borderBottom: '2px solid #000', height: 2 }} />
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, index) => (
                    <tr key={`${row.rollNo ?? 'r'}-${index}`}>
                      <td>{row.rollNo != null ? row.rollNo : ''}</td>
                      <td>{row.name?.trim() || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>

              <Box sx={{ borderTop: '1.5px solid #000', mt: 0.5 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 0.75,
                  fontSize: '10.5pt',
                  fontWeight: 600,
                }}
              >
                <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
                  {range ?? '\u00a0'}
                </Typography>
                <Typography
                  className="name-list-page-label"
                  sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
                >
                  Page No : <Box component="span" className="name-list-page-num" />
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm 12mm; }
          body * { visibility: hidden !important; }
          #${printId}, #${printId} * { visibility: visible !important; }
          #${printId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            color: #000 !important;
            background: #fff !important;
            font-family: "Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #${printId} thead { display: table-header-group; }
          #${printId} tr { page-break-inside: avoid; }
          .name-list-page-num::after { content: counter(page); }
          .no-print { display: none !important; }
        }
        .name-list-page-num::after { content: "1"; }
      `}</style>
    </>
  )
}
