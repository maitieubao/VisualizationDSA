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
    public class PremiumExpiryJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PremiumExpiryJob> _logger;
        // Chạy mỗi 6 giờ
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6);

        public PremiumExpiryJob(IServiceProvider serviceProvider, ILogger<PremiumExpiryJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("PremiumExpiryJob is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndDowngradePremiumUsersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing PremiumExpiryJob.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("PremiumExpiryJob is stopping.");
        }

        private async Task CheckAndDowngradePremiumUsersAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;

            var expiredUsers = await dbContext.Users
                .Where(u => u.PremiumExpiresAt != null && u.PremiumExpiresAt < now)
                .ToListAsync(stoppingToken);

            if (expiredUsers.Any())
            {
                _logger.LogInformation("Found {Count} expired premium users. Downgrading...", expiredUsers.Count);

                foreach (var user in expiredUsers)
                {
                    user.DowngradeFromPremium();
                    
                    // Create notification
                    var notification = new Domain.Entities.Notification(
                        user.Id,
                        "Gói Premium của bạn đã hết hạn. Trái tim của bạn sẽ không hồi cho đến khi số tim xuống dưới mức tối đa (5 tim).",
                        "/checkout"
                    );
                    dbContext.Notifications.Add(notification);
                }

                await dbContext.SaveChangesAsync(stoppingToken);
                _logger.LogInformation("Successfully downgraded {Count} users.", expiredUsers.Count);
            }
        }
    }
}
