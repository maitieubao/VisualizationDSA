using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Jobs
{
    public class StreakCheckJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<StreakCheckJob> _logger;
        // Chạy mỗi ngày lúc 00:00 (hoặc mỗi giờ để kiểm tra)
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1);

        public StreakCheckJob(IServiceProvider serviceProvider, ILogger<StreakCheckJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("StreakCheckJob is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndResetStreaksAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing StreakCheckJob.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("StreakCheckJob is stopping.");
        }

        private async Task CheckAndResetStreaksAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;
            var yesterday = now.Date.AddDays(-1);

            // Find users who have a streak > 0 but their last active date was before yesterday.
            var expiredStreakUsers = await dbContext.Users
                .Where(u => u.StreakDays > 0 && u.LastActivityDate.HasValue && u.LastActivityDate.Value.Date < yesterday)
                .ToListAsync(stoppingToken);

            if (expiredStreakUsers.Any())
            {
                _logger.LogInformation("Found {Count} users with expired streaks. Resetting...", expiredStreakUsers.Count);

                foreach (var user in expiredStreakUsers)
                {
                    user.ResetStreak();
                }

                await dbContext.SaveChangesAsync(stoppingToken);
                _logger.LogInformation("Successfully reset streaks for {Count} users.", expiredStreakUsers.Count);
            }
        }
    }
}
