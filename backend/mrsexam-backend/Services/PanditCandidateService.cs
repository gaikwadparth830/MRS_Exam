using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Pandit form entry: PK (RollNo, SessionNo), no RegionNo/SrNo/Gender.
    /// Region for filtering is derived from form centre via Centres join.
    /// </summary>
    public sealed class PanditCandidateService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly CentreResolver _centres;

        public PanditCandidateService(MrsexamContext db, SessionService sessions, CentreResolver centres)
        {
            _db = db;
            _sessions = sessions;
            _centres = centres;
        }

        public async Task<IReadOnlyList<FormPandit>> ListAsync(string? formCentre, int? regionNo, string? direction, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
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

            query = string.Equals(direction, "desc", StringComparison.OrdinalIgnoreCase)
                ? query.OrderByDescending(f => f.FormCentre).ThenByDescending(f => f.RollNo)
                : query.OrderBy(f => f.FormCentre).ThenBy(f => f.RollNo);

            return await query.ToListAsync(cancellationToken);
        }

        public async Task<FormPandit?> GetAsync(short rollNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormPandits.AsNoTracking()
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.SessionNo == session.SessionNo, cancellationToken);
        }

        public async Task<int> CountForCentreAsync(string formCentre, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            return await _db.FormPandits.CountAsync(
                f => f.SessionNo == session.SessionNo && f.FormCentre == formCentre.Trim(),
                cancellationToken);
        }

        public async Task<IReadOnlyList<FormPandit>> SearchByNameAsync(string name, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var prefix = (name ?? string.Empty).Trim();
            return await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo && f.Name != null && f.Name.StartsWith(prefix))
                .OrderBy(f => f.FormCentre).ThenBy(f => f.RollNo)
                .ToListAsync(cancellationToken);
        }

        public async Task<object> CheckConcessionAsync(short rollNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormPandits
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            var flag = PanditConcession.Evaluate(entity);
            entity.ConcessionFlag = flag;
            await _db.SaveChangesAsync(cancellationToken);

            return new
            {
                rollNo = entity.RollNo,
                sessionNo = entity.SessionNo,
                concessionFlag = flag,
                message = flag == "Y" ? "This student has taken concession." : "No concession."
            };
        }

        public async Task<FormPandit> CreateAsync(PanditCandidateWriteRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePanditAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var validated = await ValidateWriteAsync(request, (short)session.SessionNo, requireOpenFormCentre: true, cancellationToken);

            var exists = await _db.FormPandits.AnyAsync(
                f => f.SessionNo == session.SessionNo && f.RollNo == validated.RollNo,
                cancellationToken);
            if (exists)
                throw new InvalidOperationException("Roll number already exists for this session.");

            var entity = MapToEntity(request, validated, (short)session.SessionNo, existing: null);
            entity.ConcessionFlag = PanditConcession.Evaluate(entity);

            _db.FormPandits.Add(entity);
            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task<FormPandit> UpdateAsync(short rollNo, PanditCandidateWriteRequest request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePanditAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormPandits
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            var validated = await ValidateWriteAsync(request, (short)session.SessionNo, requireOpenFormCentre: true, cancellationToken);

            if (validated.RollNo != rollNo)
            {
                var conflict = await _db.FormPandits.AnyAsync(
                    f => f.SessionNo == session.SessionNo && f.RollNo == validated.RollNo,
                    cancellationToken);
                if (conflict)
                    throw new InvalidOperationException("Roll number already exists for this session.");

                // Composite PK: recreate when roll changes.
                var replacement = MapToEntity(request, validated, entity.SessionNo, entity);
                replacement.Result = entity.Result;
                replacement.Grade = entity.Grade;
                replacement.SpecialRank = entity.SpecialRank;
                replacement.TotMarks = entity.TotMarks;
                replacement.Khand1TotMarks = entity.Khand1TotMarks;
                replacement.Khand2TotMarks = entity.Khand2TotMarks;
                replacement.DummyCentreCode = entity.DummyCentreCode;
                replacement.ConcessionFlag = PanditConcession.Evaluate(replacement);

                _db.FormPandits.Remove(entity);
                _db.FormPandits.Add(replacement);
                await _db.SaveChangesAsync(cancellationToken);
                return replacement;
            }

            ApplyFormFields(entity, request, validated);
            entity.ConcessionFlag = PanditConcession.Evaluate(entity);
            await _db.SaveChangesAsync(cancellationToken);
            return entity;
        }

        public async Task DeleteAsync(short rollNo, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePanditAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);
            var entity = await _db.FormPandits
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            _db.FormPandits.Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);
        }

        public async Task<object> BatchInsertAsync(PanditBatchInsertDto request, CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePanditAsync(cancellationToken);
            var session = await RequireDefaultSessionAsync(cancellationToken);

            if (request.EndRollNo < request.StartRollNo)
                throw new InvalidOperationException("End roll number must be greater than or equal to start roll number.");

            var formCentre = await _centres.ResolveAsync(request.CentreCode, cancellationToken)
                ?? throw new InvalidOperationException("Centre does not exist.");

            if (formCentre.IsClosed)
                throw new InvalidOperationException("Form centre is closed.");

            var duplicates = await _db.FormPandits.AnyAsync(
                f => f.SessionNo == session.SessionNo
                    && f.RollNo >= request.StartRollNo
                    && f.RollNo <= request.EndRollNo,
                cancellationToken);

            if (duplicates)
                throw new InvalidOperationException("Duplicate roll numbers found in the specified range.");

            var entities = new List<FormPandit>();
            for (var roll = request.StartRollNo; roll <= request.EndRollNo; roll++)
            {
                string name;
                if (roll == request.StartRollNo)
                    name = string.IsNullOrWhiteSpace(request.StartName) ? "-" : request.StartName.Trim();
                else if (roll == request.EndRollNo)
                    name = string.IsNullOrWhiteSpace(request.EndName) ? "-" : request.EndName.Trim();
                else
                    name = "-";

                entities.Add(new FormPandit
                {
                    RollNo = (short)roll,
                    SessionNo = (short)session.SessionNo,
                    Name = name,
                    FormCentre = formCentre.CentreNo,
                    ExamCentre = formCentre.CentreNo,
                    UndFlag = "N",
                    KhandAppearing = "I",
                    FlgPortion = "N",
                    BothKhandFlag = "N",
                    ConcessionFlag = "N",
                    ResDeclFlag = "N",
                    DummyCentreCode = 0,
                    UserId = string.IsNullOrWhiteSpace(request.UserId) ? null : request.UserId.Trim().ToUpperInvariant()
                });
            }

            await _db.FormPandits.AddRangeAsync(entities, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return new { inserted = entities.Count };
        }

        private async Task<(string Name, short RollNo, string FormCentre, string ExamCentre, string UndFlag, string? UndClass, string Khand, string Portion)> ValidateWriteAsync(
            PanditCandidateWriteRequest request,
            short currentSession,
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

            var und = (request.UndFlag ?? string.Empty).Trim().ToUpperInvariant();
            if (und is not ("Y" or "N"))
                throw new InvalidOperationException("UndFlag must be Y or N.");

            string? undClass = null;
            if (und == "Y")
            {
                if (string.IsNullOrWhiteSpace(request.UndClass))
                    throw new InvalidOperationException("UndClass is required when UndFlag is Y.");
                undClass = request.UndClass.Trim();
            }

            var khand = (request.KhandAppearing ?? string.Empty).Trim().ToUpperInvariant();
            if (khand is "1") khand = "I";
            if (khand is "2") khand = "II";
            if (khand is not ("I" or "II"))
                throw new InvalidOperationException("KhandAppearing must be I or II.");

            var portion = PanditConcession.NormalizePortion(request.FlgPortion);

            var formCentre = await _centres.ResolveAsync(request.FormCentre, cancellationToken)
                ?? throw new InvalidOperationException("Form centre does not exist.");

            if (requireOpenFormCentre && formCentre.IsClosed)
                throw new InvalidOperationException("Form centre is closed.");

            var examCentre = await _centres.ResolveAsync(request.ExamCentre, cancellationToken)
                ?? throw new InvalidOperationException("Exam centre does not exist.");

            ValidatePaperSlots(request, khand, portion, currentSession);

            return (request.Name.Trim(), request.RollNo, formCentre.CentreNo, examCentre.CentreNo, und, undClass, khand, portion);
        }

        private static void ValidatePaperSlots(
            PanditCandidateWriteRequest request,
            string khand,
            string portion,
            short currentSession)
        {
            if (khand == "I")
            {
                RequireSlot(request.RollNo1, request.SessionNo1, request.Marks1, "Paper 1", currentSession);
                RequireSlot(request.RollNo2, request.SessionNo2, request.Marks2, "Paper 2", currentSession);
                RequireSlot(request.RollNo3, request.SessionNo3, request.Marks3, "Paper 3", currentSession);
                if (portion == "N")
                    RequireSlot(request.RollNo4, request.SessionNo4, request.Marks4, "Paper 4", currentSession);
            }
            else
            {
                if (portion == "N")
                {
                    RequireSlot(request.RollNo5, request.SessionNo5, request.Marks5, "Paper 5", currentSession);
                    RequireSlot(request.RollNo6, request.SessionNo6, request.Marks6, "Paper 6", currentSession);
                    RequireSlot(request.RollNo7, request.SessionNo7, request.Marks7, "Paper 7", currentSession);
                    RequireSlot(request.RollNo8, request.SessionNo8, request.Marks8, "Paper 8", currentSession);
                }
                else
                {
                    RequireSlot(request.RollNo4, request.SessionNo4, request.Marks4, "Paper 4", currentSession);
                    RequireSlot(request.RollNo5, request.SessionNo5, request.Marks5, "Paper 5", currentSession);
                    RequireSlot(request.RollNo6, request.SessionNo6, request.Marks6, "Paper 6", currentSession);
                }
            }

            OptionalMark(request.Marks1, "Paper 1");
            OptionalMark(request.Marks2, "Paper 2");
            OptionalMark(request.Marks3, "Paper 3");
            OptionalMark(request.Marks4, "Paper 4");
            OptionalMark(request.Marks5, "Paper 5");
            OptionalMark(request.Marks6, "Paper 6");
            OptionalMark(request.Marks7, "Paper 7");
            OptionalMark(request.Marks8, "Paper 8");
            OptionalMark(request.OralMarks, "Oral marks");
            OptionalMark(request.OptMarks, "Opt marks");
        }

        private static void RequireSlot(short? roll, short? sess, string? marks, string label, short currentSession)
        {
            if (roll is null or <= 0 || sess is null or <= 0)
                throw new InvalidOperationException($"{label} roll and session are required.");

            if (sess.Value != currentSession)
            {
                if (string.IsNullOrWhiteSpace(marks))
                    throw new InvalidOperationException($"{label} marks are required for prior-session papers.");

                var normalized = marks.Trim().ToUpperInvariant();
                if (normalized == "A")
                    return;

                if (!int.TryParse(normalized, out var v) || v < 0)
                    throw new InvalidOperationException($"{label} prior-session marks must be numeric ≥ 0 or A.");
            }
        }

        private static void OptionalMark(string? marks, string label)
        {
            if (string.IsNullOrWhiteSpace(marks)) return;
            var normalized = marks.Trim().ToUpperInvariant();
            if (normalized == "A") return;
            if (!int.TryParse(normalized, out var v) || v < 0 || v > 100)
                throw new InvalidOperationException($"{label} must be 0-100 or A.");
        }

        private static FormPandit MapToEntity(
            PanditCandidateWriteRequest request,
            (string Name, short RollNo, string FormCentre, string ExamCentre, string UndFlag, string? UndClass, string Khand, string Portion) validated,
            short sessionNo,
            FormPandit? existing)
        {
            var entity = existing is null
                ? new FormPandit()
                : new FormPandit
                {
                    Result = existing.Result,
                    Grade = existing.Grade,
                    SpecialRank = existing.SpecialRank,
                    TotMarks = existing.TotMarks,
                    Khand1TotMarks = existing.Khand1TotMarks,
                    Khand2TotMarks = existing.Khand2TotMarks,
                    DummyCentreCode = existing.DummyCentreCode,
                    BothKhandFlag = existing.BothKhandFlag,
                    ResDeclFlag = existing.ResDeclFlag,
                    OthKhandRollNo = existing.OthKhandRollNo,
                    UserId = existing.UserId
                };

            entity.RollNo = validated.RollNo;
            entity.SessionNo = sessionNo;
            ApplyFormFields(entity, request, validated);
            return entity;
        }

        private static void ApplyFormFields(
            FormPandit entity,
            PanditCandidateWriteRequest request,
            (string Name, short RollNo, string FormCentre, string ExamCentre, string UndFlag, string? UndClass, string Khand, string Portion) validated)
        {
            entity.Name = validated.Name;
            entity.FormCentre = validated.FormCentre;
            entity.ExamCentre = validated.ExamCentre;
            entity.UndFlag = validated.UndFlag;
            entity.UndClass = validated.UndClass;
            entity.KhandAppearing = validated.Khand;
            entity.FlgPortion = validated.Portion;
            entity.Add1 = TrimOrNull(request.Add1);
            entity.Add2 = TrimOrNull(request.Add2);
            entity.Add3 = TrimOrNull(request.Add3);
            entity.RollNo1 = request.RollNo1;
            entity.SessionNo1 = request.SessionNo1;
            entity.Marks1 = NormalizeStoredMark(request.Marks1);
            entity.RollNo2 = request.RollNo2;
            entity.SessionNo2 = request.SessionNo2;
            entity.Marks2 = NormalizeStoredMark(request.Marks2);
            entity.RollNo3 = request.RollNo3;
            entity.SessionNo3 = request.SessionNo3;
            entity.Marks3 = NormalizeStoredMark(request.Marks3);
            entity.RollNo4 = request.RollNo4;
            entity.SessionNo4 = request.SessionNo4;
            entity.Marks4 = NormalizeStoredMark(request.Marks4);
            entity.RollNo5 = request.RollNo5;
            entity.SessionNo5 = request.SessionNo5;
            entity.Marks5 = NormalizeStoredMark(request.Marks5);
            entity.RollNo6 = request.RollNo6;
            entity.SessionNo6 = request.SessionNo6;
            entity.Marks6 = NormalizeStoredMark(request.Marks6);
            entity.RollNo7 = request.RollNo7;
            entity.SessionNo7 = request.SessionNo7;
            entity.Marks7 = NormalizeStoredMark(request.Marks7);
            entity.RollNo8 = request.RollNo8;
            entity.SessionNo8 = request.SessionNo8;
            entity.Marks8 = NormalizeStoredMark(request.Marks8);
            entity.OralRollNo = request.OralRollNo;
            entity.OralSessionNo = request.OralSessionNo;
            entity.OralMarks = NormalizeStoredMark(request.OralMarks);
            entity.OptMarks = NormalizeStoredMark(request.OptMarks);
            if (request.OthKhandRollNo.HasValue)
                entity.OthKhandRollNo = request.OthKhandRollNo;
            if (!string.IsNullOrWhiteSpace(request.BothKhandFlag))
                entity.BothKhandFlag = request.BothKhandFlag.Trim().ToUpperInvariant();
            if (!string.IsNullOrWhiteSpace(request.ResDeclFlag))
                entity.ResDeclFlag = request.ResDeclFlag.Trim().ToUpperInvariant();
            if (!string.IsNullOrWhiteSpace(request.UserId))
                entity.UserId = request.UserId.Trim().ToUpperInvariant();
            entity.DummyCentreCode ??= 0;
            entity.BothKhandFlag ??= "N";
            entity.ResDeclFlag ??= "N";
        }

        private static string? TrimOrNull(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static string? NormalizeStoredMark(string? marks)
        {
            if (string.IsNullOrWhiteSpace(marks)) return null;
            var normalized = marks.Trim().ToUpperInvariant();
            if (normalized == "A") return "A";
            return int.TryParse(normalized, out var v) ? v.ToString() : normalized;
        }

        private async Task<Session> RequireDefaultSessionAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
