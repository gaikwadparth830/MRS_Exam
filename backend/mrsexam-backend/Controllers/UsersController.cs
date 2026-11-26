using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;
using mrsexam_backend.Services;

namespace mrsexam_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class UsersController : ControllerBase
    {
        private readonly MrsexamContext _db;
        private readonly PermissionService _permissions;
        private readonly UserAdminService _userAdmin;

        public UsersController(MrsexamContext db, PermissionService permissions, UserAdminService userAdmin)
        {
            _db = db;
            _permissions = permissions;
            _userAdmin = userAdmin;
        }

        // GET: api/users
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                var list = await _db.Users.AsNoTracking().ToListAsync(cancellationToken);
                return Ok(list);
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // GET: api/users/admin
        [HttpGet("admin")]
        public async Task<IActionResult> AdminList(CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                return Ok(await _userAdmin.ListAsync(cancellationToken));
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // GET: api/users/admin/{userId}
        [HttpGet("admin/{userId}")]
        public async Task<IActionResult> AdminGet(string userId, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                var item = await _userAdmin.GetAsync(userId, cancellationToken);
                if (item is null) return NotFound(new { message = $"User '{userId}' was not found." });
                return Ok(item);
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // POST: api/users/admin
        [HttpPost("admin")]
        public async Task<IActionResult> AdminCreate([FromBody] UserAdminUpsertRequest request, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                var created = await _userAdmin.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(AdminGet), new { userId = created.UserId }, created);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not allowed", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("identity is required", StringComparison.OrdinalIgnoreCase))
                {
                    return Unauthorized(new { success = false, message = ex.Message });
                }

                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/users/admin/{userId}
        [HttpPut("admin/{userId}")]
        public async Task<IActionResult> AdminUpdate(
            string userId,
            [FromBody] UserAdminUpsertRequest request,
            CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                var updated = await _userAdmin.UpdateAsync(userId, request, cancellationToken);
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not allowed", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("identity is required", StringComparison.OrdinalIgnoreCase))
                {
                    return Unauthorized(new { success = false, message = ex.Message });
                }

                if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
                    return NotFound(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/users/admin/{userId}
        [HttpDelete("admin/{userId}")]
        public async Task<IActionResult> AdminDelete(string userId, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                await _userAdmin.DeleteAsync(userId, _permissions.GetCurrentUserId(), cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("not allowed", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("identity is required", StringComparison.OrdinalIgnoreCase))
                {
                    return Unauthorized(new { success = false, message = ex.Message });
                }

                if (ex.Message.Contains("was not found", StringComparison.OrdinalIgnoreCase))
                    return NotFound(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/users/me
        [HttpGet("me")]
        public async Task<IActionResult> Me(CancellationToken cancellationToken)
        {
            try
            {
                var claims = await _permissions.GetClaimsForCurrentUserAsync(cancellationToken);
                if (!claims.Success)
                    return NotFound(claims);
                return Ok(claims);
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                var item = await _db.Users.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == id, cancellationToken);
                if (item is null) return NotFound();
                return Ok(item);
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // POST: api/users/validate
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateUser([FromBody] LoginRequest request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.UserId) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { success = false, message = "UserId and Password are required" });
            }

            var user = await _db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == request.UserId && u.Password == request.Password, cancellationToken);

            if (user is null)
            {
                return Ok(new { success = false, message = "Invalid credentials" });
            }

            var claims = await _permissions.GetClaimsAsync(user.UserId, cancellationToken);
            claims.Success = true;
            claims.Message = "Login successful";
            claims.UserId = user.UserId;
            claims.UserKey = user.UserKey;
            claims.AccessToken = user.UserKey ?? user.UserId;

            return Ok(new
            {
                success = claims.Success,
                message = claims.Message,
                userId = claims.UserId,
                userKey = claims.UserKey,
                accessToken = claims.AccessToken,
                isSupervisor = claims.IsSupervisor,
                role = claims.Role,
                exams = claims.Exams,
                centres = claims.Centres,
                features = claims.Features,
            });
        }

        // POST: api/users
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User model, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                if (!ModelState.IsValid) return BadRequest(ModelState);

                _db.Users.Add(model);
                await _db.SaveChangesAsync(cancellationToken);

                return CreatedAtAction(nameof(Get), new { id = model.UserId }, model);
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User model, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                if (id != model.UserId) return BadRequest();
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var exists = await _db.Users.AnyAsync(e => e.UserId == id, cancellationToken);
                if (!exists) return NotFound();

                _db.Entry(model).State = EntityState.Modified;
                await _db.SaveChangesAsync(cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
        {
            try
            {
                await _permissions.EnsureFeatureAsync(PermissionFeatures.UserAdmin, cancellationToken);
                var item = await _db.Users.FindAsync(new object[] { id }, cancellationToken);
                if (item is null) return NotFound();

                _db.Users.Remove(item);
                await _db.SaveChangesAsync(cancellationToken);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
        }
    }

    public sealed class LoginRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
