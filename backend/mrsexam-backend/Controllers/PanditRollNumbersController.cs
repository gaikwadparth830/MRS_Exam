using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/pandit/roll-numbers")]
    public sealed class PanditRollNumbersController : ControllerBase
    {
        private readonly PanditRollNumberService _rolls;

        public PanditRollNumbersController(PanditRollNumberService rolls) => _rolls = rolls;

        [HttpGet("next")]
        public async Task<IActionResult> Next(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.GetNextRollAsync(cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? formCentre,
            [FromQuery] int? regionNo,
            CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.ListAssignedAsync(formCentre, regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
