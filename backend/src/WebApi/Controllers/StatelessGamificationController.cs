using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Gamification API — XP, badges, leaderboard.
    /// Kết hợp in-memory cache (GamificationStrategy) + PostgreSQL persistence (ApplicationDbContext).
    /// Route: /api/v1/concepts/gamification
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/concepts/gamification")]
    [EnableRateLimiting("api")]
    public class StatelessGamificationController : ControllerBase
    {
        private readonly GamificationStrategy _gamification;
        private readonly ApplicationDbContext _dbContext;
        private readonly IMemoryCache _cache;

        private static readonly (int level, string name, int xpRequired)[] LevelTable =
        {
            (1, "Novice",       0),
            (2, "Explorer",     100),
            (3, "Learner",      300),
            (4, "Practitioner", 600),
            (5, "Expert",       1000),
            (6, "Master",       1500),
            (7, "Grandmaster",  2200),
            (8, "Legend",       3000),
        };

        public StatelessGamificationController(
            GamificationStrategy gamification, 
            ApplicationDbContext dbContext,
            IMemoryCache cache)
        {
            _gamification = gamification;
            _dbContext = dbContext;
            _cache = cache;
        }

        private static string GetLevelName(int level)
        {
            foreach (var entry in LevelTable)
                if (entry.level == level) return entry.name;
            return "Novice";
        }

        /// <summary>
        /// Lấy thông tin profile người dùng demo (XP, level, badges, activity).
        /// GET /api/v1/concepts/gamification/profile
        /// </summary>
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            return Ok(_gamification.GetUserProfile());
        }

        /// <summary>
        /// Cộng XP cho người dùng — in-memory + PostgreSQL persistence.
        /// POST /api/v1/concepts/gamification/award-xp
        /// Body: { "amount": 50, "reason": "Hoàn thành quiz" }
        /// </summary>
        [HttpPost("award-xp")]
        public async Task<IActionResult> AwardXp([FromBody] AwardXpRequest request)
        {
            if (request.Amount <= 0 || request.Amount > 500)
                return BadRequest(new { error = "INVALID_AMOUNT", message = "XP phải trong khoảng 1-500." });

            var profile = _gamification.AwardXp(request.Amount, request.Reason);

            // Persist XP to PostgreSQL — update demo user
            var dbUser = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == "demo@visualizationdsa.dev");
            if (dbUser != null)
            {
                dbUser.AwardXP(request.Amount);
                dbUser.RecordActivity();
                await _dbContext.SaveChangesAsync();
            }

            return Ok(profile);
        }

        /// <summary>
        /// Lấy danh sách tất cả badges (gồm trạng thái đã đạt hay chưa).
        /// GET /api/v1/concepts/gamification/badges
        /// </summary>
        [HttpGet("badges")]
        public IActionResult GetBadges()
        {
            return Ok(_gamification.GetAllBadges());
        }

        /// <summary>
        /// Lấy bảng xếp hạng từ PostgreSQL (live database records) có đệm kết quả.
        /// GET /api/v1/concepts/gamification/leaderboard?limit=10
        /// </summary>
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard([FromQuery] int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 50);
            var cacheKey = $"StatelessGamification_Leaderboard_{limit}";

            if (!_cache.TryGetValue(cacheKey, out List<StatelessLeaderboardEntry>? leaderboard))
            {
                var dbUsers = await _dbContext.Users
                    .OrderByDescending(u => u.TotalXP)
                    .Take(limit)
                    .Select(u => new
                    {
                        u.Username,
                        u.TotalXP,
                        u.CurrentLevel,
                        u.StreakDays,
                        BadgeCount = u.UserBadges.Count
                    })
                    .ToListAsync();

                if (dbUsers.Count == 0)
                {
                    // Fallback to in-memory mock if DB is empty
                    return Ok(_gamification.GetLeaderboard(limit));
                }

                leaderboard = dbUsers.Select((u, index) => new StatelessLeaderboardEntry
                {
                    Rank = index + 1,
                    Username = u.Username,
                    TotalXp = u.TotalXP,
                    Level = u.CurrentLevel,
                    LevelName = GetLevelName(u.CurrentLevel),
                    BadgeCount = u.BadgeCount,
                    StreakDays = u.StreakDays
                }).ToList();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromSeconds(15))
                    .SetAbsoluteExpiration(TimeSpan.FromSeconds(60));

                _cache.Set(cacheKey, leaderboard, cacheOptions);
            }

            return Ok(leaderboard);
        }

        /// <summary>
        /// Lấy cấu hình gamification (level thresholds, badge definitions, XP events).
        /// GET /api/v1/concepts/gamification/config
        /// </summary>
        [HttpGet("config")]
        [ResponseCache(Duration = 86400)]
        public IActionResult GetConfig()
        {
            return Ok(_gamification.GetConfig());
        }
    }

    public class AwardXpRequest
    {
        public int Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
