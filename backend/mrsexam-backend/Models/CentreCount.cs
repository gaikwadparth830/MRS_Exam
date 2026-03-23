using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("CENTRE_COUNT")]
    public sealed class CentreCount
    {
        [Key]
        [Column("CENTRE_COUNT_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CentreCountId { get; set; }

        [Column("CENTRE_NO")]
        [MaxLength(50)]
        public string? CentreNo { get; set; }

        [Column("CENTRE_NAME")]
        [MaxLength(100)]
        public string? CentreName { get; set; }

        [Column("FROM_GROUP1")]
        public int? FromGroup1 { get; set; }

        [Column("TO_GROUP1")]
        [MaxLength(50)]
        public string? ToGroup1 { get; set; }

        [Column("FROM_GROUP2")]
        [MaxLength(50)]
        public string? FromGroup2 { get; set; }

        [Column("TO_GROUP2")]
        [MaxLength(50)]
        public string? ToGroup2 { get; set; }

        [Column("OTHER")]
        [MaxLength(255)]
        public string? Other { get; set; }

        [Column("REGION_NO")]
        public int? RegionNo { get; set; }
    }
}
