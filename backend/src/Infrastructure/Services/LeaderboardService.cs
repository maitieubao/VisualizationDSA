using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>
    /// Triển khai LeaderboardService — truy vấn trực tiếp từ User repository kèm theo in-memory cache.
    /// </summary>
    public class LeaderboardService : ILeaderboardService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private readonly ApplicationDbContext _dbContext;
        private static readonly string LeaderboardCacheKey = "Leaderboard_TopUsers";

        public LeaderboardService(IUnitOfWork unitOfWork, IMemoryCache cache, ApplicationDbContext dbContext)
        {
            _unitOfWork = unitOfWork;
            _cache = cache;
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetTopUsersAsync(int limit = 20)
        {
            // Clamp limit để tránh truy vấn quá lớn
            limit = Math.Clamp(limit, 1, 100);

            var cacheKey = $"{LeaderboardCacheKey}_{limit}";

            if (!_cache.TryGetValue(cacheKey, out IEnumerable<LeaderboardEntryDto>? cachedEntries))
            {
                var topUsers = await _unitOfWork.Users.GetTopUsersAsync(limit);

                cachedEntries = topUsers.Select((u, index) => new LeaderboardEntryDto
                {
                    Rank       = index + 1,
                    UserId     = u.Id,
                    Username   = u.Username,
                    TotalXP    = u.TotalXP,
                    Level      = u.CurrentLevel,
                    StreakDays = u.StreakDays,
                    BadgeCount = u.UserBadges?.Count ?? 0,
                }).ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromSeconds(15))
                    .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

                _cache.Set(cacheKey, cachedEntries, cacheOptions);
            }

            return cachedEntries!;
        }

        public async Task<UserRankDto> GetUserRankAsync(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                return new UserRankDto { Rank = -1, IsInTop = false };
            }

            var rank = await _unitOfWork.Users.GetUserRankAsync(userId);
            return new UserRankDto
            {
                Rank    = rank,
                TotalXP = user.TotalXP,
                IsInTop = rank <= 20,
            };
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetClassroomWeeklyLeaderboardAsync(string classroomId, int limit = 20)
        {
            limit = Math.Clamp(limit, 1, 100);
            var cacheKey = $"{LeaderboardCacheKey}_Classroom_{classroomId}_{limit}";

            if (!_cache.TryGetValue(cacheKey, out IEnumerable<LeaderboardEntryDto>? cachedEntries))
            {
                var now = DateTime.UtcNow;
                var weekStart = now.AddDays(-7);

                var studentIds = await _dbContext.ClassroomMembers
                    .Where(m => m.ClassroomId == classroomId)
                    .Select(m => m.StudentId)
                    .ToListAsync();

                if (!studentIds.Any()) return Enumerable.Empty<LeaderboardEntryDto>();

                var weeklyProgresses = await _dbContext.UserLessonProgresses
                    .Where(p => studentIds.Contains(p.UserId) && p.CompletedAt != null && p.CompletedAt >= weekStart && p.CompletedAt <= now)
                    .ToListAsync();

                var userXpMap = weeklyProgresses
                    .GroupBy(p => p.UserId)
                    .ToDictionary(g => g.Key, g => g.Sum(p => p.XPRewarded));

                var topUserIds = userXpMap
                    .OrderByDescending(kvp => kvp.Value)
                    .Take(limit)
                    .Select(kvp => kvp.Key)
                    .ToList();

                var topUsersInfo = await _dbContext.Users
                    .Include(u => u.UserBadges)
                    .Where(u => topUserIds.Contains(u.Id))
                    .ToListAsync();

                cachedEntries = topUserIds.Select((userId, index) => 
                {
                    var u = topUsersInfo.First(user => user.Id == userId);
                    return new LeaderboardEntryDto
                    {
                        Rank       = index + 1,
                        UserId     = u.Id,
                        Username   = u.Username,
                        TotalXP    = userXpMap[userId], 
                        Level      = u.CurrentLevel,
                        StreakDays = u.StreakDays,
                        BadgeCount = u.UserBadges?.Count ?? 0,
                    };
                }).ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromSeconds(30))
                    .SetAbsoluteExpiration(TimeSpan.FromSeconds(120));

                _cache.Set(cacheKey, cachedEntries, cacheOptions);
            }

            return cachedEntries!;
        }
    }
}
