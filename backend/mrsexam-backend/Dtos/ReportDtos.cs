namespace mrsexam_backend.Dtos
{
    public sealed class ReportHeaderDto
    {
        public int SessionNo { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CentreNo { get; set; }
        public string? CentreName { get; set; }
        public string? RegionName { get; set; }
        public DateTime? ResultDate { get; set; }
        public int RowCount { get; set; }
    }

    public sealed class AttendanceReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public short? MaxRollNo { get; set; }
        public List<AttendancePairDto> Pairs { get; set; } = new();
    }

    public sealed class AttendancePairDto
    {
        public short? RollNo1 { get; set; }
        public short? RollNo2 { get; set; }
    }

    public sealed class NameListReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public List<NameListRowDto> Rows { get; set; } = new();
    }

    public sealed class NameListRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? ExamCentre { get; set; }
        public string? CentreName { get; set; }
        public string? DistrictName { get; set; }
    }

    public sealed class ResultSheetReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public string Mode { get; set; } = "named";
        public List<ResultSheetRowDto> Rows { get; set; } = new();
    }

    public sealed class ResultSheetRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? ExamCentre { get; set; }
        public string? Marks1 { get; set; }
        public short? TotMarks { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? SpecialRank { get; set; }
    }

    public sealed class CertificateReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public List<CertificateRowDto> Rows { get; set; } = new();
    }

    public sealed class CertificateRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? Gender { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? SpecialRank { get; set; }
        public string? ExamCentre { get; set; }
        public string? RegionName { get; set; }
    }

    public sealed class RegisterReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public int TotalCandidates { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public int AbsentCount { get; set; }
        public int StoppedCount { get; set; }
        public string PassPercent { get; set; } = "0.00";
        public List<RegisterRowDto> Rows { get; set; } = new();
    }

    public sealed class RegisterRowDto
    {
        public int? DummyCentreCode { get; set; }
        public string? ExamCentre { get; set; }
        public string? CentreName { get; set; }
        public int? RegionNo { get; set; }
        public string? RegionName { get; set; }
        public int CandidateCount { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public int AbsentCount { get; set; }
    }
}
