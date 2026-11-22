using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class DistrictUnicodeMigrationService
    {
        private readonly MrsexamContext _db;

        public DistrictUnicodeMigrationService(MrsexamContext db) => _db = db;

        public async Task<DistrictUnicodeConvertPreviewResponse> PreviewAsync(CancellationToken cancellationToken)
        {
            var districts = await _db.Districts.AsNoTracking()
                .OrderBy(d => d.DistrictName)
                .ToListAsync(cancellationToken);

            var centreCounts = await _db.Centres.AsNoTracking()
                .Where(c => c.DistrictName != null && c.DistrictName != "")
                .GroupBy(c => c.DistrictName!)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Name, x => x.Count, cancellationToken);

            var formCounts = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.DistrictName != null && f.DistrictName != "")
                .GroupBy(f => f.DistrictName!)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Name, x => x.Count, cancellationToken);

            var existingNames = districts
                .Select(d => d.DistrictName)
                .ToHashSet(StringComparer.Ordinal);

            var items = new List<DistrictUnicodeConvertPreviewItem>(districts.Count);
            var targetNameOwners = new Dictionary<string, string>(StringComparer.Ordinal);

            foreach (var district in districts)
            {
                var convertedName = NormalizeConverted(DvTtAakashConverter.Convert(district.DistrictName), district.DistrictName);
                var convertedShort = ConvertOptional(district.ShortName);
                var convertedCity = ConvertOptional(district.DistrictCity);

                var willChange =
                    !string.Equals(district.DistrictName, convertedName, StringComparison.Ordinal)
                    || !string.Equals(district.ShortName, convertedShort, StringComparison.Ordinal)
                    || !string.Equals(district.DistrictCity, convertedCity, StringComparison.Ordinal);

                string? conflict = null;
                if (willChange
                    && !string.Equals(district.DistrictName, convertedName, StringComparison.Ordinal))
                {
                    if (existingNames.Contains(convertedName)
                        && !string.Equals(convertedName, district.DistrictName, StringComparison.Ordinal))
                    {
                        conflict = $"Converted name '{convertedName}' already exists as another district.";
                    }
                    else if (targetNameOwners.TryGetValue(convertedName, out var otherOriginal)
                             && !string.Equals(otherOriginal, district.DistrictName, StringComparison.Ordinal))
                    {
                        conflict = $"Converted name '{convertedName}' collides with conversion of '{otherOriginal}'.";
                    }
                    else
                    {
                        targetNameOwners[convertedName] = district.DistrictName;
                    }
                }

                centreCounts.TryGetValue(district.DistrictName, out var centreRefCount);
                formCounts.TryGetValue(district.DistrictName, out var formRefCount);

                items.Add(new DistrictUnicodeConvertPreviewItem
                {
                    OriginalDistrictName = district.DistrictName,
                    ConvertedDistrictName = convertedName,
                    OriginalShortName = district.ShortName,
                    ConvertedShortName = convertedShort,
                    OriginalDistrictCity = district.DistrictCity,
                    ConvertedDistrictCity = convertedCity,
                    RegionNo = district.RegionNo ?? 0,
                    SeatDistrictNo = district.SeatDistrictNo,
                    CentreRefCount = centreRefCount,
                    FormRefCount = formRefCount,
                    WillChange = willChange,
                    Conflict = conflict,
                });
            }

            return new DistrictUnicodeConvertPreviewResponse
            {
                TotalDistricts = items.Count,
                ConvertibleCount = items.Count(i => i.WillChange && i.Conflict is null),
                UnchangedCount = items.Count(i => !i.WillChange),
                ConflictCount = items.Count(i => i.Conflict is not null),
                Items = items,
            };
        }

        public async Task<DistrictUnicodeConvertApplyResponse> ApplyAsync(CancellationToken cancellationToken)
        {
            var preview = await PreviewAsync(cancellationToken);
            var toApply = preview.Items
                .Where(i => i.WillChange && i.Conflict is null)
                .ToList();

            var skipped = preview.Items
                .Where(i => i.Conflict is not null)
                .Select(i => $"{i.OriginalDistrictName}: {i.Conflict}")
                .ToList();

            var errors = new List<string>();
            var districtsUpdated = 0;
            var centresUpdated = 0;
            var formsUpdated = 0;

            var strategy = _db.Database.CreateExecutionStrategy();
            try
            {
                await strategy.ExecuteAsync(async () =>
                {
                    await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
                    foreach (var item in toApply)
                    {
                        var oldName = item.OriginalDistrictName;
                        var newName = item.ConvertedDistrictName;

                        if (!string.Equals(oldName, newName, StringComparison.Ordinal))
                        {
                            var existingNew = await _db.Districts
                                .AsNoTracking()
                                .AnyAsync(d => d.DistrictName == newName, cancellationToken);
                            if (existingNew)
                            {
                                errors.Add($"Skipped '{oldName}': target '{newName}' already exists.");
                                continue;
                            }

                            var tracked = await _db.Districts
                                .FirstOrDefaultAsync(d => d.DistrictName == oldName, cancellationToken);
                            if (tracked is null)
                            {
                                errors.Add($"Skipped '{oldName}': district not found.");
                                continue;
                            }

                            var replacement = new District
                            {
                                DistrictName = Truncate(newName, 50) ?? newName,
                                RegionNo = tracked.RegionNo,
                                DistrictCity = NullIfBlank(Truncate(item.ConvertedDistrictCity, 50)),
                                ShortName = NullIfBlank(Truncate(item.ConvertedShortName, 10)),
                                SeatDistrictNo = tracked.SeatDistrictNo,
                            };

                            _db.Districts.Add(replacement);
                            await _db.SaveChangesAsync(cancellationToken);

                            centresUpdated += await _db.Centres
                                .Where(c => c.DistrictName == oldName)
                                .ExecuteUpdateAsync(
                                    setters => setters.SetProperty(c => c.DistrictName, newName),
                                    cancellationToken);

                            formsUpdated += await _db.FormBalbodhinis
                                .Where(f => f.DistrictName == oldName)
                                .ExecuteUpdateAsync(
                                    setters => setters.SetProperty(f => f.DistrictName, newName),
                                    cancellationToken);

                            _db.Districts.Remove(tracked);
                            await _db.SaveChangesAsync(cancellationToken);
                            districtsUpdated++;
                        }
                        else
                        {
                            var tracked = await _db.Districts
                                .FirstOrDefaultAsync(d => d.DistrictName == oldName, cancellationToken);
                            if (tracked is null)
                            {
                                errors.Add($"Skipped '{oldName}': district not found.");
                                continue;
                            }

                            tracked.ShortName = NullIfBlank(Truncate(item.ConvertedShortName, 10));
                            tracked.DistrictCity = NullIfBlank(Truncate(item.ConvertedDistrictCity, 50));
                            await _db.SaveChangesAsync(cancellationToken);
                            districtsUpdated++;
                        }
                    }

                    await transaction.CommitAsync(cancellationToken);
                });
            }
            catch (Exception ex)
            {
                errors.Add(ex.InnerException?.Message ?? ex.Message);
            }

            return new DistrictUnicodeConvertApplyResponse
            {
                DistrictsUpdated = districtsUpdated,
                CentresUpdated = centresUpdated,
                FormsUpdated = formsUpdated,
                SkippedConflicts = skipped,
                Errors = errors,
            };
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
