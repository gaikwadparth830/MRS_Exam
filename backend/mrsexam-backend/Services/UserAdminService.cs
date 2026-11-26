using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class UserAdminService
    {
        private readonly MrsexamContext _db;

        public UserAdminService(MrsexamContext db)
        {
            _db = db;
        }

        public async Task<IReadOnlyList<UserAdminListItemDto>> ListAsync(CancellationToken cancellationToken)
        {
            var users = await _db.Users.AsNoTracking().ToListAsync(cancellationToken);
            var exams = await _db.UserExams.AsNoTracking().ToListAsync(cancellationToken);
            var centres = await _db.UserCentres.AsNoTracking().ToListAsync(cancellationToken);

            var preferred = users
                .Where(u => !string.IsNullOrWhiteSpace(u.UserId))
                .GroupBy(u => NormalizeUserId(u.UserId), StringComparer.Ordinal)
                .Select(g => PreferUppercaseRow(g))
                .OrderBy(u => NormalizeUserId(u.UserId), StringComparer.Ordinal)
                .ToList();

            var examByUser = exams
                .Where(x => !string.IsNullOrWhiteSpace(x.UserId) && !string.IsNullOrWhiteSpace(x.ExamCode))
                .GroupBy(x => NormalizeUserId(x.UserId), StringComparer.Ordinal)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.ExamCode.Trim().ToLowerInvariant())
                        .Where(code => ExamCodes.All.Contains(code, StringComparer.OrdinalIgnoreCase))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .OrderBy(code => code, StringComparer.Ordinal)
                        .ToList(),
                    StringComparer.Ordinal);

            var centreByUser = centres
                .Where(x => !string.IsNullOrWhiteSpace(x.UserId) && !string.IsNullOrWhiteSpace(x.CentreNo))
                .GroupBy(x => NormalizeUserId(x.UserId), StringComparer.Ordinal)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.CentreNo.Trim())
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .OrderBy(code => code, StringComparer.OrdinalIgnoreCase)
                        .ToList(),
                    StringComparer.Ordinal);

            return preferred.Select(user =>
            {
                var id = NormalizeUserId(user.UserId);
                var role = PermissionService.DeriveRole(id, user.Role);
                examByUser.TryGetValue(id, out var userExams);
                centreByUser.TryGetValue(id, out var userCentres);

                return new UserAdminListItemDto
                {
                    UserId = id,
                    UserKey = user.UserKey,
                    Role = role,
                    Exams = role == PermissionRoles.Super
                        ? new List<string>()
                        : (userExams ?? new List<string>()),
                    Centres = role == PermissionRoles.Centre
                        ? (userCentres ?? new List<string>())
                        : new List<string>(),
                };
            }).ToList();
        }

        public async Task<UserAdminDetailDto?> GetAsync(string userId, CancellationToken cancellationToken)
        {
            var normalized = NormalizeUserId(userId);
            if (string.IsNullOrWhiteSpace(normalized))
                return null;

            var list = await ListAsync(cancellationToken);
            var match = list.FirstOrDefault(u =>
                string.Equals(u.UserId, normalized, StringComparison.OrdinalIgnoreCase));
            if (match is null)
                return null;

            return new UserAdminDetailDto
            {
                UserId = match.UserId,
                UserKey = match.UserKey,
                Role = match.Role,
                Exams = match.Exams,
                Centres = match.Centres,
            };
        }

        public async Task<UserAdminDetailDto> CreateAsync(UserAdminUpsertRequest request, CancellationToken cancellationToken)
        {
            var normalized = NormalizeAndValidateUserId(request.UserId);
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new InvalidOperationException("Password is required when creating a user.");

            var password = request.Password.Trim();
            if (password.Length > 10)
                throw new InvalidOperationException("Password must be at most 10 characters.");

            var role = NormalizeRole(request.Role);
            var (exams, centres) = await ValidateAssignmentsAsync(role, request.Exams, request.Centres, cancellationToken);

            var exists = await _db.Users.AnyAsync(
                u => u.UserId != null && u.UserId.ToUpper() == normalized,
                cancellationToken);
            if (exists)
                throw new InvalidOperationException($"User '{normalized}' already exists.");

            var userKey = NormalizeUserKey(request.UserKey);

            var strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

                _db.Users.Add(new User
                {
                    UserId = normalized,
                    Password = password,
                    UserKey = userKey,
                    Role = role,
                });

                await ReplaceAssignmentsAsync(normalized, role, exams, centres, cancellationToken);
                await _db.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);
            });

            return (await GetAsync(normalized, cancellationToken))!;
        }

        public async Task<UserAdminDetailDto> UpdateAsync(
            string userId,
            UserAdminUpsertRequest request,
            CancellationToken cancellationToken)
        {
            var routeId = NormalizeAndValidateUserId(userId);
            var bodyId = NormalizeAndValidateUserId(request.UserId);
            if (!string.Equals(routeId, bodyId, StringComparison.Ordinal))
                throw new InvalidOperationException("UserId in the URL and body must match.");

            var role = NormalizeRole(request.Role);
            var (exams, centres) = await ValidateAssignmentsAsync(role, request.Exams, request.Centres, cancellationToken);
            var userKey = NormalizeUserKey(request.UserKey);

            var strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

                var rows = await _db.Users
                    .Where(u => u.UserId != null && u.UserId.ToUpper() == routeId)
                    .ToListAsync(cancellationToken);
                if (rows.Count == 0)
                    throw new InvalidOperationException($"User '{routeId}' was not found.");

                var preferred = PreferUppercaseRow(rows);
                var password = preferred.Password;
                if (!string.IsNullOrWhiteSpace(request.Password))
                {
                    password = request.Password.Trim();
                    if (password!.Length > 10)
                        throw new InvalidOperationException("Password must be at most 10 characters.");
                }

                // Normalize USERID to uppercase; recreate when the stored key differs.
                if (string.Equals(preferred.UserId, routeId, StringComparison.Ordinal) && rows.Count == 1)
                {
                    preferred.Role = role;
                    preferred.UserKey = userKey;
                    preferred.Password = password;
                }
                else
                {
                    _db.Users.RemoveRange(rows);
                    await _db.SaveChangesAsync(cancellationToken);
                    _db.Users.Add(new User
                    {
                        UserId = routeId,
                        Password = password,
                        UserKey = userKey,
                        Role = role,
                    });
                }

                await ReplaceAssignmentsAsync(routeId, role, exams, centres, cancellationToken);
                await _db.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);
            });

            return (await GetAsync(routeId, cancellationToken))!;
        }

        public async Task DeleteAsync(string userId, string? currentUserId, CancellationToken cancellationToken)
        {
            var normalized = NormalizeAndValidateUserId(userId);
            var current = NormalizeUserId(currentUserId ?? string.Empty);

            if (!string.IsNullOrWhiteSpace(current)
                && string.Equals(normalized, current, StringComparison.Ordinal))
            {
                throw new InvalidOperationException("You cannot delete your own user account.");
            }

            var strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);

                var rows = await _db.Users
                    .Where(u => u.UserId != null && u.UserId.ToUpper() == normalized)
                    .ToListAsync(cancellationToken);
                if (rows.Count == 0)
                    throw new InvalidOperationException($"User '{normalized}' was not found.");

                var role = PermissionService.DeriveRole(normalized, PreferUppercaseRow(rows).Role);
                if (role == PermissionRoles.Super)
                {
                    var superCount = await CountSuperUsersAsync(cancellationToken);
                    if (superCount <= 1)
                        throw new InvalidOperationException("Cannot delete the last SUPER user.");
                }

                await ClearAssignmentsAsync(normalized, cancellationToken);
                _db.Users.RemoveRange(rows);
                await _db.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);
            });
        }

        private async Task<(List<string> Exams, List<string> Centres)> ValidateAssignmentsAsync(
            string role,
            IEnumerable<string>? exams,
            IEnumerable<string>? centres,
            CancellationToken cancellationToken)
        {
            var examList = (exams ?? Array.Empty<string>())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim().ToLowerInvariant())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var centreList = (centres ?? Array.Empty<string>())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var exam in examList)
            {
                if (!ExamCodes.All.Contains(exam, StringComparer.OrdinalIgnoreCase))
                    throw new InvalidOperationException($"Unknown exam code '{exam}'.");
            }

            if (centreList.Count > 0)
            {
                var allCentreNos = await _db.Centres.AsNoTracking()
                    .Select(c => c.CentreNo)
                    .ToListAsync(cancellationToken);
                var existingSet = new HashSet<string>(
                    allCentreNos.Where(c => !string.IsNullOrWhiteSpace(c)).Select(c => c.Trim()),
                    StringComparer.OrdinalIgnoreCase);

                var missing = centreList.Where(c => !existingSet.Contains(c)).ToList();
                if (missing.Count > 0)
                    throw new InvalidOperationException($"Unknown centre(s): {string.Join(", ", missing)}.");

                // Persist the centre codes as stored in CENTRES.
                centreList = centreList
                    .Select(c => allCentreNos.First(existing =>
                        string.Equals(existing?.Trim(), c, StringComparison.OrdinalIgnoreCase))!.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }

            return role switch
            {
                PermissionRoles.Super => (new List<string>(), new List<string>()),
                PermissionRoles.Operator => (examList, new List<string>()),
                PermissionRoles.Centre =>
                    examList.Count == 0 || centreList.Count == 0
                        ? throw new InvalidOperationException("CENTRE users require at least one exam and one centre.")
                        : (examList, centreList),
                _ => throw new InvalidOperationException($"Unsupported role '{role}'."),
            };
        }

        private async Task ReplaceAssignmentsAsync(
            string userId,
            string role,
            List<string> exams,
            List<string> centres,
            CancellationToken cancellationToken)
        {
            await ClearAssignmentsAsync(userId, cancellationToken);

            if (role == PermissionRoles.Super)
                return;

            foreach (var exam in exams)
            {
                _db.UserExams.Add(new UserExam
                {
                    UserId = userId,
                    ExamCode = exam,
                });
            }

            if (role != PermissionRoles.Centre)
                return;

            foreach (var centre in centres)
            {
                _db.UserCentres.Add(new UserCentre
                {
                    UserId = userId,
                    CentreNo = centre,
                });
            }
        }

        private async Task ClearAssignmentsAsync(string userId, CancellationToken cancellationToken)
        {
            var examRows = await _db.UserExams
                .Where(x => x.UserId.ToUpper() == userId)
                .ToListAsync(cancellationToken);
            if (examRows.Count > 0)
                _db.UserExams.RemoveRange(examRows);

            var centreRows = await _db.UserCentres
                .Where(x => x.UserId.ToUpper() == userId)
                .ToListAsync(cancellationToken);
            if (centreRows.Count > 0)
                _db.UserCentres.RemoveRange(centreRows);
        }

        private async Task<int> CountSuperUsersAsync(CancellationToken cancellationToken)
        {
            var users = await _db.Users.AsNoTracking().ToListAsync(cancellationToken);
            return users
                .Where(u => !string.IsNullOrWhiteSpace(u.UserId))
                .GroupBy(u => NormalizeUserId(u.UserId), StringComparer.Ordinal)
                .Select(g => PreferUppercaseRow(g))
                .Count(u => PermissionService.DeriveRole(NormalizeUserId(u.UserId), u.Role) == PermissionRoles.Super);
        }

        private static User PreferUppercaseRow(IEnumerable<User> rows)
        {
            var list = rows.ToList();
            return list.FirstOrDefault(u => string.Equals(u.UserId, NormalizeUserId(u.UserId), StringComparison.Ordinal))
                ?? list[0];
        }

        private static string NormalizeRole(string? role)
        {
            var normalized = (role ?? string.Empty).Trim().ToUpperInvariant();
            return normalized switch
            {
                PermissionRoles.Super => PermissionRoles.Super,
                PermissionRoles.Operator => PermissionRoles.Operator,
                PermissionRoles.Centre => PermissionRoles.Centre,
                _ => throw new InvalidOperationException("Role must be SUPER, OPERATOR, or CENTRE."),
            };
        }

        private static string? NormalizeUserKey(string? userKey)
        {
            if (string.IsNullOrWhiteSpace(userKey))
                return null;

            var trimmed = userKey.Trim();
            if (trimmed.Length > 5)
                throw new InvalidOperationException("User key must be at most 5 characters.");
            return trimmed;
        }

        private static string NormalizeAndValidateUserId(string? userId)
        {
            var normalized = NormalizeUserId(userId ?? string.Empty);
            if (string.IsNullOrWhiteSpace(normalized))
                throw new InvalidOperationException("UserId is required.");
            if (normalized.Length > 10)
                throw new InvalidOperationException("UserId must be at most 10 characters.");
            return normalized;
        }

        private static string NormalizeUserId(string userId) =>
            (userId ?? string.Empty).Trim().ToUpperInvariant();
    }
}
