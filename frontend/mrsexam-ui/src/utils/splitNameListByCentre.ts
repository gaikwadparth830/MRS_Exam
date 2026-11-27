export type NameListRowLike = {
  rollNo?: number | null
  name?: string | null
  examCentre?: string | null
  centreName?: string | null
  districtName?: string | null
}

export type NameListSection<T extends NameListRowLike> = {
  centreNo: string | null
  centreName: string | null
  districtName: string | null
  rows: T[]
}

/** Group name-list rows by exam centre; sections ordered by centre name, then centre no. */
export const splitNameListByCentre = <T extends NameListRowLike>(rows: T[]): NameListSection<T>[] => {
  const map = new Map<string, NameListSection<T>>()

  for (const row of rows) {
    const key = (row.examCentre ?? '').trim() || '__none__'
    let section = map.get(key)
    if (!section) {
      section = {
        centreNo: key === '__none__' ? null : key,
        centreName: row.centreName?.trim() || null,
        districtName: row.districtName?.trim() || null,
        rows: [],
      }
      map.set(key, section)
    }
    if (!section.centreName && row.centreName?.trim()) {
      section.centreName = row.centreName.trim()
    }
    if (!section.districtName && row.districtName?.trim()) {
      section.districtName = row.districtName.trim()
    }
    section.rows.push(row)
  }

  return [...map.values()]
    .map((section) => ({
      ...section,
      rows: [...section.rows].sort((a, b) => {
        const ra = a.rollNo ?? Number.MAX_SAFE_INTEGER
        const rb = b.rollNo ?? Number.MAX_SAFE_INTEGER
        return ra - rb
      }),
    }))
    .sort((a, b) => {
      const nameCmp = (a.centreName ?? '').localeCompare(b.centreName ?? '', 'mr', { sensitivity: 'base' })
      if (nameCmp !== 0) return nameCmp
      return (a.centreNo ?? '').localeCompare(b.centreNo ?? '', undefined, { sensitivity: 'base' })
    })
}
