using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("RESULT")]
    public sealed class Result
    {
        [Key]
        [Column("RESULT_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ResultId { get; set; }

        [Column("RESULT")]
        [MaxLength(100)]
        public string? ResultValue { get; set; }

        [Column("DESC")]
        [MaxLength(100)]
        public string? Description { get; set; }

        [Column("Exam")]
        public short? Exam { get; set; }
    }
}
