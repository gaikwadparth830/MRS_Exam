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
            if (!TryNormalizeCenter(model, out var error))
                return BadRequest(new { message = error });

            _db.Centres.Add(model);
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = FriendlyDbMessage(ex, "Could not create center.") });
            }

            return CreatedAtAction(nameof(Get), new { id = model.CentreNo }, model);
        }

        // PUT: api/centers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Center model, CancellationToken cancellationToken)
        {
            if (id != model.CentreNo) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!TryNormalizeCenter(model, out var error))
                return BadRequest(new { message = error });

            var exists = await _db.Centres.AnyAsync(e => e.CentreNo == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = FriendlyDbMessage(ex, "Could not update center.") });
            }

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

        private static bool TryNormalizeCenter(Center model, out string? error)
        {
            model.CentreNo = model.CentreNo?.Trim() ?? string.Empty;
            model.AddressTo = NullIfBlank(model.AddressTo);
            model.CentreName = NullIfBlank(model.CentreName);
            model.DistrictName = NullIfBlank(model.DistrictName);
            model.Add1 = NullIfBlank(model.Add1);
            model.Add2 = NullIfBlank(model.Add2);
            model.City = NullIfBlank(model.City);
            model.Pincode = NullIfBlank(model.Pincode);
            model.Phone = NullIfBlank(model.Phone);
            model.PanditFlag = NullIfBlank(model.PanditFlag);
            model.CloseFlag = NullIfBlank(model.CloseFlag);

            if (string.IsNullOrWhiteSpace(model.CentreNo))
            {
                error = "Center No is required and cannot be blank.";
                return false;
            }

            // Allow Marathi + digits/slash codes such as ठा/001 (max 10 chars in DB).
            if (model.CentreNo.Length > 10)
            {
                error = "Center No cannot exceed 10 characters (example: ठा/001).";
                return false;
            }

            error = null;
            return true;
        }

        private static string? NullIfBlank(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrEmpty(trimmed) ? null : trimmed;
        }

        private static string FriendlyDbMessage(DbUpdateException ex, string fallback)
        {
            var sql = ex.InnerException?.Message ?? ex.Message;
            if (sql.Contains("disallow_zero_length", StringComparison.OrdinalIgnoreCase))
            {
                return "One or more text fields are blank. Enter a value or leave the field empty.";
            }

            return fallback;
        }
    }
}
