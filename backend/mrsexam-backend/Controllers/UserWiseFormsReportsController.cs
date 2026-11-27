using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    /// <summary>Common supervisor report: user-wise form counts across all exams.</summary>
    [ApiController]
    [Route("api/reports/userwise-forms")]
    public sealed class UserWiseFormsReportsController : ControllerBase
    {
        private readonly UserWiseFormsReportService _reports;

        public UserWiseFormsReportsController(UserWiseFormsReportService reports) => _reports = reports;

        [HttpGet("users")]
        public async Task<IActionResult> Users(CancellationToken cancellationToken)
        {
            return Ok(await _reports.ListUserIdsAsync(cancellationToken));
        }

        [HttpGet]
        public async Task<IActionResult> Report(
            [FromQuery] string? userId = null,
            CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _reports.GetReportAsync(userId, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
