using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class ParametersController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public ParametersController(MrsexamContext db) => _db = db;

        // GET: api/parameters
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Parameters.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/parameters/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Parameters.AsNoTracking().FirstOrDefaultAsync(c => c.ParameterId == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        [HttpGet("first")]
        public async Task<IActionResult> GetFirst(CancellationToken cancellationToken)
        {
            var item = await _db.Parameters.AsNoTracking().FirstOrDefaultAsync(cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/parameters
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Parameter model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Parameters.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.ParameterId }, model);
        }

        // PUT: api/parameters/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Parameter model, CancellationToken cancellationToken)
        {
            if (id != model.ParameterId) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Parameters.AnyAsync(e => e.ParameterId == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/parameters/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Parameters.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Parameters.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
