using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("SESSION")]
    public sealed class Session
    {
        [Key]
        [Column("SESSION_NO")]
        [Required]
        public int SessionNo { get; set; }

        [Column("RESULT_DATE")]
        public DateTime? ResultDate { get; set; }

        [Column("RESULT_PRINTED")]
        [MaxLength(1)]
        public string? ResultPrinted { get; set; }

        [Column("CLOSE_FLAG")]
        [MaxLength(1)]
        public string? CloseFlag { get; set; }

        [Column("MONTH")]
        [MaxLength(20)]
        public string? Month { get; set; }

        [Column("DEFA")]
        [MaxLength(1)]
        public string? Defa { get; set; }

        [Column("RESGEN_PANDIT")]
        [MaxLength(1)]
        public string? ResgenPandit { get; set; }

        [Column("RESGEN_PRAVEEN")]
        [MaxLength(1)]
        public string? ResgenPraveen { get; set; }

        [Column("RESGEN_PRABODH")]
        [MaxLength(1)]
        public string? ResgenPrabodh { get; set; }

        [Column("RESGEN_SUBODH")]
        [MaxLength(1)]
        public string? ResgenSubodh { get; set; }

        [Column("RESGEN_PRAVESHIKA")]
        [MaxLength(1)]
        public string? ResgenPraveshika { get; set; }

        [Column("RESGEN_PRATHAMIK")]
        [MaxLength(1)]
        public string? ResgenPrathamik { get; set; }

        [Column("RESGEN_BALBODHINI")]
        [MaxLength(1)]
        public string? ResgenBalbodhini { get; set; }

        [Column("BACKUP")]
        [MaxLength(1)]
        public string? Backup { get; set; }
    }
}
