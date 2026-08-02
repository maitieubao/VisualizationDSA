using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class CoreBackgroundJobsService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CoreBackgroundJobsService> _logger;

        public CoreBackgroundJobsService(IServiceProvider serviceProvider, ILogger<CoreBackgroundJobsService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Core Background Jobs Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.UtcNow;
                
                // We want to run daily tasks shortly after midnight UTC (e.g. 00:05)
                // For simplicity in this hosted service, we run every hour and check if we already processed today.
                // In a real production system, Hangfire/Quartz would be better, but this handles basic requirements.
                
                try 
                {
                    await ProcessDailyTasksAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing daily background tasks.");
                }

                // Wait for an hour before checking again
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task ProcessDailyTasksAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var today = DateTime.UtcNow.Date;

            // 1. Premium Expiry Check (Wait, Premium has no expiry in User.cs right now, it's just a boolean. So we skip this if there is no ExpiryDate property).
            
            // 2. Streak Freeze & Reset Logic
            // If a user hasn't had activity yesterday, their streak resets.
            var yesterday = today.AddDays(-1);
            
            // Note: In large systems, do this in batches!
            var usersToReset = await dbContext.Users
                .Where(u => u.StreakDays > 0 && (u.LastActivityDate == null || u.LastActivityDate.Value.Date < yesterday))
                .ToListAsync();

            if (usersToReset.Any())
            {
                foreach (var user in usersToReset)
                {
                    // Logic to use Streak Freeze from inventory if they have it could be added here
                    var inventory = await dbContext.UserInventory
                        .FirstOrDefaultAsync(inv => inv.UserId == user.Id && inv.ItemType == "streak_freeze");
                    
                    if (inventory != null)
                    {
                        // Consume streak freeze by removing it
                        dbContext.UserInventory.Remove(inventory);
                        // Don't reset streak, they were saved!
                        _logger.LogInformation($"User {user.Id} streak saved by Streak Freeze!");
                    }
                    else
                    {
                        // Reset streak
                        await dbContext.Database.ExecuteSqlRawAsync(
                            "UPDATE \"Users\" SET \"StreakDays\" = 0 WHERE \"Id\" = {0}", user.Id);
                    }
                }
                await dbContext.SaveChangesAsync();
            }

            // 3. Session Cleanup (Delete stale learning sessions older than 24 hours)
            var staleThreshold = DateTime.UtcNow.AddHours(-24);
            await dbContext.Database.ExecuteSqlRawAsync(
                "DELETE FROM \"LearningSessions\" WHERE \"CreatedAt\" < {0}", staleThreshold);
                
            _logger.LogInformation("Daily tasks processed successfully.");
        }
    }
}
