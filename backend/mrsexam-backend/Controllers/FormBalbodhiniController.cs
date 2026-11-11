using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    /// <summary>
    /// Legacy-compatible FormBalbodhini routes. Prefer /api/candidates for Balbodhini BRD behavior.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public sealed class FormBalbodhiniController : ControllerBase
    {
        private readonly MrsexamContext _db;
        private readonly CandidateService _candidates;

        public FormBalbodhiniController(MrsexamContext db, CandidateService candidates)
        {
            _db = db;
            _candidates = candidates;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.FormBalbodhinis.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        [HttpPost("batch-insert")]
        public async Task<IActionResult> BatchInsert([FromBody] BatchInsertRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _candidates.BatchInsertAsync(new BatchInsertDto
                {
                    CentreCode = request.CentreCode ?? string.Empty,
                    RegionNo = request.RegionNo,
                    StartRollNo = request.StartRollNo,
                    EndRollNo = request.EndRollNo,
                    StartName = request.StartName,
                    EndName = request.EndName
                }, cancellationToken);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] short? sessionNo = null,
            CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 1000) pageSize = 1000;

            var query = _db.FormBalbodhinis.AsNoTracking();
            if (sessionNo.HasValue)
                query = query.Where(f => f.SessionNo == sessionNo.Value);

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            var items = await query
                .OrderBy(f => f.FormCentre)
                .ThenBy(f => f.SrNo)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return Ok(new
            {
                data = items,
                pageNumber,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage = pageNumber < totalPages,
                hasPreviousPage = pageNumber > 1,
                sessionNo
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.FormBalbodhinis.AsNoTracking().FirstOrDefaultAsync(c => c.SrNo == id, cancellationToken);
            return item is null ? NotFound() : Ok(item);
        }

        [HttpGet("session/{sessionNo}")]
        public async Task<IActionResult> GetBySession(short sessionNo, CancellationToken cancellationToken)
        {
            var list = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == sessionNo)
                .OrderBy(f => f.FormCentre)
                .ThenBy(f => f.SrNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FormBalbodhini model, CancellationToken cancellationToken)
        {
            try
            {
                var created = await _candidates.CreateAsync(new CandidateWriteRequest
                {
                    Name = model.Name ?? string.Empty,
                    Gender = model.Gender ?? string.Empty,
                    FormCentre = model.FormCentre ?? string.Empty,
                    ExamCentre = model.ExamCentre ?? string.Empty,
                    UserId = model.UserId
                }, cancellationToken);
                return CreatedAtAction(nameof(Get), new { id = created.SrNo }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("insert-after/{previousSrNo:int}")]
        public async Task<IActionResult> InsertAfter(int previousSrNo, [FromBody] FormBalbodhini model, CancellationToken cancellationToken)
        {
            try
            {
                var created = await _candidates.InsertBetweenAsync(new InsertBetweenRequest
                {
                    PreviousSrNo = previousSrNo,
                    Candidate = new CandidateWriteRequest
                    {
                        Name = model.Name ?? string.Empty,
                        Gender = model.Gender ?? string.Empty,
                        FormCentre = model.FormCentre ?? string.Empty,
                        ExamCentre = model.ExamCentre ?? model.FormCentre ?? string.Empty,
                        UserId = model.UserId
                    }
                }, cancellationToken);
                return CreatedAtAction(nameof(Get), new { id = created.SrNo }, created);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("update-marks")]
        public async Task<IActionResult> UpdateMarks([FromBody] UpdateMarksRequest req, CancellationToken cancellationToken)
        {
            if (req.RollNo is null || req.SessionNo is null) return BadRequest("rollNo and sessionNo are required");

            var item = await _db.FormBalbodhinis.FirstOrDefaultAsync(
                f => f.RollNo == req.RollNo && f.SessionNo == req.SessionNo,
                cancellationToken);
            if (item is null) return NotFound();

            if (req.Marks1 != null) item.Marks1 = req.Marks1;
            if (req.TotMarks.HasValue) item.TotMarks = req.TotMarks;
            if (req.Grade != null) item.Grade = req.Grade;
            if (req.Result != null) item.Result = req.Result;
            if (req.UndFlag != null) item.UndFlag = req.UndFlag;
            if (req.UndClass != null) item.UndClass = req.UndClass;

            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] FormBalbodhini model, CancellationToken cancellationToken)
        {
            if (id != model.SrNo) return BadRequest();

            try
            {
                var updated = await _candidates.UpdateAsync(id, new CandidateWriteRequest
                {
                    Name = model.Name ?? string.Empty,
                    Gender = model.Gender ?? string.Empty,
                    FormCentre = model.FormCentre ?? string.Empty,
                    ExamCentre = model.ExamCentre ?? string.Empty,
                    UserId = model.UserId
                }, cancellationToken);
                return Ok(updated);
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _candidates.DeleteAsync(id, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}
