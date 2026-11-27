import type { Center, District } from '../api/generatedClient'

/**
 * Centres belong to a region through DISTRICT.DISTRICT_NAME → DISTRICT.REGION_NO.
 * When regionNo is empty/null, returns no centres (caller must pick a region first).
 * Results are sorted by district, then centre no, so every district in the region is visible.
 */
export const filterCentresByRegion = (
  centres: Center[],
  districts: District[],
  regionNo: number | '' | null | undefined,
): Center[] => {
  if (regionNo === '' || regionNo == null) {
    return []
  }

  const wanted = Number(regionNo)
  if (!Number.isFinite(wanted) || wanted <= 0) {
    return []
  }

  const districtNames = new Set(
    districts
      .filter((district) => Number(district.regionNo) === wanted)
      .map((district) => (district.districtName ?? '').trim())
      .filter(Boolean),
  )

  if (districtNames.size === 0) {
    return []
  }

  return centres
    .filter((centre) => districtNames.has((centre.districtName ?? '').trim()))
    .sort((a, b) => {
      const byDistrict = (a.districtName ?? '').localeCompare(b.districtName ?? '', 'mr')
      if (byDistrict !== 0) return byDistrict
      return (a.centreNo ?? '').localeCompare(b.centreNo ?? '', 'mr')
    })
}
