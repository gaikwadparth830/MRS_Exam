using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class SessionService
    {
        private readonly MrsexamContext _db;

        public SessionService(MrsexamContext db) => _db = db;

        public async Task<Session?> GetDefaultSessionAsync(CancellationToken cancellationToken)
        {
            return await _db.Sessions.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken);
        }

        public async Task<CurrentSessionDto?> GetCurrentAsync(CancellationToken cancellationToken)
        {
            var session = await GetDefaultSessionAsync(cancellationToken);
            if (session is null) return null;

            var lockFlag = (session.ResgenBalbodhini ?? string.Empty).Trim().ToUpperInvariant();
            var backupFlag = (session.Backup ?? string.Empty).Trim().ToUpperInvariant();

            return new CurrentSessionDto
            {
                SessionNo = session.SessionNo,
                Month = session.Month,
                Defa = session.Defa,
                Backup = session.Backup,
                ResgenBalbodhini = session.ResgenBalbodhini,
                IsLocked = lockFlag == "Y",
                IsBackup = backupFlag == "Y",
                ResultDate = session.ResultDate
            };
        }

        public async Task EnsureWritableAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLocked)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task ResetBalbodhiniLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenBalbodhini = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
