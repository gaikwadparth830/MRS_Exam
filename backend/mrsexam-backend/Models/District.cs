using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("DISTRICT")]
    public sealed class District
    {
        [Key]
        [Column("DISTRICT_NAME")]
        [Required]
        [MaxLength(50)]
        public string DistrictName { get; set; } = string.Empty;

        [Column("REGION_NO")]
        public int? RegionNo { get; set; }

        [Column("DISTRICT_CITY")]
        [MaxLength(50)]
        public string? DistrictCity { get; set; }

        [Column("SHORT_NAME")]
        [MaxLength(10)]
        public string? ShortName { get; set; }

        [Column("SEAT_DISTRICT_NO")]
        public int? SeatDistrictNo { get; set; }
    }
}
