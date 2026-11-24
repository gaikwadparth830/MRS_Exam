using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PanditMarksService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PanditMarksService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<IReadOnlyList<object>> ListAsync(int regionNo, short fromRoll, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var centreNos = await (
                from c in _db.Centres.AsNoTracking()
                join d in _db.Districts.AsNoTracking() on c.DistrictName equals d.DistrictName
                where d.RegionNo == regionNo
                select c.CentreNo
            ).ToListAsync(cancellationToken);

            var rows = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RollNo >= fromRoll
                    && f.Result == null
                    && f.FormCentre != null
                    && centreNos.Contains(f.FormCentre))
                .OrderBy(f => f.RollNo)
                .Select(f => new
                {
                    f.RollNo,
                    f.SessionNo,
                    f.Name,
                    f.FormCentre,
                    f.ExamCentre,
                    f.KhandAppearing,
                    f.FlgPortion,
                    f.Marks1,
                    f.Marks2,
                    f.Marks3,
                    f.Marks4,
                    f.Marks5,
                    f.Marks6,
                    f.Marks7,
                    f.Marks8,
                    f.OralMarks,
                    f.Khand1TotMarks,
                    f.Khand2TotMarks,
                    f.TotMarks,
                    RegionNo = regionNo
                })
                .ToListAsync(cancellationToken);

            return rows.Cast<object>().ToList();
        }

        public async Task<PanditMarksUpdateResponse> UpdateAsync(
            short rollNo,
            PanditMarksUpdateRequest request,
            CancellationToken cancellationToken)
        {
            await _sessions.EnsureWritablePanditAsync(cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);
            var entity = await _db.FormPandits
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.SessionNo == session.SessionNo, cancellationToken)
                ?? throw new KeyNotFoundException("Candidate not found.");

            if (!string.IsNullOrWhiteSpace(entity.Result))
                throw new InvalidOperationException("Candidate already has a result.");

            var portion = PanditConcession.NormalizePortion(entity.FlgPortion);
            var khand = (entity.KhandAppearing ?? "I").Trim().ToUpperInvariant();
            if (khand == "1") khand = "I";
            if (khand == "2") khand = "II";
            var currentSession = (short)session.SessionNo;

            // Only update current-session editable papers based on khand/portion.
            if (portion == "N" && khand == "I")
            {
                ApplyIfCurrent(entity, 1, request.Paper1, currentSession);
                ApplyIfCurrent(entity, 2, request.Paper2, currentSession);
                ApplyIfCurrent(entity, 3, request.Paper3, currentSession);
                ApplyIfCurrent(entity, 4, request.Paper4, currentSession);
            }
            else if (portion == "N" && khand == "II")
            {
                ApplyIfCurrent(entity, 5, request.Paper5, currentSession);
                ApplyIfCurrent(entity, 6, request.Paper6, currentSession);
                ApplyIfCurrent(entity, 7, request.Paper7, currentSession);
                if (!string.IsNullOrWhiteSpace(request.Paper8))
                    ApplyIfCurrent(entity, 8, request.Paper8, currentSession);
                ApplyOralIfCurrent(entity, request.OralMarks, currentSession);
            }
            else if (portion == "O" && khand == "I")
            {
                ApplyIfCurrent(entity, 1, request.Paper1, currentSession);
                ApplyIfCurrent(entity, 2, request.Paper2, currentSession);
                ApplyIfCurrent(entity, 3, request.Paper3, currentSession);
            }
            else // OLD Khand II: papers 4–6 + oral
            {
                ApplyIfCurrent(entity, 4, request.Paper4, currentSession);
                ApplyIfCurrent(entity, 5, request.Paper5, currentSession);
                ApplyIfCurrent(entity, 6, request.Paper6, currentSession);
                ApplyOralIfCurrent(entity, request.OralMarks, currentSession);
            }

            RecalcTotals(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return new PanditMarksUpdateResponse
            {
                RollNo = entity.RollNo,
                SessionNo = entity.SessionNo,
                Marks1 = entity.Marks1,
                Marks2 = entity.Marks2,
                Marks3 = entity.Marks3,
                Marks4 = entity.Marks4,
                Marks5 = entity.Marks5,
                Marks6 = entity.Marks6,
                Marks7 = entity.Marks7,
                Marks8 = entity.Marks8,
                OralMarks = entity.OralMarks,
                Khand1TotMarks = entity.Khand1TotMarks,
                Khand2TotMarks = entity.Khand2TotMarks,
                TotMarks = entity.TotMarks
            };
        }

        /// <summary>BRD: TotMarks on marks form ≈ sum P1..P7 (exclude marks8).</summary>
        public static void RecalcTotals(FormPandit entity)
        {
            entity.Khand1TotMarks = MarkValue(entity.Marks1) + MarkValue(entity.Marks2)
                + MarkValue(entity.Marks3) + MarkValue(entity.Marks4);
            entity.Khand2TotMarks = MarkValue(entity.Marks5) + MarkValue(entity.Marks6)
                + MarkValue(entity.Marks7); // marks8 often excluded from khand2 total
            var tot = MarkValue(entity.Marks1) + MarkValue(entity.Marks2) + MarkValue(entity.Marks3)
                + MarkValue(entity.Marks4) + MarkValue(entity.Marks5) + MarkValue(entity.Marks6)
                + MarkValue(entity.Marks7);
            entity.TotMarks = (short)tot;
        }

        private static void ApplyIfCurrent(FormPandit entity, int paper, string? value, short currentSession)
        {
            var paperSession = GetPaperSession(entity, paper);
            // Editable when paper session is null/current (current attempt) or when value provided for current slot.
            if (paperSession is not null && paperSession != currentSession && string.IsNullOrWhiteSpace(value))
                return;

            if (value is null) return;
            var mark = ValidatePaperMark(value, $"Paper {paper}");
            SetPaperMark(entity, paper, mark);
            if (GetPaperSession(entity, paper) is null)
                SetPaperSession(entity, paper, currentSession);
            if (GetPaperRoll(entity, paper) is null or <= 0)
                SetPaperRoll(entity, paper, entity.RollNo);
        }

        private static void ApplyOralIfCurrent(FormPandit entity, string? value, short currentSession)
        {
            if (entity.OralSessionNo is not null && entity.OralSessionNo != currentSession && string.IsNullOrWhiteSpace(value))
                return;
            if (value is null) return;
            entity.OralMarks = ValidatePaperMark(value, "Oral marks");
            entity.OralSessionNo ??= currentSession;
            entity.OralRollNo ??= entity.RollNo;
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

        public static int MarkValue(string? mark)
        {
            if (string.IsNullOrWhiteSpace(mark)) return 0;
            if (string.Equals(mark.Trim(), "A", StringComparison.OrdinalIgnoreCase)) return 0;
            return int.TryParse(mark.Trim(), out var v) ? v : 0;
        }

        private static short? GetPaperSession(FormPandit e, int paper) => paper switch
        {
            1 => e.SessionNo1, 2 => e.SessionNo2, 3 => e.SessionNo3, 4 => e.SessionNo4,
            5 => e.SessionNo5, 6 => e.SessionNo6, 7 => e.SessionNo7, 8 => e.SessionNo8,
            _ => null
        };

        private static short? GetPaperRoll(FormPandit e, int paper) => paper switch
        {
            1 => e.RollNo1, 2 => e.RollNo2, 3 => e.RollNo3, 4 => e.RollNo4,
            5 => e.RollNo5, 6 => e.RollNo6, 7 => e.RollNo7, 8 => e.RollNo8,
            _ => null
        };

        private static void SetPaperMark(FormPandit e, int paper, string mark)
        {
            switch (paper)
            {
                case 1: e.Marks1 = mark; break;
                case 2: e.Marks2 = mark; break;
                case 3: e.Marks3 = mark; break;
                case 4: e.Marks4 = mark; break;
                case 5: e.Marks5 = mark; break;
                case 6: e.Marks6 = mark; break;
                case 7: e.Marks7 = mark; break;
                case 8: e.Marks8 = mark; break;
            }
        }

        private static void SetPaperSession(FormPandit e, int paper, short session)
        {
            switch (paper)
            {
                case 1: e.SessionNo1 = session; break;
                case 2: e.SessionNo2 = session; break;
                case 3: e.SessionNo3 = session; break;
                case 4: e.SessionNo4 = session; break;
                case 5: e.SessionNo5 = session; break;
                case 6: e.SessionNo6 = session; break;
                case 7: e.SessionNo7 = session; break;
                case 8: e.SessionNo8 = session; break;
            }
        }

        private static void SetPaperRoll(FormPandit e, int paper, short roll)
        {
            switch (paper)
            {
                case 1: e.RollNo1 = roll; break;
                case 2: e.RollNo2 = roll; break;
                case 3: e.RollNo3 = roll; break;
                case 4: e.RollNo4 = roll; break;
                case 5: e.RollNo5 = roll; break;
                case 6: e.RollNo6 = roll; break;
                case 7: e.RollNo7 = roll; break;
                case 8: e.RollNo8 = roll; break;
            }
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
