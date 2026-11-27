using Microsoft.EntityFrameworkCore;
using mrsexam_backend.Dtos;

namespace mrsexam_backend.Services
{
    /// <summary>Legacy Rpt_CentreList — centre no, name, address.</summary>
    public sealed class CentreListReportService
    {
        private readonly MrsexamContext _db;

        public CentreListReportService(MrsexamContext db) => _db = db;

        public async Task<CentreListReportDto> GetReportAsync(CancellationToken cancellationToken)
        {
            var centres = await _db.Centres.AsNoTracking()
                .OrderBy(c => c.CentreNo)
                .Select(c => new
                {
                    c.CentreNo,
                    c.CentreName,
                    c.Add1,
                    c.Add2,
                    c.City,
                    c.AddressTo,
                })
                .ToListAsync(cancellationToken);

            var rows = centres.Select(c => new CentreListRowDto
            {
                CentreNo = c.CentreNo,
                CentreName = c.CentreName,
                Address = BuildAddress(c.Add1, c.Add2, c.City, c.AddressTo),
            }).ToList();

            var today = DateTime.Now;
            var printDate = $"{today.Day:00}-{today.Month:00}-{today.Year}";

            return new CentreListReportDto
            {
                Header = new ReportHeaderDto
                {
                    Title = "Centre List",
                    TitleMr = "केंद्र सूची",
                    RowCount = rows.Count,
                },
                PrintDate = printDate,
                Rows = rows,
            };
        }

        private static string? BuildAddress(string? add1, string? add2, string? city, string? addressTo)
        {
            var parts = new[] { add1, add2, city }
                .Select(p => p?.Trim())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Cast<string>()
                .ToList();

            if (parts.Count > 0)
                return string.Join(", ", parts);

            var fallback = addressTo?.Trim();
            return string.IsNullOrWhiteSpace(fallback) ? null : fallback;
        }
    }
}
