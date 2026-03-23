using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class AttSheetsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public AttSheetsController(MrsexamContext db) => _db = db;

        // GET: api/attsheets
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.AttSheets.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/attsheets/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.AttSheets.AsNoTracking().FirstOrDefaultAsync(c => c.AttSheetId == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // GET: api/attsheets/centre/{examCentre}
        [HttpGet("centre/{examCentre}")]
        public async Task<IActionResult> GetByCentre(string examCentre, CancellationToken cancellationToken)
        {
            var list = await _db.AttSheets.AsNoTracking()
                .Where(a => a.ExamCentre == examCentre)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // POST: api/attsheets
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AttSheet model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.AttSheets.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.AttSheetId }, model);
        }

        // PUT: api/attsheets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AttSheet model, CancellationToken cancellationToken)
        {
            if (id != model.AttSheetId) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.AttSheets.AnyAsync(e => e.AttSheetId == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/attsheets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.AttSheets.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.AttSheets.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
