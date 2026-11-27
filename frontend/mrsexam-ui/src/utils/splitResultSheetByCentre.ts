import type { Center } from '../api/generatedClient'

type ResultSheetLike<TRow extends { examCentre?: string | null }> = {
  header: {
    centreNo?: string | null
    centreName?: string | null
    rowCount?: number | null
    [key: string]: unknown
  }
  mode: string
  rows: TRow[]
}

/**
 * Splits a region-wide result sheet into one section per exam centre (print page breaks).
 */
export const splitResultSheetByCentre = <TRow extends { examCentre?: string | null }>(
  report: ResultSheetLike<TRow>,
  centres: Center[],
): ResultSheetLike<TRow>[] => {
  const order: string[] = []
  const grouped = new Map<string, TRow[]>()

  for (const row of report.rows) {
    const key = (row.examCentre ?? '').trim() || '(blank)'
    if (!grouped.has(key)) {
      grouped.set(key, [])
      order.push(key)
    }
    grouped.get(key)!.push(row)
  }

  if (order.length <= 1) {
    return [report]
  }

  const nameByCode = new Map(
    centres
      .map((centre) => [(centre.centreNo ?? '').trim(), centre.centreName ?? null] as const)
      .filter(([code]) => Boolean(code)),
  )

  return order.map((code) => {
    const rows = grouped.get(code) ?? []
    const centreNo = code === '(blank)' ? null : code
    return {
      ...report,
      header: {
        ...report.header,
        centreNo,
        centreName: centreNo ? (nameByCode.get(centreNo) ?? null) : null,
        rowCount: rows.length,
      },
      rows,
    }
  })
}
