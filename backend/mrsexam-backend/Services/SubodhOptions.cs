namespace mrsexam_backend.Services
{
    public sealed class SubodhOptions
    {
        public const string SectionName = "Subodh";
        // BRD: Subodh uses exam_no = 4 for grace and result.
        public int GraceExamNo { get; set; } = 4;
        public int ResultExamNo { get; set; } = 4;
    }
}