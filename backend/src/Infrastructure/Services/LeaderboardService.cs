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

        public async Task<IEnumerable<LeaderboardEntryDto>> GetClassroomLeaderboardAsync(string classroomId, int limit = 10)
        {
            // Gamification Classroom dropped in favor of LMS Classroom. 
            // Classroom Leaderboards will be re-implemented later.
            return await Task.FromResult(Enumerable.Empty<LeaderboardEntryDto>());
        }

        public async Task<IEnumerable<LeaderboardEntryDto>> GetClassroomWeeklyLeaderboardAsync(string classroomId, int limit = 20) { return await Task.FromResult(Enumerable.Empty<LeaderboardEntryDto>()); }
    }
}
