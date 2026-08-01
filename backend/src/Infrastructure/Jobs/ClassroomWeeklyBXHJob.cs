using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;
using System.Collections.Generic;

namespace VisualizationDSA.Infrastructure.Jobs
{
    public class ClassroomWeeklyBXHJob : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ClassroomWeeklyBXHJob> _logger;

        public ClassroomWeeklyBXHJob(IServiceProvider serviceProvider, ILogger<ClassroomWeeklyBXHJob> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayToNextMondayMidnight(); // Every Monday 00:00:00 UTC
                _logger.LogInformation("ClassroomWeeklyBXHJob will run in {Delay}", delay);
                await Task.Delay(delay, stoppingToken);

                if (stoppingToken.IsCancellationRequested) break;

                try
                {
                    await ProcessClassroomLeaderboardsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in ClassroomWeeklyBXHJob");
                }
            }
        }

        private async Task ProcessClassroomLeaderboardsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var now = DateTime.UtcNow;
            var weekStart = now.AddDays(-7).Date;
            var weekEnd = now.Date;

            // Get all classrooms
            var classrooms = await dbContext.Classrooms
                .Include(c => c.Members)
                .ToListAsync();

            foreach (var classroom in classrooms)
            {
                var studentIds = classroom.Members.Select(m => m.StudentId).ToList();
                if (!studentIds.Any()) continue;

                // Calculate weekly XP for each student in this classroom
                var weeklyProgresses = await dbContext.UserLessonProgresses
                    .Where(p => studentIds.Contains(p.UserId) && p.CompletedAt != null && p.CompletedAt >= weekStart && p.CompletedAt < weekEnd)
                    .ToListAsync();

                var userXpMap = new Dictionary<Guid, int>();
                foreach(var p in weeklyProgresses)
                {
                    if (!userXpMap.ContainsKey(p.UserId)) userXpMap[p.UserId] = 0;
                    userXpMap[p.UserId] += p.XPRewarded;
                }

                // If no XP was earned in the classroom, skip saving history
                if (!userXpMap.Any()) continue;

                var rankings = userXpMap
                    .OrderByDescending(kvp => kvp.Value)
                    .Select((kvp, index) => new {
                        UserId = kvp.Key,
                        Rank = index + 1,
                        TotalXp = kvp.Value
                    })
                    .ToList();

                var rankingsJson = JsonSerializer.Serialize(rankings);

                var history = new ClassroomLeaderboardHistory(
                    classroom.Id.ToString(),
                    weekStart,
                    weekEnd,
                    rankingsJson
                );
                dbContext.ClassroomLeaderboardHistories.Add(history);

                // Send notification to everyone
                var top3 = rankings.Take(3).ToList();
                
                foreach(var member in classroom.Members)
                {
                    var isTop3 = top3.Any(t => t.UserId == member.StudentId);
                    var message = isTop3 
                        ? $"Chúc mừng! Bạn đã lọt vào Top 3 lớp {classroom.Name} tuần này. Hãy kiểm tra BXH ngay."
                        : $"BXH Lớp {classroom.Name} tuần này đã có kết quả. Cố gắng lọt Top 3 tuần sau nhé!";

                    await notificationService.SendNotificationAsync(
                        member.StudentId,
                        "Tổng kết BXH Lớp Tuần",
                        message,
                        "CLASSROOM_LEADERBOARD",
                        $"/classrooms/{classroom.Id}" // Link to the specific classroom
                    );
                }
            }

            await dbContext.SaveChangesAsync();
            _logger.LogInformation("Processed weekly leaderboards for {Count} classrooms", classrooms.Count);
        }

        private TimeSpan GetDelayToNextMondayMidnight()
        {
            var now = DateTime.UtcNow;
            int daysUntilMonday = ((int)DayOfWeek.Monday - (int)now.DayOfWeek + 7) % 7;
            if (daysUntilMonday == 0 && now.TimeOfDay.TotalSeconds > 0)
            {
                daysUntilMonday = 7;
            }
            var nextMonday = now.Date.AddDays(daysUntilMonday);
            return nextMonday - now;
        }
    }
}
