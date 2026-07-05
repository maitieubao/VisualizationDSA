using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.WebApi.Filters
{
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly ApplicationDbContext _context;

        public DatabaseHealthCheck(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
                if (canConnect)
                {
                    return HealthCheckResult.Healthy("Kết nối cơ sở dữ liệu hoạt động bình thường.");
                }
                return HealthCheckResult.Unhealthy("Không thể kết nối đến cơ sở dữ liệu.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Lỗi kiểm tra kết nối cơ sở dữ liệu.", ex);
            }
        }
    }
}
