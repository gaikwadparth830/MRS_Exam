using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/subodh/marks")]
    public sealed class SubodhMarksController : ControllerBase
    {
        private readonly SubodhMarksService _marks;

        public SubodhMarksController(SubodhMarksService marks) => _marks = marks;

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] int regionNo, [FromQuery] short fromRoll, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _marks.ListAsync(regionNo, fromRoll, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { rule = "BR-050", message = ex.Message });
            }
        }

        [HttpPut("{srno:int}")]
        public async Task<IActionResult> Update(int srno, [FromBody] SubodhMarksUpdateRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _marks.UpdateAsync(srno, request, cancellationToken));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "BR-055", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "BR-052", message = ex.Message });
            }
        }
    }
}
