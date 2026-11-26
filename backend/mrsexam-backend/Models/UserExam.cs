using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("USER_EXAM")]
    public sealed class UserExam
    {
        [Column("USERID")]
        [Required]
        [MaxLength(10)]
        public string UserId { get; set; } = string.Empty;

        [Column("EXAM_CODE")]
        [Required]
        [MaxLength(20)]
        public string ExamCode { get; set; } = string.Empty;
    }
}
