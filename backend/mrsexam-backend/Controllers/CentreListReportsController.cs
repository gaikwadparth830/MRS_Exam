using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    /// <summary>Common report: list of centres (Rpt_CentreList).</summary>
    [ApiController]
    [Route("api/reports/centre-list")]
    public sealed class CentreListReportsController : ControllerBase
    {
        private readonly CentreListReportService _reports;

        public CentreListReportsController(CentreListReportService reports) => _reports = reports;

        [HttpGet]
        public async Task<IActionResult> Report(CancellationToken cancellationToken)
        {
            return Ok(await _reports.GetReportAsync(cancellationToken));
        }
    }
}
