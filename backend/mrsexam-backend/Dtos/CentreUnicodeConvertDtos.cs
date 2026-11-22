namespace mrsexam_backend.Dtos
{
    public sealed class CentreUnicodeConvertPreviewItem
    {
        public string OriginalCentreNo { get; set; } = string.Empty;
        public string ConvertedCentreNo { get; set; } = string.Empty;
        public string? OriginalCentreName { get; set; }
        public string? ConvertedCentreName { get; set; }
        public string? OriginalAddressTo { get; set; }
        public string? ConvertedAddressTo { get; set; }
        public string? OriginalAdd1 { get; set; }
        public string? ConvertedAdd1 { get; set; }
        public string? OriginalAdd2 { get; set; }
        public string? ConvertedAdd2 { get; set; }
        public string? OriginalCity { get; set; }
        public string? ConvertedCity { get; set; }
        public string? OriginalDistrictName { get; set; }
        public string? ConvertedDistrictName { get; set; }
        public int FormRefCount { get; set; }
        public bool WillChange { get; set; }
        public bool CentreNoChanges { get; set; }
        public string? Conflict { get; set; }
    }

    public sealed class CentreUnicodeConvertPreviewResponse
    {
        public int TotalCentres { get; set; }
        public int ConvertibleCount { get; set; }
        public int UnchangedCount { get; set; }
        public int ConflictCount { get; set; }
        public IReadOnlyList<CentreUnicodeConvertPreviewItem> Items { get; set; } =
            Array.Empty<CentreUnicodeConvertPreviewItem>();
    }

    public sealed class CentreUnicodeConvertApplyResponse
    {
        public int CentresUpdated { get; set; }
        public int CentreNosRenamed { get; set; }
        public int FormRefsUpdated { get; set; }
        public IReadOnlyList<string> SkippedConflicts { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> Errors { get; set; } = Array.Empty<string>();
    }
}
