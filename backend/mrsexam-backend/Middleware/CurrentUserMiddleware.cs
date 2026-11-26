namespace mrsexam_backend.Middleware
{
    public sealed class CurrentUserMiddleware
    {
        public const string UserIdItemKey = "UserId";
        public const string UserIdHeader = "X-User-Id";

        private readonly RequestDelegate _next;

        public CurrentUserMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            var userId = ResolveUserId(context);
            if (!string.IsNullOrWhiteSpace(userId))
                context.Items[UserIdItemKey] = userId;

            await _next(context);
        }

        public static string? ResolveUserId(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue(UserIdHeader, out var headerValues))
            {
                var fromHeader = headerValues.FirstOrDefault()?.Trim();
                if (!string.IsNullOrWhiteSpace(fromHeader))
                    return fromHeader.ToUpperInvariant();
            }

            var auth = context.Request.Headers.Authorization.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(auth)
                && auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                var token = auth["Bearer ".Length..].Trim();
                // Legacy bearer may be UserKey or UserId; treat as UserId when it looks like one.
                if (!string.IsNullOrWhiteSpace(token) && token.Length <= 10 && !token.Contains(' '))
                    return token.ToUpperInvariant();
            }

            return null;
        }

        public static string? GetUserId(HttpContext? context)
        {
            if (context is null) return null;
            if (context.Items.TryGetValue(UserIdItemKey, out var value) && value is string s && !string.IsNullOrWhiteSpace(s))
                return s.Trim().ToUpperInvariant();
            return ResolveUserId(context);
        }
    }
}
