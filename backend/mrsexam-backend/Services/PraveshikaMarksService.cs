using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PraveshikaMarksService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PraveshikaMarksService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int regionNo, short fromRoll, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var rows = await _db.FormPraveshikas.AsNoTracking()
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
                    f.Marks2,
                    f.TotMarks,
                    f.RegionNo,
                    f.Name
                })
                .ToListAsync(cancellationToken);

            return rows;
        }

        public async Task<PraveshikaMarksUpdateResponse> UpdateAsync(int srno, PraveshikaMarksUpdateRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePraveshikaAsync(cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);
            var entity = await _db.FormPraveshikas
                .FirstOrDefaultAsync(f => f.SrNo == srno && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            if (!string.IsNullOrWhiteSpace(entity.Result))
                throw new InvalidOperationException("Candidate already has a result.");

            var paper1 = ValidatePaperMark(request.Paper1, "Paper 1");
            var paper2 = ValidatePaperMark(request.Paper2, "Paper 2");
            var tot = (short)(MarkValue(paper1) + MarkValue(paper2));

            entity.Marks1 = paper1;
            entity.Marks2 = paper2;
            entity.TotMarks = tot;
            await _db.SaveChangesAsync(cancellationToken);

            return new PraveshikaMarksUpdateResponse
            {
                SrNo = entity.SrNo,
                Marks1 = entity.Marks1,
                Marks2 = entity.Marks2,
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