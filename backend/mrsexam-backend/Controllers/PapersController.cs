using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class PapersController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public PapersController(MrsexamContext db) => _db = db;

        // GET: api/papers
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Papers.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/papers/paged?pageNumber=1&pageSize=50&examNo=123
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50,
            [FromQuery] int? examNo = null,
            CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 1000) pageSize = 1000;

            var query = _db.Papers.AsNoTracking();

            if (examNo.HasValue)
            {
                query = query.Where(p => p.ExamNo == examNo.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderBy(p => p.PaperNo).ThenBy(p => p.ExamNo)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var response = new
            {
                data = items,
                pageNumber,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage = pageNumber < totalPages,
                hasPreviousPage = pageNumber > 1,
                examNo
            };

            return Ok(response);
        }

        // GET: api/papers/exam/{examNo}
        [HttpGet("exam/{examNo}")]
        public async Task<IActionResult> GetByExam(int examNo, CancellationToken cancellationToken)
        {
            var list = await _db.Papers.AsNoTracking()
                .Where(p => p.ExamNo == examNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/papers/{paperNo}/{examNo}
        [HttpGet("{paperNo}/{examNo}")]
        public async Task<IActionResult> Get(int paperNo, int examNo, CancellationToken cancellationToken)
        {
            var item = await _db.Papers.AsNoTracking()
                .FirstOrDefaultAsync(c => c.PaperNo == paperNo && c.ExamNo == examNo, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/papers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Paper model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Papers.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { paperNo = model.PaperNo, examNo = model.ExamNo }, model);
        }

        // PUT: api/papers/{paperNo}/{examNo}
        [HttpPut("{paperNo}/{examNo}")]
        public async Task<IActionResult> Update(int paperNo, int examNo, [FromBody] Paper model, CancellationToken cancellationToken)
        {
            if (paperNo != model.PaperNo || examNo != model.ExamNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Papers.AnyAsync(e => e.PaperNo == paperNo && e.ExamNo == examNo, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/papers/{paperNo}/{examNo}
        [HttpDelete("{paperNo}/{examNo}")]
        public async Task<IActionResult> Delete(int paperNo, int examNo, CancellationToken cancellationToken)
        {
            var item = await _db.Papers.FindAsync(new object[] { paperNo, examNo }, cancellationToken);
            if (item is null) return NotFound();

            _db.Papers.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
