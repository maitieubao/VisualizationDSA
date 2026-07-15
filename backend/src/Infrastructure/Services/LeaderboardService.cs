using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.Infrastructure.Services
{
    /// <summary>
    /// Triển khai LeaderboardService — truy vấn trực tiếp từ User repository kèm theo in-memory cache.
    /// </summary>
    public class LeaderboardService : ILeaderboardService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private static readonly string LeaderboardCacheKey = "Leaderboard_TopUsers";

        public LeaderboardService(IUnitOfWork unitOfWork, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _cache = cache;
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
    }
}
