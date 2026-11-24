namespace mrsexam_backend.Services
{
    public sealed class PraveenOptions
    {
        public const string SectionName = "Praveen";
        // BRD: Praveen uses exam_no = 6 for grace and result.
        public int GraceExamNo { get; set; } = 6;
        public int ResultExamNo { get; set; } = 6;
    }
}
