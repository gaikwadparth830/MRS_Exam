using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Legacy Frm_Userwiselist_Totforms / Rpt_TotalForms — forms entered per user × exam for default session.
    /// </summary>
    public sealed class UserWiseFormsReportService
    {
        private static readonly string[] ExamOrder =
        [
            "PANDIT",
            "PRAVEEN",
            "PRABODH",
            "SUBODH",
            "PRAVESHIKA",
            "PRATHAMIK",
            "BALBODHINI",
            "SAMBHASHAN",
        ];

        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;

        public UserWiseFormsReportService(MrsexamContext db, SessionService sessions)
        {
            _db = db;
            _sessions = sessions;
        }

        public async Task<List<string>> ListUserIdsAsync(CancellationToken cancellationToken)
        {
            return await _db.Users.AsNoTracking()
                .Select(u => u.UserId)
                .OrderBy(id => id)
                .ToListAsync(cancellationToken);
        }

        public async Task<UserWiseFormsReportDto> GetReportAsync(
            string? userId,
            CancellationToken cancellationToken)
        {
            var session = await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");

            var sessionNo = (short)session.SessionNo;
            var filterUser = string.IsNullOrWhiteSpace(userId) ? null : userId.Trim();

            var counts = new Dictionary<(string UserId, string Exam), int>();

            await AccumulateAsync(counts, "PANDIT",
                _db.FormPandits.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "PRAVEEN",
                _db.FormPraveens.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "PRABODH",
                _db.FormPrabodhs.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "SUBODH",
                _db.FormSubodhs.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "PRAVESHIKA",
                _db.FormPraveshikas.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "PRATHAMIK",
                _db.FormPrathamiks.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "BALBODHINI",
                _db.FormBalbodhinis.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);
            await AccumulateAsync(counts, "SAMBHASHAN",
                _db.FormSambhashans.AsNoTracking()
                    .Where(f => f.SessionNo == sessionNo && f.UserId != null && f.UserId.Trim() != string.Empty)
                    .Select(f => f.UserId!),
                filterUser, cancellationToken);

            List<string> users;
            if (filterUser is not null)
            {
                users = [filterUser];
            }
            else
            {
                var masterUsers = await _db.Users.AsNoTracking()
                    .Select(u => u.UserId)
                    .ToListAsync(cancellationToken);
                users = masterUsers
                    .Select(u => u.Trim())
                    .Concat(counts.Keys.Select(k => k.UserId))
                    .Where(u => !string.IsNullOrWhiteSpace(u))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(id => id, StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }

            var rows = new List<UserWiseFormsRowDto>();
            foreach (var uid in users)
            {
                var uidKey = uid.Trim().ToUpperInvariant();
                foreach (var exam in ExamOrder)
                {
                    counts.TryGetValue((uidKey, exam), out var total);
                    rows.Add(new UserWiseFormsRowDto
                    {
                        UserId = uid.Trim(),
                        Exam = exam,
                        FormCount = total,
                    });
                }
            }

            var sessionText = session.SessionNo.ToString();
            var header = new ReportHeaderDto
            {
                SessionNo = session.SessionNo,
                Month = DvTtAakashConverter.NormalizeMonth(session.Month),
                Year = sessionText.Length >= 4 ? sessionText[..4] : sessionText,
                Title = "Userwise Total Number Of Forms",
                TitleMr = "यूजरनुसार फॉर्म संख्या",
                ExamName = null,
                RegionName = filterUser is null ? "All users" : filterUser,
                ResultDate = session.ResultDate,
                RowCount = rows.Count,
            };

            return new UserWiseFormsReportDto
            {
                Header = header,
                Rows = rows,
            };
        }

        private static async Task AccumulateAsync(
            Dictionary<(string UserId, string Exam), int> counts,
            string exam,
            IQueryable<string> userIdsQuery,
            string? filterUser,
            CancellationToken cancellationToken)
        {
            if (filterUser is not null)
            {
                var upper = filterUser.Trim().ToUpper();
                userIdsQuery = userIdsQuery.Where(u => u.ToUpper() == upper);
            }

            var grouped = await userIdsQuery
                .GroupBy(u => u.Trim())
                .Select(g => new { UserId = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            foreach (var row in grouped)
            {
                if (string.IsNullOrWhiteSpace(row.UserId)) continue;
                var key = (row.UserId.Trim().ToUpperInvariant(), exam);
                counts[key] = row.Count;
            }
        }
    }
}
