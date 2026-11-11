using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class ReportService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public ReportService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<AttendanceReportDto> GetAttendanceAsync(string centreNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var centreCode = centreNo.Trim();
            if (string.IsNullOrWhiteSpace(centreCode))
                throw new InvalidOperationException("Exam centre is required for attendance sheet.");

            var centre = await _db.Centres.AsNoTracking()
                .FirstOrDefaultAsync(c => c.CentreNo == centreCode, cancellationToken);

            var rolls = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.ExamCentre == centreCode
                    && f.RollNo != null)
                .OrderBy(f => f.RollNo)
                .Select(f => f.RollNo!.Value)
                .ToListAsync(cancellationToken);

            var pairs = new List<AttendancePairDto>();
            for (var i = 0; i < rolls.Count; i += 2)
            {
                pairs.Add(new AttendancePairDto
                {
                    RollNo1 = rolls[i],
                    RollNo2 = i + 1 < rolls.Count ? rolls[i + 1] : null,
                });
            }

            return new AttendanceReportDto
            {
                Header = BuildHeader(session, "Attendance Sheet", centreCode, centre?.CentreName, null),
                MaxRollNo = rolls.Count > 0 ? rolls[^1] : null,
                Pairs = pairs,
            };
        }

        public async Task<NameListReportDto> GetNameListAsync(string? centreNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var centreCode = centreNo?.Trim();

            var query = from form in _db.FormBalbodhinis.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                        join centre in _db.Centres.AsNoTracking() on form.ExamCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        select new { form, centre };

            if (!string.IsNullOrWhiteSpace(centreCode))
                query = query.Where(x => x.form.ExamCentre == centreCode);

            var rows = await query
                .OrderBy(x => x.form.ExamCentre)
                .ThenBy(x => x.form.RollNo)
                .ThenBy(x => x.form.SrNo)
                .Select(x => new NameListRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = x.form.Name,
                    ExamCentre = x.form.ExamCentre,
                    CentreName = x.centre != null ? x.centre.CentreName : null,
                    DistrictName = x.centre != null ? x.centre.DistrictName : x.form.DistrictName,
                })
                .ToListAsync(cancellationToken);

            string? centreName = null;
            if (!string.IsNullOrWhiteSpace(centreCode))
            {
                centreName = await _db.Centres.AsNoTracking()
                    .Where(c => c.CentreNo == centreCode)
                    .Select(c => c.CentreName)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var header = BuildHeader(session, "Name List", centreCode, centreName, null);
            header.RowCount = rows.Count;
            return new NameListReportDto { Header = header, Rows = rows };
        }

        public async Task<ResultSheetReportDto> GetResultSheetAsync(
            string mode,
            string? centreNo,
            int? regionNo,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var normalizedMode = string.Equals(mode, "noname", StringComparison.OrdinalIgnoreCase) ? "noname" : "named";
            var centreCode = centreNo?.Trim();

            var query = _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo);

            if (!string.IsNullOrWhiteSpace(centreCode))
                query = query.Where(f => f.ExamCentre == centreCode);

            if (regionNo is > 0)
                query = query.Where(f => f.RegionNo == regionNo);

            var rows = await query
                .OrderBy(f => f.RegionNo)
                .ThenBy(f => f.ExamCentre)
                .ThenBy(f => f.RollNo)
                .Select(f => new ResultSheetRowDto
                {
                    RollNo = f.RollNo,
                    Name = normalizedMode == "named" ? f.Name : null,
                    ExamCentre = f.ExamCentre,
                    Marks1 = f.Marks1,
                    TotMarks = f.TotMarks,
                    Grade = f.Grade,
                    Result = f.Result,
                    SpecialRank = f.SpecialRank,
                })
                .ToListAsync(cancellationToken);

            string? regionName = null;
            if (regionNo is > 0)
            {
                regionName = await _db.Regions.AsNoTracking()
                    .Where(r => r.RegionNo == regionNo)
                    .Select(r => r.RegionName)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var header = BuildHeader(
                session,
                normalizedMode == "named" ? "Result Sheet" : "Result Sheet (No Name)",
                centreCode,
                null,
                regionName);
            header.ResultDate = session.ResultDate;
            header.RowCount = rows.Count;

            return new ResultSheetReportDto
            {
                Header = header,
                Mode = normalizedMode,
                Rows = rows,
            };
        }

        public async Task<CertificateReportDto> GetCertificatesAsync(
            int? regionNo,
            int? fromRoll,
            int? toRoll,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            if (regionNo is null or <= 0)
                throw new InvalidOperationException("Region is required for certificates.");

            var query = _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.RegionNo == regionNo
                    && f.Result != null
                    && f.Result.ToUpper() == "PASS");

            if (fromRoll is > 0)
                query = query.Where(f => f.RollNo >= fromRoll);

            if (toRoll is > 0)
                query = query.Where(f => f.RollNo <= toRoll);

            var region = await _db.Regions.AsNoTracking()
                .FirstOrDefaultAsync(r => r.RegionNo == regionNo, cancellationToken);

            var rows = await query
                .OrderBy(f => f.RollNo)
                .Select(f => new CertificateRowDto
                {
                    RollNo = f.RollNo,
                    Name = f.Name,
                    Gender = f.Gender,
                    Grade = f.Grade,
                    Result = f.Result,
                    SpecialRank = f.SpecialRank,
                    ExamCentre = f.ExamCentre,
                    RegionName = region != null ? region.RegionName : null,
                })
                .ToListAsync(cancellationToken);

            var header = BuildHeader(session, "Certificates", null, null, region?.RegionName);
            header.RowCount = rows.Count;
            return new CertificateReportDto { Header = header, Rows = rows };
        }

        public async Task<RegisterReportDto> GetRegisterAsync(int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            // Clear blank results to null (RULE-096).
            var blankResults = await _db.FormBalbodhinis
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.Result != null
                    && f.Result.Trim() == string.Empty)
                .ToListAsync(cancellationToken);
            foreach (var row in blankResults)
                row.Result = null;

            await AssignDummyCentreCodesAsync(session.SessionNo, regionNo, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);

            var formsQuery = _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo);
            if (regionNo is > 0)
                formsQuery = formsQuery.Where(f => f.RegionNo == regionNo);

            var forms = await formsQuery.ToListAsync(cancellationToken);

            var total = forms.Count;
            var passCount = forms.Count(f => string.Equals(f.Result?.Trim(), "PASS", StringComparison.OrdinalIgnoreCase));
            var failCount = forms.Count(f =>
                string.Equals(f.Result?.Trim(), "FAIL", StringComparison.OrdinalIgnoreCase)
                && string.Equals(f.Grade?.Trim(), "X", StringComparison.OrdinalIgnoreCase));
            var absentCount = forms.Count(f => string.Equals(f.Grade?.Trim(), "A", StringComparison.OrdinalIgnoreCase));
            var stoppedCount = forms.Count(f => string.IsNullOrWhiteSpace(f.Result));
            var passPercent = total == 0 ? "0.00" : ((passCount * 100.0) / total).ToString("0.00");

            var centreNames = await _db.Centres.AsNoTracking()
                .Select(c => new { c.CentreNo, c.CentreName })
                .ToDictionaryAsync(c => c.CentreNo, c => c.CentreName, cancellationToken);

            var regionNames = await _db.Regions.AsNoTracking()
                .Select(r => new { r.RegionNo, r.RegionName })
                .ToDictionaryAsync(r => r.RegionNo, r => r.RegionName, cancellationToken);

            var grouped = forms
                .GroupBy(f => new { f.DummyCentreCode, f.ExamCentre, f.RegionNo })
                .OrderBy(g => g.Key.RegionNo)
                .ThenBy(g => g.Key.DummyCentreCode)
                .ThenBy(g => g.Key.ExamCentre)
                .Select(g =>
                {
                    var examCentre = g.Key.ExamCentre ?? string.Empty;
                    centreNames.TryGetValue(examCentre, out var centreName);
                    string? regionName = null;
                    if (g.Key.RegionNo is int rn)
                        regionNames.TryGetValue(rn, out regionName);

                    return new RegisterRowDto
                    {
                        DummyCentreCode = g.Key.DummyCentreCode,
                        ExamCentre = g.Key.ExamCentre,
                        CentreName = centreName,
                        RegionNo = g.Key.RegionNo,
                        RegionName = regionName,
                        CandidateCount = g.Count(),
                        PassCount = g.Count(f => string.Equals(f.Result?.Trim(), "PASS", StringComparison.OrdinalIgnoreCase)),
                        FailCount = g.Count(f =>
                            string.Equals(f.Result?.Trim(), "FAIL", StringComparison.OrdinalIgnoreCase)
                            && string.Equals(f.Grade?.Trim(), "X", StringComparison.OrdinalIgnoreCase)),
                        AbsentCount = g.Count(f => string.Equals(f.Grade?.Trim(), "A", StringComparison.OrdinalIgnoreCase)),
                    };
                })
                .ToList();

            string? filterRegionName = null;
            if (regionNo is > 0)
                regionNames.TryGetValue(regionNo.Value, out filterRegionName);

            var header = BuildHeader(
                session,
                regionNo is > 0 ? "Region-wise Register" : "Register",
                null,
                null,
                filterRegionName);
            header.RowCount = grouped.Count;

            return new RegisterReportDto
            {
                Header = header,
                TotalCandidates = total,
                PassCount = passCount,
                FailCount = failCount,
                AbsentCount = absentCount,
                StoppedCount = stoppedCount,
                PassPercent = passPercent,
                Rows = grouped,
            };
        }

        private async Task AssignDummyCentreCodesAsync(int sessionNo, int? regionNo, CancellationToken cancellationToken)
        {
            var query = _db.FormBalbodhinis
                .Where(f => f.SessionNo == (short)sessionNo);
            if (regionNo is > 0)
                query = query.Where(f => f.RegionNo == regionNo);

            var rows = await query
                .OrderBy(f => f.RegionNo)
                .ThenBy(f => f.RollNo)
                .ThenBy(f => f.ExamCentre)
                .ThenBy(f => f.SrNo)
                .ToListAsync(cancellationToken);

            foreach (var row in rows)
                row.DummyCentreCode = null;

            foreach (var regionGroup in rows.GroupBy(r => r.RegionNo))
            {
                var code = 0;
                string? previousCentre = null;
                foreach (var row in regionGroup.OrderBy(r => r.RollNo).ThenBy(r => r.ExamCentre).ThenBy(r => r.SrNo))
                {
                    var centre = row.ExamCentre?.Trim() ?? string.Empty;
                    if (!string.Equals(centre, previousCentre, StringComparison.OrdinalIgnoreCase))
                    {
                        code += 1;
                        previousCentre = centre;
                    }
                    row.DummyCentreCode = code;
                }
            }
        }

        private async Task<Session> RequireDefaultSessionAsync(CancellationToken cancellationToken)
        {
            var session = await _sessions.GetDefaultSessionAsync(cancellationToken);
            if (session is null)
                throw new InvalidOperationException("Session not selected.");
            return session;
        }

        private static ReportHeaderDto BuildHeader(
            Session session,
            string title,
            string? centreNo,
            string? centreName,
            string? regionName)
        {
            var sessionText = session.SessionNo.ToString();
            return new ReportHeaderDto
            {
                SessionNo = session.SessionNo,
                Month = session.Month,
                Year = sessionText.Length >= 4 ? sessionText[..4] : sessionText,
                Title = title,
                CentreNo = centreNo,
                CentreName = centreName,
                RegionName = regionName,
                ResultDate = session.ResultDate,
            };
        }
    }
}
