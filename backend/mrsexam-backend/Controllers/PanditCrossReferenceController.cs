using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/pandit/cross-reference")]
    public sealed class PanditCrossReferenceController : ControllerBase
    {
        private readonly PanditCrossRefService _crossRef;

        public PanditCrossReferenceController(PanditCrossRefService crossRef) => _crossRef = crossRef;

        [HttpPost("run")]
        public async Task<IActionResult> Run(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _crossRef.RunAsync(cancellationToken));
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "PND-001", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> Status(CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _crossRef.StatusAsync(cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
