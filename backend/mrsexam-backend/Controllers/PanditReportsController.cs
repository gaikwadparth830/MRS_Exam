using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/pandit/reports")]
    public sealed class PanditReportsController : ControllerBase
    {
        private readonly PanditReportService _reports;

        public PanditReportsController(PanditReportService reports) => _reports = reports;

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
        public async Task<IActionResult> NameList(
            [FromQuery] string? centreNo,
            [FromQuery] int? regionNo,
            CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetNameListAsync(centreNo, regionNo, cancellationToken));
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

        [HttpGet("certificates")]
        public async Task<IActionResult> Certificates(
            [FromQuery] int? regionNo = null,
            [FromQuery] string? formCentre = null,
            [FromQuery] int? fromRoll = null,
            [FromQuery] int? toRoll = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetCertificatesAsync(regionNo, formCentre, fromRoll, toRoll, cancellationToken));
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

        [HttpGet("students-passing")]
        public async Task<IActionResult> StudentsPassing(
            [FromQuery] string? formCentre,
            [FromQuery] int? regionNo,
            CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetStudentsPassingAsync(formCentre, regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("lost-by-2")]
        public async Task<IActionResult> LostByTwo([FromQuery] int? regionNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _reports.GetLostByTwoAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
