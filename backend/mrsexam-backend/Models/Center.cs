using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("CENTRE")]
    public sealed class Center
    {
        [Key]
        [Column("CENTRE_NO")]
        [Required]
        [MaxLength(10)]
        public string CentreNo { get; set; } = string.Empty;

        [Column("ADDRESS_TO")]
        [MaxLength(50)]
        public string? AddressTo { get; set; }

        [Column("CENTRE_NAME")]
        [MaxLength(100)]
        public string? CentreName { get; set; }

        [Column("DISTRICT_NAME")]
        [MaxLength(50)]
        public string? DistrictName { get; set; }

        [Column("ADD1")]
        [MaxLength(50)]
        public string? Add1 { get; set; }

        [Column("ADD2")]
        [MaxLength(50)]
        public string? Add2 { get; set; }

        [Column("CITY")]
        [MaxLength(35)]
        public string? City { get; set; }

        [Column("PINCODE")]
        [MaxLength(6)]
        public string? Pincode { get; set; }

        [Column("PHONE")]
        [MaxLength(15)]
        public string? Phone { get; set; }

        [Column("PANDIT_FLAG")]
        [MaxLength(1)]
        public string? PanditFlag { get; set; }

        [Column("CLOSE_FLAG")]
        [MaxLength(1)]
        public string? CloseFlag { get; set; }
    }
}
