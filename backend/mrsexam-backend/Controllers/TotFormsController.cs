using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class TotFormsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public TotFormsController(MrsexamContext db) => _db = db;

        // GET: api/totforms
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.TotForms.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/totforms/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.TotForms.AsNoTracking().FirstOrDefaultAsync(c => c.TotFormsId == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // GET: api/totforms/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId, CancellationToken cancellationToken)
        {
            var list = await _db.TotForms.AsNoTracking()
                .Where(t => t.UserId == userId)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/totforms/exam/{exam}
        [HttpGet("exam/{exam}")]
        public async Task<IActionResult> GetByExam(string exam, CancellationToken cancellationToken)
        {
            var list = await _db.TotForms.AsNoTracking()
                .Where(t => t.Exam == exam)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // POST: api/totforms
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TotForm model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.TotForms.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.TotFormsId }, model);
        }

        // PUT: api/totforms/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TotForm model, CancellationToken cancellationToken)
        {
            if (id != model.TotFormsId) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.TotForms.AnyAsync(e => e.TotFormsId == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/totforms/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.TotForms.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.TotForms.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
