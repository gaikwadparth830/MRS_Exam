namespace mrsexam_backend.Dtos
{
    public sealed class ReportHeaderDto
    {
        public int SessionNo { get; set; }
        public string? Month { get; set; }
        public string? Year { get; set; }
        public string Title { get; set; } = string.Empty;
        /// <summary>Optional Marathi / Devanagari title for print header.</summary>
        public string? TitleMr { get; set; }
        public string? ExamName { get; set; }
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
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? CentreName { get; set; }
        public string? DistrictName { get; set; }
        public string? Gender { get; set; }
        public int? RegionNo { get; set; }
        public string? RegionName { get; set; }
        public string? KhandAppearing { get; set; }
        public string? FlgPortion { get; set; }
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
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? Marks1 { get; set; }
        public string? Marks2 { get; set; }
        public string? Marks3 { get; set; }
        public string? Marks4 { get; set; }
        public string? Marks5 { get; set; }
        public string? Marks6 { get; set; }
        public string? Marks7 { get; set; }
        public string? Marks8 { get; set; }
        public string? OralMarks { get; set; }
        public string? RegLang { get; set; }
        public short? TotMarks { get; set; }
        public int? Khand1TotMarks { get; set; }
        public int? Khand2TotMarks { get; set; }
        public string? KhandAppearing { get; set; }
        public string? FlgPortion { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? SpecialRank { get; set; }
    }

    public sealed class MarkSheetReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public string? Variant { get; set; }
        public List<MarkSheetRowDto> Rows { get; set; } = new();
    }

    public sealed class MarkSheetRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? Marks1 { get; set; }
        public string? Marks2 { get; set; }
        public string? Marks3 { get; set; }
        public string? Marks4 { get; set; }
        public string? Marks5 { get; set; }
        public string? Marks6 { get; set; }
        public string? Marks7 { get; set; }
        public string? Marks8 { get; set; }
        public string? OralMarks { get; set; }
        public string? RegLang { get; set; }
        public short? TotMarks { get; set; }
        public int? Khand1TotMarks { get; set; }
        public int? Khand2TotMarks { get; set; }
        public string? KhandAppearing { get; set; }
        public string? FlgPortion { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? SpecialRank { get; set; }
        public int? RegionNo { get; set; }
    }

    public sealed class HallTicketReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public List<HallTicketRowDto> Rows { get; set; } = new();
    }

    public sealed class HallTicketRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? Gender { get; set; }
        public short? SessionNo { get; set; }
        public string? Paper1Schedule { get; set; }
        public string? Paper2Schedule { get; set; }
        public string? Paper3Schedule { get; set; }
        public string? OralSchedule { get; set; }
    }

    public sealed class LostByTwoReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public int? Class3Marks { get; set; }
        public int? MinTotalKhand1 { get; set; }
        public int? MinTotalKhand2 { get; set; }
        public List<LostByTwoRowDto> Rows { get; set; } = new();
    }

    public sealed class LostByTwoRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? Marks1 { get; set; }
        public string? Marks2 { get; set; }
        public string? Marks3 { get; set; }
        public string? Marks4 { get; set; }
        public string? Marks5 { get; set; }
        public string? Marks6 { get; set; }
        public string? Marks7 { get; set; }
        public string? Marks8 { get; set; }
        public string? OralMarks { get; set; }
        public short? TotMarks { get; set; }
        public int? Khand1TotMarks { get; set; }
        public int? Khand2TotMarks { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? NearMissReason { get; set; }
    }

    public sealed class RanksReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public List<RankRowDto> Rows { get; set; } = new();
    }

    public sealed class RankRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public short? TotMarks { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? SpecialRank { get; set; }
        public int? RegionNo { get; set; }
        public string? RegionName { get; set; }
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
    }

    public sealed class PanditResultDetailsReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public List<PanditResultDetailsRowDto> Rows { get; set; } = new();
    }

    public sealed class PanditResultDetailsRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? KhandAppearing { get; set; }
        public string? FlgPortion { get; set; }
        public string? Marks1 { get; set; }
        public string? Marks2 { get; set; }
        public string? Marks3 { get; set; }
        public string? Marks4 { get; set; }
        public string? Marks5 { get; set; }
        public string? Marks6 { get; set; }
        public string? Marks7 { get; set; }
        public string? Marks8 { get; set; }
        public string? OralMarks { get; set; }
        public int? Khand1TotMarks { get; set; }
        public int? Khand2TotMarks { get; set; }
        public short? TotMarks { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? SpecialRank { get; set; }
        public string? ConcessionFlag { get; set; }
        public string? UndFlag { get; set; }
        public string? BothKhandFlag { get; set; }
    }

    public sealed class StudentsPassingReportDto
    {
        public ReportHeaderDto Header { get; set; } = new();
        public string PassingMode { get; set; } = "full";
        public List<StudentsPassingRowDto> Rows { get; set; } = new();
    }

    public sealed class StudentsPassingRowDto
    {
        public short? RollNo { get; set; }
        public string? Name { get; set; }
        public string? Result { get; set; }
        public string? Grade { get; set; }
        public short? TotMarks { get; set; }
        public string? FormCentre { get; set; }
        public string? ExamCentre { get; set; }
        public string? KhandAppearing { get; set; }
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
