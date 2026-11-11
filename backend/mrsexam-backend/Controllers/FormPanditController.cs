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

        // PATCH: api/formpandit/update-marks
        [HttpPatch("update-marks")]
        public async Task<IActionResult> UpdateMarks([FromBody] Models.UpdateMarksRequest req, CancellationToken cancellationToken)
        {
            if (req.RollNo is null || req.SessionNo is null) return BadRequest("rollNo and sessionNo are required");

            var item = await _db.FormPandits.FirstOrDefaultAsync(f => f.RollNo == req.RollNo && f.SessionNo == req.SessionNo, cancellationToken);
            if (item is null) return NotFound();

            // update fields if provided
            if (req.Marks1 != null) item.Marks1 = req.Marks1;
            if (req.Marks2 != null) item.Marks2 = req.Marks2;
            if (req.Marks3 != null) item.Marks3 = req.Marks3;
            if (req.Marks4 != null) item.Marks4 = req.Marks4;
            if (req.Marks5 != null) item.Marks5 = req.Marks5;
            if (req.Marks6 != null) item.Marks6 = req.Marks6;
            if (req.OralMarks != null) item.OralMarks = req.OralMarks;
            if (req.TotMarks.HasValue) item.TotMarks = req.TotMarks;
            if (req.Grade != null) item.Grade = req.Grade;
            if (req.Result != null) item.Result = req.Result;
            if (req.UndFlag != null) item.UndFlag = req.UndFlag;
            if (req.UndClass != null) item.UndClass = req.UndClass;

            await _db.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        // POST: api/formpandit/batch-insert
        [HttpPost("batch-insert")]
        public async Task<IActionResult> BatchInsert([FromBody] Models.BatchInsertRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (request.EndRollNo < request.StartRollNo)
                return BadRequest("EndRollNo must be greater than or equal to StartRollNo.");

            var duplicates = await _db.FormPandits
                .AnyAsync(f => f.SessionNo == request.SessionNo && f.RollNo >= request.StartRollNo && f.RollNo <= request.EndRollNo, cancellationToken);

            if (duplicates)
                return Conflict("Duplicate roll numbers found in the specified session.");

            var entities = new List<FormPandit>();
            for (var r = request.StartRollNo; r <= request.EndRollNo; r++)
            {
                entities.Add(new FormPandit
                {
                    RollNo = (short)r,
                    SessionNo = (short)request.SessionNo,
                    Name = r == request.StartRollNo ? request.StartName : (r == request.EndRollNo ? request.EndName : null),
                    FormCentre = request.CentreCode,
                    ExamCentre = request.CentreCode,
                    DummyCentreCode = 0
                });
            }

            await _db.FormPandits.AddRangeAsync(entities, cancellationToken);
            try
            {
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Batch insert failed.", ex);
            }

            return Ok(new { inserted = entities.Count });
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

        // POST: api/formpandit/insert-after/{previousRollNo}/{sessionNo}
        [HttpPost("insert-after/{previousRollNo}/{sessionNo}")]
        public async Task<IActionResult> InsertAfter(short previousRollNo, short sessionNo, [FromBody] FormPandit model, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var lastRollNo = await _db.FormPandits.Where(f => f.SessionNo == sessionNo).Select(f => (short?)f.RollNo).MaxAsync(cancellationToken) ?? 0;
            var newRollNo = (previousRollNo >= 0 && previousRollNo <= lastRollNo) ? (short)(previousRollNo + 1) : (short)(lastRollNo + 1);

            await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                if (newRollNo <= lastRollNo)
                {
                    await _db.Database.ExecuteSqlRawAsync(
                        "UPDATE FORM_PANDIT SET ROLL_NO = ROLL_NO + 1 WHERE SESSION_NO = {0} AND ROLL_NO >= {1}",
                        new object[] { sessionNo, newRollNo },
                        cancellationToken);
                }

                model.RollNo = newRollNo;
                model.SessionNo = sessionNo;
                _db.FormPandits.Add(model);
                await _db.SaveChangesAsync(cancellationToken);
                await tx.CommitAsync(cancellationToken);

                return CreatedAtAction(nameof(Get), new { rollNo = model.RollNo, sessionNo = model.SessionNo }, model);
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync(cancellationToken);
                throw new InvalidOperationException("An error occurred while inserting the record.", ex);
            }
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
