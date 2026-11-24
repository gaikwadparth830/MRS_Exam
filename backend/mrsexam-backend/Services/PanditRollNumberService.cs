using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Pandit rolls are entered with the form (PK RollNo+SessionNo).
    /// Next roll = max(RollNo)+1 for session; list by formCentre or region via Centres.
    /// </summary>
    public sealed class PanditRollNumberService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PanditRollNumberService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<object> GetNextRollAsync(CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var maxRoll = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo)
                .MaxAsync(f => (int?)f.RollNo, cancellationToken);

            return new
            {
                sessionNo = session.SessionNo,
                nextRollNo = (maxRoll ?? 0) + 1
            };
        }

        public async Task<IReadOnlyList<object>> ListAssignedAsync(string? formCentre, int? regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            IQueryable<FormPandit> query = _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo);

            if (!string.IsNullOrWhiteSpace(formCentre))
                query = query.Where(f => f.FormCentre == formCentre.Trim());

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
                    f.FormCentre,
                    f.ExamCentre,
                    f.KhandAppearing
                })
                .ToListAsync(cancellationToken);

            return rows.Cast<object>().ToList();
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
