using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class FormPrathamikController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public FormPrathamikController(MrsexamContext db) => _db = db;

        // GET: api/formprathamik
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.FormPrathamiks.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formprathamik/paged?pageNumber=1&pageSize=50
        // GET: api/formprathamik/paged?pageNumber=1&pageSize=50&sessionNo=123
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50,
            [FromQuery] short? sessionNo = null,
            CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 1000) pageSize = 1000; // Max limit

            var query = _db.FormPrathamiks.AsNoTracking();

            if (sessionNo.HasValue)
            {
                query = query.Where(f => f.SessionNo == sessionNo.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderBy(f => f.SrNo)
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
                sessionNo
            };

            return Ok(response);
        }

        // GET: api/formprathamik/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
        {
            var item = await _db.FormPrathamiks.AsNoTracking().FirstOrDefaultAsync(c => c.SrNo == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // GET: api/formprathamik/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId, CancellationToken cancellationToken)
        {
            var list = await _db.FormPrathamiks.AsNoTracking()
                .Where(f => f.UserId == userId)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formprathamik/centre/{centreCode}
        [HttpGet("centre/{centreCode}")]
        public async Task<IActionResult> GetByCentre(int centreCode, CancellationToken cancellationToken)
        {
            var list = await _db.FormPrathamiks.AsNoTracking()
                .Where(f => f.DummyCentreCode == centreCode)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formprathamik/name/{name}
        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
        {
            var list = await _db.FormPrathamiks.AsNoTracking()
                .Where(f => f.Name != null && f.Name.Contains(name))
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formprathamik/session/{sessionNo}
        [HttpGet("session/{sessionNo}")]
        public async Task<IActionResult> GetBySession(short sessionNo, CancellationToken cancellationToken)
        {
            var list = await _db.FormPrathamiks.AsNoTracking()
                .Where(f => f.SessionNo == sessionNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formprathamik/region/{regionNo}
        [HttpGet("region/{regionNo}")]
        public async Task<IActionResult> GetByRegion(int regionNo, CancellationToken cancellationToken)
        {
            var list = await _db.FormPrathamiks.AsNoTracking()
                .Where(f => f.RegionNo == regionNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // POST: api/formprathamik
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FormPrathamik model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.FormPrathamiks.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { id = model.SrNo }, model);
        }

        // PUT: api/formprathamik/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FormPrathamik model, CancellationToken cancellationToken)
        {
            if (id != model.SrNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.FormPrathamiks.AnyAsync(e => e.SrNo == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/formprathamik/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var item = await _db.FormPrathamiks.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.FormPrathamiks.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
