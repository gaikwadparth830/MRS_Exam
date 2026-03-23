using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("TOT_FORMS")]
    public sealed class TotForm
    {
        [Key]
        [Column("TOT_FORMS_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TotFormsId { get; set; }

        [Column("userid")]
        [MaxLength(10)]
        public string? UserId { get; set; }

        [Column("exam")]
        [MaxLength(15)]
        public string? Exam { get; set; }

        [Column("tot_forms")]
        public short? TotForms { get; set; }
    }
}
