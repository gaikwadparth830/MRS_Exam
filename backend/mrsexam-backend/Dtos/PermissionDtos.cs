namespace mrsexam_backend.Dtos
{
    public static class PermissionRoles
    {
        public const string Super = "SUPER";
        public const string Operator = "OPERATOR";
        public const string Centre = "CENTRE";
    }

    public static class PermissionFeatures
    {
        public const string FormEntry = "form-entry";
        public const string Marks = "marks";
        public const string SetRolls = "set-rolls";
        public const string GenerateResult = "generate-result";
        public const string Reports = "reports";
        public const string Masters = "masters";
        public const string SelectSession = "select-session";
        public const string BatchInsert = "batch-insert";
        public const string ResetLock = "reset-lock";
        public const string CrossReference = "cross-reference";
        public const string CorrectMarks = "correct-marks";
        public const string UserAdmin = "user-admin";

        public static readonly string[] All =
        [
            FormEntry,
            Marks,
            SetRolls,
            GenerateResult,
            Reports,
            Masters,
            SelectSession,
            BatchInsert,
            ResetLock,
            CrossReference,
            CorrectMarks,
            UserAdmin,
        ];

        public static readonly string[] Operator =
        [
            FormEntry,
            Marks,
            SetRolls,
            GenerateResult,
            Reports,
            Masters,
            SelectSession,
            CrossReference,
        ];

        public static readonly string[] CentreOnly = [FormEntry];
    }

    public static class ExamCodes
    {
        public static readonly string[] All =
        [
            "balbodhini",
            "prathamik",
            "praveshika",
            "subodh",
            "prabodh",
            "praveen",
            "pandit",
            "sambhashan",
        ];
    }

    public sealed class AuthClaimsDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public string? UserKey { get; set; }
        public string? AccessToken { get; set; }
        public bool IsSupervisor { get; set; }
        public string Role { get; set; } = PermissionRoles.Operator;
        public IReadOnlyList<string> Exams { get; set; } = Array.Empty<string>();
        /// <summary>null = all centres; empty = none; otherwise allowed centre codes.</summary>
        public IReadOnlyList<string>? Centres { get; set; }
        public IReadOnlyList<string> Features { get; set; } = Array.Empty<string>();
    }

    public class UserAdminListItemDto
    {
        public string UserId { get; set; } = string.Empty;
        public string? UserKey { get; set; }
        public string Role { get; set; } = PermissionRoles.Operator;
        public List<string> Exams { get; set; } = new();
        public List<string> Centres { get; set; } = new();
    }

    public sealed class UserAdminDetailDto : UserAdminListItemDto
    {
    }

    public sealed class UserAdminUpsertRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string? UserKey { get; set; }
        public string Role { get; set; } = PermissionRoles.Operator;
        public List<string> Exams { get; set; } = new();
        public List<string> Centres { get; set; } = new();
    }
}
