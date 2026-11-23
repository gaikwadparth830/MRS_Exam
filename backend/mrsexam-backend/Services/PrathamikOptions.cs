namespace mrsexam_backend.Services
{
    public sealed class PrathamikOptions
    {
        public const string SectionName = "Prathamik";
        // BRD: Prathamik uses exam_no = 2 for grace and result.
        public int GraceExamNo { get; set; } = 2;
        public int ResultExamNo { get; set; } = 2;
    }
}
