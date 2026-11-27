using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/praveen/reports")]
    public sealed class PraveenReportsController : ControllerBase
    {
        private readonly PraveenReportService _reports;

        public PraveenReportsController(PraveenReportService reports) => _reports = reports;

        [HttpGet("attendance")]
        public async Task<IActionResult> Attendance([FromQuery] string centreNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetAttendanceAsync(centreNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("name-list")]
        public async Task<IActionResult> NameList([FromQuery] string? centreNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetNameListAsync(centreNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("result-sheet")]
        public async Task<IActionResult> ResultSheet(
            [FromQuery] string mode = "named",
            [FromQuery] string? centreNo = null,
            [FromQuery] int? regionNo = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetResultSheetAsync(mode, centreNo, regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mark-sheet")]
        public async Task<IActionResult> MarkSheet(
            [FromQuery] int? regionNo = null,
            [FromQuery] int? fromRoll = null,
            [FromQuery] int? toRoll = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetMarkSheetAsync(regionNo, fromRoll, toRoll, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("ranks")]
        public async Task<IActionResult> Ranks(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetRanksAsync(cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("lost-two-marks")]
        public async Task<IActionResult> LostTwoMarks(
            [FromQuery] int? regionNo = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetLostByTwoMarksAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("certificates")]
        public async Task<IActionResult> Certificates(
            [FromQuery] int regionNo,
            [FromQuery] int? fromRoll = null,
            [FromQuery] int? toRoll = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetCertificatesAsync(regionNo, fromRoll, toRoll, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromQuery] int? regionNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetRegisterAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Centre-wise contiguous roll ranges (legacy Centre-wise No. of Students Appearing).</summary>
        [HttpGet("centre-wise-students")]
        public async Task<IActionResult> CentreWiseStudents(
            [FromQuery] int? regionNo = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetCentreWiseStudentsAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
