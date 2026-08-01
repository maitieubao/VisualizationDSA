using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Jobs
{
    public class StreakReminderJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<StreakReminderJob> _logger;

        public StreakReminderJob(IServiceProvider serviceProvider, ILogger<StreakReminderJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayToNextTime(13, 0); // 13:00 UTC is 20:00 VN time
                _logger.LogInformation("StreakReminderJob will run in {Delay}", delay);
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                try
                {
                    await RemindUsersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in StreakReminderJob");
                }
            }
        }

        private async Task RemindUsersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var today = DateTime.UtcNow.Date;
            
            var usersToRemind = await dbContext.Users
                .Where(u => u.StreakDays > 0 && 
                            (u.LastActivityDate == null || u.LastActivityDate.Value.Date < today))
                .ToListAsync();

            foreach(var user in usersToRemind)
            {
                await notificationService.SendNotificationAsync(
                    user.Id,
                    "Cảnh báo Streak",
                    "Bạn chưa học hôm nay! Vào học ngay để không mất chuỗi streak nhé.",
                    "STREAK_REMINDER",
                    "/dashboard"
                );
            }
            
            _logger.LogInformation("Sent streak reminder to {Count} users", usersToRemind.Count);
        }

        private TimeSpan GetDelayToNextTime(int targetHourUTC, int targetMinuteUTC)
        {
            var now = DateTime.UtcNow;
            var next = new DateTime(now.Year, now.Month, now.Day, targetHourUTC, targetMinuteUTC, 0, DateTimeKind.Utc);
            if (now >= next)
            {
                next = next.AddDays(1);
            }
            return next - now;
        }
    }
}
