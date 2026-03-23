using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("REGION")]
    public sealed class Region
    {
        [Key]
        [Column("REGION_NO")]
        [Required]
        public int RegionNo { get; set; }

        [Column("REGION_NAME")]
        [MaxLength(50)]
        public string? RegionName { get; set; }

        [Column("SEAT_REGION_NO")]
        public int? SeatRegionNo { get; set; }

        [Column("REGION_NAME_ENG")]
        [MaxLength(50)]
        public string? RegionNameEng { get; set; }
    }
}
