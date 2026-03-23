using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("PAPER")]
    public sealed class Paper
    {
        [Key]
        [Column("PAPER_NO", Order = 0)]
        [Required]
        public int PaperNo { get; set; }

        [Key]
        [Column("EXAM_NO", Order = 1)]
        [Required]
        public int ExamNo { get; set; }

        [Column("PAPER_NAME")]
        [MaxLength(40)]
        public string? PaperName { get; set; }

        [Column("PASSING_MARKS")]
        public int? PassingMarks { get; set; }

        [Column("EXEMPTION_MARKS")]
        public int? ExemptionMarks { get; set; }

        [Column("MIN_MARKS")]
        public int? MinMarks { get; set; }
    }
}
