using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/praveen/results")]
    public sealed class PraveenResultsController : ControllerBase
    {
        private readonly PraveenResultService _results;
        private readonly SessionService _sessions;
        private readonly PermissionService _permissions;

        public PraveenResultsController(PraveenResultService results, SessionService sessions, PermissionService permissions)
        {
            _results = results;
            _sessions = sessions;
        _permissions = permissions;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int regionNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.ListAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateResultRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.GenerateAsync(request.RegionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "BR-060", message = ex.Message });
            }
        }

        [HttpPost("ranks")]
        public async Task<IActionResult> Ranks(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.FindRanksAsync(cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "BR-065", message = ex.Message });
            }
        }

        [HttpPost("lock/reset")]
        public async Task<IActionResult> ResetLock(CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureSuperAsync(cancellationToken);
                await _sessions.ResetPraveenLockAsync(cancellationToken);
                return Ok(new { resgenPraveen = "N" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "BR-070", message = ex.Message });
            }
        }

        [HttpGet("correction")]
        public async Task<IActionResult> Correction([FromQuery] int regionNo, [FromQuery] short rollNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.GetCorrectionAsync(regionNo, rollNo, cancellationToken));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "BR-071", message = ex.Message });
            }
        }

        [HttpPut("correction")]
        public async Task<IActionResult> SaveCorrection([FromBody] PraveenCorrectionSaveRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.SaveCorrectionAsync(request, cancellationToken));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "BR-072", message = ex.Message });
            }
        }
    }
}
