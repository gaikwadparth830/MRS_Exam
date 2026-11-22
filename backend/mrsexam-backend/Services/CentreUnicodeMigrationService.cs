using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class CentreUnicodeMigrationService
    {
        private const int CentreNoMaxLength = 20;
        private readonly MrsexamContext _db;

        public CentreUnicodeMigrationService(MrsexamContext db) => _db = db;

        public async Task<CentreUnicodeConvertPreviewResponse> PreviewAsync(CancellationToken cancellationToken)
        {
            var centres = await _db.Centres.AsNoTracking()
                .OrderBy(c => c.CentreNo)
                .ToListAsync(cancellationToken);

            var formRefCounts = await CountFormRefsByCentreAsync(cancellationToken);
            var existingNos = centres.Select(c => c.CentreNo).ToHashSet(StringComparer.Ordinal);
            var targetOwners = new Dictionary<string, string>(StringComparer.Ordinal);

            var items = new List<CentreUnicodeConvertPreviewItem>(centres.Count);
            foreach (var centre in centres)
            {
                var convertedNo = NormalizeConverted(DvTtAakashConverter.Convert(centre.CentreNo), centre.CentreNo);
                var convertedName = ConvertOptional(centre.CentreName);
                var convertedAddressTo = ConvertOptional(centre.AddressTo);
                var convertedAdd1 = ConvertOptional(centre.Add1);
                var convertedAdd2 = ConvertOptional(centre.Add2);
                var convertedCity = ConvertOptional(centre.City);
                var convertedDistrict = ConvertOptional(centre.DistrictName);

                var centreNoChanges = !string.Equals(centre.CentreNo, convertedNo, StringComparison.Ordinal);
                var willChange = centreNoChanges
                    || !string.Equals(centre.CentreName, convertedName, StringComparison.Ordinal)
                    || !string.Equals(centre.AddressTo, convertedAddressTo, StringComparison.Ordinal)
                    || !string.Equals(centre.Add1, convertedAdd1, StringComparison.Ordinal)
                    || !string.Equals(centre.Add2, convertedAdd2, StringComparison.Ordinal)
                    || !string.Equals(centre.City, convertedCity, StringComparison.Ordinal)
                    || !string.Equals(centre.DistrictName, convertedDistrict, StringComparison.Ordinal);

                string? conflict = null;
                if (centreNoChanges)
                {
                    if (convertedNo.Length > CentreNoMaxLength)
                    {
                        conflict = $"Converted Centre No '{convertedNo}' exceeds {CentreNoMaxLength} characters.";
                    }
                    else if (existingNos.Contains(convertedNo)
                             && !string.Equals(convertedNo, centre.CentreNo, StringComparison.Ordinal))
                    {
                        conflict = $"Converted Centre No '{convertedNo}' already exists.";
                    }
                    else if (targetOwners.TryGetValue(convertedNo, out var other)
                             && !string.Equals(other, centre.CentreNo, StringComparison.Ordinal))
                    {
                        conflict = $"Converted Centre No '{convertedNo}' collides with '{other}'.";
                    }
                    else
                    {
                        targetOwners[convertedNo] = centre.CentreNo;
                    }
                }

                formRefCounts.TryGetValue(centre.CentreNo, out var formRefs);

                items.Add(new CentreUnicodeConvertPreviewItem
                {
                    OriginalCentreNo = centre.CentreNo,
                    ConvertedCentreNo = convertedNo,
                    OriginalCentreName = centre.CentreName,
                    ConvertedCentreName = convertedName,
                    OriginalAddressTo = centre.AddressTo,
                    ConvertedAddressTo = convertedAddressTo,
                    OriginalAdd1 = centre.Add1,
                    ConvertedAdd1 = convertedAdd1,
                    OriginalAdd2 = centre.Add2,
                    ConvertedAdd2 = convertedAdd2,
                    OriginalCity = centre.City,
                    ConvertedCity = convertedCity,
                    OriginalDistrictName = centre.DistrictName,
                    ConvertedDistrictName = convertedDistrict,
                    FormRefCount = formRefs,
                    WillChange = willChange,
                    CentreNoChanges = centreNoChanges,
                    Conflict = conflict,
                });
            }

            return new CentreUnicodeConvertPreviewResponse
            {
                TotalCentres = items.Count,
                ConvertibleCount = items.Count(i => i.WillChange && i.Conflict is null),
                UnchangedCount = items.Count(i => !i.WillChange),
                ConflictCount = items.Count(i => i.Conflict is not null),
                Items = items,
            };
        }

        public async Task<CentreUnicodeConvertApplyResponse> ApplyAsync(CancellationToken cancellationToken)
        {
            var preview = await PreviewAsync(cancellationToken);
            var toApply = preview.Items.Where(i => i.WillChange && i.Conflict is null).ToList();
            var skipped = preview.Items
                .Where(i => i.Conflict is not null)
                .Select(i => $"{i.OriginalCentreNo}: {i.Conflict}")
                .ToList();

            var errors = new List<string>();
            var centresUpdated = 0;
            var centreNosRenamed = 0;
            var formRefsUpdated = 0;

            var strategy = _db.Database.CreateExecutionStrategy();
            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    await EnsureCentreNoCapacityAsync(cancellationToken);

                    await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
                    foreach (var item in toApply)
                    {
                        var oldNo = item.OriginalCentreNo;
                        var newNo = Truncate(item.ConvertedCentreNo, CentreNoMaxLength) ?? item.ConvertedCentreNo;

                        if (item.CentreNoChanges)
                        {
                            var exists = await _db.Centres.AsNoTracking()
                                .AnyAsync(c => c.CentreNo == newNo, cancellationToken);
                            if (exists)
                            {
                                errors.Add($"Skipped '{oldNo}': target '{newNo}' already exists.");
                                continue;
                            }

                            var tracked = await _db.Centres
                                .FirstOrDefaultAsync(c => c.CentreNo == oldNo, cancellationToken);
                            if (tracked is null)
                            {
                                errors.Add($"Skipped '{oldNo}': centre not found.");
                                continue;
                            }

                            var replacement = CloneConverted(tracked, item, newNo);
                            _db.Centres.Add(replacement);
                            await _db.SaveChangesAsync(cancellationToken);

                            formRefsUpdated += await UpdateCentreRefsAsync(oldNo, newNo, cancellationToken);

                            _db.Centres.Remove(tracked);
                            await _db.SaveChangesAsync(cancellationToken);
                            centresUpdated++;
                            centreNosRenamed++;
                        }
                        else
                        {
                            var tracked = await _db.Centres
                                .FirstOrDefaultAsync(c => c.CentreNo == oldNo, cancellationToken);
                            if (tracked is null)
                            {
                                errors.Add($"Skipped '{oldNo}': centre not found.");
                                continue;
                            }

                            ApplyTextFields(tracked, item);
                            await _db.SaveChangesAsync(cancellationToken);
                            centresUpdated++;
                        }
                    }

                    await transaction.CommitAsync(cancellationToken);
                });
            }
            catch (Exception ex)
            {
                errors.Add(ex.InnerException?.Message ?? ex.Message);
            }

            return new CentreUnicodeConvertApplyResponse
            {
                CentresUpdated = centresUpdated,
                CentreNosRenamed = centreNosRenamed,
                FormRefsUpdated = formRefsUpdated,
                SkippedConflicts = skipped,
                Errors = errors,
            };
        }

        private async Task EnsureCentreNoCapacityAsync(CancellationToken cancellationToken)
        {
            // Unicode district prefixes often exceed the legacy 10-char CENTRE_NO width.
            await _db.Database.ExecuteSqlRawAsync(
                """
                IF COL_LENGTH('CENTRE', 'CENTRE_NO') IS NOT NULL
                BEGIN
                  DECLARE @len int = (
                    SELECT CHARACTER_MAXIMUM_LENGTH
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'CENTRE' AND COLUMN_NAME = 'CENTRE_NO'
                  );
                  IF @len IS NOT NULL AND @len > 0 AND @len < 20
                    ALTER TABLE CENTRE ALTER COLUMN CENTRE_NO nvarchar(20) NOT NULL;
                END
                """,
                cancellationToken);

            await _db.Database.ExecuteSqlRawAsync(
                """
                IF COL_LENGTH('FORM_PANDIT', 'FORM_CENTRE') IS NOT NULL
                BEGIN
                  DECLARE @len int = (
                    SELECT CHARACTER_MAXIMUM_LENGTH
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = 'FORM_PANDIT' AND COLUMN_NAME = 'FORM_CENTRE'
                  );
                  IF @len IS NOT NULL AND @len > 0 AND @len < 20
                  BEGIN
                    ALTER TABLE FORM_PANDIT ALTER COLUMN FORM_CENTRE nvarchar(20) NULL;
                    ALTER TABLE FORM_PANDIT ALTER COLUMN EXAM_CENTRE nvarchar(20) NULL;
                  END
                END
                """,
                cancellationToken);
        }

        private async Task<Dictionary<string, int>> CountFormRefsByCentreAsync(CancellationToken cancellationToken)
        {
            var counts = new Dictionary<string, int>(StringComparer.Ordinal);

            void Add(string? key)
            {
                if (string.IsNullOrWhiteSpace(key)) return;
                counts[key] = counts.TryGetValue(key, out var n) ? n + 1 : 1;
            }

            var balbodhini = await _db.FormBalbodhinis.AsNoTracking()
                .Select(f => new { f.FormCentre, f.ExamCentre })
                .ToListAsync(cancellationToken);
            foreach (var row in balbodhini)
            {
                Add(row.FormCentre);
                Add(row.ExamCentre);
            }

            var prathamik = await _db.FormPrathamiks.AsNoTracking()
                .Select(f => new { f.FormCentre, f.ExamCentre })
                .ToListAsync(cancellationToken);
            foreach (var row in prathamik)
            {
                Add(row.FormCentre);
                Add(row.ExamCentre);
            }

            return counts;
        }

        private async Task<int> UpdateCentreRefsAsync(string oldNo, string newNo, CancellationToken cancellationToken)
        {
            var updated = 0;
            updated += await _db.FormBalbodhinis.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormBalbodhinis.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.FormPrathamiks.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormPrathamiks.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.FormPandits.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormPandits.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.FormPrabodhs.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormPrabodhs.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.FormPraveshikas.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormPraveshikas.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.FormPraveens.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormPraveens.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.FormSubodhs.Where(f => f.FormCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.FormCentre, newNo), cancellationToken);
            updated += await _db.FormSubodhs.Where(f => f.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.ExamCentre, newNo), cancellationToken);
            updated += await _db.AttSheets.Where(a => a.ExamCentre == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.ExamCentre, newNo), cancellationToken);
            updated += await _db.CentreCounts.Where(c => c.CentreNo == oldNo)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.CentreNo, newNo), cancellationToken);
            return updated;
        }

        private static Center CloneConverted(Center source, CentreUnicodeConvertPreviewItem item, string newNo)
        {
            return new Center
            {
                CentreNo = newNo,
                AddressTo = NullIfBlank(Truncate(item.ConvertedAddressTo, 50)),
                CentreName = NullIfBlank(Truncate(item.ConvertedCentreName, 100)),
                DistrictName = NullIfBlank(Truncate(item.ConvertedDistrictName, 50)),
                Add1 = NullIfBlank(Truncate(item.ConvertedAdd1, 50)),
                Add2 = NullIfBlank(Truncate(item.ConvertedAdd2, 50)),
                City = NullIfBlank(Truncate(item.ConvertedCity, 35)),
                Pincode = source.Pincode,
                Phone = source.Phone,
                PanditFlag = source.PanditFlag,
                CloseFlag = source.CloseFlag,
            };
        }

        private static void ApplyTextFields(Center tracked, CentreUnicodeConvertPreviewItem item)
        {
            tracked.AddressTo = NullIfBlank(Truncate(item.ConvertedAddressTo, 50));
            tracked.CentreName = NullIfBlank(Truncate(item.ConvertedCentreName, 100));
            tracked.DistrictName = NullIfBlank(Truncate(item.ConvertedDistrictName, 50));
            tracked.Add1 = NullIfBlank(Truncate(item.ConvertedAdd1, 50));
            tracked.Add2 = NullIfBlank(Truncate(item.ConvertedAdd2, 50));
            tracked.City = NullIfBlank(Truncate(item.ConvertedCity, 35));
        }

        private static string? ConvertOptional(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return NormalizeConverted(DvTtAakashConverter.Convert(value), value.Trim());
        }

        private static string NormalizeConverted(string converted, string fallback)
        {
            var trimmed = (converted ?? string.Empty).Trim();
            return string.IsNullOrEmpty(trimmed) ? fallback.Trim() : trimmed;
        }

        private static string? Truncate(string? value, int maxLength)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            return value.Length <= maxLength ? value : value[..maxLength];
        }

        private static string? NullIfBlank(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrEmpty(trimmed) ? null : trimmed;
        }
    }
}
