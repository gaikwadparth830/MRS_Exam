using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("USERS")]
    public sealed class User
    {
        [Key]
        [Column("USERID")]
        [Required]
        [MaxLength(10)]
        public string UserId { get; set; } = string.Empty;

        [Column("PASSWORD")]
        [MaxLength(10)]
        public string? Password { get; set; }

        [Column("KEY")]
        [MaxLength(5)]
        public string? UserKey { get; set; }
    }
}
