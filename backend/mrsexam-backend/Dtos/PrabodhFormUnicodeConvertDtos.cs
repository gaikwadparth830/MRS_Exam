namespace mrsexam_backend.Dtos
{
    public sealed class PrabodhFormUnicodeConvertPreviewItem
    {
        public int SrNo { get; set; }
        public short? RollNo { get; set; }
        public short? SessionNo { get; set; }
        public string? OriginalName { get; set; }
        public string? ConvertedName { get; set; }
        public string? OriginalFormCentre { get; set; }
        public string? ConvertedFormCentre { get; set; }
        public string? OriginalExamCentre { get; set; }
        public string? ConvertedExamCentre { get; set; }
        public bool WillChange { get; set; }
        public string? Conflict { get; set; }
    }

    public sealed class PrabodhFormUnicodeConvertPreviewResponse
    {
        public int TotalRows { get; set; }
        public int ConvertibleCount { get; set; }
        public int UnchangedCount { get; set; }
        public int ConflictCount { get; set; }
        public int SampleLimit { get; set; }
        public IReadOnlyList<PrabodhFormUnicodeConvertPreviewItem> Items { get; set; } =
            Array.Empty<PrabodhFormUnicodeConvertPreviewItem>();
    }

    public sealed class PrabodhFormUnicodeConvertApplyResponse
    {
        public int RowsUpdated { get; set; }
        public int NamesUpdated { get; set; }
        public int FormCentresUpdated { get; set; }
        public int ExamCentresUpdated { get; set; }
        public int SkippedConflicts { get; set; }
        public IReadOnlyList<string> Errors { get; set; } = Array.Empty<string>();
    }
}
