using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mrsexam_backend.Models
{
    [Table("PARAMETER")]
    public sealed class Parameter
    {
        [Key]
        [Column("PARAMETER_ID")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ParameterId { get; set; }

        [Column("CENTRE_ADDRESS_TO")]
        [MaxLength(50)]
        public string? CentreAddressTo { get; set; }

        [Column("SESSION_MONTH11")]
        [MaxLength(20)]
        public string? SessionMonth11 { get; set; }

        [Column("SESSION_MONTH12")]
        [MaxLength(20)]
        public string? SessionMonth12 { get; set; }

        [Column("SESSION_MONTH21")]
        [MaxLength(20)]
        public string? SessionMonth21 { get; set; }

        [Column("SESSION_MONTH22")]
        [MaxLength(20)]
        public string? SessionMonth22 { get; set; }

        [Column("INST_NAME")]
        [MaxLength(50)]
        public string? InstName { get; set; }

        [Column("INST_ADD")]
        [MaxLength(55)]
        public string? InstAdd { get; set; }

        [Column("LIST_OF_CENTRES")]
        [MaxLength(50)]
        public string? ListOfCentres { get; set; }

        [Column("CENTRE_NO")]
        [MaxLength(20)]
        public string? CentreNo { get; set; }

        [Column("CENTRE_NAME")]
        [MaxLength(20)]
        public string? CentreName { get; set; }

        [Column("CENTRE_ADD")]
        [MaxLength(20)]
        public string? CentreAdd { get; set; }

        [Column("PAGE_NO")]
        [MaxLength(20)]
        public string? PageNo { get; set; }

        [Column("RIGHT_HEAD")]
        [MaxLength(50)]
        public string? RightHead { get; set; }

        [Column("CENTRE_HEAD_PANDIT")]
        [MaxLength(200)]
        public string? CentreHeadPandit { get; set; }

        [Column("CENTRE")]
        [MaxLength(50)]
        public string? Centre { get; set; }

        [Column("HEADING_ATTSHEET")]
        public string? HeadingAttsheet { get; set; }

        [Column("ROLL_NO")]
        [MaxLength(50)]
        public string? RollNo { get; set; }

        [Column("PAPER1")]
        [MaxLength(50)]
        public string? Paper1 { get; set; }

        [Column("PAPER2")]
        [MaxLength(50)]
        public string? Paper2 { get; set; }

        [Column("PAPER3")]
        [MaxLength(50)]
        public string? Paper3 { get; set; }

        [Column("PAPER4")]
        [MaxLength(50)]
        public string? Paper4 { get; set; }

        [Column("PAPER5")]
        [MaxLength(50)]
        public string? Paper5 { get; set; }

        [Column("PAPER6")]
        [MaxLength(50)]
        public string? Paper6 { get; set; }

        [Column("DATE")]
        [MaxLength(50)]
        public string? Date { get; set; }

        [Column("RIGHT_FOOT")]
        [MaxLength(200)]
        public string? RightFoot { get; set; }

        [Column("FROM")]
        [MaxLength(50)]
        public string? From { get; set; }

        [Column("TO")]
        [MaxLength(50)]
        public string? To { get; set; }

        [Column("CENTRE_HEAD_PRAVEEN")]
        [MaxLength(200)]
        public string? CentreHeadPraveen { get; set; }

        [Column("APPLICANT_NAME")]
        [MaxLength(50)]
        public string? ApplicantName { get; set; }

        [Column("EXAM_CENTRE")]
        [MaxLength(50)]
        public string? ExamCentre { get; set; }

        [Column("ROLL_NO1")]
        [MaxLength(50)]
        public string? RollNo1 { get; set; }

        [Column("SESSION")]
        [MaxLength(50)]
        public string? Session { get; set; }

        [Column("SSMA_TimeStamp")]
        [Timestamp]
        public byte[] SsmaTimeStamp { get; set; } = Array.Empty<byte>();
    }
}
