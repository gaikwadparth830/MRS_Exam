using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PraveenResultService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly PraveenOptions _options;
        private const int OralRegLangPassMin = 35;

        public PraveenResultService(MrsexamContext db, SessionService sessions, IOptions<PraveenOptions> options)
        {
            _db = db;
            _sessions = sessions;
            _options = options.Value;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var rows = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.RegionNo == regionNo)
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.RollNo,
                    f.RegionNo,
                    f.Marks1,
                    f.Marks2,
                    f.Marks3,
                    f.Marks4,
                    f.Marks5,
                    f.OralMarks,
                    f.RegLang,
                    f.TotMarks,
                    f.Grade,
                    f.SpecialRank,
                    f.Result
                })
                .ToListAsync(cancellationToken);

            return rows.Cast<object>().ToList();
        }

        public async Task<object> GenerateAsync(int regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var exam = await _db.Exams.AsNoTracking()
                .FirstOrDefaultAsync(e => e.ExamNo == _options.ResultExamNo, cancellationToken)
                ?? throw new InvalidOperationException("Exam details are missing for Praveen.");

            var papers = new Paper[6];
            for (var paperNo = 1; paperNo <= 5; paperNo++)
            {
                papers[paperNo] = await _db.Papers.AsNoTracking()
                    .FirstOrDefaultAsync(p => p.ExamNo == _options.ResultExamNo && p.PaperNo == paperNo, cancellationToken)
                    ?? throw new InvalidOperationException($"Paper {paperNo} details are missing for Praveen.");
            }

            object? result = null;
            var strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

                // BRD: process whole session (all regions); regionNo kept for API/display only.
                var eligible = await _db.FormPraveens
                    .Where(f => f.SessionNo == session.SessionNo
                        && f.Marks1 != null
                        && f.Marks2 != null
                        && f.Marks3 != null
                        && f.Marks4 != null
                        && f.Marks5 != null
                        && f.OralMarks != null
                        && f.Result == null)
                    .OrderBy(f => f.RegionNo)
                    .ThenBy(f => f.RollNo)
                    .ToListAsync(cancellationToken);

                foreach (var row in eligible)
                {
                    row.SpecialRank = null;
                    row.Grade = null;
                    row.Result = null;
                }

                await _db.SaveChangesAsync(cancellationToken);

                foreach (var row in eligible)
                    ApplyResultRules(row, exam, papers[1], papers[2], papers[3], papers[4], papers[5]);

                await _db.SaveChangesAsync(cancellationToken);

                var sessionTopTotal = await _db.FormPraveens
                    .Where(f => f.SessionNo == session.SessionNo
                        && f.Result != null
                        && f.Result.ToUpper() == "PASS"
                        && f.TotMarks != null)
                    .MaxAsync(f => (int?)f.TotMarks, cancellationToken);

                if (sessionTopTotal is not null)
                {
                    var topPassInSession = await _db.FormPraveens
                        .Where(f => f.SessionNo == session.SessionNo
                            && f.Result != null
                            && f.Result.ToUpper() == "PASS"
                            && f.TotMarks == sessionTopTotal)
                        .ToListAsync(cancellationToken);

                    foreach (var row in topPassInSession)
                        row.SpecialRank = "FIRST";
                }

                var trackedSession = await _db.Sessions
                    .FirstOrDefaultAsync(s => s.SessionNo == session.SessionNo, cancellationToken)
                    ?? throw new InvalidOperationException("Session not selected.");
                trackedSession.ResgenPraveen = "Y";

                await _db.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);

                result = new
                {
                    processed = eligible.Count,
                    regionNo,
                    sessionWide = true
                };
            });

            return result!;
        }

        public async Task<object> FindRanksAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var passing = await _db.FormPraveens
                .Where(f => f.SessionNo == session.SessionNo
                    && f.Result != null
                    && f.Result.ToUpper() == "PASS")
                .OrderByDescending(f => f.TotMarks)
                .ToListAsync(cancellationToken);

            if (passing.Count == 0)
                return new { first = 0, second = 0 };

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

        public async Task<object> GetCorrectionAsync(int regionNo, short rollNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var row = await _db.FormPraveens.AsNoTracking()
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo
                        && f.RegionNo == regionNo
                        && f.RollNo == rollNo
                        && f.Result != null,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate with result not found.");

            return new
            {
                row.RollNo,
                row.RegionNo,
                row.SessionNo,
                row.Name,
                row.Marks1,
                row.Marks2,
                row.Marks3,
                row.Marks4,
                row.Marks5,
                row.OralMarks,
                row.RegLang,
                row.TotMarks,
                row.Grade,
                row.Result,
                row.SpecialRank
            };
        }

        public async Task<object> SaveCorrectionAsync(PraveenCorrectionSaveRequest request, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var row = await _db.FormPraveens
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo
                        && f.RegionNo == request.RegionNo
                        && f.RollNo == request.RollNo
                        && f.Result != null,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate with result not found.");

            var paper1 = ValidateCorrectionPaper(request.Paper1, "Paper 1");
            var paper2 = ValidateCorrectionPaper(request.Paper2, "Paper 2");
            var paper3 = ValidateCorrectionPaper(request.Paper3, "Paper 3");
            var paper4 = ValidateCorrectionPaper(request.Paper4, "Paper 4");
            var paper5 = ValidateCorrectionPaper(request.Paper5, "Paper 5");
            var oral = ValidateCorrectionPaper(request.OralMarks, "Oral marks");
            var regLang = ValidateCorrectionPaper(request.RegLang, "Reg Lang");
            var tot = (short)(MarkValue(paper1) + MarkValue(paper2) + MarkValue(paper3) + MarkValue(paper4) + MarkValue(paper5));

            var hadSpecialRank = !string.IsNullOrWhiteSpace(row.SpecialRank);
            row.Marks1 = paper1;
            row.Marks2 = paper2;
            row.Marks3 = paper3;
            row.Marks4 = paper4;
            row.Marks5 = paper5;
            row.OralMarks = oral;
            row.RegLang = regLang;
            row.TotMarks = tot;

            if (hadSpecialRank)
            {
                // Ranks are session-wide for Praveen; clear all session results so regenerate is required.
                var sessionRows = await _db.FormPraveens
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

        private static string ValidateCorrectionPaper(string? input, string paperLabel)
        {
            var normalized = (input ?? string.Empty).Trim().ToUpperInvariant();
            if (normalized == "A")
                return "A";

            if (int.TryParse(normalized, out var marks) && marks is >= 0 and <= 100)
                return marks.ToString();

            throw new InvalidOperationException($"{paperLabel} must be 0-100 or A.");
        }

        private static int MarkValue(string? mark)
        {
            if (string.IsNullOrWhiteSpace(mark))
                return 0;

            if (string.Equals(mark.Trim(), "A", StringComparison.OrdinalIgnoreCase))
                return 0;

            return int.TryParse(mark.Trim(), out var v) ? v : 0;
        }

        private static void ApplyResultRules(
            FormPraveen row,
            Exam exam,
            Paper paper1,
            Paper paper2,
            Paper paper3,
            Paper paper4,
            Paper paper5)
        {
            var marks1 = row.Marks1?.Trim() ?? string.Empty;
            var marks2 = row.Marks2?.Trim() ?? string.Empty;
            var marks3 = row.Marks3?.Trim() ?? string.Empty;
            var marks4 = row.Marks4?.Trim() ?? string.Empty;
            var marks5 = row.Marks5?.Trim() ?? string.Empty;
            var oral = row.OralMarks?.Trim() ?? string.Empty;
            var regLang = row.RegLang?.Trim() ?? string.Empty;

            var isA1 = string.Equals(marks1, "A", StringComparison.OrdinalIgnoreCase);
            var isA2 = string.Equals(marks2, "A", StringComparison.OrdinalIgnoreCase);
            var isA3 = string.Equals(marks3, "A", StringComparison.OrdinalIgnoreCase);
            var isA4 = string.Equals(marks4, "A", StringComparison.OrdinalIgnoreCase);
            var isA5 = string.Equals(marks5, "A", StringComparison.OrdinalIgnoreCase);

            if (isA1 && isA2 && isA3 && isA4 && isA5)
            {
                row.TotMarks = null;
                row.Result = "Fail";
                row.Grade = "A";
                return;
            }

            if (isA1 || isA2 || isA3 || isA4 || isA5)
            {
                row.Result = "Fail";
                row.Grade = "X";
                return;
            }

            var total = row.TotMarks ?? (short)(MarkValue(marks1) + MarkValue(marks2) + MarkValue(marks3) + MarkValue(marks4) + MarkValue(marks5));
            row.TotMarks = total;

            if (total < (exam.MinTotalKhand1 ?? 0))
            {
                row.Result = "Fail";
                row.Grade = "X";
                return;
            }

            if (marks1.Length == 0 || marks2.Length == 0 || marks3.Length == 0 || marks4.Length == 0 || marks5.Length == 0 || oral.Length == 0)
            {
                row.Result = "-";
                row.Grade = "-";
                return;
            }

            if (!int.TryParse(marks1, out var p1) || p1 < (paper1.MinMarks ?? 0)
                || !int.TryParse(marks2, out var p2) || p2 < (paper2.MinMarks ?? 0)
                || !int.TryParse(marks3, out var p3) || p3 < (paper3.MinMarks ?? 0)
                || !int.TryParse(marks4, out var p4) || p4 < (paper4.MinMarks ?? 0)
                || !int.TryParse(marks5, out var p5) || p5 < (paper5.MinMarks ?? 0)
                || (MarkValue(oral) + MarkValue(regLang)) < OralRegLangPassMin)
            {
                row.Result = "Fail";
                row.Grade = "X";
                return;
            }

            row.Result = "Pass";
            if (total >= (exam.DistMarks ?? int.MaxValue))
                row.Grade = "Vi. Yo.";
            else if (total >= (exam.Class1Marks ?? int.MaxValue))
                row.Grade = "1";
            else if (total >= (exam.Class2Marks ?? int.MaxValue))
                row.Grade = "2";
            else
                row.Grade = "3";
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
