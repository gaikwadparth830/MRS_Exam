import { Box, Typography } from '@mui/material'

import type { CentreListReport } from '../../api/common/centreListClient'
import { marathiNameFieldSx } from '../../utils/marathiTransliterate'

type Props = {
  printId: string
  report: CentreListReport
  orgAddress?: string
}

const marathiSx = marathiNameFieldSx['& .MuiInputBase-input']

const toDevanagariDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)] ?? d)

/**
 * Legacy Rpt_CentreList — केंद्र सूची (centre no, name, address).
 */
export const CentreListPrint = ({
  printId,
  report,
  orgAddress = '३८७, नारायण पेठ, पुणे ४११० ३०.',
}: Props) => {
  const printDateMr = toDevanagariDigits(report.printDate || '')

  return (
    <>
      <Box
        id={printId}
        className="report-print-root centre-list"
        sx={{
          ...marathiSx,
          color: '#000',
          bgcolor: '#fff',
          fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif',
          width: '100%',
          maxWidth: '210mm',
          mx: 'auto',
          px: '10mm',
          pt: '8mm',
          pb: '10mm',
          boxSizing: 'border-box',
        }}
      >
        <Typography sx={{ textAlign: 'center', fontSize: '13.5pt', fontWeight: 800, lineHeight: 1.25 }}>
          महाराष्ट्र राष्ट्रभाषा सभा, पुणे
        </Typography>
        <Typography sx={{ textAlign: 'center', fontSize: '11pt', fontWeight: 600, mt: 0.25 }}>
          {orgAddress}
        </Typography>

        <Box sx={{ borderTop: '1.5px solid #000', mt: 1, mb: 0.75 }} />

        <Box sx={{ position: 'relative', minHeight: '1.4em', mb: 0.5 }}>
          <Typography sx={{ textAlign: 'center', fontSize: '12.5pt', fontWeight: 800 }}>
            {report.header.titleMr ?? 'केंद्र सूची'}
          </Typography>
          <Typography
            className="centre-list-page-label"
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              fontSize: '10.5pt',
              fontWeight: 600,
            }}
          >
            पृष्ठ क्रमांक :{' '}
            <Box component="span" className="centre-list-page-num" />
          </Typography>
        </Box>

        <Typography sx={{ textAlign: 'center', fontSize: '11pt', fontWeight: 600, mb: 0.75 }}>
          {printDateMr}
        </Typography>

        <Box sx={{ borderTop: '2px solid #000', borderBottom: '1px solid #000', mb: 0.5 }} />

        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            '& th, & td': {
              padding: '2px 4px',
              fontSize: '10pt',
              fontWeight: 600,
              verticalAlign: 'top',
              lineHeight: 1.25,
              textAlign: 'left',
            },
            '& th': {
              fontWeight: 800,
              paddingBottom: '4px',
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '16%' }}>केंद्र क्रमांक</th>
              <th style={{ width: '42%' }}>केंद्र का नाम</th>
              <th style={{ width: '42%' }}>केंद्र का पता</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row, index) => (
              <tr key={`${row.centreNo ?? 'c'}-${index}`}>
                <td>{row.centreNo ? toDevanagariDigits(row.centreNo) : ''}</td>
                <td>{row.centreName?.trim() || ''}</td>
                <td>{row.address?.trim() || ''}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 12mm 10mm;
          }
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
          .centre-list-page-num::after {
            content: counter(page) "/" counter(pages);
          }
          .no-print { display: none !important; }
        }
        .centre-list-page-num::after {
          content: "1";
        }
      `}</style>
    </>
  )
}
