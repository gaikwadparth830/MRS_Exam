using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;

namespace mrsexam_backend.Services
{
    public sealed class CentreResolver
    {
        private readonly MrsexamContext _db;

        public CentreResolver(MrsexamContext db) => _db = db;

        public async Task<CentreResolveDto?> ResolveAsync(string centreNo, CancellationToken cancellationToken)
        {
            var code = (centreNo ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(code)) return null;

            var centre = await _db.Centres.AsNoTracking()
                .FirstOrDefaultAsync(c => c.CentreNo == code, cancellationToken);
            if (centre is null) return null;

            int? regionNo = null;
            string? regionName = null;
            var districtName = centre.DistrictName?.Trim();

            if (!string.IsNullOrEmpty(districtName))
            {
                var district = await _db.Districts.AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DistrictName == districtName, cancellationToken);
                regionNo = district?.RegionNo;

                if (regionNo.HasValue)
                {
                    var region = await _db.Regions.AsNoTracking()
                        .FirstOrDefaultAsync(r => r.RegionNo == regionNo.Value, cancellationToken);
                    regionName = region?.RegionName;
                }
            }

            var city = string.IsNullOrWhiteSpace(centre.City) ? "-" : centre.City.Trim();
            var name = centre.CentreName?.Trim() ?? string.Empty;

            return new CentreResolveDto
            {
                CentreNo = centre.CentreNo,
                CentreName = centre.CentreName,
                City = centre.City,
                Display = string.IsNullOrEmpty(name) ? city : $"{name}, {city}",
                DistrictName = centre.DistrictName,
                RegionNo = regionNo,
                RegionName = regionName,
                IsClosed = string.Equals(centre.CloseFlag?.Trim(), "Y", StringComparison.OrdinalIgnoreCase)
            };
        }
    }
}
