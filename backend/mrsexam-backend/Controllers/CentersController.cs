using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class CentersController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public CentersController(MrsexamContext db) => _db = db;

        // GET: api/centers
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Centres.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/centers/paged?pageNumber=1&pageSize=50
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50,
            CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 1000) pageSize = 1000;

            var totalCount = await _db.Centres.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await _db.Centres
                .AsNoTracking()
                .OrderBy(c => c.CentreNo)
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
                hasPreviousPage = pageNumber > 1
            };

            return Ok(response);
        }

        // GET: api/centers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
        {
            var item = await _db.Centres.AsNoTracking().FirstOrDefaultAsync(c => c.CentreNo == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/centers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Center model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.Centres.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.CentreNo }, model);
        }

        // PUT: api/centers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Center model, CancellationToken cancellationToken)
        {
            if (id != model.CentreNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.Centres.AnyAsync(e => e.CentreNo == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/centers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        {
            var item = await _db.Centres.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Centres.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
