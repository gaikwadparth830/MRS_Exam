using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;
using mrsexam_backend.Models;

namespace mrsexam_backend.Services
{
    public sealed class RollNumberService
    {
        private readonly MrsexamContext _db;
        private readonly SessionService _sessions;
        private readonly CentreResolver _centres;

        public RollNumberService(MrsexamContext db, SessionService sessions, CentreResolver centres)
        {
            _db = db;
            _sessions = sessions;
            _centres = centres;
        }

        public async Task<RollPreviewResponse> PreviewAsync(RollPreviewRequest request, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            ValidateRange(request);

            var forms = await GetCentreFormsAsync(session.SessionNo, request.FormCentre, cancellationToken);
            var rollCount = request.LastRollNo - request.FirstRollNo + 1;
            if (forms.Count < rollCount)
                throw new InvalidOperationException("That many forms are not entered for the centre.");

            var assignments = forms.Take(rollCount)
                .Select((form, index) => new RollAssignmentRow
                {
                    SrNo = form.SrNo,
                    Name = form.Name,
                    RollNo = request.FirstRollNo + index
                })
                .ToList();

            return new RollPreviewResponse
            {
                FormCount = forms.Count,
                RollCount = rollCount,
                LastCandidateName = assignments.LastOrDefault()?.Name,
                Assignments = assignments
            };
        }

        public async Task<RollPreviewResponse> CommitAsync(RollCommitRequest request, CancellationToken cancellationToken)
        {
            if (!request.Confirmed)
                throw new InvalidOperationException("Confirmation is required before roll numbers are saved.");

            await _sessions.EnsureWritableAsync(cancellationToken);
            var preview = await PreviewAsync(request, cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);

            await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
            var forms = await _db.FormBalbodhinis
                .Where(f => f.SessionNo == session.SessionNo && f.FormCentre == request.FormCentre.Trim())
                .OrderBy(f => f.SrNo)
                .Take(preview.RollCount)
                .ToListAsync(cancellationToken);

            for (var i = 0; i < forms.Count; i++)
                forms[i].RollNo = (short)(request.FirstRollNo + i);

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
            return preview;
        }

        public async Task<NextCentreResponse> NextCentreAsync(int seatRegionNo, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            var regionNos = await _db.Regions.AsNoTracking()
                .Where(r => r.SeatRegionNo == seatRegionNo)
                .Select(r => r.RegionNo)
                .ToListAsync(cancellationToken);

            var centresWithForms = await (
                from form in _db.FormBalbodhinis.AsNoTracking()
                join centre in _db.Centres.AsNoTracking() on form.FormCentre equals centre.CentreNo
                join district in _db.Districts.AsNoTracking() on centre.DistrictName equals district.DistrictName into districtJoin
                from district in districtJoin.DefaultIfEmpty()
                where form.SessionNo == session.SessionNo
                    && form.RegionNo.HasValue
                    && regionNos.Contains(form.RegionNo.Value)
                orderby district != null ? district.SeatDistrictNo : int.MaxValue, centre.CentreNo
                select new { centre.CentreNo, centre.CentreName }
            ).Distinct().ToListAsync(cancellationToken);

            var first = centresWithForms.FirstOrDefault();
            var maxRoll = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RegionNo.HasValue
                    && regionNos.Contains(f.RegionNo.Value)
                    && f.RollNo != null)
                .MaxAsync(f => (int?)f.RollNo, cancellationToken);

            return new NextCentreResponse
            {
                FormCentre = first?.CentreNo,
                CentreName = first?.CentreName,
                SuggestedFirstRollNo = (maxRoll ?? 0) + 1
            };
        }

        public async Task<RollPreviewResponse> AurPreviewAsync(AurRollRequest request, CancellationToken cancellationToken)
        {
            var session = await RequireDefaultAsync(cancellationToken);
            await EnsureCentreInSeatRegionAsync(request.FormCentre, request.SeatRegionNo, cancellationToken);

            var regionNos = await SeatRegionNosAsync(request.SeatRegionNo, cancellationToken);
            var start = (await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RegionNo.HasValue
                    && regionNos.Contains(f.RegionNo.Value)
                    && f.RollNo != null)
                .MaxAsync(f => (int?)f.RollNo, cancellationToken) ?? 0) + 1;

            var forms = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.FormCentre == request.FormCentre.Trim()
                    && f.RollNo == null)
                .OrderBy(f => f.SrNo)
                .ToListAsync(cancellationToken);

            var assignments = forms.Select((form, index) => new RollAssignmentRow
            {
                SrNo = form.SrNo,
                Name = form.Name,
                RollNo = start + index
            }).ToList();

            return new RollPreviewResponse
            {
                FormCount = forms.Count,
                RollCount = assignments.Count,
                LastCandidateName = assignments.LastOrDefault()?.Name,
                Assignments = assignments
            };
        }

        public async Task<RollPreviewResponse> AurCommitAsync(AurRollRequest request, CancellationToken cancellationToken)
        {
            if (!request.Confirmed)
                throw new InvalidOperationException("Confirmation is required before Aur roll numbers are saved.");

            await _sessions.EnsureWritableAsync(cancellationToken);
            var preview = await AurPreviewAsync(request, cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);

            await using var tx = await _db.Database.BeginTransactionAsync(cancellationToken);
            var forms = await _db.FormBalbodhinis
                .Where(f => f.SessionNo == session.SessionNo
                    && f.FormCentre == request.FormCentre.Trim()
                    && f.RollNo == null)
                .OrderBy(f => f.SrNo)
                .ToListAsync(cancellationToken);

            for (var i = 0; i < forms.Count; i++)
                forms[i].RollNo = (short)preview.Assignments[i].RollNo;

            await _db.SaveChangesAsync(cancellationToken);
            await tx.CommitAsync(cancellationToken);
            return preview;
        }

        public async Task<object> ClearAsync(ClearRollRequest request, CancellationToken cancellationToken)
        {
            if (!request.Confirmed)
                throw new InvalidOperationException("Confirmation is required before clearing roll numbers.");

            await _sessions.EnsureWritableAsync(cancellationToken);
            var session = await RequireDefaultAsync(cancellationToken);
            var centre = await _centres.ResolveAsync(request.FormCentre, cancellationToken)
                ?? throw new InvalidOperationException("Centre does not exist.");

            var minRoll = await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == session.SessionNo
                    && f.FormCentre == request.FormCentre.Trim()
                    && f.RollNo != null)
                .MinAsync(f => (int?)f.RollNo, cancellationToken);

            if (minRoll is null)
                return new { cleared = 0 };

            var rows = await _db.FormBalbodhinis
                .Where(f => f.SessionNo == session.SessionNo
                    && f.RegionNo == centre.RegionNo
                    && f.RollNo != null
                    && f.RollNo >= minRoll)
                .ToListAsync(cancellationToken);

            foreach (var row in rows)
                row.RollNo = null;

            await _db.SaveChangesAsync(cancellationToken);
            return new { cleared = rows.Count };
        }

        private static void ValidateRange(RollPreviewRequest request)
        {
            if (request.FirstRollNo < 0 || request.LastRollNo < 0)
                throw new InvalidOperationException("Roll numbers must be numeric and not negative.");

            if (request.LastRollNo < request.FirstRollNo)
                throw new InvalidOperationException("Last roll number must be greater than or equal to first.");
        }

        private async Task<List<FormBalbodhini>> GetCentreFormsAsync(int sessionNo, string formCentre, CancellationToken cancellationToken)
        {
            return await _db.FormBalbodhinis.AsNoTracking()
                .Where(f => f.SessionNo == sessionNo && f.FormCentre == formCentre.Trim())
                .OrderBy(f => f.SrNo)
                .ToListAsync(cancellationToken);
        }

        private async Task EnsureCentreInSeatRegionAsync(string formCentre, int seatRegionNo, CancellationToken cancellationToken)
        {
            var centre = await _centres.ResolveAsync(formCentre, cancellationToken)
                ?? throw new InvalidOperationException("Centre does not exist.");

            if (!centre.RegionNo.HasValue)
                throw new InvalidOperationException("Centre region could not be resolved.");

            var region = await _db.Regions.AsNoTracking()
                .FirstOrDefaultAsync(r => r.RegionNo == centre.RegionNo.Value, cancellationToken)
                ?? throw new InvalidOperationException("Region not found.");

            if (region.SeatRegionNo != seatRegionNo)
                throw new InvalidOperationException("Centre does not belong to the selected seat region.");
        }

        private async Task<List<int>> SeatRegionNosAsync(int seatRegionNo, CancellationToken cancellationToken)
        {
            return await _db.Regions.AsNoTracking()
                .Where(r => r.SeatRegionNo == seatRegionNo)
                .Select(r => r.RegionNo)
                .ToListAsync(cancellationToken);
        }

        private async Task<Session> RequireDefaultAsync(CancellationToken cancellationToken)
        {
            return await _sessions.GetDefaultSessionAsync(cancellationToken)
                ?? throw new InvalidOperationException("Session not selected.");
        }
    }
}
