using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class FormPanditController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public FormPanditController(MrsexamContext db) => _db = db;

        // GET: api/formpandit
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.FormPandits.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpandit/paged?pageNumber=1&pageSize=50&sessionNo=123
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

            var query = _db.FormPandits.AsNoTracking();

            if (sessionNo.HasValue)
            {
                query = query.Where(f => f.SessionNo == sessionNo.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await query
                .OrderBy(f => f.RollNo).ThenBy(f => f.SessionNo)
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

        // GET: api/formpandit/{rollNo}/{sessionNo}
        [HttpGet("{rollNo}/{sessionNo}")]
        public async Task<IActionResult> Get(short rollNo, short sessionNo, CancellationToken cancellationToken)
        {
            var item = await _db.FormPandits.AsNoTracking()
                .FirstOrDefaultAsync(f => f.RollNo == rollNo && f.SessionNo == sessionNo, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // GET: api/formpandit/session/{sessionNo}
        [HttpGet("session/{sessionNo}")]
        public async Task<IActionResult> GetBySession(short sessionNo, CancellationToken cancellationToken)
        {
            var list = await _db.FormPandits.AsNoTracking()
                .Where(f => f.SessionNo == sessionNo)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpandit/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId, CancellationToken cancellationToken)
        {
            var list = await _db.FormPandits.AsNoTracking()
                .Where(f => f.UserId == userId)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpandit/centre/{centreCode}
        [HttpGet("centre/{centreCode}")]
        public async Task<IActionResult> GetByCentre(int centreCode, CancellationToken cancellationToken)
        {
            var list = await _db.FormPandits.AsNoTracking()
                .Where(f => f.DummyCentreCode == centreCode)
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/formpandit/name/{name}
        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name, CancellationToken cancellationToken)
        {
            var list = await _db.FormPandits.AsNoTracking()
                .Where(f => f.Name != null && f.Name.Contains(name))
                .ToListAsync(cancellationToken);
            return Ok(list);
        }

        // POST: api/formpandit
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FormPandit model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            _db.FormPandits.Add(model);
            await _db.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(Get), new { rollNo = model.RollNo, sessionNo = model.SessionNo }, model);
        }

        // PUT: api/formpandit/{rollNo}/{sessionNo}
        [HttpPut("{rollNo}/{sessionNo}")]
        public async Task<IActionResult> Update(short rollNo, short sessionNo, [FromBody] FormPandit model, CancellationToken cancellationToken)
        {
            if (rollNo != model.RollNo || sessionNo != model.SessionNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var exists = await _db.FormPandits.AnyAsync(e => e.RollNo == rollNo && e.SessionNo == sessionNo, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // DELETE: api/formpandit/{rollNo}/{sessionNo}
        [HttpDelete("{rollNo}/{sessionNo}")]
        public async Task<IActionResult> Delete(short rollNo, short sessionNo, CancellationToken cancellationToken)
        {
            var item = await _db.FormPandits.FindAsync(new object[] { rollNo, sessionNo }, cancellationToken);
            if (item is null) return NotFound();

            _db.FormPandits.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
