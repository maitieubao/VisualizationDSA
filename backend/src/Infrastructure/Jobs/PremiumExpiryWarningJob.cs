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
    public class PremiumExpiryWarningJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PremiumExpiryWarningJob> _logger;

        public PremiumExpiryWarningJob(IServiceProvider serviceProvider, ILogger<PremiumExpiryWarningJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayToNextTime(12, 0); // 12:00 UTC
                _logger.LogInformation("PremiumExpiryWarningJob will run in {Delay}", delay);
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                try
                {
                    await WarnUsersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in PremiumExpiryWarningJob");
                }
            }
        }

        private async Task WarnUsersAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var now = DateTime.UtcNow;
            var threeDaysFromNow = now.AddDays(3);
            
            // Find users who expire within 3 days and haven't expired yet
            var usersToWarn = await dbContext.Users
                .Where(u => u.PremiumExpiresAt != null && 
                            u.PremiumExpiresAt > now && 
                            u.PremiumExpiresAt <= threeDaysFromNow)
                .ToListAsync();

            foreach(var user in usersToWarn)
            {
                var daysLeft = (user.PremiumExpiresAt.Value - now).Days;
                var daysText = daysLeft == 0 ? "hôm nay" : $"trong {daysLeft} ngày nữa";

                await notificationService.SendNotificationAsync(
                    user.Id,
                    "Gói Premium sắp hết hạn",
                    $"Gói Premium của bạn sẽ hết hạn {daysText}. Hãy gia hạn để không bị gián đoạn trải nghiệm học tập không giới hạn!",
                    "PREMIUM_WARNING",
                    "/checkout"
                );
            }
            
            _logger.LogInformation("Sent premium expiry warning to {Count} users", usersToWarn.Count);
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
