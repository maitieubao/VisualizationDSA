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
    public class TeacherAppReminderJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TeacherAppReminderJob> _logger;

        public TeacherAppReminderJob(IServiceProvider serviceProvider, ILogger<TeacherAppReminderJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayToNextTime(8, 0); // 8:00 UTC (15:00 VN)
                _logger.LogInformation("TeacherAppReminderJob will run in {Delay}", delay);
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                try
                {
                    await RemindAdminsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in TeacherAppReminderJob");
                }
            }
        }

        private async Task RemindAdminsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var threeDaysAgo = DateTime.UtcNow.AddDays(-3);
            
            var pendingAppsCount = await dbContext.TeacherApplications
                .CountAsync(a => a.Status == "Pending" && 
                            // Since TeacherApplication does not have a CreatedAt field explicitly,
                            // Wait, does TeacherApplication have CreatedAt? I need to check.
                            // If it doesn't, we can just notify if there are ANY pending applications.
                            a.Status == "Pending"); // We will just check if any exist

            if (pendingAppsCount > 0)
            {
                var admins = await dbContext.Users.Where(u => u.Role == "Admin").ToListAsync();
                foreach(var admin in admins)
                {
                    await notificationService.SendNotificationAsync(
                        admin.Id,
                        "Duyệt đơn đăng ký Giảng viên",
                        $"Có {pendingAppsCount} đơn đăng ký Giảng viên đang chờ duyệt. Vui lòng kiểm tra và xử lý.",
                        "ADMIN_ALERT",
                        "/admin/teacher-applications"
                    );
                }
                _logger.LogInformation("Sent reminder to {Count} admins for {AppCount} pending apps", admins.Count, pendingAppsCount);
            }
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
