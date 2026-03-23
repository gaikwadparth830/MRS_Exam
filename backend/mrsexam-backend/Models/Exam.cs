using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("EXAM")]
    public sealed class Exam
    {
        [Key]
        [Column("EXAM_NO")]
        [Required]
        public int ExamNo { get; set; }

        [Column("EXAM_NAME")]
        [MaxLength(50)]
        public string? ExamName { get; set; }

        [Column("SESSION_NO")]
        public int? SessionNo { get; set; }

        [Column("NO_OF_PAPERS")]
        public int? NoOfPapers { get; set; }

        [Column("FEES")]
        public int? Fees { get; set; }

        [Column("ATT_SHEET_PRINTED")]
        [MaxLength(1)]
        public string? AttSheetPrinted { get; set; }

        [Column("RESULT_GEN_FLAG")]
        [MaxLength(1)]
        public string? ResultGenFlag { get; set; }

        [Column("MIN_TOTAL_KHAND1")]
        public int? MinTotalKhand1 { get; set; }

        [Column("MIN_TOTAL_KHAND2")]
        public int? MinTotalKhand2 { get; set; }

        [Column("CLASS1_MARKS")]
        public int? Class1Marks { get; set; }

        [Column("CLASS2_MARKS")]
        public int? Class2Marks { get; set; }

        [Column("CLASS3_MARKS")]
        public int? Class3Marks { get; set; }

        [Column("DIST_MARKS")]
        public int? DistMarks { get; set; }
    }
}
