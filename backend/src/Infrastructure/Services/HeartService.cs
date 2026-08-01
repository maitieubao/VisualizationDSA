using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.Infrastructure.Services
{
    public class HeartService : IHeartService
    {
        private readonly ApplicationDbContext _dbContext;

        public HeartService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<HeartStatusDto> GetHeartStatusAsync(Guid userId)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new KeyNotFoundException("Không tìm thấy người dùng.");

            // 1. Sync recovered hearts if any
            var recovered = CalculateRecoveredHearts(user);
            if (recovered > 0)
            {
                var interval = user.IsPremium ? 1800 : 3600;
                var newHearts = Math.Min(user.Hearts + recovered, user.MaxHearts);
                
                // Advance LastHeartUsedAt by (recovered * interval) seconds
                var newLastUsed = user.LastHeartUsedAt?.AddSeconds(recovered * interval);
                if (newHearts >= user.MaxHearts)
                {
                    newLastUsed = null; // Fully recovered
                }

                await _dbContext.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE Users SET Hearts = {newHearts}, LastHeartUsedAt = {newLastUsed} WHERE Id = {userId}"
                );

                user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId) ?? user;
            }

            // 2. Check ad sliding window reset
            CheckAdSlidingWindow(user);

            // 3. Calculate next heart recovery countdown in seconds
            int? nextHeartInSeconds = null;
            if (user.Hearts < user.MaxHearts && user.LastHeartUsedAt.HasValue)
            {
                var interval = user.IsPremium ? 1800 : 3600;
                var secondsElapsed = (DateTime.UtcNow - user.LastHeartUsedAt.Value).TotalSeconds;
                var secondsRemaining = interval - (secondsElapsed % interval);
                nextHeartInSeconds = Math.Max(0, (int)secondsRemaining);
            }

            return new HeartStatusDto
            {
                Hearts = user.Hearts,
                MaxHearts = user.MaxHearts,
                NextHeartInSeconds = nextHeartInSeconds,
                LastHeartUsedAt = user.LastHeartUsedAt,
                IsRecovering = user.Hearts < user.MaxHearts,
                AdsWatchedToday = user.AdWatchCount,
                AdsMaxPerDay = 5
            };
        }

        public async Task<bool> DeductHeartAtomicAsync(Guid userId)
        {
            var now = DateTime.UtcNow;

            // Atomic SQL update: UPDATE Users SET Hearts = Hearts - 1, LastHeartUsedAt = @Now WHERE Id = @UserId AND Hearts > 0
            var rowsAffected = await _dbContext.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Users SET Hearts = Hearts - 1, LastHeartUsedAt = COALESCE(LastHeartUsedAt, {now}) WHERE Id = {userId} AND Hearts > 0"
            );

            return rowsAffected > 0;
        }

        public async Task<WatchAdResponseDto> WatchAdAsync(Guid userId)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                throw new KeyNotFoundException("Không tìm thấy người dùng.");

            // Check & reset 24h sliding window
            var now = DateTime.UtcNow;
            if (user.FirstAdAt == null || (now - user.FirstAdAt.Value).TotalSeconds >= 86400)
            {
                user.RecordAdWatch(); // Resets FirstAdAt to now & count to 1
            }
            else
            {
                if (user.AdWatchCount >= 5)
                {
                    var resetTime = user.FirstAdAt.Value.AddSeconds(86400);
                    var remainingSecs = Math.Max(0, (int)(resetTime - now).TotalSeconds);
                    throw new InvalidOperationException($"AD_LIMIT_REACHED:Bạn đã xem tối đa 5 quảng cáo trong 24 giờ. Vui lòng thử lại sau {remainingSecs} giây.");
                }
                user.RecordAdWatch();
            }

            // Award +2 hearts capped at MaxHearts
            var newHearts = Math.Min(user.Hearts + 2, user.MaxHearts);
            var lastHeartUsed = newHearts >= user.MaxHearts ? (DateTime?)null : user.LastHeartUsedAt;

            await _dbContext.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Users SET Hearts = {newHearts}, LastHeartUsedAt = {lastHeartUsed}, AdWatchCount = {user.AdWatchCount}, FirstAdAt = {user.FirstAdAt} WHERE Id = {userId}"
            );

            _dbContext.ChangeTracker.Clear();

            var remaining = Math.Max(0, 5 - user.AdWatchCount);
            int? nextAdAvailableIn = null;
            if (user.AdWatchCount >= 5 && user.FirstAdAt.HasValue)
            {
                nextAdAvailableIn = Math.Max(0, (int)(user.FirstAdAt.Value.AddSeconds(86400) - DateTime.UtcNow).TotalSeconds);
            }

            return new WatchAdResponseDto
            {
                Hearts = newHearts,
                MaxHearts = user.MaxHearts,
                AdsWatchedToday = user.AdWatchCount,
                AdsRemainingToday = remaining,
                NextAdAvailableInSeconds = nextAdAvailableIn
            };
        }

        public int CalculateRecoveredHearts(User user)
        {
            if (user.Hearts >= user.MaxHearts || user.LastHeartUsedAt == null)
                return 0;

            var secondsElapsed = (DateTime.UtcNow - user.LastHeartUsedAt.Value).TotalSeconds;
            var recoveryInterval = user.IsPremium ? 1800 : 3600; // 30 mins (Premium) vs 60 mins (Free)
            var recovered = (int)(secondsElapsed / recoveryInterval);

            return Math.Min(recovered, user.MaxHearts - user.Hearts);
        }

        private static void CheckAdSlidingWindow(User user)
        {
            if (user.FirstAdAt.HasValue && (DateTime.UtcNow - user.FirstAdAt.Value).TotalSeconds >= 86400)
            {
                // Window expired
                user.RecordAdWatch(); // reset
            }
        }
    }
}
