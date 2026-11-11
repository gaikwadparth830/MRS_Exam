using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Models;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class DistrictsController : ControllerBase
    {
        private readonly MrsexamContext _db;

        public DistrictsController(MrsexamContext db) => _db = db;

        // GET: api/districts
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var list = await _db.Districts.AsNoTracking().ToListAsync(cancellationToken);
            return Ok(list);
        }

        // GET: api/districts/paged?pageNumber=1&pageSize=50
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 50,
            CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 50;
            if (pageSize > 1000) pageSize = 1000;

            var totalCount = await _db.Districts.CountAsync(cancellationToken);
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var items = await _db.Districts
                .AsNoTracking()
                .OrderBy(d => d.DistrictName)
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

        // GET: api/districts/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
        {
            var item = await _db.Districts.AsNoTracking().FirstOrDefaultAsync(c => c.DistrictName == id, cancellationToken);
            if (item is null) return NotFound();
            return Ok(item);
        }

        // POST: api/districts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] District model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!TryNormalizeDistrict(model, out var error))
                return BadRequest(new { message = error });

            _db.Districts.Add(model);
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = FriendlyDbMessage(ex, "Could not create district.") });
            }

            return CreatedAtAction(nameof(Get), new { id = model.DistrictName }, model);
        }

        // PUT: api/districts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] District model, CancellationToken cancellationToken)
        {
            if (id != model.DistrictName) return BadRequest();
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!TryNormalizeDistrict(model, out var error))
                return BadRequest(new { message = error });

            var exists = await _db.Districts.AnyAsync(e => e.DistrictName == id, cancellationToken);
            if (!exists) return NotFound();

            _db.Entry(model).State = EntityState.Modified;
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(new { message = FriendlyDbMessage(ex, "Could not update district.") });
            }

            return NoContent();
        }

        private static bool TryNormalizeDistrict(District model, out string? error)
        {
            model.DistrictName = model.DistrictName?.Trim() ?? string.Empty;
            // DB CHECK constraints disallow zero-length strings; blank optional fields must be NULL.
            model.ShortName = NullIfBlank(model.ShortName);
            model.DistrictCity = NullIfBlank(model.DistrictCity);

            if (string.IsNullOrWhiteSpace(model.DistrictName))
            {
                error = "District Name (Marathi) is required and cannot be blank.";
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
            if (sql.Contains("DISTRICT_CITY", StringComparison.OrdinalIgnoreCase)
                && sql.Contains("disallow_zero_length", StringComparison.OrdinalIgnoreCase))
            {
                return "District City cannot be blank. Enter a Marathi city name, or leave it empty (it will be stored as blank/NULL).";
            }

            if (sql.Contains("SHORT_NAME", StringComparison.OrdinalIgnoreCase)
                && sql.Contains("disallow_zero_length", StringComparison.OrdinalIgnoreCase))
            {
                return "Short Name cannot be blank. Enter a value or leave it empty.";
            }

            if (sql.Contains("DISTRICT_NAME", StringComparison.OrdinalIgnoreCase)
                && sql.Contains("disallow_zero_length", StringComparison.OrdinalIgnoreCase))
            {
                return "District Name (Marathi) is required and cannot be blank.";
            }

            return fallback;
        }

        // DELETE: api/districts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        {
            var item = await _db.Districts.FindAsync(new object[] { id }, cancellationToken);
            if (item is null) return NotFound();

            _db.Districts.Remove(item);
            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
