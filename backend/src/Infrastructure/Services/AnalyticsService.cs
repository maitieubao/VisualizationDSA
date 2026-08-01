using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    
    
    
    
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _db;

        public AnalyticsService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<SystemOverviewDto> GetSystemOverviewAsync()
        {
            var today = DateTime.UtcNow.Date;

            
            var totalUsers    = await _db.Users.CountAsync();
            var activeToday   = await _db.Users.CountAsync(
                u => u.LastActivityDate.HasValue && u.LastActivityDate.Value.Date == today);
            var totalAttempts = await _db.QuizAttempts.CountAsync();
            var totalXP       = await _db.Users.SumAsync(u => u.TotalXP);
            var avgLevel      = totalUsers > 0
                                    ? await _db.Users.AverageAsync(u => (double)u.CurrentLevel)
                                    : 0.0;

            return new SystemOverviewDto
            {
                TotalUsers        = totalUsers,
                ActiveToday       = activeToday,
                TotalQuizAttempts = totalAttempts,
                TotalXPAwarded    = totalXP,
                AverageLevel      = Math.Round(avgLevel, 2),
                GeneratedAt       = DateTime.UtcNow,
            };
        }

        public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(Guid userId)
        {
            
            var user = await _db.Users
                .AsNoTracking()
                .Include(u => u.QuizAttempts)
                .Include(u => u.LearningProgresses)
                .Include(u => u.UserBadges)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new KeyNotFoundException($"User {userId} not found.");

            var attempts  = user.QuizAttempts.ToList();
            var passed    = attempts.Count(a => a.Passed);
            var passRate  = attempts.Count > 0 ? (double)passed / attempts.Count : 0.0;

            return new UserAnalyticsDto
            {
                TotalXP            = user.TotalXP,
                CurrentLevel       = user.CurrentLevel,
                StreakDays         = user.StreakDays,
                TotalQuizAttempts  = attempts.Count,
                QuizzesPassedCount = passed,
                QuizPassRate       = Math.Round(passRate, 3),
                ModulesCompleted   = user.LearningProgresses.Count,
                BadgesEarned       = user.UserBadges.Count,
                LastActivityDate   = user.LastActivityDate,
                CompletedModules   = user.LearningProgresses.Select(lp => lp.ModuleId).ToList(),
            };
        }

        public async Task<IEnumerable<ModulePopularityDto>> GetModulePopularityAsync(int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 50);

            
            var result = await _db.LearningProgresses
                .GroupBy(lp => lp.ModuleId)
                .Select(g => new ModulePopularityDto
                {
                    ModuleId        = g.Key,
                    CompletionCount = g.Count(),
                })
                .OrderByDescending(m => m.CompletionCount)
                .Take(limit)
                .ToListAsync();

            return result;
        }
    }
}
