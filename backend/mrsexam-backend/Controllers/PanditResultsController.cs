using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/pandit/results")]
    public sealed class PanditResultsController : ControllerBase
    {
        private readonly PanditResultService _results;
        private readonly SessionService _sessions;
        private readonly PermissionService _permissions;

        public PanditResultsController(PanditResultService results, SessionService sessions, PermissionService permissions)
        {
            _results = results;
            _sessions = sessions;
        _permissions = permissions;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int? regionNo, CancellationToken cancellationToken)
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
        public async Task<IActionResult> Generate(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.GenerateAsync(cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "PND-040", message = ex.Message });
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
                return BadRequest(new { rule = "PND-045", message = ex.Message });
            }
        }

        [HttpPost("lock/reset")]
        public async Task<IActionResult> ResetLock(CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureSuperAsync(cancellationToken);
                await _sessions.ResetPanditLockAsync(cancellationToken);
                return Ok(new { resgenPandit = "N" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "PND-070", message = ex.Message });
            }
        }

        [HttpGet("correction")]
        public async Task<IActionResult> Correction([FromQuery] short rollNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _results.GetCorrectionAsync(rollNo, cancellationToken));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("correction")]
        public async Task<IActionResult> SaveCorrection([FromBody] PanditCorrectionSaveRequest request, CancellationToken cancellationToken)
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
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
