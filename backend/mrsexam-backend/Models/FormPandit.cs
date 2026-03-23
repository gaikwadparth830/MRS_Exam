using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("FORM_PANDIT")]
    public sealed class FormPandit
    {
        [Key]
        [Column("ROLL_NO", Order = 0)]
        [Required]
        public short RollNo { get; set; }

        [Key]
        [Column("SESSION_NO", Order = 1)]
        [Required]
        public short SessionNo { get; set; }

        [Column("NAME")]
        [MaxLength(60)]
        public string? Name { get; set; }

        [Column("FORM_CENTRE")]
        [MaxLength(10)]
        public string? FormCentre { get; set; }

        [Column("EXAM_CENTRE")]
        [MaxLength(10)]
        public string? ExamCentre { get; set; }

        [Column("ROLL_NO_1")]
        public short? RollNo1 { get; set; }

        [Column("SESSION_NO_1")]
        public short? SessionNo1 { get; set; }

        [Column("MARKS1")]
        [MaxLength(3)]
        public string? Marks1 { get; set; }

        [Column("ROLL_NO_2")]
        public short? RollNo2 { get; set; }

        [Column("SESSION_NO_2")]
        public short? SessionNo2 { get; set; }

        [Column("MARKS2")]
        [MaxLength(3)]
        public string? Marks2 { get; set; }

        [Column("ROLL_NO_3")]
        public short? RollNo3 { get; set; }

        [Column("SESSION_NO_3")]
        public short? SessionNo3 { get; set; }

        [Column("MARKS3")]
        [MaxLength(3)]
        public string? Marks3 { get; set; }

        [Column("ROLL_NO_4")]
        public short? RollNo4 { get; set; }

        [Column("SESSION_NO_4")]
        public short? SessionNo4 { get; set; }

        [Column("MARKS4")]
        [MaxLength(3)]
        public string? Marks4 { get; set; }

        [Column("ROLL_NO_5")]
        public short? RollNo5 { get; set; }

        [Column("SESSION_NO_5")]
        public short? SessionNo5 { get; set; }

        [Column("MARKS5")]
        [MaxLength(3)]
        public string? Marks5 { get; set; }

        [Column("ROLL_NO_6")]
        public short? RollNo6 { get; set; }

        [Column("SESSION_NO_6")]
        public short? SessionNo6 { get; set; }

        [Column("MARKS6")]
        [MaxLength(3)]
        public string? Marks6 { get; set; }

        [Column("ORAL_ROLL_NO")]
        public short? OralRollNo { get; set; }

        [Column("ORAL_SESSION_NO")]
        public short? OralSessionNo { get; set; }

        [Column("ORAL_MARKS")]
        [MaxLength(3)]
        public string? OralMarks { get; set; }

        [Column("OPT_MARKS")]
        [MaxLength(3)]
        public string? OptMarks { get; set; }

        [Column("KHAND1_TOTMARKS")]
        public int? Khand1TotMarks { get; set; }

        [Column("KHAND2_TOTMARKS")]
        public int? Khand2TotMarks { get; set; }

        [Column("TOT_MARKS")]
        public short? TotMarks { get; set; }

        [Column("GRADE")]
        [MaxLength(10)]
        public string? Grade { get; set; }

        [Column("UND_FLAG")]
        [MaxLength(1)]
        public string? UndFlag { get; set; }

        [Column("UND_CLASS")]
        [MaxLength(4)]
        public string? UndClass { get; set; }

        [Column("SPECIAL_RANK")]
        [MaxLength(10)]
        public string? SpecialRank { get; set; }

        [Column("KHAND_APPEARING")]
        [MaxLength(2)]
        public string? KhandAppearing { get; set; }

        [Column("BOTH_KHAND_FLAG")]
        [MaxLength(1)]
        public string? BothKhandFlag { get; set; }

        [Column("OTH_KHAND_ROLLNO")]
        public short? OthKhandRollNo { get; set; }

        [Column("CONCESSION_FLAG")]
        [MaxLength(1)]
        public string? ConcessionFlag { get; set; }

        [Column("RES_DECL_FLAG")]
        [MaxLength(1)]
        public string? ResDeclFlag { get; set; }

        [Column("RESULT")]
        [MaxLength(20)]
        public string? Result { get; set; }

        [Column("ADD1")]
        [MaxLength(80)]
        public string? Add1 { get; set; }

        [Column("ADD2")]
        [MaxLength(80)]
        public string? Add2 { get; set; }

        [Column("ADD3")]
        [MaxLength(80)]
        public string? Add3 { get; set; }

        [Column("DUMMYCENTRECODE")]
        public int? DummyCentreCode { get; set; }

        [Column("userid")]
        [MaxLength(15)]
        public string? UserId { get; set; }
    }
}
