using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/pandit/candidates")]
    public sealed class PanditCandidatesController : ControllerBase
    {
        private readonly PanditCandidateService _candidates;

        public PanditCandidatesController(PanditCandidateService candidates)
        {
            _candidates = candidates;
        }

        [HttpGet]
        public async Task<IActionResult> List(
            [FromQuery] string? formCentre,
            [FromQuery] int? regionNo,
            [FromQuery] string? direction,
            CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.ListAsync(formCentre, regionNo, direction, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { rule = "PND-003", message = ex.Message });
            }
        }

        [HttpGet("{rollNo:int}")]
        public async Task<IActionResult> Get(short rollNo, CancellationToken cancellationToken)
        {
            var item = await _candidates.GetAsync(rollNo, cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpGet("count")]
        public async Task<IActionResult> Count([FromQuery] string formCentre, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(formCentre))
                return BadRequest(new { message = "formCentre is required." });

            return Ok(new { count = await _candidates.CountForCentreAsync(formCentre, cancellationToken) });
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] short? rollNo,
            CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(name))
                return Ok(await _candidates.SearchByNameAsync(name, cancellationToken));

            if (rollNo.HasValue)
            {
                var item = await _candidates.GetAsync(rollNo.Value, cancellationToken);
                return item is null ? NotFound() : Ok(item);
            }

            return BadRequest(new { message = "Provide name= or rollNo=." });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PanditCandidateWriteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var created = await _candidates.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(Get), new { rollNo = created.RollNo }, created);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase)
                || ex.Message.Contains("Backup", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "PND-001", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "PND-020", message = ex.Message });
            }
        }

        [HttpPut("{rollNo:int}")]
        public async Task<IActionResult> Update(short rollNo, [FromBody] PanditCandidateWriteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.UpdateAsync(rollNo, request, cancellationToken));
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
                return BadRequest(new { rule = "PND-020", message = ex.Message });
            }
        }

        [HttpDelete("{rollNo:int}")]
        public async Task<IActionResult> Delete(short rollNo, CancellationToken cancellationToken)
        {
            try
            {
                await _candidates.DeleteAsync(rollNo, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { rule = "PND-001", message = ex.Message });
            }
        }

        [HttpPost("batch")]
        public async Task<IActionResult> Batch([FromBody] PanditBatchInsertDto request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.BatchInsertAsync(request, cancellationToken));
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

        [HttpPost("{rollNo:int}/check-concession")]
        public async Task<IActionResult> CheckConcession(short rollNo, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.CheckConcessionAsync(rollNo, cancellationToken));
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
