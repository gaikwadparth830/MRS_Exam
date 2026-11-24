using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/praveen/roll-numbers")]
    public sealed class PraveenRollNumbersController : ControllerBase
    {
        private readonly PraveenRollNumberService _rolls;

        public PraveenRollNumbersController(PraveenRollNumberService rolls) => _rolls = rolls;

        [HttpGet("next")]
        public async Task<IActionResult> Next([FromQuery] int regionNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.GetNextRollAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int regionNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _rolls.ListAssignedAsync(regionNo, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
