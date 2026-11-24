namespace mrsexam_backend.Services
{
    public sealed class PrabodhOptions
    {
        public const string SectionName = "Prabodh";
        // BRD: Prabodh uses exam_no = 5 for grace and result.
        public int GraceExamNo { get; set; } = 5;
        public int ResultExamNo { get; set; } = 5;
    }
}