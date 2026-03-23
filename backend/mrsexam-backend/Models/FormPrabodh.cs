using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("FORM_PRABODH")]
    public sealed class FormPrabodh
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

        [Column("MARKS2")]
        [MaxLength(50)]
        public string? Marks2 { get; set; }

        [Column("MARKS3")]
        [MaxLength(50)]
        public string? Marks3 { get; set; }

        [Column("ORAL_MARKS")]
        [MaxLength(50)]
        public string? OralMarks { get; set; }

        [Column("REG_LANG")]
        [MaxLength(50)]
        public string? RegLang { get; set; }

        [Column("TOT_MARKS")]
        public short? TotMarks { get; set; }

        [Column("GRADE")]
        [MaxLength(15)]
        public string? Grade { get; set; }

        [Column("SPECIAL_RANK")]
        [MaxLength(50)]
        public string? SpecialRank { get; set; }

        [Column("RESULT")]
        [MaxLength(20)]
        public string? Result { get; set; }

        [Column("DummyCentreCode")]
        public int? DummyCentreCode { get; set; }

        [Column("Resgen_run")]
        public short? ResgenRun { get; set; }

        [Column("userid")]
        [MaxLength(15)]
        public string? UserId { get; set; }
    }
}
