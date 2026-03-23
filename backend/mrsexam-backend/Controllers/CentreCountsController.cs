using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class CentreCountsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public CentreCountsController(MrsexamContext db) => _db = db;

        // GET: api/centrecounts
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.CentreCounts.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/centrecounts/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.CentreCounts.AsNoTracking().FirstOrDefaultAsync(c => c.CentreCountId == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // GET: api/centrecounts/centre/{centreNo}
        [HttpGet("centre/{centreNo}")]
        public async Task<IActionResult> GetByCentre(string centreNo, CancellationToken cancellationToken)
        {
            var list = await _db.CentreCounts.AsNoTracking()
                .Where(c => c.CentreNo == centreNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/centrecounts/region/{regionNo}
        [HttpGet("region/{regionNo}")]
        public async Task<IActionResult> GetByRegion(int regionNo, CancellationToken cancellationToken)
        {
            var list = await _db.CentreCounts.AsNoTracking()
                .Where(c => c.RegionNo == regionNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // POST: api/centrecounts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CentreCount model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.CentreCounts.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.CentreCountId }, model);
        }

        // PUT: api/centrecounts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CentreCount model, CancellationToken cancellationToken)
        {
            if (id != model.CentreCountId) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.CentreCounts.AnyAsync(e => e.CentreCountId == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/centrecounts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.CentreCounts.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.CentreCounts.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
