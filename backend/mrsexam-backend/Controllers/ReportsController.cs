using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public sealed class ReportsController : ControllerBase
    {
        private readonly ReportService _reports;

        public ReportsController(ReportService reports) => _reports = reports;

        [HttpGet("attendance")]
        public async Task<IActionResult> Attendance([FromQuery] string centreNo, CancellationToken cancellationToken)
        {
            try
            {
                var report = await _reports.GetAttendanceAsync(centreNo, cancellationToken);
                return Ok(report);
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
                var report = await _reports.GetNameListAsync(centreNo, cancellationToken);
                return Ok(report);
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
                var report = await _reports.GetResultSheetAsync(mode, centreNo, regionNo, cancellationToken);
                return Ok(report);
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
                var report = await _reports.GetCertificatesAsync(regionNo, fromRoll, toRoll, cancellationToken);
                return Ok(report);
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
                var report = await _reports.GetRegisterAsync(regionNo, cancellationToken);
                return Ok(report);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
