using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("FORM_PRATHAMIK")]
    public sealed class FormPrathamik
    {
        [Key]
        [Column("SRNO")]
        [Required]
        public int SrNo { get; set; }

        [Column("ROLL_NO")]
        public short? RollNo { get; set; }

        [Column("REGION_NO")]
        public int? RegionNo { get; set; }

        [Column("NAME")]
        [MaxLength(60)]
        public string? Name { get; set; }

        [Column("SESSION_NO")]
        public short? SessionNo { get; set; }

        [Column("GENDER")]
        [MaxLength(1)]
        public string? Gender { get; set; }

        [Column("FORM_CENTRE")]
        [MaxLength(50)]
        public string? FormCentre { get; set; }

        [Column("EXAM_CENTRE")]
        [MaxLength(50)]
        public string? ExamCentre { get; set; }

        [Column("MARKS1")]
        [MaxLength(50)]
        public string? Marks1 { get; set; }

        [Column("TOT_MARKS")]
        public short? TotMarks { get; set; }

        [Column("GRADE")]
        [MaxLength(10)]
        public string? Grade { get; set; }

        [Column("UND_FLAG")]
        [MaxLength(1)]
        public string? UndFlag { get; set; }

        [Column("UND_CLASS")]
        [MaxLength(6)]
        public string? UndClass { get; set; }

        [Column("SPECIAL_RANK")]
        [MaxLength(20)]
        public string? SpecialRank { get; set; }

        [Column("RESULT")]
        [MaxLength(20)]
        public string? Result { get; set; }

        [Column("DummyCentreCode")]
        public int? DummyCentreCode { get; set; }

        [Column("resgen_run")]
        public short? ResgenRun { get; set; }

        [Column("userid")]
        [MaxLength(15)]
        public string? UserId { get; set; }
    }
}
