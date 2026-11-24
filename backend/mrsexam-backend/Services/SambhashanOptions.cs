namespace mrsexam_backend.Services
{
    public sealed class SambhashanOptions
    {
        public const string SectionName = "Sambhashan";
        // BRD: Sambhashan uses exam_no = 8 for grace and result.
        public int GraceExamNo { get; set; } = 8;
        public int ResultExamNo { get; set; } = 8;
    }
}
