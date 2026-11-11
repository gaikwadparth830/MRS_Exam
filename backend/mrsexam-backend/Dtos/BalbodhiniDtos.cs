using System.ComponentModel.DataAnnotations;

namespace mrsexam_backend.Dtos
{
    public sealed class CandidateWriteRequest
    {
        [Required]
        [MaxLength(60)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[MmFf]$")]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string FormCentre { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ExamCentre { get; set; } = string.Empty;

        public string? UserId { get; set; }
    }

    public sealed class InsertBetweenRequest
    {
        [Required]
        public int PreviousSrNo { get; set; }

        [Required]
        public CandidateWriteRequest Candidate { get; set; } = new();
    }

    public sealed class BatchInsertDto
    {
        [Required]
        [MaxLength(50)]
        public string CentreCode { get; set; } = string.Empty;

        [Required]
        public int RegionNo { get; set; }

        [Required]
        public int StartRollNo { get; set; }

        [Required]
        public int EndRollNo { get; set; }

        public string? StartName { get; set; }

        public string? EndName { get; set; }

        public string? UserId { get; set; }
    }

    public sealed class CentreResolveDto
    {
        public string CentreNo { get; set; } = string.Empty;
        public string? CentreName { get; set; }
        public string? City { get; set; }
        public string? Display { get; set; }
        public string? DistrictName { get; set; }
        public int? RegionNo { get; set; }
        public string? RegionName { get; set; }
        public bool IsClosed { get; set; }
    }

    public sealed class CurrentSessionDto
    {
        public int SessionNo { get; set; }
        public string? Month { get; set; }
        public string? Defa { get; set; }
        public string? Backup { get; set; }
        public string? ResgenBalbodhini { get; set; }
        public bool IsLocked { get; set; }
        public bool IsBackup { get; set; }
        public DateTime? ResultDate { get; set; }
    }

    public sealed class LoginResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? UserId { get; set; }
        public string? UserKey { get; set; }
        public string? AccessToken { get; set; }
        public bool IsSupervisor { get; set; }
    }

    public class RollPreviewRequest
    {
        [Required]
        public int SeatRegionNo { get; set; }

        [Required]
        [MaxLength(50)]
        public string FormCentre { get; set; } = string.Empty;

        [Required]
        public int FirstRollNo { get; set; }

        [Required]
        public int LastRollNo { get; set; }
    }

    public sealed class RollCommitRequest : RollPreviewRequest
    {
        [Required]
        public bool Confirmed { get; set; }
    }

    public sealed class RollPreviewResponse
    {
        public int FormCount { get; set; }
        public int RollCount { get; set; }
        public string? LastCandidateName { get; set; }
        public IReadOnlyList<RollAssignmentRow> Assignments { get; set; } = Array.Empty<RollAssignmentRow>();
    }

    public sealed class RollAssignmentRow
    {
        public int SrNo { get; set; }
        public string? Name { get; set; }
        public int RollNo { get; set; }
    }

    public sealed class AurRollRequest
    {
        [Required]
        public int SeatRegionNo { get; set; }

        [Required]
        [MaxLength(50)]
        public string FormCentre { get; set; } = string.Empty;

        public bool Confirmed { get; set; }
    }

    public sealed class ClearRollRequest
    {
        [Required]
        [MaxLength(50)]
        public string FormCentre { get; set; } = string.Empty;

        [Required]
        public bool Confirmed { get; set; }
    }

    public sealed class NextCentreResponse
    {
        public string? FormCentre { get; set; }
        public string? CentreName { get; set; }
        public int? SuggestedFirstRollNo { get; set; }
    }

    public sealed class MarksUpdateRequest
    {
        [Required]
        public string Paper1 { get; set; } = string.Empty;

        public bool AcceptGrace { get; set; }
    }

    public sealed class MarksUpdateResponse
    {
        public int SrNo { get; set; }
        public string? Marks1 { get; set; }
        public short? TotMarks { get; set; }
        public bool GraceOffered { get; set; }
        public int? GraceAmount { get; set; }
        public string? Message { get; set; }
    }

    public sealed class GenerateResultRequest
    {
        [Required]
        public int RegionNo { get; set; }
    }

    public sealed class CorrectionLookupRequest
    {
        [Required]
        public int RegionNo { get; set; }

        [Required]
        public short RollNo { get; set; }
    }

    public sealed class CorrectionSaveRequest
    {
        [Required]
        public int RegionNo { get; set; }

        [Required]
        public short RollNo { get; set; }

        [Required]
        public string Paper1 { get; set; } = string.Empty;
    }
}
