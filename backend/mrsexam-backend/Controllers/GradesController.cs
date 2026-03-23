using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class GradesController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public GradesController(MrsexamContext db) => _db = db;

        // GET: api/grades
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Grades.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/grades/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
        {
            var item = await _db.Grades.AsNoTracking().FirstOrDefaultAsync(c => c.GradeNo == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/grades
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Grade model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Grades.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.GradeNo }, model);
        }

        // PUT: api/grades/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Grade model, CancellationToken cancellationToken)
        {
            if (id != model.GradeNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Grades.AnyAsync(e => e.GradeNo == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/grades/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        {
            var item = await _db.Grades.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Grades.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
