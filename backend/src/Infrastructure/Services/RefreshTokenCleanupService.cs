using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly ILogger<RefreshTokenCleanupService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public RefreshTokenCleanupService(ILogger<RefreshTokenCleanupService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Refresh Token Cleanup Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupTokensAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing Refresh Token Cleanup.");
                }

                
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task CleanupTokensAsync(CancellationToken stoppingToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var thresholdDate = DateTime.UtcNow.AddDays(-7);

            
            var tokensToDelete = await dbContext.RefreshTokens
                .Where(rt => rt.ExpiresAt < DateTime.UtcNow || (rt.IsRevoked && rt.ExpiresAt < thresholdDate))
                .ToListAsync(stoppingToken);

            if (tokensToDelete.Count > 0)
            {
                dbContext.RefreshTokens.RemoveRange(tokensToDelete);
                await dbContext.SaveChangesAsync(stoppingToken);
                _logger.LogInformation("Cleaned up {Count} expired/revoked refresh tokens.", tokensToDelete.Count);
            }
        }
    }
}
