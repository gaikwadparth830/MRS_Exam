using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("INSTITUTION")]
    public sealed class Institution
    {
        [Key]
        [Column("INSTITUTION_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InstitutionId { get; set; }

        [Column("INST_NAME")]
        [MaxLength(50)]
        public string? InstName { get; set; }

        [Column("INST_ADD")]
        [MaxLength(55)]
        public string? InstAdd { get; set; }
    }
}
