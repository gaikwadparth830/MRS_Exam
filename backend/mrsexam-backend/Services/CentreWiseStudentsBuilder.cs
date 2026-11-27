using mrsexam_backend.Dtos;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Shared logic for legacy Rpt_CentreWiseNoOfStudent — contiguous roll ranges per exam centre.
    /// </summary>
    public static class CentreWiseStudentsBuilder
    {
        public static List<CentreWiseStudentsRowDto> BuildRows(
            IEnumerable<(string CentreNo, int RollNo)> forms,
            IReadOnlyDictionary<string, string?> centreNames)
        {
            var rows = new List<CentreWiseStudentsRowDto>();

            foreach (var group in forms
                .GroupBy(f => f.CentreNo.Trim(), StringComparer.OrdinalIgnoreCase)
                .OrderBy(g => g.Min(x => x.RollNo))
                .ThenBy(g => g.Key))
            {
                var rolls = group.Select(x => x.RollNo).Distinct().OrderBy(x => x).ToList();
                var ranges = BuildContiguousRanges(rolls);
                if (ranges.Count == 0) continue;

                // One print row per centre: first range + optional second range (legacy layout).
                // Extra blocks beyond 2 become additional rows for the same centre.
                for (var i = 0; i < ranges.Count; i += 2)
                {
                    var first = ranges[i];
                    (int From, int To)? second = i + 1 < ranges.Count ? ranges[i + 1] : null;
                    centreNames.TryGetValue(group.Key, out var centreName);

                    rows.Add(new CentreWiseStudentsRowDto
                    {
                        CentreNo = group.Key,
                        CentreName = centreName,
                        RollFrom = first.From,
                        RollTo = first.To,
                        RollFrom2 = second?.From,
                        RollTo2 = second?.To,
                        StudentCount = rolls.Count(r =>
                            (r >= first.From && r <= first.To)
                            || (second is { } s && r >= s.From && r <= s.To)),
                    });
                }
            }

            return rows;
        }

        public static List<(int From, int To)> BuildContiguousRanges(IReadOnlyList<int> sortedDistinctRolls)
        {
            var ranges = new List<(int From, int To)>();
            if (sortedDistinctRolls.Count == 0) return ranges;

            var start = sortedDistinctRolls[0];
            var prev = sortedDistinctRolls[0];
            for (var i = 1; i < sortedDistinctRolls.Count; i++)
            {
                var roll = sortedDistinctRolls[i];
                if (roll == prev + 1)
                {
                    prev = roll;
                    continue;
                }

                ranges.Add((start, prev));
                start = prev = roll;
            }

            ranges.Add((start, prev));
            return ranges;
        }
    }
}
