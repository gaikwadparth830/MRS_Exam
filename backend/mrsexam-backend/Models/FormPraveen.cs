using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("FORM_PRAVEEN")]
    public sealed class FormPraveen
    {
        [Key]
        [Column("ROLL_NO", Order = 0)]
        [Required]
        public short RollNo { get; set; }

        [Key]
        [Column("REGION_NO", Order = 1)]
        [Required]
        public int RegionNo { get; set; }

        [Key]
        [Column("SESSION_NO", Order = 2)]
        [Required]
        public short SessionNo { get; set; }

        [Column("NAME")]
        [MaxLength(60)]
        public string? Name { get; set; }

        [Column("FORM_CENTRE")]
        [MaxLength(50)]
        public string? FormCentre { get; set; }

        [Column("EXAM_CENTRE")]
        [MaxLength(50)]
        public string? ExamCentre { get; set; }

        [Column("MARKS1")]
        [MaxLength(50)]
        public string? Marks1 { get; set; }

        [Column("MARKS2")]
        [MaxLength(50)]
        public string? Marks2 { get; set; }

        [Column("MARKS3")]
        [MaxLength(50)]
        public string? Marks3 { get; set; }

        [Column("MARKS4")]
        [MaxLength(50)]
        public string? Marks4 { get; set; }

        [Column("ORAL_MARKS")]
        [MaxLength(50)]
        public string? OralMarks { get; set; }

        [Column("REG_LANG")]
        [MaxLength(50)]
        public string? RegLang { get; set; }

        [Column("TOT_MARKS")]
        public short? TotMarks { get; set; }

        [Column("GRADE")]
        [MaxLength(8)]
        public string? Grade { get; set; }

        [Column("UND_FLAG")]
        [MaxLength(1)]
        public string? UndFlag { get; set; }

        [Column("UND_CLASS")]
        [MaxLength(6)]
        public string? UndClass { get; set; }

        [Column("SPECIAL_RANK")]
        [MaxLength(10)]
        public string? SpecialRank { get; set; }

        [Column("RESULT")]
        [MaxLength(20)]
        public string? Result { get; set; }

        [Column("DUMMYCENTRECODE")]
        public int? DummyCentreCode { get; set; }

        [Column("userid")]
        [MaxLength(15)]
        public string? UserId { get; set; }
    }
}
