using System.ComponentModel.DataAnnotations;

namespace mrsexam_backend.Models
{
    public sealed class BatchInsertRequest
    {
        [Required]
        public int SessionNo { get; set; }

        // Centre code entered on UI is a string (centre identifier). It will be stored
        // in `FORM_CENTRE` and `EXAM_CENTRE`. DummyCentreCode will be set to 0.
        public string? CentreCode { get; set; }

        [Required]
        public int RegionNo { get; set; }

        [Required]
        public int StartRollNo { get; set; }

        public string? StartName { get; set; }

        [Required]
        public int EndRollNo { get; set; }

        public string? EndName { get; set; }
    }
}
