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

            var balbodhiniLock = (session.ResgenBalbodhini ?? string.Empty).Trim().ToUpperInvariant();
            var prathamikLock = (session.ResgenPrathamik ?? string.Empty).Trim().ToUpperInvariant();
            var praveshikaLock = (session.ResgenPraveshika ?? string.Empty).Trim().ToUpperInvariant();
            var subodhLock = (session.ResgenSubodh ?? string.Empty).Trim().ToUpperInvariant();
            var prabodhLock = (session.ResgenPrabodh ?? string.Empty).Trim().ToUpperInvariant();
            var praveenLock = (session.ResgenPraveen ?? string.Empty).Trim().ToUpperInvariant();
            var panditLock = (session.ResgenPandit ?? string.Empty).Trim().ToUpperInvariant();
            var sambhashanLock = (session.ResgenSambhashan ?? string.Empty).Trim().ToUpperInvariant();
            var backupFlag = (session.Backup ?? string.Empty).Trim().ToUpperInvariant();

            return new CurrentSessionDto
            {
                SessionNo = session.SessionNo,
                Month = session.Month,
                Defa = session.Defa,
                Backup = session.Backup,
                ResgenBalbodhini = session.ResgenBalbodhini,
                ResgenPrathamik = session.ResgenPrathamik,
                ResgenPraveshika = session.ResgenPraveshika,
                ResgenSubodh = session.ResgenSubodh,
                ResgenPrabodh = session.ResgenPrabodh,
                ResgenPraveen = session.ResgenPraveen,
                ResgenPandit = session.ResgenPandit,
                ResgenSambhashan = session.ResgenSambhashan,
                IsLocked = balbodhiniLock == "Y",
                IsLockedPrathamik = prathamikLock == "Y",
                IsLockedPraveshika = praveshikaLock == "Y",
                IsLockedSubodh = subodhLock == "Y",
                IsLockedPrabodh = prabodhLock == "Y",
                IsLockedPraveen = praveenLock == "Y",
                IsLockedPandit = panditLock == "Y",
                IsLockedSambhashan = sambhashanLock == "Y",
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

        public async Task EnsureWritablePrathamikAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedPrathamik)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task EnsureWritablePraveshikaAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedPraveshika)
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

        public async Task ResetPrathamikLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenPrathamik = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task ResetPraveshikaLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenPraveshika = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task EnsureWritableSubodhAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedSubodh)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task ResetSubodhLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenSubodh = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task EnsureWritablePrabodhAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedPrabodh)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task ResetPrabodhLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenPrabodh = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task EnsureWritablePraveenAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedPraveen)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task ResetPraveenLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenPraveen = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task EnsureWritablePanditAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedPandit)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task ResetPanditLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenPandit = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task EnsureWritableSambhashanAsync(CancellationToken cancellationToken)
        {
            var current = await GetCurrentAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            if (current.IsBackup)
                throw new InvalidOperationException("Backup session is read-only.");

            if (current.IsLockedSambhashan)
                throw new InvalidOperationException("Result has been generated. Forms and marks are locked.");
        }

        public async Task ResetSambhashanLockAsync(CancellationToken cancellationToken)
        {
            var session = await _db.Sessions
                .FirstOrDefaultAsync(s => s.Defa != null && s.Defa.ToUpper() == "Y", cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            session.ResgenSambhashan = "N";
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
