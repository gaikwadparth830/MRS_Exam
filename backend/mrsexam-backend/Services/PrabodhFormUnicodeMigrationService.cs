using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    /// <summary>
    /// Converts FORM_PRABODH DV-TTAakash Marathi fields (NAME, FORM_CENTRE, EXAM_CENTRE) to Unicode.
    /// </summary>
    public sealed class PrabodhFormUnicodeMigrationService
    {
        private const int NameMaxLength = 60;
        private const int CentreMaxLength = 50;
        private const int PreviewSampleLimit = 100;
        private const int ApplyBatchSize = 500;

        private readonly MrsexamContext _db;

        public PrabodhFormUnicodeMigrationService(MrsexamContext db) => _db = db;

        public async Task<PrabodhFormUnicodeConvertPreviewResponse> PreviewAsync(CancellationToken cancellationToken)
        {
            var rows = await _db.FormPrabodhs.AsNoTracking()
                .Select(f => new { f.SrNo, f.RollNo, f.SessionNo, f.Name, f.FormCentre, f.ExamCentre })
                .OrderBy(f => f.SrNo)
                .ToListAsync(cancellationToken);

            var convertible = 0;
            var unchanged = 0;
            var conflicts = 0;
            var samples = new List<PrabodhFormUnicodeConvertPreviewItem>(PreviewSampleLimit);

            foreach (var row in rows)
            {
                var item = BuildItem(row.SrNo, row.RollNo, row.SessionNo, row.Name, row.FormCentre, row.ExamCentre);
                if (item.Conflict is not null) conflicts++;
                else if (item.WillChange) convertible++;
                else unchanged++;

                if ((item.WillChange || item.Conflict is not null) && samples.Count < PreviewSampleLimit)
                    samples.Add(item);
            }

            return new PrabodhFormUnicodeConvertPreviewResponse
            {
                TotalRows = rows.Count,
                ConvertibleCount = convertible,
                UnchangedCount = unchanged,
                ConflictCount = conflicts,
                SampleLimit = PreviewSampleLimit,
                Items = samples,
            };
        }

        public async Task<PrabodhFormUnicodeConvertApplyResponse> ApplyAsync(CancellationToken cancellationToken)
        {
            var errors = new List<string>();
            var rowsUpdated = 0;
            var namesUpdated = 0;
            var formCentresUpdated = 0;
            var examCentresUpdated = 0;

            try
            {
                var keys = await _db.FormPrabodhs.AsNoTracking()
                    .Select(f => new { f.SrNo, f.Name, f.FormCentre, f.ExamCentre })
                    .OrderBy(f => f.SrNo)
                    .ToListAsync(cancellationToken);

                var toUpdate = new List<(int SrNo, string? Name, string? FormCentre, string? ExamCentre, bool NameChanged, bool FormChanged, bool ExamChanged)>();
                foreach (var row in keys)
                {
                    var item = BuildItem(row.SrNo, null, null, row.Name, row.FormCentre, row.ExamCentre);
                    if (!item.WillChange) continue;

                    var nameChanged = !string.Equals(row.Name, item.ConvertedName, StringComparison.Ordinal);
                    var formChanged = !string.Equals(row.FormCentre, item.ConvertedFormCentre, StringComparison.Ordinal);
                    var examChanged = !string.Equals(row.ExamCentre, item.ConvertedExamCentre, StringComparison.Ordinal);
                    toUpdate.Add((row.SrNo, item.ConvertedName, item.ConvertedFormCentre, item.ConvertedExamCentre, nameChanged, formChanged, examChanged));
                }

                for (var offset = 0; offset < toUpdate.Count; offset += ApplyBatchSize)
                {
                    var batch = toUpdate.Skip(offset).Take(ApplyBatchSize).ToList();
                    var srNos = batch.Select(b => b.SrNo).ToList();
                    var tracked = await _db.FormPrabodhs
                        .Where(f => srNos.Contains(f.SrNo))
                        .ToListAsync(cancellationToken);

                    var bySr = tracked.ToDictionary(f => f.SrNo);
                    foreach (var plan in batch)
                    {
                        if (!bySr.TryGetValue(plan.SrNo, out var entity))
                        {
                            errors.Add($"Skipped SRNO {plan.SrNo}: row not found.");
                            continue;
                        }

                        if (plan.NameChanged)
                        {
                            entity.Name = plan.Name;
                            namesUpdated++;
                        }

                        if (plan.FormChanged)
                        {
                            entity.FormCentre = plan.FormCentre;
                            formCentresUpdated++;
                        }

                        if (plan.ExamChanged)
                        {
                            entity.ExamCentre = plan.ExamCentre;
                            examCentresUpdated++;
                        }

                        rowsUpdated++;
                    }

                    await _db.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                errors.Add(ex.InnerException?.Message ?? ex.Message);
            }

            return new PrabodhFormUnicodeConvertApplyResponse
            {
                RowsUpdated = rowsUpdated,
                NamesUpdated = namesUpdated,
                FormCentresUpdated = formCentresUpdated,
                ExamCentresUpdated = examCentresUpdated,
                SkippedConflicts = 0,
                Errors = errors,
            };
        }

        private static PrabodhFormUnicodeConvertPreviewItem BuildItem(
            int srNo,
            short? rollNo,
            short? sessionNo,
            string? name,
            string? formCentre,
            string? examCentre)
        {
            var convertedName = ConvertField(name, NameMaxLength);
            var convertedForm = ConvertField(formCentre, CentreMaxLength);
            var convertedExam = ConvertField(examCentre, CentreMaxLength);

            var willChange = !string.Equals(name, convertedName, StringComparison.Ordinal)
                || !string.Equals(formCentre, convertedForm, StringComparison.Ordinal)
                || !string.Equals(examCentre, convertedExam, StringComparison.Ordinal);

            return new PrabodhFormUnicodeConvertPreviewItem
            {
                SrNo = srNo,
                RollNo = rollNo,
                SessionNo = sessionNo,
                OriginalName = name,
                ConvertedName = convertedName,
                OriginalFormCentre = formCentre,
                ConvertedFormCentre = convertedForm,
                OriginalExamCentre = examCentre,
                ConvertedExamCentre = convertedExam,
                WillChange = willChange,
                Conflict = null,
            };
        }

        private static string? ConvertField(string? value, int maxLength)
        {
            if (string.IsNullOrWhiteSpace(value))
                return NullIfBlank(value);

            var trimmed = value.Trim();
            if (!LooksLikeDvTt(trimmed))
                return trimmed;

            var converted = NormalizeConverted(DvTtAakashConverter.Convert(trimmed), trimmed);
            if (converted.Length > maxLength)
                return Truncate(converted, maxLength);

            return converted;
        }

        /// <summary>
        /// Skip values that are already Devanagari Unicode (or plain ASCII codes without DV markers).
        /// </summary>
        private static bool LooksLikeDvTt(string value)
        {
            var hasDevanagari = false;
            var hasDvMarker = false;
            foreach (var ch in value)
            {
                if (ch >= '\u0900' && ch <= '\u097F')
                    hasDevanagari = true;
                else if (ch > 127)
                    hasDvMarker = true;
                else if (ch is '+' or '<' or '>' or '`' or '^' or '_' or '~' or '{' or '}' or '[' or ']' or '\\')
                    hasDvMarker = true;
            }

            if (hasDevanagari && !hasDvMarker)
                return false;

            return hasDvMarker;
        }

        private static string NormalizeConverted(string converted, string fallback)
        {
            var trimmed = (converted ?? string.Empty).Trim();
            return string.IsNullOrEmpty(trimmed) ? fallback.Trim() : trimmed;
        }

        private static string Truncate(string value, int maxLength)
            => value.Length <= maxLength ? value : value[..maxLength];

        private static string? NullIfBlank(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrEmpty(trimmed) ? null : trimmed;
        }
    }
}
