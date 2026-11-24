using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Praveen form entry: default session, resgen_praveen lock,
    /// form-centre validation, required roll number, no SrNo/gender.
    /// </summary>
    public sealed class PraveenCandidateService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly CentreResolver _centres;

        public PraveenCandidateService(MrsexamContext db, SessionService sessions, CentreResolver centres)
        {
            _db = db;
            _sessions = sessions;
            _centres = centres;
        }

        public async Task<IReadOnlyList<FormPraveen>> ListAsync(string? formCentre, string? direction, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var query = _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo);

            if (!string.IsNullOrWhiteSpace(formCentre))
                query = query.Where(f => f.FormCentre == formCentre.Trim());

            query = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase)
                ? query.OrderByDescending(f => f.FormCentre).ThenByDescending(f => f.RollNo)
                : query.OrderBy(f => f.FormCentre).ThenBy(f => f.RollNo);

            return await query.ToListAsync(cancellationToken);
        }

        public async Task<FormPraveen?> GetAsync(short rollNo, int regionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormPraveens.AsNoTracking()
                .FirstOrDefaultAsync(
                    f => f.RollNo == rollNo && f.RegionNo == regionNo && f.SessionNo == session.SessionNo,
                    cancellationToken);
        }

        public async Task<int> CountForCentreAsync(string formCentre, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormPraveens.CountAsync(
                f => f.SessionNo == session.SessionNo && f.FormCentre == formCentre.Trim(),
                cancellationToken);
        }

        public async Task<IReadOnlyList<FormPraveen>> SearchByNameAsync(string name, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var prefix = (name ?? string.Empty).Trim();
            return await _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.Name != null && f.Name.StartsWith(prefix))
                .OrderBy(f => f.FormCentre).ThenBy(f => f.RollNo)
                .ToListAsync(cancellationToken);
        }

        public async Task<FormPraveen?> SearchByRollAsync(int regionNo, short rollNo, CancellationToken cancellationToken)
        {
            return await GetAsync(rollNo, regionNo, cancellationToken);
        }

        public async Task<FormPraveen> CreateAsync(PraveenCandidateWriteRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePraveenAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var validated = await ValidateWriteAsync(request, requireOpenFormCentre: true, cancellationToken);

            var exists = await _db.FormPraveens.AnyAsync(
                f => f.SessionNo == session.SessionNo
                    && f.RegionNo == validated.RegionNo
                    && f.RollNo == validated.RollNo,
                cancellationToken);
            if (exists)
                throw new InvalidOperationException("Roll number already exists for this region and session.");

            var entity = new FormPraveen
            {
                RollNo = validated.RollNo,
                Name = validated.Name.Trim(),
                FormCentre = validated.FormCentre.Trim(),
                ExamCentre = validated.ExamCentre.Trim(),
                RegionNo = validated.RegionNo,
                SessionNo = (short)session.SessionNo,
                UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim().ToUpperInvariant(),
                DummyCentreCode = 0
            };

            _db.FormPraveens.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task<FormPraveen> UpdateAsync(short rollNo, int regionNo, PraveenCandidateWriteRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePraveenAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormPraveens
                .FirstOrDefaultAsync(
                    f => f.RollNo == rollNo && f.RegionNo == regionNo && f.SessionNo == session.SessionNo,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            var validated = await ValidateWriteAsync(request, requireOpenFormCentre: true, cancellationToken);

            if (validated.RollNo != rollNo || validated.RegionNo != regionNo)
            {
                var conflict = await _db.FormPraveens.AnyAsync(
                    f => f.SessionNo == session.SessionNo
                        && f.RegionNo == validated.RegionNo
                        && f.RollNo == validated.RollNo
                        && !(f.RollNo == rollNo && f.RegionNo == regionNo),
                    cancellationToken);
                if (conflict)
                    throw new InvalidOperationException("Roll number already exists for this region and session.");
            }

            // Composite PK keys cannot be mutated in place; recreate when roll/region change.
            if (validated.RollNo != rollNo || validated.RegionNo != regionNo)
            {
                var replacement = new FormPraveen
                {
                    RollNo = validated.RollNo,
                    RegionNo = validated.RegionNo,
                    SessionNo = entity.SessionNo,
                    Name = validated.Name.Trim(),
                    FormCentre = validated.FormCentre.Trim(),
                    ExamCentre = validated.ExamCentre.Trim(),
                    Marks1 = entity.Marks1,
                    Marks2 = entity.Marks2,
                    Marks3 = entity.Marks3,
                    Marks4 = entity.Marks4,
                    Marks5 = entity.Marks5,
                    OralMarks = entity.OralMarks,
                    RegLang = entity.RegLang,
                    TotMarks = entity.TotMarks,
                    Grade = entity.Grade,
                    UndFlag = entity.UndFlag,
                    UndClass = entity.UndClass,
                    SpecialRank = entity.SpecialRank,
                    Result = entity.Result,
                    DummyCentreCode = entity.DummyCentreCode,
                    UserId = string.IsNullOrWhiteSpace(request.UserId)
                        ? entity.UserId
                        : request.UserId.Trim().ToUpperInvariant()
                };
                _db.FormPraveens.Remove(entity);
                _db.FormPraveens.Add(replacement);
                await _db.SaveChangesAsync(cancellationToken);
                return replacement;
            }

            entity.Name = validated.Name.Trim();
            entity.FormCentre = validated.FormCentre.Trim();
            entity.ExamCentre = validated.ExamCentre.Trim();
            if (!string.IsNullOrWhiteSpace(request.UserId))
                entity.UserId = request.UserId.Trim().ToUpperInvariant();

            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task DeleteAsync(short rollNo, int regionNo, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePraveenAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormPraveens
                .FirstOrDefaultAsync(
                    f => f.RollNo == rollNo && f.RegionNo == regionNo && f.SessionNo == session.SessionNo,
                    cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            _db.FormPraveens.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task<object> BatchInsertAsync(BatchInsertDto request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePraveenAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);

            if (request.EndRollNo < request.StartRollNo)
                throw new InvalidOperationException("End roll number must be greater than or equal to start roll number.");

            var formCentre = await _centres.ResolveAsync(request.CentreCode, cancellationToken)
                ?? throw new InvalidOperationException("Centre does not exist.");

            if (formCentre.IsClosed)
                throw new InvalidOperationException("Form centre is closed.");

            var duplicates = await _db.FormPraveens.AnyAsync(
                f => f.SessionNo == session.SessionNo
                    && f.RegionNo == request.RegionNo
                    && f.RollNo >= request.StartRollNo
                    && f.RollNo <= request.EndRollNo,
                cancellationToken);

            if (duplicates)
                throw new InvalidOperationException("Duplicate roll numbers found in the specified region.");

            var entities = new List<FormPraveen>();
            for (var roll = request.StartRollNo; roll <= request.EndRollNo; roll++)
            {
                string name;
                if (roll == request.StartRollNo)
                    name = string.IsNullOrWhiteSpace(request.StartName) ? "-" : request.StartName.Trim();
                else if (roll == request.EndRollNo)
                    name = string.IsNullOrWhiteSpace(request.EndName) ? "-" : request.EndName.Trim();
                else
                    name = "-";

                entities.Add(new FormPraveen
                {
                    RollNo = (short)roll,
                    RegionNo = request.RegionNo,
                    SessionNo = (short)session.SessionNo,
                    Name = name,
                    FormCentre = request.CentreCode.Trim(),
                    ExamCentre = request.CentreCode.Trim(),
                    DummyCentreCode = 0,
                    UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim().ToUpperInvariant()
                });
            }

            await _db.FormPraveens.AddRangeAsync(entities, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return new { inserted = entities.Count };
        }

        private async Task<(string Name, short RollNo, string FormCentre, string ExamCentre, int RegionNo)> ValidateWriteAsync(
            PraveenCandidateWriteRequest request,
            bool requireOpenFormCentre,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new InvalidOperationException("Name is required.");

            if (request.RollNo <= 0)
                throw new InvalidOperationException("Roll number is required.");

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

            if (!formCentre.RegionNo.HasValue)
                throw new InvalidOperationException("Form centre region could not be resolved.");

            return (request.Name, request.RollNo, formCentre.CentreNo, examCentre.CentreNo, formCentre.RegionNo.Value);
        }

        private async Task<Session> RequireDefaultSessionAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
