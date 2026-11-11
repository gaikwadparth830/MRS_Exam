using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class CandidateService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly CentreResolver _centres;

        public CandidateService(MrsexamContext db, SessionService sessions, CentreResolver centres)
        {
            _db = db;
            _sessions = sessions;
            _centres = centres;
        }

        public async Task<IReadOnlyList<FormBalbodhini>> ListAsync(string? formCentre, string? direction, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var query = _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo);

            if (!string.IsNullOrWhiteSpace(formCentre))
                query = query.Where(f => f.FormCentre == formCentre.Trim());

            query = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase)
                ? query.OrderByDescending(f => f.FormCentre).ThenByDescending(f => f.SrNo)
                : query.OrderBy(f => f.FormCentre).ThenBy(f => f.SrNo);

            return await query.ToListAsync(cancellationToken);
        }

        public async Task<FormBalbodhini?> GetAsync(int srno, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormBalbodhinis.AsNoTracking()
                .FirstOrDefaultAsync(f => f.SrNo == srno && f.SessionNo == session.SessionNo, cancellationToken);
        }

        public async Task<int> CountForCentreAsync(string formCentre, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormBalbodhinis.CountAsync(
                f => f.SessionNo == session.SessionNo && f.FormCentre == formCentre.Trim(),
                cancellationToken);
        }

        public async Task<IReadOnlyList<FormBalbodhini>> SearchByNameAsync(string name, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var prefix = (name ?? string.Empty).Trim();
            return await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.Name != null && f.Name.StartsWith(prefix))
                .OrderBy(f => f.FormCentre).ThenBy(f => f.SrNo)
                .ToListAsync(cancellationToken);
        }

        public async Task<FormBalbodhini?> SearchByRollAsync(int regionNo, short rollNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormBalbodhinis.AsNoTracking()
                .FirstOrDefaultAsync(
                    f => f.SessionNo == session.SessionNo && f.RegionNo == regionNo && f.RollNo == rollNo,
                    cancellationToken);
        }

        public async Task<FormBalbodhini> CreateAsync(CandidateWriteRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var validated = await ValidateWriteAsync(request, requireOpenFormCentre: true, cancellationToken);

            var maxSrNo = await _db.FormBalbodhinis.MaxAsync(f => (int?)f.SrNo, cancellationToken) ?? 0;
            var entity = new FormBalbodhini
            {
                SrNo = maxSrNo + 3,
                Name = validated.Name.Trim(),
                Gender = validated.Gender.Trim().ToUpperInvariant(),
                FormCentre = validated.FormCentre.Trim(),
                ExamCentre = validated.ExamCentre.Trim(),
                RegionNo = validated.RegionNo,
                SessionNo = (short)session.SessionNo,
                UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim().ToUpperInvariant(),
                RollNo = null
            };

            _db.FormBalbodhinis.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task<FormBalbodhini> UpdateAsync(int srno, CandidateWriteRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormBalbodhinis
                .FirstOrDefaultAsync(f => f.SrNo == srno && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            var validated = await ValidateWriteAsync(request, requireOpenFormCentre: true, cancellationToken);
            var existingRoll = entity.RollNo;

            entity.Name = validated.Name.Trim();
            entity.Gender = validated.Gender.Trim().ToUpperInvariant();
            entity.FormCentre = validated.FormCentre.Trim();
            entity.ExamCentre = validated.ExamCentre.Trim();
            entity.RegionNo = validated.RegionNo;
            entity.RollNo = existingRoll;
            if (!string.IsNullOrWhiteSpace(request.UserId))
                entity.UserId = request.UserId.Trim().ToUpperInvariant();

            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task DeleteAsync(int srno, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormBalbodhinis
                .FirstOrDefaultAsync(f => f.SrNo == srno && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            _db.FormBalbodhinis.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task<FormBalbodhini> InsertBetweenAsync(InsertBetweenRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var previous = await _db.FormBalbodhinis.AsNoTracking()
                .FirstOrDefaultAsync(f => f.SrNo == request.PreviousSrNo && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Previous candidate not found.");

            var next = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.FormCentre == previous.FormCentre
                    && f.SrNo > previous.SrNo)
                .OrderBy(f => f.SrNo)
                .FirstOrDefaultAsync(cancellationToken);

            if (next is not null && next.SrNo == previous.SrNo + 1)
                throw new InvalidOperationException("No gap between serial numbers for insert.");

            var validated = await ValidateWriteAsync(request.Candidate, requireOpenFormCentre: true, cancellationToken);
            if (!string.Equals(validated.FormCentre.Trim(), previous.FormCentre, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Insert between requires the same form centre.");

            var entity = new FormBalbodhini
            {
                SrNo = previous.SrNo + 1,
                Name = validated.Name.Trim(),
                Gender = validated.Gender.Trim().ToUpperInvariant(),
                FormCentre = validated.FormCentre.Trim(),
                ExamCentre = validated.ExamCentre.Trim(),
                RegionNo = validated.RegionNo,
                SessionNo = (short)session.SessionNo,
                UserId = string.IsNullOrWhiteSpace(request.Candidate.UserId)
                    ? null
                    : request.Candidate.UserId.Trim().ToUpperInvariant(),
                RollNo = null
            };

            _db.FormBalbodhinis.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task<object> BatchInsertAsync(BatchInsertDto request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);

            if (request.EndRollNo < request.StartRollNo)
                throw new InvalidOperationException("End roll number must be greater than or equal to start roll number.");

            var formCentre = await _centres.ResolveAsync(request.CentreCode, cancellationToken)
                ?? throw new InvalidOperationException("Centre does not exist.");

            if (formCentre.IsClosed)
                throw new InvalidOperationException("Form centre is closed.");

            var duplicates = await _db.FormBalbodhinis.AnyAsync(
                f => f.SessionNo == session.SessionNo
                    && f.RegionNo == request.RegionNo
                    && f.RollNo >= request.StartRollNo
                    && f.RollNo <= request.EndRollNo,
                cancellationToken);

            if (duplicates)
                throw new InvalidOperationException("Duplicate roll numbers found in the specified region.");

            var maxSrNo = await _db.FormBalbodhinis.MaxAsync(f => (int?)f.SrNo, cancellationToken) ?? 0;
            var nextSrNo = maxSrNo == 0 ? 3 : maxSrNo + 3;
            var entities = new List<FormBalbodhini>();

            for (var roll = request.StartRollNo; roll <= request.EndRollNo; roll++)
            {
                string name;
                if (roll == request.StartRollNo)
                    name = string.IsNullOrWhiteSpace(request.StartName) ? "-" : request.StartName.Trim();
                else if (roll == request.EndRollNo)
                    name = string.IsNullOrWhiteSpace(request.EndName) ? "-" : request.EndName.Trim();
                else
                    name = "-";

                entities.Add(new FormBalbodhini
                {
                    SrNo = nextSrNo,
                    RollNo = (short)roll,
                    RegionNo = request.RegionNo,
                    SessionNo = (short)session.SessionNo,
                    Name = name,
                    FormCentre = request.CentreCode.Trim(),
                    ExamCentre = request.CentreCode.Trim(),
                    DummyCentreCode = 0,
                    UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim().ToUpperInvariant()
                });

                nextSrNo += 3;
            }

            await _db.FormBalbodhinis.AddRangeAsync(entities, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return new { inserted = entities.Count };
        }

        private async Task<(string Name, string Gender, string FormCentre, string ExamCentre, int? RegionNo)> ValidateWriteAsync(
            CandidateWriteRequest request,
            bool requireOpenFormCentre,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new InvalidOperationException("Name is required.");

            var gender = (request.Gender ?? string.Empty).Trim().ToUpperInvariant();
            if (gender is not ("M" or "F"))
                throw new InvalidOperationException("Gender must be M or F.");

            if (string.IsNullOrWhiteSpace(request.FormCentre))
                throw new InvalidOperationException("Form centre is required.");

            if (string.IsNullOrWhiteSpace(request.ExamCentre))
                throw new InvalidOperationException("Exam centre is required.");

            var formCentre = await _centres.ResolveAsync(request.FormCentre, cancellationToken)
                ?? throw new InvalidOperationException("Form centre does not exist.");

            if (requireOpenFormCentre && formCentre.IsClosed)
                throw new InvalidOperationException("Form centre is closed.");

            var examCentre = await _centres.ResolveAsync(request.ExamCentre, cancellationToken)
                ?? throw new InvalidOperationException("Exam centre does not exist.");

            return (request.Name, gender, formCentre.CentreNo, examCentre.CentreNo, formCentre.RegionNo);
        }

        private async Task<Session> RequireDefaultSessionAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
