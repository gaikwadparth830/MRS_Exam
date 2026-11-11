using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/candidates")]
    public sealed class CandidatesController : ControllerBase
    {
        private readonly CandidateService _candidates;
        private readonly CentreResolver _centres;

        public CandidatesController(CandidateService candidates, CentreResolver centres)
        {
            _candidates = candidates;
            _centres = centres;
        }

        [HttpGet]
        public async Task<IActionResult> List([FromQuery] string? formCentre, [FromQuery] string? direction, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.ListAsync(formCentre, direction, cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { rule = "FR-004", message = ex.Message });
            }
        }

        [HttpGet("{srno:int}")]
        public async Task<IActionResult> Get(int srno, CancellationToken cancellationToken)
        {
            var item = await _candidates.GetAsync(srno, cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpGet("count")]
        public async Task<IActionResult> Count([FromQuery] string formCentre, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(formCentre))
                return BadRequest(new { rule = "FR-032", message = "formCentre is required." });

            return Ok(new { count = await _candidates.CountForCentreAsync(formCentre, cancellationToken) });
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] int? regionNo,
            [FromQuery] short? rollNo,
            CancellationToken cancellationToken)
        {
            if (!string.IsNullOrWhiteSpace(name))
                return Ok(await _candidates.SearchByNameAsync(name, cancellationToken));

            if (regionNo.HasValue && rollNo.HasValue)
            {
                var item = await _candidates.SearchByRollAsync(regionNo.Value, rollNo.Value, cancellationToken);
                return item is null ? NotFound() : Ok(item);
            }

            return BadRequest(new { rule = "FR-034", message = "Provide name= or regionNo= and rollNo=." });
        }

        [HttpGet("~/api/centres/{centreNo}/resolve")]
        public async Task<IActionResult> ResolveCentre(string centreNo, CancellationToken cancellationToken)
        {
            var resolved = await _centres.ResolveAsync(centreNo, cancellationToken);
            return resolved is null ? NotFound() : Ok(resolved);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CandidateWriteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var created = await _candidates.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(Get), new { srno = created.SrNo }, created);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase)
                || ex.Message.Contains("Backup", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-022", message = ex.Message });
            }
        }

        [HttpPut("{srno:int}")]
        public async Task<IActionResult> Update(int srno, [FromBody] CandidateWriteRequest request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.UpdateAsync(srno, request, cancellationToken));
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-027", message = ex.Message });
            }
        }

        [HttpDelete("{srno:int}")]
        public async Task<IActionResult> Delete(int srno, CancellationToken cancellationToken)
        {
            try
            {
                await _candidates.DeleteAsync(srno, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
        }

        [HttpPost("insert-between")]
        public async Task<IActionResult> InsertBetween([FromBody] InsertBetweenRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var created = await _candidates.InsertBetweenAsync(request, cancellationToken);
                return CreatedAtAction(nameof(Get), new { srno = created.SrNo }, created);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-026", message = ex.Message });
            }
        }

        [HttpPost("batch")]
        public async Task<IActionResult> Batch([FromBody] BatchInsertDto request, CancellationToken cancellationToken)
        {
            try
            {
                return Ok(await _candidates.BatchInsertAsync(request, cancellationToken));
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("locked", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { rule = "FR-035", message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-036", message = ex.Message });
            }
        }
    }
}
