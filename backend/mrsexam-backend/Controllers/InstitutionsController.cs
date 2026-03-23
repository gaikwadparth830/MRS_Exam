using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class InstitutionsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public InstitutionsController(MrsexamContext db) => _db = db;

        // GET: api/institutions
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Institutions.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/institutions/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Institutions.AsNoTracking().FirstOrDefaultAsync(c => c.InstitutionId == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/institutions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Institution model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Institutions.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.InstitutionId }, model);
        }

        // PUT: api/institutions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Institution model, CancellationToken cancellationToken)
        {
            if (id != model.InstitutionId) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Institutions.AnyAsync(e => e.InstitutionId == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/institutions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Institutions.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Institutions.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
