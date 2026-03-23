using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("GRADE")]
    public sealed class Grade
    {
        [Key]
        [Column("GRADE_NO")]
        [Required]
        [MaxLength(10)]
        public string GradeNo { get; set; } = string.Empty;

        [Column("GRADE_NAME")]
        [MaxLength(50)]
        public string? GradeName { get; set; }

        [Column("GRADE_NAME_CERT")]
        [MaxLength(50)]
        public string? GradeNameCert { get; set; }
    }
}
