namespace mrsexam_backend.Services
{
    public sealed class PraveshikaOptions
    {
        public const string SectionName = "Praveshika";
        // BRD: Praveshika uses exam_no = 3 for grace and result.
        public int GraceExamNo { get; set; } = 3;
        public int ResultExamNo { get; set; } = 3;
    }
}