using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context) { }

        public async Task<User?> GetByIdWithDetailsAsync(Guid id, bool track = true)
        {
            var query = _context.Users.AsQueryable();
            if (!track)
            {
                query = query.AsNoTracking();
            }
            return await query
                .Include(u => u.LearningProgresses)
                .Include(u => u.UserBadges)
                    .ThenInclude(ub => ub.Badge)
                .Include(u => u.QuizAttempts)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<User>> GetTopUsersAsync(int limit)
        {
            return await _context.Users
                .AsNoTracking()
                .Include(u => u.UserBadges)
                .OrderByDescending(u => u.TotalXP)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> GetUserRankAsync(Guid id)
        {
            var userXp = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => u.TotalXP)
                .FirstOrDefaultAsync();

            // SQL đếm số lượng người có XP lớn hơn để tính hạng
            return await _context.Users.CountAsync(u => u.TotalXP > userXp) + 1;
        }

        public async Task<UserProgressDomainModel?> GetUserProgressDomainModelAsync(Guid userId)
        {
            return await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new UserProgressDomainModel
                {
                    TotalXP = u.TotalXP,
                    CurrentLevel = u.CurrentLevel,
                    StreakDays = u.StreakDays,
                    IsPremium = u.IsPremium,
                    CompletedModuleIds = u.LearningProgresses.Select(lp => lp.ModuleId).ToList(),
                    Badges = u.UserBadges.Select(ub => new UserBadgeDomainModel
                    {
                        BadgeId = ub.BadgeId,
                        Name = ub.Badge != null ? ub.Badge.Name : string.Empty,
                        Description = ub.Badge != null ? ub.Badge.Description : string.Empty,
                        Icon = ub.Badge != null ? ub.Badge.Icon : string.Empty,
                        Color = ub.Badge != null ? ub.Badge.Color : string.Empty,
                        EarnedAt = ub.EarnedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }
    }
}
