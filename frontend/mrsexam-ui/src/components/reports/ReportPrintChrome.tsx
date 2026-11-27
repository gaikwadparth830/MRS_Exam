import type { ReactNode } from 'react'
import { Box, Stack, Typography } from '@mui/material'

import { marathiNameFieldSx } from '../../utils/marathiTransliterate'

export type ReportPrintHeader = {
  sessionNo?: number | null
  month?: string | null
  year?: string | null
  title?: string | null
  titleMr?: string | null
  examName?: string | null
  centreNo?: string | null
  centreName?: string | null
  regionName?: string | null
  resultDate?: string | null
  rowCount?: number | null
}

type Props = {
  printId: string
  header: ReportPrintHeader
  children: ReactNode
  /** Extra summary line(s) under the meta block (e.g. register totals). */
  summary?: ReactNode
}

const marathiCellSx = marathiNameFieldSx['& .MuiInputBase-input']

/**
 * Shared print header + table wrapper for exam report HTML print preview.
 * Uses Devanagari-capable font for titles and Marathi region/centre names.
 */
export const ReportPrintChrome = ({ printId, header, children, summary }: Props) => {
  const sessionLine = [
    header.sessionNo != null ? `Session ${header.sessionNo}` : null,
    header.month ? `Month: ${header.month}` : null,
    header.year ? `Year: ${header.year}` : null,
  ].filter(Boolean).join(' · ')

  const centreLine = header.centreNo
    ? `Centre: ${header.centreNo}${header.centreName ? ` · ${header.centreName}` : ''}`
    : null

  return (
    <>
      <Box
        id={printId}
        className="report-print-root"
        sx={{
          overflowX: 'auto',
          '& .report-print-table': {
            width: '100%',
            borderCollapse: 'collapse',
            '& th, & td': {
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              padding: '4px 8px',
              fontSize: '0.8125rem',
            },
            '& th': { fontWeight: 700, textAlign: 'left' },
          },
          '& .marathi-cell': marathiCellSx,
        }}
      >
        <Stack spacing={1.25} sx={{ mb: 2 }} className="report-print-header">
          {header.examName ? (
            <Typography variant="subtitle2" color="text.secondary" className="marathi-cell">
              {header.examName}
            </Typography>
          ) : null}
          <Typography variant="h5" fontWeight={700}>
            {header.title ?? 'Report'}
          </Typography>
          {header.titleMr ? (
            <Typography variant="h6" className="marathi-cell" sx={{ fontWeight: 600 }}>
              {header.titleMr}
            </Typography>
          ) : null}
          {sessionLine ? <Typography variant="body2">{sessionLine}</Typography> : null}
          {centreLine ? (
            <Typography variant="body2" className="marathi-cell">{centreLine}</Typography>
          ) : null}
          {header.regionName ? (
            <Typography variant="body2" className="marathi-cell">
              Region: {header.regionName}
            </Typography>
          ) : null}
          {header.resultDate ? (
            <Typography variant="body2">
              Result date: {new Date(header.resultDate).toLocaleDateString()}
            </Typography>
          ) : null}
          {header.rowCount != null ? (
            <Typography variant="body2">Rows: {header.rowCount}</Typography>
          ) : null}
          {summary}
        </Stack>
        {children}
      </Box>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #${printId}, #${printId} * { visibility: visible !important; }
          #${printId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 16px;
            font-family: "Noto Sans Devanagari", "IBM Plex Sans", sans-serif;
          }
          #${printId} .marathi-cell {
            font-family: "Noto Sans Devanagari", "IBM Plex Sans", sans-serif !important;
          }
          #${printId} .result-sheet-section {
            page-break-after: always;
            break-after: page;
          }
          #${printId} .result-sheet-section:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  )
}

export const reportMarathiCellClass = 'marathi-cell'
