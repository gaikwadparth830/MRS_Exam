using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Conservative cross-reference for Pandit Khand I / Khand II pairs.
    /// Links candidates that share name+centres OR already reference OthKhandRollNo,
    /// then sets BothKhandFlag=Y, ResDeclFlag=Y and OthKhandRollNo as appropriate.
    /// Does not invent merges beyond these signals (CrossRef BRD still has open questions).
    /// </summary>
    public sealed class PanditCrossRefService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public PanditCrossRefService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<object> RunAsync(CancellationToken cancellationToken)
        {
            var session = await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            await _sessions.EnsureWritablePanditAsync(cancellationToken);

            var rows = await _db.FormPandits
                .Where(f => f.SessionNo == session.SessionNo)
                .ToListAsync(cancellationToken);

            var khand1 = rows.Where(r => IsKhand(r, "I")).ToList();
            var khand2 = rows.Where(r => IsKhand(r, "II")).ToList();

            var linked = 0;
            var byRoll = rows.ToDictionary(r => r.RollNo);

            // Pass 1: explicit OthKhandRollNo references.
            foreach (var row in rows)
            {
                if (row.OthKhandRollNo is null or <= 0) continue;
                if (!byRoll.TryGetValue(row.OthKhandRollNo.Value, out var other)) continue;
                if (LinkPair(row, other))
                    linked++;
            }

            // Pass 2: same normalized name + form/exam centres, opposite khands.
            var used = new HashSet<short>();
            foreach (var a in khand1)
            {
                if (used.Contains(a.RollNo)) continue;
                var name = Norm(a.Name);
                if (string.IsNullOrEmpty(name) || name == "-") continue;

                var match = khand2.FirstOrDefault(b =>
                    !used.Contains(b.RollNo)
                    && Norm(b.Name) == name
                    && SameCentre(a.FormCentre, b.FormCentre)
                    && SameCentre(a.ExamCentre, b.ExamCentre));

                if (match is null) continue;
                if (LinkPair(a, match))
                {
                    linked++;
                    used.Add(a.RollNo);
                    used.Add(match.RollNo);
                }
            }

            await _db.SaveChangesAsync(cancellationToken);
            return new
            {
                sessionNo = session.SessionNo,
                khand1Count = khand1.Count,
                khand2Count = khand2.Count,
                pairsLinked = linked
            };
        }

        public async Task<object> StatusAsync(CancellationToken cancellationToken)
        {
            var session = await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            var rows = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo)
                .ToListAsync(cancellationToken);

            return new
            {
                sessionNo = session.SessionNo,
                total = rows.Count,
                bothKhand = rows.Count(r => FlagY(r.BothKhandFlag)),
                resDecl = rows.Count(r => FlagY(r.ResDeclFlag)),
                withOthRoll = rows.Count(r => r.OthKhandRollNo is > 0)
            };
        }

        private static bool LinkPair(FormPandit a, FormPandit b)
        {
            var changed = false;
            if (!FlagY(a.BothKhandFlag)) { a.BothKhandFlag = "Y"; changed = true; }
            if (!FlagY(b.BothKhandFlag)) { b.BothKhandFlag = "Y"; changed = true; }
            if (!FlagY(a.ResDeclFlag)) { a.ResDeclFlag = "Y"; changed = true; }
            if (!FlagY(b.ResDeclFlag)) { b.ResDeclFlag = "Y"; changed = true; }
            if (a.OthKhandRollNo != b.RollNo) { a.OthKhandRollNo = b.RollNo; changed = true; }
            if (b.OthKhandRollNo != a.RollNo) { b.OthKhandRollNo = a.RollNo; changed = true; }
            return changed;
        }

        private static bool IsKhand(FormPandit row, string expected)
        {
            var k = (row.KhandAppearing ?? string.Empty).Trim().ToUpperInvariant();
            if (k == "1") k = "I";
            if (k == "2") k = "II";
            return k == expected;
        }

        private static bool FlagY(string? v) =>
            string.Equals((v ?? string.Empty).Trim(), "Y", StringComparison.OrdinalIgnoreCase);

        private static string Norm(string? name) =>
            (name ?? string.Empty).Trim().ToUpperInvariant();

        private static bool SameCentre(string? a, string? b) =>
            string.Equals((a ?? string.Empty).Trim(), (b ?? string.Empty).Trim(), StringComparison.OrdinalIgnoreCase);
    }
}
