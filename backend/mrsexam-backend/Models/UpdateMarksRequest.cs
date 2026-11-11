namespace mrsexam_backend.Models
{
    public sealed class UpdateMarksRequest
    {
        public short? RollNo { get; set; }
        public int? RegionNo { get; set; }
        public short? SessionNo { get; set; }

        public string? Marks1 { get; set; }
        public string? Marks2 { get; set; }
        public string? Marks3 { get; set; }
        public string? Marks4 { get; set; }
        public string? Marks5 { get; set; }
        public string? Marks6 { get; set; }
        public string? OralMarks { get; set; }

        public short? TotMarks { get; set; }
        public string? Grade { get; set; }
        public string? Result { get; set; }
        public string? UndFlag { get; set; }
        public string? UndClass { get; set; }
    }
}
