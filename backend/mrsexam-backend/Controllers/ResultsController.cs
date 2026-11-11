using Microsoft.AspNetCore.Mvc;
using mrsexam_backend.Dtos;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/results")]
    public sealed class ResultsController : ControllerBase
    {
        private readonly ResultService _results;
        private readonly SessionService _sessions;

        public ResultsController(ResultService results, SessionService sessions)
        {
            _results = results;
            _sessions = sessions;
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
                return BadRequest(new { rule = "FR-060", message = ex.Message });
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
                return BadRequest(new { rule = "FR-065", message = ex.Message });
            }
        }

        [HttpPost("lock/reset")]
        public async Task<IActionResult> ResetLock(CancellationToken cancellationToken)
        {
            try
            {
                await _sessions.ResetBalbodhiniLockAsync(cancellationToken);
                return Ok(new { resgenBalbodhini = "N" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { rule = "FR-070", message = ex.Message });
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
                return BadRequest(new { rule = "FR-071", message = ex.Message });
            }
        }

        [HttpPut("correction")]
        public async Task<IActionResult> SaveCorrection([FromBody] CorrectionSaveRequest request, CancellationToken cancellationToken)
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
                return BadRequest(new { rule = "FR-072", message = ex.Message });
            }
        }
    }
}
