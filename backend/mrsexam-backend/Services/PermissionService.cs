using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Middleware;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class PermissionService
    {
        private readonly MrsexamContext _db;
        private readonly IHttpContextAccessor _http;

        public PermissionService(MrsexamContext db, IHttpContextAccessor http)
        {
            _db = db;
            _http = http;
        }

        public string? GetCurrentUserId() => CurrentUserMiddleware.GetUserId(_http.HttpContext);

        public string RequireCurrentUserId()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(userId))
                throw new InvalidOperationException("User identity is required (send X-User-Id).");
            return userId;
        }

        public async Task<AuthClaimsDto> GetClaimsAsync(string userId, CancellationToken cancellationToken)
        {
            var normalized = NormalizeUserId(userId);
            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == normalized, cancellationToken);

            // Tolerate legacy mixed-case USERID rows.
            if (user is null)
            {
                user = await _db.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId != null && u.UserId.ToUpper() == normalized, cancellationToken);
            }

            if (user is null)
            {
                return new AuthClaimsDto
                {
                    Success = false,
                    Message = "User not found",
                    UserId = normalized,
                    Role = PermissionRoles.Operator,
                };
            }

            var storedUserId = (user.UserId ?? normalized).Trim();
            var role = DeriveRole(storedUserId, user.Role);
            var exams = await ResolveExamsAsync(storedUserId, role, cancellationToken);
            var centres = await ResolveCentresAsync(storedUserId, role, cancellationToken);
            var features = ResolveFeatures(role);
            var isSupervisor = role == PermissionRoles.Super;

            return new AuthClaimsDto
            {
                Success = true,
                Message = "OK",
                UserId = storedUserId,
                UserKey = user.UserKey,
                AccessToken = user.UserKey ?? storedUserId,
                IsSupervisor = isSupervisor,
                Role = role,
                Exams = exams,
                Centres = centres,
                Features = features,
            };
        }

        public async Task<AuthClaimsDto> GetClaimsForCurrentUserAsync(CancellationToken cancellationToken)
        {
            var userId = RequireCurrentUserId();
            return await GetClaimsAsync(userId, cancellationToken);
        }

        public static string DeriveRole(string userId, string? roleColumn)
        {
            var id = NormalizeUserId(userId);
            if (id == PermissionRoles.Super)
                return PermissionRoles.Super;

            var role = (roleColumn ?? string.Empty).Trim().ToUpperInvariant();
            return role switch
            {
                PermissionRoles.Super => PermissionRoles.Super,
                PermissionRoles.Centre => PermissionRoles.Centre,
                PermissionRoles.Operator => PermissionRoles.Operator,
                _ => PermissionRoles.Operator,
            };
        }

        public async Task<bool> HasExamAsync(string userId, string examCode, CancellationToken cancellationToken)
        {
            var claims = await GetClaimsAsync(userId, cancellationToken);
            return claims.Exams.Contains(examCode.Trim().ToLowerInvariant(), StringComparer.OrdinalIgnoreCase);
        }

        public async Task<bool> HasFeatureAsync(string userId, string feature, CancellationToken cancellationToken)
        {
            var claims = await GetClaimsAsync(userId, cancellationToken);
            return claims.Features.Contains(feature.Trim().ToLowerInvariant(), StringComparer.OrdinalIgnoreCase);
        }

        public async Task EnsureFeatureAsync(string feature, CancellationToken cancellationToken)
        {
            var userId = RequireCurrentUserId();
            if (!await HasFeatureAsync(userId, feature, cancellationToken))
                throw new InvalidOperationException($"Feature '{feature}' is not allowed for this user.");
        }

        public async Task EnsureSuperAsync(CancellationToken cancellationToken)
        {
            await EnsureFeatureAsync(PermissionFeatures.ResetLock, cancellationToken);
        }

        public async Task<bool> CanAccessCentreAsync(string userId, string? centreNo, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(centreNo))
                return false;

            var filter = await GetCentreFilterAsync(userId, cancellationToken);
            if (filter is null)
                return true;

            return filter.Contains(centreNo.Trim());
        }

        /// <summary>
        /// null = all centres; empty set = no centres; otherwise allowed centres.
        /// </summary>
        public async Task<HashSet<string>?> GetCentreFilterAsync(string? userId, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return null;

            var claims = await GetClaimsAsync(userId, cancellationToken);
            if (claims.Centres is null)
                return null;

            return new HashSet<string>(claims.Centres, StringComparer.OrdinalIgnoreCase);
        }

        public async Task EnsureFormCentreAllowedAsync(string? formCentre, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(userId))
                return; // keep legacy clients working until header is always sent

            await EnsureFormCentreAllowedAsync(userId, formCentre, cancellationToken);
        }

        public async Task EnsureFormCentreAllowedAsync(string userId, string? formCentre, CancellationToken cancellationToken)
        {
            var claims = await GetClaimsAsync(userId, cancellationToken);
            if (claims.Role != PermissionRoles.Centre)
                return;

            if (string.IsNullOrWhiteSpace(formCentre))
                throw new InvalidOperationException("Form centre is required for centre-limited users.");

            if (claims.Centres is null || claims.Centres.Count == 0)
                throw new InvalidOperationException("No centres are assigned to this user.");

            if (!claims.Centres.Contains(formCentre.Trim(), StringComparer.OrdinalIgnoreCase))
                throw new InvalidOperationException($"Centre '{formCentre.Trim()}' is not assigned to this user.");
        }

        public async Task EnsureBatchInsertAllowedAsync(CancellationToken cancellationToken)
        {
            await EnsureFeatureAsync(PermissionFeatures.BatchInsert, cancellationToken);
        }

        private async Task<IReadOnlyList<string>> ResolveExamsAsync(string userId, string role, CancellationToken cancellationToken)
        {
            if (role == PermissionRoles.Super)
                return ExamCodes.All;

            var rows = await _db.UserExams.AsNoTracking()
                .Where(x => x.UserId == userId || x.UserId.ToUpper() == NormalizeUserId(userId))
                .Select(x => x.ExamCode)
                .ToListAsync(cancellationToken);

            var assigned = rows
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim().ToLowerInvariant())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Where(code => ExamCodes.All.Contains(code, StringComparer.OrdinalIgnoreCase))
                .ToList();

            // Legacy OPERATOR with no USER_EXAM rows keeps access to all exams.
            // CENTRE users must be explicitly assigned exams.
            if (assigned.Count == 0 && role == PermissionRoles.Operator)
                return ExamCodes.All;

            return assigned;
        }

        private async Task<IReadOnlyList<string>?> ResolveCentresAsync(string userId, string role, CancellationToken cancellationToken)
        {
            if (role is PermissionRoles.Super or PermissionRoles.Operator)
                return null;

            var rows = await _db.UserCentres.AsNoTracking()
                .Where(x => x.UserId == userId || x.UserId.ToUpper() == NormalizeUserId(userId))
                .Select(x => x.CentreNo)
                .ToListAsync(cancellationToken);

            return rows
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private static IReadOnlyList<string> ResolveFeatures(string role) =>
            role switch
            {
                PermissionRoles.Super => PermissionFeatures.All,
                PermissionRoles.Centre => PermissionFeatures.CentreOnly,
                _ => PermissionFeatures.Operator,
            };

        private static string NormalizeUserId(string userId) =>
            (userId ?? string.Empty).Trim().ToUpperInvariant();
    }
}
