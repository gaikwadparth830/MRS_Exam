using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("AttSheet")]
    public sealed class AttSheet
    {
        [Key]
        [Column("AttSheet_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AttSheetId { get; set; }

        [Column("exam_centre")]
        [MaxLength(50)]
        public string? ExamCentre { get; set; }

        [Column("col1_RollNo")]
        public int? Col1RollNo { get; set; }

        [Column("col2_RollNo")]
        public int? Col2RollNo { get; set; }
    }
}
