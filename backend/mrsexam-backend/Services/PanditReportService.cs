using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PanditReportService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PanditReportService(MrsexamContext db, SessionService sessions)
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

            var rolls = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo && f.ExamCentre == centreCode)
                .OrderBy(f => f.RollNo)
                .Select(f => f.RollNo)
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
                Header = BuildHeader(session, "Pandit Attendance Sheet", centreCode, centre?.CentreName, null),
                MaxRollNo = rolls.Count > 0 ? rolls[^1] : null,
                Pairs = pairs,
            };
        }

        public async Task<NameListReportDto> GetNameListAsync(string? centreNo, int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var centreCode = centreNo?.Trim();

            var query = from form in _db.FormPandits.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                        join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                        from district in districtJoin.DefaultIfEmpty()
                        select new { form, centre, district };

            if (!string.IsNullOrWhiteSpace(centreCode))
                query = query.Where(x => x.form.FormCentre == centreCode || x.form.ExamCentre == centreCode);

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var rows = await query
                .OrderBy(x => x.form.FormCentre)
                .ThenBy(x => x.form.RollNo)
                .Select(x => new NameListRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = x.form.Name,
                    ExamCentre = x.form.ExamCentre,
                    CentreName = x.centre != null ? x.centre.CentreName : null,
                    DistrictName = x.centre != null ? x.centre.DistrictName : null,
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

            var header = BuildHeader(session, "Pandit Name List", centreCode, centreName, null);
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

            var query = from form in _db.FormPandits.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                        join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                        from district in districtJoin.DefaultIfEmpty()
                        select new { form, centre, district };

            if (!string.IsNullOrWhiteSpace(centreCode))
                query = query.Where(x => x.form.ExamCentre == centreCode || x.form.FormCentre == centreCode);

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var rows = await query
                .OrderBy(x => x.form.RollNo)
                .Select(x => new ResultSheetRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = normalizedMode == "named" ? x.form.Name : null,
                    ExamCentre = x.form.ExamCentre,
                    Marks1 = x.form.Marks1,
                    Marks2 = x.form.Marks2,
                    Marks3 = x.form.Marks3,
                    Marks4 = x.form.Marks4,
                    Marks5 = x.form.Marks5,
                    Marks6 = x.form.Marks6,
                    Marks7 = x.form.Marks7,
                    Marks8 = x.form.Marks8,
                    OralMarks = x.form.OralMarks,
                    TotMarks = x.form.TotMarks,
                    Grade = x.form.Grade,
                    Result = x.form.Result,
                    SpecialRank = x.form.SpecialRank,
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
                normalizedMode == "named" ? "Pandit Result Sheet" : "Pandit Result Sheet (No Name)",
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
            string? formCentre,
            int? fromRoll,
            int? toRoll,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            var query = from form in _db.FormPandits.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                            && form.Result != null
                            && form.Result.Contains("Pass")
                        join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                        from district in districtJoin.DefaultIfEmpty()
                        select new { form, centre, district };

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            if (!string.IsNullOrWhiteSpace(formCentre))
                query = query.Where(x => x.form.FormCentre == formCentre.Trim());

            if (fromRoll is > 0)
                query = query.Where(x => x.form.RollNo >= fromRoll);

            if (toRoll is > 0)
                query = query.Where(x => x.form.RollNo <= toRoll);

            var rows = await query
                .OrderBy(x => x.form.RollNo)
                .Select(x => new CertificateRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = x.form.Name,
                    Gender = null,
                    Grade = x.form.Grade,
                    Result = x.form.Result,
                    SpecialRank = x.form.SpecialRank,
                    ExamCentre = x.form.ExamCentre,
                    RegionName = null,
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

            var header = BuildHeader(session, "Pandit Certificates", formCentre, null, regionName);
            header.RowCount = rows.Count;
            return new CertificateReportDto { Header = header, Rows = rows };
        }

        public async Task<RegisterReportDto> GetRegisterAsync(int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            var formsQuery = from form in _db.FormPandits.AsNoTracking()
                             where form.SessionNo == (short)session.SessionNo
                             join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                             from centre in centreJoin.DefaultIfEmpty()
                             join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                             from district in districtJoin.DefaultIfEmpty()
                             select new { form, centre, district };

            if (regionNo is > 0)
                formsQuery = formsQuery.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var forms = await formsQuery.ToListAsync(cancellationToken);

            var total = forms.Count;
            var passCount = forms.Count(f => (f.form.Result ?? string.Empty).Contains("Pass", StringComparison.OrdinalIgnoreCase));
            var failCount = forms.Count(f => string.Equals(f.form.Result?.Trim(), "Fail", StringComparison.OrdinalIgnoreCase));
            var absentCount = forms.Count(f => string.Equals(f.form.Result?.Trim(), "Absent", StringComparison.OrdinalIgnoreCase));
            var stoppedCount = forms.Count(f => string.IsNullOrWhiteSpace(f.form.Result));
            var passPercent = total == 0 ? "0.00" : ((passCount * 100.0) / total).ToString("0.00");

            var centreNames = await _db.Centres.AsNoTracking()
                .Select(c => new { c.CentreNo, c.CentreName })
                .ToDictionaryAsync(c => c.CentreNo, c => c, cancellationToken);

            var regionNames = await _db.Regions.AsNoTracking()
                .Select(r => new { r.RegionNo, r.RegionName })
                .ToDictionaryAsync(r => r.RegionNo, r => r.RegionName, cancellationToken);

            var grouped = forms
                .GroupBy(f => new { f.form.DummyCentreCode, f.form.ExamCentre, RegionNo = f.district?.RegionNo ?? 0 })
                .OrderBy(g => g.Key.RegionNo)
                .ThenBy(g => g.Key.ExamCentre)
                .Select(g =>
                {
                    var examCentre = g.Key.ExamCentre ?? string.Empty;
                    centreNames.TryGetValue(examCentre, out var centreInfo);
                    string? regionName = null;
                    regionNames.TryGetValue(g.Key.RegionNo, out regionName);

                    return new RegisterRowDto
                    {
                        DummyCentreCode = g.Key.DummyCentreCode,
                        ExamCentre = g.Key.ExamCentre,
                        CentreName = centreInfo?.CentreName,
                        RegionNo = g.Key.RegionNo,
                        RegionName = regionName,
                        CandidateCount = g.Count(),
                        PassCount = g.Count(f => (f.form.Result ?? string.Empty).Contains("Pass", StringComparison.OrdinalIgnoreCase)),
                        FailCount = g.Count(f => string.Equals(f.form.Result?.Trim(), "Fail", StringComparison.OrdinalIgnoreCase)),
                        AbsentCount = g.Count(f => string.Equals(f.form.Result?.Trim(), "Absent", StringComparison.OrdinalIgnoreCase)),
                    };
                })
                .ToList();

            string? filterRegionName = null;
            if (regionNo is > 0)
                regionNames.TryGetValue(regionNo.Value, out filterRegionName);

            var header = BuildHeader(
                session,
                regionNo is > 0 ? "Pandit Region-wise Register" : "Pandit Register",
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

        public async Task<object> GetRanksAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var rows = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.SpecialRank != null
                    && f.SpecialRank != string.Empty)
                .OrderBy(f => f.SpecialRank)
                .ThenByDescending(f => f.TotMarks)
                .Select(f => new
                {
                    f.RollNo,
                    f.Name,
                    f.TotMarks,
                    f.Grade,
                    f.Result,
                    f.SpecialRank,
                    f.FormCentre,
                    f.ExamCentre
                })
                .ToListAsync(cancellationToken);

            return new
            {
                header = BuildHeader(session, "Pandit Ranks", null, null, null),
                rows
            };
        }

        public async Task<object> GetStudentsPassingAsync(string? formCentre, int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            var query = from form in _db.FormPandits.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                            && form.Result != null
                            && (form.Result.Contains("Exam Pass")
                                || form.Result.Contains("Khand1 Pass")
                                || form.Result.Contains("Khand2 Pass"))
                        join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                        from district in districtJoin.DefaultIfEmpty()
                        select new { form, centre, district };

            if (!string.IsNullOrWhiteSpace(formCentre))
                query = query.Where(x => x.form.FormCentre == formCentre.Trim());

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var rows = await query
                .OrderBy(x => x.form.RollNo)
                .Select(x => new
                {
                    x.form.RollNo,
                    x.form.Name,
                    x.form.Result,
                    x.form.Grade,
                    x.form.TotMarks,
                    x.form.FormCentre,
                    x.form.ExamCentre,
                    x.form.KhandAppearing
                })
                .ToListAsync(cancellationToken);

            return new
            {
                header = BuildHeader(session, "Pandit Students Passing", formCentre, null, null),
                rows
            };
        }

        public async Task<object> GetLostByTwoAsync(int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var exam = await _db.Exams.AsNoTracking()
                .FirstOrDefaultAsync(e => e.ExamNo == 7, cancellationToken);

            var minK1 = exam?.MinTotalKhand1 ?? 140;
            var minK2 = exam?.MinTotalKhand2 ?? 105;
            var class3 = exam?.Class3Marks ?? 245;

            var query = from form in _db.FormPandits.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                            && form.Result != null
                            && form.Result.ToUpper() == "FAIL"
                            && form.TotMarks != null
                        join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                        from district in districtJoin.DefaultIfEmpty()
                        select new { form, centre, district };

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var forms = await query.ToListAsync(cancellationToken);
            var rows = forms
                .Where(x =>
                {
                    var tot = x.form.TotMarks ?? 0;
                    var k1 = x.form.Khand1TotMarks ?? 0;
                    var k2 = x.form.Khand2TotMarks ?? 0;
                    return (tot >= class3 - 2 && tot < class3)
                        || (k1 >= minK1 - 2 && k1 < minK1)
                        || (k2 >= minK2 - 2 && k2 < minK2);
                })
                .OrderBy(x => x.form.RollNo)
                .Select(x => new
                {
                    x.form.RollNo,
                    x.form.Name,
                    x.form.TotMarks,
                    x.form.Khand1TotMarks,
                    x.form.Khand2TotMarks,
                    x.form.Result,
                    x.form.Grade,
                    x.form.FormCentre
                })
                .ToList();

            return new
            {
                header = BuildHeader(session, "Pandit Lost by 2 Marks", null, null, null),
                rows
            };
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
