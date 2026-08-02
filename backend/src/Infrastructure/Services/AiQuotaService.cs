using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class AiQuotaService : IAiQuotaService
    {
        private readonly ApplicationDbContext _context;

        public AiQuotaService(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task EnsureQuotaResetAsync(Domain.Entities.User user)
        {
            if (user.AiQuotaResetAt == null || (DateTime.UtcNow - user.AiQuotaResetAt.Value).TotalHours >= 24)
            {
                user.ResetAiQuota();
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> CheckAndIncrementGlobalAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            await EnsureQuotaResetAsync(user);

            int maxGlobal = user.IsPremium ? 50 : 5;
            if (user.AiGlobalUsed >= maxGlobal)
                return false;

            user.IncrementAiGlobal();
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckAndIncrementLessonAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            await EnsureQuotaResetAsync(user);

            // In-lesson is part of global, so we check global first
            int maxGlobal = user.IsPremium ? 50 : 5;
            if (user.AiGlobalUsed >= maxGlobal)
                return false;

            int maxLesson = user.IsPremium ? 30 : 3;
            if (user.AiLessonUsed >= maxLesson)
                return false;

            user.IncrementAiGlobal(); // counts towards global too
            user.IncrementAiLesson();
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(int globalUsed, int globalMax, int lessonUsed, int lessonMax)> GetQuotaStatusAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return (0, 0, 0, 0);

            await EnsureQuotaResetAsync(user);

            int maxGlobal = user.IsPremium ? 50 : 5;
            int maxLesson = user.IsPremium ? 30 : 3;

            return (user.AiGlobalUsed, maxGlobal, user.AiLessonUsed, maxLesson);
        }
    }
}
