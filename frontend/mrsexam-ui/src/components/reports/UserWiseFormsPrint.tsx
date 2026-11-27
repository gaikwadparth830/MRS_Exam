import { Box, Typography } from '@mui/material'

import { marathiNameFieldSx } from '../../utils/marathiTransliterate'
import type { UserWiseFormsReport } from '../../api/common/userWiseFormsClient'

type Props = {
  printId: string
  report: UserWiseFormsReport
}

const marathiSx = marathiNameFieldSx['& .MuiInputBase-input']

/**
 * Legacy Rpt_TotalForms — USERID | EXAM | NO OF FORMS.
 */
export const UserWiseFormsPrint = ({ printId, report }: Props) => {
  const { header, rows } = report

  return (
    <>
      <Box
        id={printId}
        className="report-print-root userwise-forms"
        sx={{
          ...marathiSx,
          color: '#000',
          bgcolor: '#fff',
          fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", "Arial Unicode MS", sans-serif',
          width: '100%',
          maxWidth: '210mm',
          mx: 'auto',
          px: '14mm',
          pt: '12mm',
          pb: '12mm',
          boxSizing: 'border-box',
        }}
      >
        <Typography sx={{ textAlign: 'center', fontSize: '14pt', fontWeight: 800, lineHeight: 1.3 }}>
          महाराष्ट्र राष्ट्रभाषा सभा, पुणे
        </Typography>
        <Typography sx={{ textAlign: 'center', fontSize: '13pt', fontWeight: 700, mt: 1 }}>
          {header.title ?? 'Userwise Total Number Of Forms'}
        </Typography>
        <Typography sx={{ textAlign: 'center', fontSize: '12pt', fontWeight: 600, mt: 0.5 }}>
          Session - {header.sessionNo}
        </Typography>

        <Box sx={{ borderTop: '1.5px solid #000', mt: 1.5, mb: 0.5 }} />

        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            '& th, & td': {
              padding: '3px 8px',
              fontSize: '11pt',
              fontWeight: 600,
              verticalAlign: 'top',
              lineHeight: 1.35,
            },
            '& th': {
              fontWeight: 800,
              textAlign: 'left',
              borderBottom: '1px solid #000',
            },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '28%' }}>USERID</th>
              <th style={{ width: '44%' }}>EXAM</th>
              <th style={{ width: '28%' }}>NO OF FORMS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.userId}-${row.exam}-${index}`}>
                <td>{row.userId ?? ''}</td>
                <td>{row.exam ?? ''}</td>
                <td>{row.formCount ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
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
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}
