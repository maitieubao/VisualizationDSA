using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Jobs
{
    public class SessionCleanupJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SessionCleanupJob> _logger;
        // Chạy mỗi 15 phút
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(15);

        public SessionCleanupJob(IServiceProvider serviceProvider, ILogger<SessionCleanupJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SessionCleanupJob is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupExpiredSessionsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing SessionCleanupJob.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("SessionCleanupJob is stopping.");
        }

        private async Task CleanupExpiredSessionsAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;

            // Xóa trực tiếp hàng loạt sử dụng ExecuteDeleteAsync (EF Core 7+)
            var deletedCount = await dbContext.LearningSessions
                .Where(s => s.ExpiresAt < now)
                .ExecuteDeleteAsync(stoppingToken);

            if (deletedCount > 0)
            {
                _logger.LogInformation("Successfully cleaned up {Count} expired sessions.", deletedCount);
            }
        }
    }
}
