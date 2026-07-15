using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>
    /// ✅ B2 FIX: Dùng ApplicationDbContext trực tiếp với GROUP BY / COUNT aggregate queries
    /// thay vì GetAllAsync() load toàn bộ bảng vào memory (N+1 problem).
    /// </summary>
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

            // Aggregate queries — không load entity vào memory
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
            // Load user với navigation properties cần thiết — chỉ đúng user đó
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

            // GROUP BY trực tiếp ở DB — không load toàn bộ bảng vào memory
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
