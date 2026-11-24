using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// NEW-portion concession rules (Proc_CheckConcession / RULE-PND-06).
    /// </summary>
    public static class PanditConcession
    {
        public static string Evaluate(FormPandit row)
        {
            var khand = (row.KhandAppearing ?? string.Empty).Trim().ToUpperInvariant();
            var portion = NormalizePortion(row.FlgPortion);

            var k1Sessions = CollectFilledSessions(
                (row.SessionNo1, HasSlot(row.RollNo1, row.SessionNo1)),
                (row.SessionNo2, HasSlot(row.RollNo2, row.SessionNo2)),
                (row.SessionNo3, HasSlot(row.RollNo3, row.SessionNo3)),
                (row.SessionNo4, HasSlot(row.RollNo4, row.SessionNo4) && portion == "N"));

            var k2Sessions = CollectFilledSessions(
                (row.SessionNo5, HasSlot(row.RollNo5, row.SessionNo5)),
                (row.SessionNo6, HasSlot(row.RollNo6, row.SessionNo6)),
                (row.SessionNo7, HasSlot(row.RollNo7, row.SessionNo7) && portion == "N"),
                (row.SessionNo8, HasSlot(row.RollNo8, row.SessionNo8) && portion == "N"),
                (row.OralSessionNo, HasSlot(row.OralRollNo, row.OralSessionNo)));

            // OLD Khand II uses papers 4–6 + oral (session slots on 4–6).
            if (portion == "O" && khand is "II" or "2")
            {
                k2Sessions = CollectFilledSessions(
                    (row.SessionNo4, HasSlot(row.RollNo4, row.SessionNo4)),
                    (row.SessionNo5, HasSlot(row.RollNo5, row.SessionNo5)),
                    (row.SessionNo6, HasSlot(row.RollNo6, row.SessionNo6)),
                    (row.OralSessionNo, HasSlot(row.OralRollNo, row.OralSessionNo)));
                k1Sessions = CollectFilledSessions(
                    (row.SessionNo1, HasSlot(row.RollNo1, row.SessionNo1)),
                    (row.SessionNo2, HasSlot(row.RollNo2, row.SessionNo2)),
                    (row.SessionNo3, HasSlot(row.RollNo3, row.SessionNo3)));
            }

            var hasK1 = k1Sessions.Count > 0;
            var hasK2 = k2Sessions.Count > 0;

            if (hasK1 && !hasK2)
                return HasAnyDifference(k1Sessions) ? "Y" : "N";

            if (hasK2 && !hasK1)
                return HasAnyDifference(k2Sessions) ? "Y" : "N";

            if (hasK1 && hasK2)
            {
                var diffs = CountDifferences(k1Sessions) + CountDifferences(k2Sessions);
                // Also count cross-khand baseline differences conservatively.
                if (k1Sessions.Count > 0 && k2Sessions.Count > 0 && k1Sessions[0] != k2Sessions[0])
                    diffs++;
                return diffs >= 2 ? "Y" : "N";
            }

            return "N";
        }

        public static string NormalizePortion(string? value)
        {
            var v = (value ?? "N").Trim().ToUpperInvariant();
            return v == "O" ? "O" : "N";
        }

        private static bool HasSlot(short? roll, short? session) =>
            roll is > 0 && session is > 0;

        private static List<short> CollectFilledSessions(params (short? Session, bool Filled)[] slots)
        {
            var list = new List<short>();
            foreach (var (session, filled) in slots)
            {
                if (filled && session is > 0)
                    list.Add(session.Value);
            }
            return list;
        }

        private static bool HasAnyDifference(IReadOnlyList<short> sessions)
        {
            if (sessions.Count < 2) return false;
            var first = sessions[0];
            return sessions.Any(s => s != first);
        }

        private static int CountDifferences(IReadOnlyList<short> sessions)
        {
            if (sessions.Count < 2) return 0;
            var first = sessions[0];
            return sessions.Count(s => s != first);
        }
    }
}
