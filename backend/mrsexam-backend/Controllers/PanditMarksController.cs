using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/pandit/marks")]
    public sealed class PanditMarksController : ControllerBase
    {
        private readonly PanditMarksService _marks;

        public PanditMarksController(PanditMarksService marks) => _marks = marks;

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int regionNo, [FromQuery] short fromRoll, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _marks.ListAsync(regionNo, fromRoll, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { rule = "PND-030", message = ex.Message });
            }
        }

        [HttpPut("{rollNo:int}")]
        public async Task<IActionResult> Update(short rollNo, [FromBody] PanditMarksUpdateRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _marks.UpdateAsync(rollNo, request, cancellationToken));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "PND-001", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "PND-025", message = ex.Message });
            }
        }
    }
}
