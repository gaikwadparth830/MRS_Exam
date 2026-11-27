using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PrabodhReportService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PrabodhReportService(MrsexamContext db, SessionService sessions)
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

            var rolls = await _db.FormPrabodhs.AsNoTracking()
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
                Header = BuildHeader(session, "Attendance Sheet", "उपस्थिति पत्र", centreCode, centre?.CentreName, null),
                MaxRollNo = rolls.Count > 0 ? rolls[^1] : null,
                Pairs = pairs,
            };
        }

        public async Task<NameListReportDto> GetNameListAsync(string? centreNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var centreCode = centreNo?.Trim();

            var query = from form in _db.FormPrabodhs.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                        join centre in _db.Centres.AsNoTracking() on form.ExamCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        select new { form, centre };

            if (!string.IsNullOrWhiteSpace(centreCode))
                query = query.Where(x => x.form.ExamCentre == centreCode);

            var regionNames = await _db.Regions.AsNoTracking()
                .Select(r => new { r.RegionNo, r.RegionName })
                .ToDictionaryAsync(r => r.RegionNo, r => r.RegionName, cancellationToken);

            var rows = await query
                .OrderBy(x => x.form.ExamCentre)
                .ThenBy(x => x.form.RollNo)
                .ThenBy(x => x.form.SrNo)
                .Select(x => new NameListRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = x.form.Name,
                    FormCentre = x.form.FormCentre,
                    ExamCentre = x.form.ExamCentre,
                    CentreName = x.centre != null ? x.centre.CentreName : null,
                    DistrictName = x.centre != null ? x.centre.DistrictName : null,
                    Gender = x.form.Gender,
                    RegionNo = x.form.RegionNo,
                })
                .ToListAsync(cancellationToken);

            foreach (var row in rows)
            {
                if (row.RegionNo is int rn && regionNames.TryGetValue(rn, out var rnName))
                    row.RegionName = rnName;
            }

            string? centreName = null;
            if (!string.IsNullOrWhiteSpace(centreCode))
            {
                centreName = await _db.Centres.AsNoTracking()
                    .Where(c => c.CentreNo == centreCode)
                    .Select(c => c.CentreName)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var header = BuildHeader(session, "Name List", "नामावली", centreCode, centreName, null);
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

            var query = _db.FormPrabodhs.AsNoTracking()
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
                    Marks2 = f.Marks2,
                    Marks3 = f.Marks3,
                    OralMarks = f.OralMarks,
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

            string? centreName = null;
            if (!string.IsNullOrWhiteSpace(centreCode))
            {
                centreName = await _db.Centres.AsNoTracking()
                    .Where(c => c.CentreNo == centreCode)
                    .Select(c => c.CentreName)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var header = BuildHeader(
                session,
                normalizedMode == "named" ? "Result Sheet" : "Result Sheet (No Name)",
                "परीक्षा - फल",
                centreCode,
                centreName,
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

        public async Task<MarkSheetReportDto> GetMarkSheetAsync(
            int? regionNo,
            int? fromRoll,
            int? toRoll,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            // Prefer students with a generated result (RESGEN path); still return rows if Result is set.
            var query = _db.FormPrabodhs.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.Result != null
                    && f.Result.Trim() != string.Empty);

            if (regionNo is > 0)
                query = query.Where(f => f.RegionNo == regionNo);

            if (fromRoll is > 0)
                query = query.Where(f => f.RollNo >= fromRoll);

            if (toRoll is > 0)
                query = query.Where(f => f.RollNo <= toRoll);

            var rows = await query
                .OrderBy(f => f.RegionNo)
                .ThenBy(f => f.RollNo)
                .Select(f => new MarkSheetRowDto
                {
                    RollNo = f.RollNo,
                    Name = f.Name,
                    FormCentre = f.FormCentre,
                    ExamCentre = f.ExamCentre,
                    Marks1 = f.Marks1,
                    Marks2 = f.Marks2,
                    Marks3 = f.Marks3,
                    OralMarks = f.OralMarks,
                    TotMarks = f.TotMarks,
                    Grade = f.Grade,
                    Result = f.Result,
                    SpecialRank = f.SpecialRank,
                    RegionNo = f.RegionNo,
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

            var header = BuildHeader(session, "Mark Sheet", "गुणपत्रिका", null, null, regionName);
            header.ResultDate = session.ResultDate;
            header.RowCount = rows.Count;
            return new MarkSheetReportDto { Header = header, Rows = rows };
        }

        public async Task<HallTicketReportDto> GetHallTicketAsync(
            string? centreNo,
            int? fromRoll,
            int? toRoll,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var centreCode = centreNo?.Trim();

            // Pre-exam: rolls assigned; marks may still be null.
            var query = _db.FormPrabodhs.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo && f.RollNo != null);

            if (!string.IsNullOrWhiteSpace(centreCode))
                query = query.Where(f => f.ExamCentre == centreCode || f.FormCentre == centreCode);

            if (fromRoll is > 0)
                query = query.Where(f => f.RollNo >= fromRoll);

            if (toRoll is > 0)
                query = query.Where(f => f.RollNo <= toRoll);

            string? centreName = null;
            if (!string.IsNullOrWhiteSpace(centreCode))
            {
                centreName = await _db.Centres.AsNoTracking()
                    .Where(c => c.CentreNo == centreCode)
                    .Select(c => c.CentreName)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var rows = await query
                .OrderBy(f => f.ExamCentre)
                .ThenBy(f => f.RollNo)
                .Select(f => new HallTicketRowDto
                {
                    RollNo = f.RollNo,
                    Name = f.Name,
                    FormCentre = f.FormCentre,
                    ExamCentre = f.ExamCentre,
                    Gender = f.Gender,
                    SessionNo = f.SessionNo,
                    // Paper schedule placeholders — filled from PARAMETER in a later print polish pass.
                    Paper1Schedule = null,
                    Paper2Schedule = null,
                    Paper3Schedule = null,
                    OralSchedule = null,
                })
                .ToListAsync(cancellationToken);

            var header = BuildHeader(session, "Hall Ticket", "प्रवेशपत्र", centreCode, centreName, null);
            header.RowCount = rows.Count;
            return new HallTicketReportDto { Header = header, Rows = rows };
        }

        public async Task<LostByTwoReportDto> GetLostByTwoMarksAsync(
            int? regionNo,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            // Catalog RPT-PRB-08: legacy Cmd_LosingTwoMarksPrabodh (exam_no=5). Exact SQL not extracted;
            // reasonable implementation: FAIL students whose TotMarks is within 2 of Class3/MinTotal,
            // OR any paper score falls in [minMarks-2, minMarks).
            var exam = await _db.Exams.AsNoTracking()
                .FirstOrDefaultAsync(e => e.ExamNo == 5, cancellationToken);
            var papers = await _db.Papers.AsNoTracking()
                .Where(p => p.ExamNo == 5)
                .OrderBy(p => p.PaperNo)
                .ToListAsync(cancellationToken);

            var class3 = exam?.Class3Marks ?? 0;
            var minTotal = exam?.MinTotalKhand1 ?? class3;

            var query = _db.FormPrabodhs.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.Result != null
                    && f.Result.ToUpper() == "FAIL"
                    && f.TotMarks != null);

            if (regionNo is > 0)
                query = query.Where(f => f.RegionNo == regionNo);

            var forms = await query.ToListAsync(cancellationToken);
            var paperMins = papers
                .Where(p => p.MinMarks is > 0 || p.PassingMarks is > 0)
                .Select(p => new { p.PaperNo, Min = p.MinMarks ?? p.PassingMarks ?? 0 })
                .Where(p => p.Min > 0)
                .ToList();

            var rows = forms
                .Select(f =>
                {
                    var reasons = new List<string>();
                    var tot = f.TotMarks ?? 0;
                    var threshold = minTotal > 0 ? minTotal : class3;
                    if (threshold > 0 && tot >= threshold - 2 && tot < threshold)
                        reasons.Add($"Tot {tot} within 2 of min total {threshold}");

                    TryNearMissPaper(f.Marks1, 1, paperMins.FirstOrDefault(p => p.PaperNo == 1)?.Min, reasons);
                    TryNearMissPaper(f.Marks2, 2, paperMins.FirstOrDefault(p => p.PaperNo == 2)?.Min, reasons);
                    TryNearMissPaper(f.Marks3, 3, paperMins.FirstOrDefault(p => p.PaperNo == 3)?.Min, reasons);

                    if (reasons.Count == 0)
                        return null;

                    return new LostByTwoRowDto
                    {
                        RollNo = f.RollNo,
                        Name = f.Name,
                        FormCentre = f.FormCentre,
                        ExamCentre = f.ExamCentre,
                        Marks1 = f.Marks1,
                        Marks2 = f.Marks2,
                        Marks3 = f.Marks3,
                        OralMarks = f.OralMarks,
                        TotMarks = f.TotMarks,
                        Grade = f.Grade,
                        Result = f.Result,
                        NearMissReason = string.Join("; ", reasons),
                    };
                })
                .Where(r => r != null)
                .Cast<LostByTwoRowDto>()
                .OrderBy(r => r.RollNo)
                .ToList();

            string? regionName = null;
            if (regionNo is > 0)
            {
                regionName = await _db.Regions.AsNoTracking()
                    .Where(r => r.RegionNo == regionNo)
                    .Select(r => r.RegionName)
                    .FirstOrDefaultAsync(cancellationToken);
            }

            var header = BuildHeader(session, "Lost by 2 Marks", "दोन गुणांनी कमी", null, null, regionName);
            header.RowCount = rows.Count;
            return new LostByTwoReportDto
            {
                Header = header,
                Class3Marks = class3 > 0 ? class3 : null,
                MinTotalKhand1 = minTotal > 0 ? minTotal : null,
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

            var query = _db.FormPrabodhs.AsNoTracking()
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

            var header = BuildHeader(session, "Certificates", "प्रमाणपत्र", null, null, region?.RegionName);
            header.RowCount = rows.Count;
            return new CertificateReportDto { Header = header, Rows = rows };
        }

        public async Task<RegisterReportDto> GetRegisterAsync(int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            // Clear blank results to null (RULE-096).
            var blankResults = await _db.FormPrabodhs
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.Result != null
                    && f.Result.Trim() == string.Empty)
                .ToListAsync(cancellationToken);
            foreach (var row in blankResults)
                row.Result = null;

            await AssignDummyCentreCodesAsync(session.SessionNo, regionNo, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);

            var formsQuery = _db.FormPrabodhs.AsNoTracking()
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
                "नोंदवही",
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
            var query = _db.FormPrabodhs
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

        private static void TryNearMissPaper(string? marksText, int paperNo, int? minMarks, List<string> reasons)
        {
            if (minMarks is null or <= 0) return;
            if (!TryParseMarks(marksText, out var marks)) return;
            if (marks >= minMarks.Value - 2 && marks < minMarks.Value)
                reasons.Add($"Paper {paperNo}: {marks} in [{minMarks.Value - 2}, {minMarks.Value})");
        }

        private static bool TryParseMarks(string? text, out int marks)
        {
            marks = 0;
            if (string.IsNullOrWhiteSpace(text)) return false;
            var trimmed = text.Trim();
            if (trimmed.Equals("A", StringComparison.OrdinalIgnoreCase)
                || trimmed.Equals("AB", StringComparison.OrdinalIgnoreCase)
                || trimmed == "-"
                || trimmed == "*")
                return false;
            return int.TryParse(trimmed, out marks);
        }

        /// <summary>
        /// Centre-wise number of students appearing — contiguous ROLL_NO ranges per EXAM_CENTRE
        /// (legacy Frm_CentreWiseNoOfStudent / Rpt_CentreWiseNoOfStudent).
        /// </summary>
        public async Task<CentreWiseStudentsReportDto> GetCentreWiseStudentsAsync(
            int? regionNo,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);

            var query = _db.FormPrabodhs.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.RollNo != null
                    && f.ExamCentre != null
                    && f.ExamCentre.Trim() != string.Empty);

            if (regionNo is > 0)
                query = query.Where(f => f.RegionNo == regionNo);

            var forms = await query
                .Select(f => new { f.ExamCentre, RollNo = f.RollNo!.Value })
                .ToListAsync(cancellationToken);

            var centreNos = forms
                .Select(f => f.ExamCentre!.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var centreNames = await _db.Centres.AsNoTracking()
                .Where(c => centreNos.Contains(c.CentreNo))
                .Select(c => new { c.CentreNo, c.CentreName })
                .ToDictionaryAsync(
                    c => c.CentreNo,
                    c => (string?)c.CentreName,
                    StringComparer.OrdinalIgnoreCase,
                    cancellationToken);

            var rows = CentreWiseStudentsBuilder.BuildRows(
                forms.Select(f => (f.ExamCentre!.Trim(), (int)f.RollNo)),
                centreNames);

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
                "Centre-wise Students Appearing",
                "केंद्रानुसार विद्यार्थी संख्या",
                null,
                null,
                regionName);
            header.RowCount = rows.Count;

            return new CentreWiseStudentsReportDto
            {
                Header = header,
                Rows = rows,
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
            string? titleMr,
            string? centreNo,
            string? centreName,
            string? regionName)
        {
            var sessionText = session.SessionNo.ToString();
            return new ReportHeaderDto
            {
                SessionNo = session.SessionNo,
                Month = DvTtAakashConverter.NormalizeMonth(session.Month),
                Year = sessionText.Length >= 4 ? sessionText[..4] : sessionText,
                Title = title,
                TitleMr = titleMr,
                ExamName = "Prabodh",
                CentreNo = centreNo,
                CentreName = centreName,
                RegionName = regionName,
                ResultDate = session.ResultDate,
            };
        }
    }
}
