using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using VisualizationDSA.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;

namespace VisualizationDSA.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ILogger<NotificationService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public NotificationService(ILogger<NotificationService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task SendNotificationAsync(Guid userId, string title, string message, string type, string linkUrl = "", Guid? refId = null)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var notification = new Domain.Entities.Notification(
                    userId, 
                    $"{title}: {message}", 
                    linkUrl, 
                    type, 
                    refId
                );

                dbContext.Notifications.Add(notification);
                await dbContext.SaveChangesAsync();

                _logger.LogInformation("Saved notification to User {UserId}: {Title} - {Message}", userId, title, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save notification to User {UserId}", userId);
            }
        }
    }
}
