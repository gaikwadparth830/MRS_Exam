using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/roll-numbers")]
    public sealed class RollNumbersController : ControllerBase
    {
        private readonly RollNumberService _rolls;

        public RollNumbersController(RollNumberService rolls) => _rolls = rolls;

        [HttpPost("preview")]
        public async Task<IActionResult> Preview([FromBody] RollPreviewRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.PreviewAsync(request, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-041", message = ex.Message });
            }
        }

        [HttpPost("commit")]
        public async Task<IActionResult> Commit([FromBody] RollCommitRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.CommitAsync(request, cancellationToken));
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-043", message = ex.Message });
            }
        }

        [HttpGet("next-centre")]
        public async Task<IActionResult> NextCentre([FromQuery] int seatRegionNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.NextCentreAsync(seatRegionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("aur/preview")]
        public async Task<IActionResult> AurPreview([FromBody] AurRollRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.AurPreviewAsync(request, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-045", message = ex.Message });
            }
        }

        [HttpPost("aur/commit")]
        public async Task<IActionResult> AurCommit([FromBody] AurRollRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.AurCommitAsync(request, cancellationToken));
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-045", message = ex.Message });
            }
        }

        [HttpPost("clear")]
        public async Task<IActionResult> Clear([FromBody] ClearRollRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.ClearAsync(request, cancellationToken));
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-046", message = ex.Message });
            }
        }
    }
}
