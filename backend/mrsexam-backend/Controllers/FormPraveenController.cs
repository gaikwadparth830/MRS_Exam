using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class FormPraveenController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public FormPraveenController(MrsexamContext db) => _db = db;

        // GET: api/formpraveen
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.FormPraveens.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpraveen/paged?pageNumber=1&pageSize=50&sessionNo=123
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50,
            [FromQuery] short? sessionNo = null,
            CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 1000) pageSize = 1000;

            var query = _db.FormPraveens.AsNoTracking();

            if (sessionNo.HasValue)
            {
                query = query.Where(f => f.SessionNo == sessionNo.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderBy(f => f.RollNo).ThenBy(f => f.RegionNo).ThenBy(f => f.SessionNo)
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

        // GET: api/formpraveen/{rollNo}/{regionNo}/{sessionNo}
        [HttpGet("{rollNo}/{regionNo}/{sessionNo}")]
        public async Task<IActionResult> Get(short rollNo, int regionNo, short sessionNo, CancellationToken cancellationToken)
        {
            var item = await _db.FormPraveens.AsNoTracking()
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.RegionNo == regionNo && f.SessionNo == sessionNo, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // GET: api/formpraveen/session/{sessionNo}
        [HttpGet("session/{sessionNo}")]
        public async Task<IActionResult> GetBySession(short sessionNo, CancellationToken cancellationToken)
        {
            var list = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.SessionNo == sessionNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpraveen/region/{regionNo}
        [HttpGet("region/{regionNo}")]
        public async Task<IActionResult> GetByRegion(int regionNo, CancellationToken cancellationToken)
        {
            var list = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.RegionNo == regionNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpraveen/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId, CancellationToken cancellationToken)
        {
            var list = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.UserId == userId)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpraveen/centre/{centreCode}
        [HttpGet("centre/{centreCode}")]
        public async Task<IActionResult> GetByCentre(int centreCode, CancellationToken cancellationToken)
        {
            var list = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.DummyCentreCode == centreCode)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpraveen/name/{name}
        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
        {
            var list = await _db.FormPraveens.AsNoTracking()
                .Where(f => f.Name != null && f.Name.Contains(name))
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // POST: api/formpraveen
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FormPraveen model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.FormPraveens.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { rollNo = model.RollNo, regionNo = model.RegionNo, sessionNo = model.SessionNo }, model);
        }

        // PUT: api/formpraveen/{rollNo}/{regionNo}/{sessionNo}
        [HttpPut("{rollNo}/{regionNo}/{sessionNo}")]
        public async Task<IActionResult> Update(short rollNo, int regionNo, short sessionNo, [FromBody] FormPraveen model, CancellationToken cancellationToken)
        {
            if (rollNo != model.RollNo || regionNo != model.RegionNo || sessionNo != model.SessionNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.FormPraveens.AnyAsync(e => e.RollNo == rollNo && e.RegionNo == regionNo && e.SessionNo == sessionNo, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/formpraveen/{rollNo}/{regionNo}/{sessionNo}
        [HttpDelete("{rollNo}/{regionNo}/{sessionNo}")]
        public async Task<IActionResult> Delete(short rollNo, int regionNo, short sessionNo, CancellationToken cancellationToken)
        {
            var item = await _db.FormPraveens.FindAsync(new object[] { rollNo, regionNo, sessionNo }, cancellationToken);
            if (item is null) return NotFound();

            _db.FormPraveens.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
