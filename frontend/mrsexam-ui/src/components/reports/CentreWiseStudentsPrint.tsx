import { Box, Typography } from '@mui/material'

import { marathiNameFieldSx } from '../../utils/marathiTransliterate'
import type { ReportPrintHeader } from './ReportPrintChrome'

export type CentreWiseStudentsPrintRow = {
  centreNo?: string | null
  centreName?: string | null
  rollFrom?: number | null
  rollTo?: number | null
  rollFrom2?: number | null
  rollTo2?: number | null
}

type Props = {
  printId: string
  header: ReportPrintHeader
  rows: CentreWiseStudentsPrintRow[]
  examLabel?: string
  orgAddress?: string
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

const formatRange = (from?: number | null, to?: number | null) => {
  if (from == null || to == null) return '- से -'
  return `${toDevanagariDigits(from)} ते ${toDevanagariDigits(to)}`
}

/**
 * Legacy centre-wise students appearing (Rpt_CentreWiseNoOfStudent).
 * Columns: केंद्र क्रमांक | केंद्र का नाम | roll from-to | optional 2nd range.
 */
export const CentreWiseStudentsPrint = ({
  printId,
  header,
  rows,
  examLabel = 'Prabodh',
  orgAddress = '३८७, नारायण पेठ, पुणे ४११० ३०.',
}: Props) => {
  const sessionLine = formatSessionLine(header.month, header.year)

  return (
    <>
      <Box
        id={printId}
        className="report-print-root centre-wise-students"
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
        <Box sx={{ position: 'relative', mb: 1.5 }}>
          <Typography sx={{ textAlign: 'center', fontSize: '14pt', fontWeight: 800, lineHeight: 1.25 }}>
            महाराष्ट्र राष्ट्रभाषा सभा, पुणे
          </Typography>
          <Typography sx={{ textAlign: 'center', fontSize: '11pt', fontWeight: 600, mt: 0.25 }}>
            {orgAddress}
          </Typography>
          <Box sx={{ position: 'absolute', right: 0, top: 0, textAlign: 'right' }}>
            <Typography sx={{ fontSize: '11pt', fontWeight: 700 }}>{examLabel}</Typography>
            <Typography sx={{ fontSize: '10.5pt', fontWeight: 600 }}>
              {sessionLine ?? '\u00a0'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderTop: '2px solid #000', mb: 0.75 }} />

        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            '& th, & td': {
              borderBottom: '1px solid #000',
              padding: '4px 6px',
              fontSize: '10.5pt',
              fontWeight: 600,
              verticalAlign: 'top',
              lineHeight: 1.3,
            },
            '& th': {
              fontWeight: 800,
              textAlign: 'left',
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '16%' }}>केंद्र क्रमांक</th>
              <th style={{ width: '42%' }}>केंद्र का नाम</th>
              <th style={{ width: '21%' }} />
              <th style={{ width: '21%' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.centreNo ?? 'c'}-${index}`}>
                <td>{row.centreNo ? toDevanagariDigits(row.centreNo) : '—'}</td>
                <td>{row.centreName?.trim() || '—'}</td>
                <td>{formatRange(row.rollFrom, row.rollTo)}</td>
                <td>{formatRange(row.rollFrom2, row.rollTo2)}</td>
              </tr>
            ))}
          </tbody>
        </Box>
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
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}
