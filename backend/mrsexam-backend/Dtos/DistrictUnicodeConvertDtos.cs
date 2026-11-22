namespace mrsexam_backend.Dtos
{
    public sealed class DistrictUnicodeConvertPreviewItem
    {
        public string OriginalDistrictName { get; set; } = string.Empty;
        public string ConvertedDistrictName { get; set; } = string.Empty;
        public string? OriginalShortName { get; set; }
        public string? ConvertedShortName { get; set; }
        public string? OriginalDistrictCity { get; set; }
        public string? ConvertedDistrictCity { get; set; }
        public int RegionNo { get; set; }
        public int? SeatDistrictNo { get; set; }
        public int CentreRefCount { get; set; }
        public int FormRefCount { get; set; }
        public bool WillChange { get; set; }
        public string? Conflict { get; set; }
    }

    public sealed class DistrictUnicodeConvertPreviewResponse
    {
        public int TotalDistricts { get; set; }
        public int ConvertibleCount { get; set; }
        public int UnchangedCount { get; set; }
        public int ConflictCount { get; set; }
        public IReadOnlyList<DistrictUnicodeConvertPreviewItem> Items { get; set; } =
            Array.Empty<DistrictUnicodeConvertPreviewItem>();
    }

    public sealed class DistrictUnicodeConvertApplyResponse
    {
        public int DistrictsUpdated { get; set; }
        public int CentresUpdated { get; set; }
        public int FormsUpdated { get; set; }
        public IReadOnlyList<string> SkippedConflicts { get; set; } = Array.Empty<string>();
        public IReadOnlyList<string> Errors { get; set; } = Array.Empty<string>();
    }
}
