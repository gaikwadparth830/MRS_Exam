using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class BalbodhiniOptions
    {
        public const string SectionName = "Balbodhini";
        // Legacy grace uses exam_no = 1 (Q-002 open). Kept configurable.
        public int GraceExamNo { get; set; } = 1;
        // Legacy result uses exam_no = 2 (Q-002 open). Kept configurable.
        public int ResultExamNo { get; set; } = 2;
    }

    public sealed class MarksService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly BalbodhiniOptions _options;

        public MarksService(MrsexamContext db, SessionService sessions, IOptions<BalbodhiniOptions> options)
        {
            _db = db;
            _sessions = sessions;
            _options = options.Value;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int regionNo, short fromRoll, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var rows = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RegionNo == regionNo
                    && f.RollNo != null
                    && f.RollNo >= fromRoll
                    && f.Result == null)
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.SrNo,
                    f.RollNo,
                    f.SessionNo,
                    f.Marks1,
                    f.TotMarks,
                    f.RegionNo,
                    f.Name
                })
                .ToListAsync(cancellationToken);

            return rows;
        }

        public async Task<MarksUpdateResponse> UpdateAsync(int srno, MarksUpdateRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);
            var entity = await _db.FormBalbodhinis
                .FirstOrDefaultAsync(f => f.SrNo == srno && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            if (!string.IsNullOrWhiteSpace(entity.Result))
                throw new InvalidOperationException("Candidate already has a result.");

            var paper1 = (request.Paper1 ?? string.Empty).Trim().ToUpperInvariant();
            if (paper1 == "A")
            {
                entity.Marks1 = "A";
                entity.TotMarks = 0;
                await _db.SaveChangesAsync(cancellationToken);
                return new MarksUpdateResponse
                {
                    SrNo = entity.SrNo,
                    Marks1 = entity.Marks1,
                    TotMarks = entity.TotMarks
                };
            }

            if (!int.TryParse(paper1, out var marks) || marks < 0 || marks > 100)
                throw new InvalidOperationException("Paper 1 must be 0-100 or A.");

            var exam = await _db.Exams.AsNoTracking()
                .FirstOrDefaultAsync(e => e.ExamNo == _options.GraceExamNo, cancellationToken);

            var graceAmount = GetGraceAmount(marks, exam);
            if (graceAmount > 0 && !request.AcceptGrace)
            {
                return new MarksUpdateResponse
                {
                    SrNo = entity.SrNo,
                    Marks1 = marks.ToString(),
                    TotMarks = (short)marks,
                    GraceOffered = true,
                    GraceAmount = graceAmount,
                    Message = $"Mark is {graceAmount} below a grade boundary. Accept grace?"
                };
            }

            if (graceAmount > 0 && request.AcceptGrace)
                marks += graceAmount;

            entity.Marks1 = marks.ToString();
            entity.TotMarks = (short)marks;
            await _db.SaveChangesAsync(cancellationToken);

            return new MarksUpdateResponse
            {
                SrNo = entity.SrNo,
                Marks1 = entity.Marks1,
                TotMarks = entity.TotMarks,
                GraceOffered = false,
                GraceAmount = graceAmount > 0 && request.AcceptGrace ? graceAmount : null
            };
        }

        private static int GetGraceAmount(int marks, Exam? exam)
        {
            if (exam is null) return 0;

            var boundaries = new[] { exam.Class1Marks, exam.Class2Marks, exam.Class3Marks, exam.DistMarks }
                .Where(b => b.HasValue)
                .Select(b => b!.Value)
                .Distinct();

            foreach (var boundary in boundaries)
            {
                var diff = boundary - marks;
                if (diff is 1 or 2) return diff;
            }

            return 0;
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
