using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PanditResultService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly PanditOptions _options;

        // Exact BRD result strings.
        private const string Absent = "Absent";
        private const string Fail = "Fail";
        private const string Khand1Pass = "Pandit Khand1 Pass";
        private const string Khand2Pass = "Pandit Khand2 Pass";
        private const string ExamPass = "Pandit Exam Pass";

        public PanditResultService(MrsexamContext db, SessionService sessions, IOptions<PanditOptions> options)
        {
            _db = db;
            _sessions = sessions;
            _options = options.Value;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            IQueryable<FormPandit> query = _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo);

            if (regionNo is > 0)
            {
                var centreNos = await (
                    from c in _db.Centres.AsNoTracking()
                    join d in _db.Districts.AsNoTracking() on c.DistrictName equals d.DistrictName
                    where d.RegionNo == regionNo
                    select c.CentreNo
                ).ToListAsync(cancellationToken);
                query = query.Where(f => f.FormCentre != null && centreNos.Contains(f.FormCentre));
            }

            var rows = await query
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.RollNo,
                    f.SessionNo,
                    f.Name,
                    f.KhandAppearing,
                    f.FlgPortion,
                    f.Marks1,
                    f.Marks2,
                    f.Marks3,
                    f.Marks4,
                    f.Marks5,
                    f.Marks6,
                    f.Marks7,
                    f.Marks8,
                    f.OralMarks,
                    f.Khand1TotMarks,
                    f.Khand2TotMarks,
                    f.TotMarks,
                    f.Grade,
                    f.SpecialRank,
                    f.Result,
                    f.ConcessionFlag,
                    f.BothKhandFlag
                })
                .ToListAsync(cancellationToken);

            return rows.Cast<object>().ToList();
        }

        public async Task<object> GenerateAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var current = await _sessions.GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
            if (current.IsLockedPandit)
                throw new InvalidOperationException("Result has already been generated for Pandit (RESGEN_PANDIT=Y).");

            var exam = await _db.Exams.AsNoTracking()
                .FirstOrDefaultAsync(e => e.ExamNo == _options.ResultExamNo, cancellationToken)
                ?? throw new InvalidOperationException("Exam details are missing for Pandit.");

            var papers = await _db.Papers.AsNoTracking()
                .Where(p => p.ExamNo == _options.ResultExamNo)
                .ToDictionaryAsync(p => p.PaperNo, cancellationToken);

            object? result = null;
            var strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

                var eligible = await _db.FormPandits
                    .Where(f => f.SessionNo == session.SessionNo && f.Result == null)
                    .OrderBy(f => f.RollNo)
                    .ToListAsync(cancellationToken);

                // Keep only rows that have the marks needed for their khand/portion.
                eligible = eligible.Where(HasRequiredMarks).ToList();

                foreach (var row in eligible)
                {
                    row.SpecialRank = null;
                    ApplyResultRules(row, exam, papers);
                }

                await _db.SaveChangesAsync(cancellationToken);

                var trackedSession = await _db.Sessions
                    .FirstOrDefaultAsync(s => s.SessionNo == session.SessionNo, cancellationToken)
                    ?? throw new InvalidOperationException("Session not selected.");
                trackedSession.ResgenPandit = "Y";

                await _db.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);

                result = new { processed = eligible.Count, sessionWide = true };
            });

            return result!;
        }

        public async Task<object> FindRanksAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            // Ranking among Exam Pass / "Pandit Exam Pass" by max TotMarks.
            var passing = await _db.FormPandits
                .Where(f => f.SessionNo == session.SessionNo
                    && f.Result != null
                    && f.Result.Contains("Exam Pass")
                    && f.TotMarks != null)
                .OrderByDescending(f => f.TotMarks)
                .ToListAsync(cancellationToken);

            if (passing.Count == 0)
                return new { first = 0, second = 0 };

            foreach (var row in passing)
                row.SpecialRank = null;

            var firstTotal = passing[0].TotMarks;
            var firstCount = 0;
            var secondCount = 0;
            int? secondTotal = null;

            foreach (var row in passing)
            {
                if (row.TotMarks == firstTotal)
                {
                    row.SpecialRank = "FIRST";
                    firstCount++;
                    continue;
                }

                secondTotal ??= row.TotMarks;
                if (row.TotMarks == secondTotal)
                {
                    row.SpecialRank = "SECOND";
                    secondCount++;
                    continue;
                }

                break;
            }

            await _db.SaveChangesAsync(cancellationToken);
            return new { first = firstCount, second = secondCount };
        }

        public async Task<object> GetCorrectionAsync(short rollNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var row = await _db.FormPandits.AsNoTracking()
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo && f.RollNo == rollNo && f.Result != null,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate with result not found.");

            return new
            {
                row.RollNo,
                row.SessionNo,
                row.Name,
                row.KhandAppearing,
                row.FlgPortion,
                row.Marks1,
                row.Marks2,
                row.Marks3,
                row.Marks4,
                row.Marks5,
                row.Marks6,
                row.Marks7,
                row.Marks8,
                row.OralMarks,
                row.TotMarks,
                row.Grade,
                row.Result,
                row.SpecialRank
            };
        }

        public async Task<object> SaveCorrectionAsync(PanditCorrectionSaveRequest request, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var row = await _db.FormPandits
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo && f.RollNo == request.RollNo && f.Result != null,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate with result not found.");

            if (request.Paper1 != null) row.Marks1 = ValidateCorrectionPaper(request.Paper1, "Paper 1");
            if (request.Paper2 != null) row.Marks2 = ValidateCorrectionPaper(request.Paper2, "Paper 2");
            if (request.Paper3 != null) row.Marks3 = ValidateCorrectionPaper(request.Paper3, "Paper 3");
            if (request.Paper4 != null) row.Marks4 = ValidateCorrectionPaper(request.Paper4, "Paper 4");
            if (request.Paper5 != null) row.Marks5 = ValidateCorrectionPaper(request.Paper5, "Paper 5");
            if (request.Paper6 != null) row.Marks6 = ValidateCorrectionPaper(request.Paper6, "Paper 6");
            if (request.Paper7 != null) row.Marks7 = ValidateCorrectionPaper(request.Paper7, "Paper 7");
            if (request.Paper8 != null) row.Marks8 = ValidateCorrectionPaper(request.Paper8, "Paper 8");
            if (request.OralMarks != null) row.OralMarks = ValidateCorrectionPaper(request.OralMarks, "Oral marks");

            PanditMarksService.RecalcTotals(row);

            var hadSpecialRank = !string.IsNullOrWhiteSpace(row.SpecialRank);
            if (hadSpecialRank)
            {
                var sessionRows = await _db.FormPandits
                    .Where(f => f.SessionNo == session.SessionNo)
                    .ToListAsync(cancellationToken);
                foreach (var item in sessionRows)
                {
                    item.Grade = null;
                    item.Result = null;
                    item.SpecialRank = null;
                }
                await _db.SaveChangesAsync(cancellationToken);
                return new { clearedSession = true, message = "Special rank existed. Session results cleared. Regenerate results." };
            }

            row.Grade = null;
            row.Result = null;
            row.SpecialRank = string.Empty;
            await _db.SaveChangesAsync(cancellationToken);
            return new { clearedSession = false, message = "Marks updated. Candidate result cleared." };
        }

        private static bool HasRequiredMarks(FormPandit row)
        {
            var portion = PanditConcession.NormalizePortion(row.FlgPortion);
            var khand = NormKhand(row.KhandAppearing);

            if (portion == "N" && khand == "I")
                return HasMark(row.Marks1) && HasMark(row.Marks2) && HasMark(row.Marks3) && HasMark(row.Marks4);

            if (portion == "N" && khand == "II")
                return HasMark(row.Marks5) && HasMark(row.Marks6) && HasMark(row.Marks7) && HasMark(row.OralMarks);

            if (portion == "O" && khand == "I")
                return HasMark(row.Marks1) && HasMark(row.Marks2) && HasMark(row.Marks3);

            // OLD Khand II
            return HasMark(row.Marks4) && HasMark(row.Marks5) && HasMark(row.Marks6) && HasMark(row.OralMarks);
        }

        private static void ApplyResultRules(FormPandit row, Exam exam, IReadOnlyDictionary<int, Paper> papers)
        {
            var portion = PanditConcession.NormalizePortion(row.FlgPortion);
            var khand = NormKhand(row.KhandAppearing);
            var concession = string.Equals((row.ConcessionFlag ?? "N").Trim(), "Y", StringComparison.OrdinalIgnoreCase);
            var both = string.Equals((row.BothKhandFlag ?? "N").Trim(), "Y", StringComparison.OrdinalIgnoreCase)
                || string.Equals((row.ResDeclFlag ?? "N").Trim(), "Y", StringComparison.OrdinalIgnoreCase)
                || HasOtherKhandMarks(row, khand, portion);

            var minK1 = exam.MinTotalKhand1 ?? 140;
            var minK2 = exam.MinTotalKhand2 ?? 105;
            var dist = exam.DistMarks ?? 525;
            var class1 = exam.Class1Marks ?? 420;
            var class2 = exam.Class2Marks ?? 350;
            var class3 = exam.Class3Marks ?? 245;

            if (portion == "O")
            {
                ApplyOldResult(row, khand, both, concession, papers, minK1, minK2, dist, class1, class2, class3);
                return;
            }

            if (khand == "I")
                ApplyNewKhand1(row, both, concession, papers, minK1, minK2, dist, class1, class2, class3);
            else
                ApplyNewKhand2(row, both, concession, papers, minK1, minK2, dist, class1, class2, class3);
        }

        private static void ApplyNewKhand1(
            FormPandit row,
            bool both,
            bool concession,
            IReadOnlyDictionary<int, Paper> papers,
            int minK1,
            int minK2,
            int dist,
            int class1,
            int class2,
            int class3)
        {
            var m = new[] { row.Marks1, row.Marks2, row.Marks3, row.Marks4 };
            if (m.All(IsA))
            {
                row.TotMarks = null;
                row.Khand1TotMarks = null;
                row.Result = Absent;
                row.Grade = "A";
                return;
            }

            if (m.Any(IsA))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            var k1Tot = SumMarks(m);
            row.Khand1TotMarks = k1Tot;

            if (k1Tot < minK1)
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            if (!AllPapersMeetMin(m, papers, 1, 4))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            if (!both)
            {
                row.TotMarks = (short)k1Tot;
                row.Result = Khand1Pass;
                row.Grade = "-";
                return;
            }

            // Other khand marks present.
            var other = new[] { row.Marks5, row.Marks6, row.Marks7, row.OralMarks };
            if (concession)
            {
                if (AllMeetExemption(other, papers, new[] { 5, 6, 7, 9 }))
                {
                    PanditMarksService.RecalcTotals(row);
                    row.Result = ExamPass;
                    row.Grade = "3";
                    return;
                }

                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            var k2Tot = SumMarks(row.Marks5, row.Marks6, row.Marks7);
            row.Khand2TotMarks = k2Tot;
            if (k2Tot < minK2
                || !AllPapersMeetMin(new[] { row.Marks5, row.Marks6, row.Marks7 }, papers, 5, 7)
                || !MeetsMin(row.OralMarks, PaperMin(papers, 9)))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            PanditMarksService.RecalcTotals(row);
            row.Result = ExamPass;
            row.Grade = GradeByTotal(row.TotMarks ?? 0, dist, class1, class2, class3);
        }

        private static void ApplyNewKhand2(
            FormPandit row,
            bool both,
            bool concession,
            IReadOnlyDictionary<int, Paper> papers,
            int minK1,
            int minK2,
            int dist,
            int class1,
            int class2,
            int class3)
        {
            var m = new[] { row.Marks5, row.Marks6, row.Marks7 };
            var oral = row.Marks8; // optional; primary oral is OralMarks
            _ = oral;

            if (m.All(IsA) && IsA(row.OralMarks))
            {
                row.TotMarks = null;
                row.Khand2TotMarks = null;
                row.Result = Absent;
                row.Grade = "A";
                return;
            }

            if (m.Any(IsA) || IsA(row.OralMarks))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            var k2Tot = SumMarks(m);
            row.Khand2TotMarks = k2Tot;

            if (k2Tot < minK2)
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            if (!AllPapersMeetMin(m, papers, 5, 7) || !MeetsMin(row.OralMarks, PaperMin(papers, 9)))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            if (!both)
            {
                row.TotMarks = (short)k2Tot;
                row.Result = Khand2Pass;
                row.Grade = "-";
                return;
            }

            var other = new[] { row.Marks1, row.Marks2, row.Marks3, row.Marks4 };
            if (concession)
            {
                if (AllMeetExemption(other, papers, new[] { 1, 2, 3, 4 }))
                {
                    PanditMarksService.RecalcTotals(row);
                    row.Result = ExamPass;
                    row.Grade = "3";
                    return;
                }

                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            var k1Tot = SumMarks(other);
            row.Khand1TotMarks = k1Tot;
            if (k1Tot < minK1 || !AllPapersMeetMin(other, papers, 1, 4))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            PanditMarksService.RecalcTotals(row);
            row.Result = ExamPass;
            row.Grade = GradeByTotal(row.TotMarks ?? 0, dist, class1, class2, class3);
        }

        /// <summary>
        /// OLD portion (flgportion=O): Khand I papers 1–3; Khand II papers 4–6 + oral.
        /// Grade bands hardcoded 375/300/250 for both-khand; khand2 min often 70 for m4+m5 path (BRD notes).
        /// </summary>
        private static void ApplyOldResult(
            FormPandit row,
            string khand,
            bool both,
            bool concession,
            IReadOnlyDictionary<int, Paper> papers,
            int minK1,
            int minK2,
            int dist,
            int class1,
            int class2,
            int class3)
        {
            // Prefer EXAM thresholds for min totals; OLD both-khand grades use 375/300/250.
            const int oldDist = 375;
            const int oldClass1 = 300;
            const int oldClass2 = 250;
            var oldMinK2 = Math.Min(minK2, 70); // BRD: OLD often hardcodes 70 for m4+m5

            if (khand == "I")
            {
                var m = new[] { row.Marks1, row.Marks2, row.Marks3 };
                if (m.All(IsA))
                {
                    row.Result = Absent;
                    row.Grade = "A";
                    row.TotMarks = null;
                    return;
                }
                if (m.Any(IsA) || SumMarks(m) < minK1 || !AllPapersMeetMin(m, papers, 1, 3))
                {
                    row.Result = Fail;
                    row.Grade = "X";
                    return;
                }

                row.Khand1TotMarks = SumMarks(m);
                if (!both)
                {
                    row.TotMarks = (short)row.Khand1TotMarks;
                    row.Result = Khand1Pass;
                    row.Grade = "-";
                    return;
                }

                EscalateOldBoth(row, concession, papers, oldMinK2, oldDist, oldClass1, oldClass2, appearingKhand1: true);
                return;
            }

            var m2 = new[] { row.Marks4, row.Marks5, row.Marks6 };
            if (m2.All(IsA) && IsA(row.OralMarks))
            {
                row.Result = Absent;
                row.Grade = "A";
                row.TotMarks = null;
                return;
            }
            if (m2.Any(IsA) || IsA(row.OralMarks)
                || SumMarks(row.Marks4, row.Marks5) < oldMinK2
                || !AllPapersMeetMin(m2, papers, 4, 6)
                || !MeetsMin(row.OralMarks, PaperMin(papers, 9)))
            {
                row.Result = Fail;
                row.Grade = "X";
                return;
            }

            row.Khand2TotMarks = SumMarks(m2);
            if (!both)
            {
                row.TotMarks = (short)row.Khand2TotMarks.Value;
                row.Result = Khand2Pass;
                row.Grade = "-";
                return;
            }

            EscalateOldBoth(row, concession, papers, minK1, oldDist, oldClass1, oldClass2, appearingKhand1: false);
            _ = dist;
            _ = class1;
            _ = class2;
            _ = class3;
        }

        private static void EscalateOldBoth(
            FormPandit row,
            bool concession,
            IReadOnlyDictionary<int, Paper> papers,
            int otherMin,
            int dist,
            int class1,
            int class2,
            bool appearingKhand1)
        {
            if (appearingKhand1)
            {
                var other = new[] { row.Marks4, row.Marks5, row.Marks6 };
                if (concession)
                {
                    if (AllMeetExemption(other.Concat(new[] { row.OralMarks }).ToArray(), papers, new[] { 4, 5, 6, 9 }))
                    {
                        row.TotMarks = (short)(SumMarks(row.Marks1, row.Marks2, row.Marks3) + SumMarks(other));
                        row.Result = ExamPass;
                        row.Grade = "3";
                        return;
                    }
                    row.Result = Fail;
                    row.Grade = "X";
                    return;
                }

                if (SumMarks(row.Marks4, row.Marks5) < otherMin || !MeetsMin(row.OralMarks, PaperMin(papers, 9)))
                {
                    row.Result = Fail;
                    row.Grade = "X";
                    return;
                }
            }
            else
            {
                var other = new[] { row.Marks1, row.Marks2, row.Marks3 };
                if (concession)
                {
                    if (AllMeetExemption(other, papers, new[] { 1, 2, 3 }))
                    {
                        row.TotMarks = (short)(SumMarks(other) + SumMarks(row.Marks4, row.Marks5, row.Marks6));
                        row.Result = ExamPass;
                        row.Grade = "3";
                        return;
                    }
                    row.Result = Fail;
                    row.Grade = "X";
                    return;
                }

                if (SumMarks(other) < otherMin || !AllPapersMeetMin(other, papers, 1, 3))
                {
                    row.Result = Fail;
                    row.Grade = "X";
                    return;
                }
            }

            var tot = SumMarks(row.Marks1, row.Marks2, row.Marks3, row.Marks4, row.Marks5, row.Marks6);
            row.TotMarks = (short)tot;
            row.Result = ExamPass;
            // OLD both-khand: 375 / 300 / 250 bands; below 250 → grade 3
            if (tot >= dist) row.Grade = "Vi. Yo.";
            else if (tot >= class1) row.Grade = "1";
            else if (tot >= class2) row.Grade = "2";
            else row.Grade = "3";
        }

        private static string GradeByTotal(int tot, int dist, int class1, int class2, int class3)
        {
            if (tot >= dist) return "Vi. Yo.";
            if (tot >= class1) return "1";
            if (tot >= class2) return "2";
            if (tot >= class3) return "3";
            return "3";
        }

        private static bool HasOtherKhandMarks(FormPandit row, string appearing, string portion)
        {
            if (portion == "N")
            {
                if (appearing == "I")
                    return HasMark(row.Marks5) || HasMark(row.Marks6) || HasMark(row.Marks7) || HasMark(row.OralMarks);
                return HasMark(row.Marks1) || HasMark(row.Marks2) || HasMark(row.Marks3) || HasMark(row.Marks4);
            }

            if (appearing == "I")
                return HasMark(row.Marks4) || HasMark(row.Marks5) || HasMark(row.Marks6) || HasMark(row.OralMarks);
            return HasMark(row.Marks1) || HasMark(row.Marks2) || HasMark(row.Marks3);
        }

        private static bool AllPapersMeetMin(IReadOnlyList<string?> marks, IReadOnlyDictionary<int, Paper> papers, int fromPaper, int toPaper)
        {
            var idx = 0;
            for (var p = fromPaper; p <= toPaper; p++, idx++)
            {
                if (idx >= marks.Count) return false;
                if (!MeetsMin(marks[idx], PaperMin(papers, p))) return false;
            }
            return true;
        }

        private static bool AllMeetExemption(IReadOnlyList<string?> marks, IReadOnlyDictionary<int, Paper> papers, int[] paperNos)
        {
            for (var i = 0; i < paperNos.Length && i < marks.Count; i++)
            {
                var exemption = papers.TryGetValue(paperNos[i], out var paper)
                    ? paper.ExemptionMarks ?? 40
                    : 40;
                if (!MeetsMin(marks[i], exemption)) return false;
            }
            return true;
        }

        private static int PaperMin(IReadOnlyDictionary<int, Paper> papers, int paperNo) =>
            papers.TryGetValue(paperNo, out var p) ? p.MinMarks ?? 0 : 0;

        private static bool MeetsMin(string? mark, int min)
        {
            if (string.IsNullOrWhiteSpace(mark) || IsA(mark)) return false;
            return int.TryParse(mark.Trim(), out var v) && v >= min;
        }

        private static bool HasMark(string? m) => !string.IsNullOrWhiteSpace(m);
        private static bool IsA(string? m) => string.Equals((m ?? string.Empty).Trim(), "A", StringComparison.OrdinalIgnoreCase);

        private static int SumMarks(params string?[] marks) => marks.Sum(PanditMarksService.MarkValue);
        private static int SumMarks(IEnumerable<string?> marks) => marks.Sum(PanditMarksService.MarkValue);

        private static string NormKhand(string? value)
        {
            var k = (value ?? "I").Trim().ToUpperInvariant();
            if (k == "1") return "I";
            if (k == "2") return "II";
            return k is "II" ? "II" : "I";
        }

        private static string ValidateCorrectionPaper(string? input, string paperLabel)
        {
            var normalized = (input ?? string.Empty).Trim().ToUpperInvariant();
            if (normalized == "A") return "A";
            if (int.TryParse(normalized, out var marks) && marks is >= 0 and <= 100)
                return marks.ToString();
            throw new InvalidOperationException($"{paperLabel} must be 0-100 or A.");
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
