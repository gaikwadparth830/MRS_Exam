using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("USER_CENTRE")]
    public sealed class UserCentre
    {
        [Column("USERID")]
        [Required]
        [MaxLength(10)]
        public string UserId { get; set; } = string.Empty;

        [Column("CENTRE_NO")]
        [Required]
        [MaxLength(20)]
        public string CentreNo { get; set; } = string.Empty;
    }
}
