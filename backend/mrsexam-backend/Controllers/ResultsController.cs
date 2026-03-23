using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class ResultsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public ResultsController(MrsexamContext db) => _db = db;

        // GET: api/results
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Results.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/results/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Results.AsNoTracking().FirstOrDefaultAsync(c => c.ResultId == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/results
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Result model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Results.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.ResultId }, model);
        }

        // PUT: api/results/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Result model, CancellationToken cancellationToken)
        {
            if (id != model.ResultId) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Results.AnyAsync(e => e.ResultId == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/results/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.Results.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Results.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
