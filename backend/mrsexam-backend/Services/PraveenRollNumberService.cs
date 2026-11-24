using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Praveen rolls are entered with the form (PK includes RollNo).
    /// Provides next-roll suggestion and list-by-region only.
    /// </summary>
    public sealed class PraveenRollNumberService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PraveenRollNumberService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<object> GetNextRollAsync(int regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var maxRoll = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.RegionNo == regionNo)
                .MaxAsync(f => (int?)f.RollNo, cancellationToken);

            return new
            {
                regionNo,
                sessionNo = session.SessionNo,
                nextRollNo = (maxRoll ?? 0) + 1
            };
        }

        public async Task<IReadOnlyList<object>> ListAssignedAsync(int regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var rows = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.RegionNo == regionNo)
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.RollNo,
                    f.RegionNo,
                    f.SessionNo,
                    f.Name,
                    f.FormCentre,
                    f.ExamCentre
                })
                .ToListAsync(cancellationToken);

            return rows;
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
