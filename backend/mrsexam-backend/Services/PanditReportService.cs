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
                Header = BuildHeader(session, "Attendance Sheet", "उपस्थिति पत्र", centreCode, centre?.CentreName, null),
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
                    FormCentre = x.form.FormCentre,
                    ExamCentre = x.form.ExamCentre,
                    CentreName = x.centre != null ? x.centre.CentreName : null,
                    DistrictName = x.centre != null ? x.centre.DistrictName : null,
                    KhandAppearing = x.form.KhandAppearing,
                    FlgPortion = x.form.FlgPortion,
                    RegionNo = x.district != null ? x.district.RegionNo : null,
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
                    FormCentre = x.form.FormCentre,
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
                    Khand1TotMarks = x.form.Khand1TotMarks,
                    Khand2TotMarks = x.form.Khand2TotMarks,
                    KhandAppearing = x.form.KhandAppearing,
                    FlgPortion = x.form.FlgPortion,
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
                normalizedMode == "named" ? "Result Sheet" : "Result Sheet (No Name)",
                "निकाल पत्रक",
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

        public async Task<PanditResultDetailsReportDto> GetResultDetailsAsync(
            string? centreNo,
            int? regionNo,
            CancellationToken cancellationToken)
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
                query = query.Where(x => x.form.ExamCentre == centreCode || x.form.FormCentre == centreCode);

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var rows = await query
                .OrderBy(x => x.form.RollNo)
                .Select(x => new PanditResultDetailsRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = x.form.Name,
                    FormCentre = x.form.FormCentre,
                    ExamCentre = x.form.ExamCentre,
                    KhandAppearing = x.form.KhandAppearing,
                    FlgPortion = x.form.FlgPortion,
                    Marks1 = x.form.Marks1,
                    Marks2 = x.form.Marks2,
                    Marks3 = x.form.Marks3,
                    Marks4 = x.form.Marks4,
                    Marks5 = x.form.Marks5,
                    Marks6 = x.form.Marks6,
                    Marks7 = x.form.Marks7,
                    Marks8 = x.form.Marks8,
                    OralMarks = x.form.OralMarks,
                    Khand1TotMarks = x.form.Khand1TotMarks,
                    Khand2TotMarks = x.form.Khand2TotMarks,
                    TotMarks = x.form.TotMarks,
                    Grade = x.form.Grade,
                    Result = x.form.Result,
                    SpecialRank = x.form.SpecialRank,
                    ConcessionFlag = x.form.ConcessionFlag,
                    UndFlag = x.form.UndFlag,
                    BothKhandFlag = x.form.BothKhandFlag,
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

            var header = BuildHeader(session, "Result Details", "निकाल तपशील", centreCode, null, regionName);
            header.ResultDate = session.ResultDate;
            header.RowCount = rows.Count;
            return new PanditResultDetailsReportDto { Header = header, Rows = rows };
        }

        public async Task<MarkSheetReportDto> GetMarkSheetAsync(
            int? fromRoll,
            int? toRoll,
            string? variant,
            string? portion,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var normalizedVariant = string.IsNullOrWhiteSpace(variant) ? "new" : variant.Trim().ToLowerInvariant();
            var portionFilter = portion?.Trim().ToUpperInvariant();

            var query = _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.Result != null
                    && f.Result.Trim() != string.Empty);

            if (fromRoll is > 0)
                query = query.Where(f => f.RollNo >= fromRoll);

            if (toRoll is > 0)
                query = query.Where(f => f.RollNo <= toRoll);

            if (portionFilter is "N" or "O")
                query = query.Where(f => f.FlgPortion == portionFilter);

            // variant=onlynew → NEW portion only (flgportion=N)
            if (normalizedVariant is "onlynew" or "new")
            {
                if (portionFilter is null or "" or "ALL")
                    query = query.Where(f => f.FlgPortion == null || f.FlgPortion == "N" || f.FlgPortion == "n");
            }

            var rows = await query
                .OrderBy(f => f.RollNo)
                .Select(f => new MarkSheetRowDto
                {
                    RollNo = f.RollNo,
                    Name = f.Name,
                    FormCentre = f.FormCentre,
                    ExamCentre = f.ExamCentre,
                    Marks1 = f.Marks1,
                    Marks2 = f.Marks2,
                    Marks3 = f.Marks3,
                    Marks4 = f.Marks4,
                    Marks5 = f.Marks5,
                    Marks6 = f.Marks6,
                    Marks7 = f.Marks7,
                    Marks8 = f.Marks8,
                    OralMarks = f.OralMarks,
                    TotMarks = f.TotMarks,
                    Khand1TotMarks = f.Khand1TotMarks,
                    Khand2TotMarks = f.Khand2TotMarks,
                    KhandAppearing = f.KhandAppearing,
                    FlgPortion = f.FlgPortion,
                    Grade = f.Grade,
                    Result = f.Result,
                    SpecialRank = f.SpecialRank,
                })
                .ToListAsync(cancellationToken);

            var header = BuildHeader(session, "Mark Sheet", "गुणपत्रिका", null, null, null);
            header.ResultDate = session.ResultDate;
            header.RowCount = rows.Count;
            return new MarkSheetReportDto { Header = header, Variant = normalizedVariant, Rows = rows };
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

            var header = BuildHeader(session, "Certificates", "प्रमाणपत्र", formCentre, null, regionName);
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

        public async Task<RanksReportDto> GetRanksAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            // Prefer full exam pass for FIRST/SECOND (catalog RPT-PND-07).
            var rows = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == (short)session.SessionNo
                    && f.SpecialRank != null
                    && f.SpecialRank != string.Empty
                    && f.Result != null
                    && f.Result.Contains("Exam Pass"))
                .OrderBy(f => f.SpecialRank)
                .ThenByDescending(f => f.TotMarks)
                .Select(f => new RankRowDto
                {
                    RollNo = f.RollNo,
                    Name = f.Name,
                    TotMarks = f.TotMarks,
                    Grade = f.Grade,
                    Result = f.Result,
                    SpecialRank = f.SpecialRank,
                    FormCentre = f.FormCentre,
                    ExamCentre = f.ExamCentre,
                })
                .ToListAsync(cancellationToken);

            var header = BuildHeader(session, "Ranks", "क्रमांक", null, null, null);
            header.RowCount = rows.Count;
            return new RanksReportDto { Header = header, Rows = rows };
        }

        public async Task<StudentsPassingReportDto> GetStudentsPassingAsync(
            string? formCentre,
            int? regionNo,
            string? passingMode,
            CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var mode = (passingMode ?? "full").Trim().ToLowerInvariant();

            var query = from form in _db.FormPandits.AsNoTracking()
                        where form.SessionNo == (short)session.SessionNo
                            && form.Result != null
                        join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo into centreJoin
                        from centre in centreJoin.DefaultIfEmpty()
                        join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                        from district in districtJoin.DefaultIfEmpty()
                        select new { form, centre, district };

            query = mode switch
            {
                "khand1" => query.Where(x => x.form.Result!.Contains("Khand1 Pass")),
                "khand2" => query.Where(x => x.form.Result!.Contains("Khand2 Pass")),
                _ => query.Where(x => x.form.Result!.Contains("Exam Pass")),
            };

            if (!string.IsNullOrWhiteSpace(formCentre))
                query = query.Where(x => x.form.FormCentre == formCentre.Trim());

            if (regionNo is > 0)
                query = query.Where(x => x.district != null && x.district.RegionNo == regionNo);

            var rows = await query
                .OrderBy(x => x.form.RollNo)
                .Select(x => new StudentsPassingRowDto
                {
                    RollNo = x.form.RollNo,
                    Name = x.form.Name,
                    Result = x.form.Result,
                    Grade = x.form.Grade,
                    TotMarks = x.form.TotMarks,
                    FormCentre = x.form.FormCentre,
                    ExamCentre = x.form.ExamCentre,
                    KhandAppearing = x.form.KhandAppearing,
                })
                .ToListAsync(cancellationToken);

            var title = mode switch
            {
                "khand1" => "Students Passing — Khand I",
                "khand2" => "Students Passing — Khand II",
                _ => "Students Passing — Full Exam",
            };

            var header = BuildHeader(session, title, "उत्तीर्ण विद्यार्थी", formCentre, null, null);
            header.RowCount = rows.Count;
            return new StudentsPassingReportDto { Header = header, PassingMode = mode, Rows = rows };
        }

        public async Task<LostByTwoReportDto> GetLostByTwoAsync(int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            // Catalog RPT-PND-09: Cmd_LosingTwoMarksPandit exam 7 — near-miss on Class3 / Khand mins.
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
                .Select(x =>
                {
                    var tot = x.form.TotMarks ?? 0;
                    var k1 = x.form.Khand1TotMarks ?? 0;
                    var k2 = x.form.Khand2TotMarks ?? 0;
                    var reasons = new List<string>();
                    if (tot >= class3 - 2 && tot < class3)
                        reasons.Add($"Tot {tot} within 2 of Class3 {class3}");
                    if (k1 >= minK1 - 2 && k1 < minK1)
                        reasons.Add($"Khand1 {k1} within 2 of {minK1}");
                    if (k2 >= minK2 - 2 && k2 < minK2)
                        reasons.Add($"Khand2 {k2} within 2 of {minK2}");
                    if (reasons.Count == 0) return null;

                    return new LostByTwoRowDto
                    {
                        RollNo = x.form.RollNo,
                        Name = x.form.Name,
                        FormCentre = x.form.FormCentre,
                        ExamCentre = x.form.ExamCentre,
                        TotMarks = x.form.TotMarks,
                        Khand1TotMarks = x.form.Khand1TotMarks,
                        Khand2TotMarks = x.form.Khand2TotMarks,
                        Result = x.form.Result,
                        Grade = x.form.Grade,
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
                Class3Marks = class3,
                MinTotalKhand1 = minK1,
                MinTotalKhand2 = minK2,
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
                ExamName = "Pandit",
                CentreNo = centreNo,
                CentreName = centreName,
                RegionName = regionName,
                ResultDate = session.ResultDate,
            };
        }
    }
}
