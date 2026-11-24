namespace mrsexam_backend.Services
{
    public sealed class PanditOptions
    {
        public const string SectionName = "Pandit";
        // BRD: Pandit uses exam_no = 7 for grace and result.
        public int GraceExamNo { get; set; } = 7;
        public int ResultExamNo { get; set; } = 7;
    }
}
