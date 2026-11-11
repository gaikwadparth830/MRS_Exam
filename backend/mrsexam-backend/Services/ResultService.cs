using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class ResultService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly BalbodhiniOptions _options;

        public ResultService(MrsexamContext db, SessionService sessions, IOptions<BalbodhiniOptions> options)
        {
            _db = db;
            _sessions = sessions;
            _options = options.Value;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var rows = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.RegionNo == regionNo)
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.SrNo,
                    f.RollNo,
                    f.Marks1,
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
                ?? throw new InvalidOperationException("Exam details are missing for Balbodhini.");

            var paper = await _db.Papers.AsNoTracking()
                .FirstOrDefaultAsync(p => p.ExamNo == _options.ResultExamNo && p.PaperNo == 1, cancellationToken)
                ?? throw new InvalidOperationException("Paper details are missing for Balbodhini.");

            var region = await _db.Regions.AsNoTracking()
                .FirstOrDefaultAsync(r => r.RegionNo == regionNo, cancellationToken)
                ?? throw new InvalidOperationException("Region not found.");

            await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

            var eligible = await _db.FormBalbodhinis
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RegionNo == regionNo
                    && f.Marks1 != null
                    && f.Result == null)
                .OrderBy(f => f.RollNo)
                .ToListAsync(cancellationToken);

            foreach (var row in eligible)
            {
                row.SpecialRank = null;
                row.Grade = null;
                row.Result = null;
            }

            await _db.SaveChangesAsync(cancellationToken);

            var currentMaxRun = await _db.FormBalbodhinis
                .Where(f => f.SessionNo == session.SessionNo)
                .MaxAsync(f => (int?)f.ResgenRun, cancellationToken);

            // Legacy stores computedRun + 1 (DEF-04 / Q-006). Preserve until answered.
            var computedRun = currentMaxRun is null or 0 ? 1 : currentMaxRun.Value + 1;
            var storedRun = (short)(computedRun + 1);

            foreach (var row in eligible)
            {
                ApplyResultRules(row, exam, paper);
                row.ResgenRun = storedRun;
            }

            await _db.SaveChangesAsync(cancellationToken);

            var passing = eligible
                .Where(r => string.Equals(r.Result, "Pass", StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(r => r.TotMarks ?? 0)
                .ToList();

            if (passing.Count > 0)
            {
                var top = passing[0].TotMarks ?? 0;
                var englishName = region.RegionNameEng?.Trim() ?? region.RegionName?.Trim() ?? string.Empty;
                foreach (var row in passing.Where(r => (r.TotMarks ?? 0) == top))
                    row.SpecialRank = $"FIRST IN {englishName}".Trim();
            }

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);

            return new
            {
                processed = eligible.Count,
                resgenRun = storedRun,
                regionNo
            };
        }

        public async Task<object> FindRanksAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var passing = await _db.FormBalbodhinis
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
            var row = await _db.FormBalbodhinis.AsNoTracking()
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo
                        && f.RegionNo == regionNo
                        && f.RollNo == rollNo
                        && f.Result != null,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate with result not found.");

            return new
            {
                row.SrNo,
                row.RollNo,
                row.RegionNo,
                row.Name,
                row.Marks1,
                row.TotMarks,
                row.Grade,
                row.Result,
                row.SpecialRank,
                row.ResgenRun
            };
        }

        public async Task<object> SaveCorrectionAsync(CorrectionSaveRequest request, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var row = await _db.FormBalbodhinis
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo
                        && f.RegionNo == request.RegionNo
                        && f.RollNo == request.RollNo
                        && f.Result != null,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate with result not found.");

            var paper1 = (request.Paper1 ?? string.Empty).Trim().ToUpperInvariant();
            short? tot;
            if (paper1 == "A")
            {
                tot = 0;
            }
            else if (int.TryParse(paper1, out var marks) && marks is >= 0 and <= 100)
            {
                tot = (short)marks;
                paper1 = marks.ToString();
            }
            else
            {
                throw new InvalidOperationException("Paper 1 must be 0-100 or A.");
            }

            var hadSpecialRank = !string.IsNullOrWhiteSpace(row.SpecialRank);
            row.Marks1 = paper1;
            row.TotMarks = tot;

            if (hadSpecialRank)
            {
                var regionRows = await _db.FormBalbodhinis
                    .Where(f => f.SessionNo == session.SessionNo && f.RegionNo == request.RegionNo)
                    .ToListAsync(cancellationToken);

                foreach (var item in regionRows)
                {
                    item.Grade = null;
                    item.Result = null;
                    item.ResgenRun = null;
                    item.SpecialRank = null;
                }

                await _db.SaveChangesAsync(cancellationToken);
                return new { clearedRegion = true, message = "Special rank existed. Region results cleared. Regenerate the region." };
            }

            row.Grade = null;
            row.Result = null;
            row.ResgenRun = null;
            row.SpecialRank = string.Empty;
            await _db.SaveChangesAsync(cancellationToken);
            return new { clearedRegion = false, message = "Marks updated. Candidate result cleared." };
        }

        private static void ApplyResultRules(FormBalbodhini row, Exam exam, Paper paper)
        {
            var marks1 = row.Marks1?.Trim() ?? string.Empty;

            if (string.Equals(marks1, "A", StringComparison.OrdinalIgnoreCase))
            {
                row.TotMarks = null;
                row.Result = "Fail";
                row.Grade = "A";
                return;
            }

            var total = row.TotMarks ?? 0;
            if (row.TotMarks is null)
                total = 0;

            if (total < (exam.MinTotalKhand1 ?? 0))
            {
                row.Result = "Fail";
                row.Grade = "X";
                return;
            }

            if (marks1.Length == 0)
            {
                row.Result = "-";
                row.Grade = "-";
                return;
            }

            if (!int.TryParse(marks1, out var paperMarks) || paperMarks < (paper.MinMarks ?? 0))
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
