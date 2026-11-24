using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PraveenMarksService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PraveenMarksService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int regionNo, short fromRoll, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var rows = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RegionNo == regionNo
                    && f.RollNo >= fromRoll
                    && f.Result == null)
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.RollNo,
                    f.SessionNo,
                    f.Marks1,
                    f.Marks2,
                    f.Marks3,
                    f.Marks4,
                    f.Marks5,
                    f.OralMarks,
                    f.RegLang,
                    f.TotMarks,
                    f.RegionNo,
                    f.Name
                })
                .ToListAsync(cancellationToken);

            return rows;
        }

        public async Task<PraveenMarksUpdateResponse> UpdateAsync(
            short rollNo,
            int regionNo,
            PraveenMarksUpdateRequest request,
            CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePraveenAsync(cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);
            var entity = await _db.FormPraveens
                .FirstOrDefaultAsync(
                    f => f.RollNo == rollNo && f.RegionNo == regionNo && f.SessionNo == session.SessionNo,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            if (!string.IsNullOrWhiteSpace(entity.Result))
                throw new InvalidOperationException("Candidate already has a result.");

            var paper1 = ValidatePaperMark(request.Paper1, "Paper 1");
            var paper2 = ValidatePaperMark(request.Paper2, "Paper 2");
            var paper3 = ValidatePaperMark(request.Paper3, "Paper 3");
            var paper4 = ValidatePaperMark(request.Paper4, "Paper 4");
            var paper5 = ValidatePaperMark(request.Paper5, "Paper 5");
            var oral = ValidatePaperMark(request.OralMarks, "Oral marks");
            var regLang = ValidatePaperMark(request.RegLang, "Reg Lang");
            var tot = (short)(MarkValue(paper1) + MarkValue(paper2) + MarkValue(paper3) + MarkValue(paper4) + MarkValue(paper5));

            entity.Marks1 = paper1;
            entity.Marks2 = paper2;
            entity.Marks3 = paper3;
            entity.Marks4 = paper4;
            entity.Marks5 = paper5;
            entity.OralMarks = oral;
            entity.RegLang = regLang;
            entity.TotMarks = tot;
            await _db.SaveChangesAsync(cancellationToken);

            return new PraveenMarksUpdateResponse
            {
                RollNo = entity.RollNo,
                RegionNo = entity.RegionNo,
                SessionNo = entity.SessionNo,
                Marks1 = entity.Marks1,
                Marks2 = entity.Marks2,
                Marks3 = entity.Marks3,
                Marks4 = entity.Marks4,
                Marks5 = entity.Marks5,
                OralMarks = entity.OralMarks,
                RegLang = entity.RegLang,
                TotMarks = entity.TotMarks
            };
        }

        private static string ValidatePaperMark(string? input, string paperLabel)
        {
            var normalized = (input ?? string.Empty).Trim().ToUpperInvariant();
            if (normalized == "A")
                return "A";

            if (!int.TryParse(normalized, out var marks) || marks < 0 || marks > 100)
                throw new InvalidOperationException($"{paperLabel} must be 0-100 or A.");

            return marks.ToString();
        }

        private static int MarkValue(string mark)
        {
            if (string.Equals(mark, "A", StringComparison.OrdinalIgnoreCase))
                return 0;

            return int.TryParse(mark, out var v) ? v : 0;
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
