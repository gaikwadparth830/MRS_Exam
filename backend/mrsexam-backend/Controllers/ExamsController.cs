using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class ExamsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public ExamsController(MrsexamContext db) => _db = db;

        // GET: api/exams
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Exams.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/exams/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Exams.AsNoTracking().FirstOrDefaultAsync(c => c.ExamNo == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/exams
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Exam model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Exams.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.ExamNo }, model);
        }

        // PUT: api/exams/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Exam model, CancellationToken cancellationToken)
        {
            if (id != model.ExamNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Exams.AnyAsync(e => e.ExamNo == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/exams/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Exams.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Exams.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
