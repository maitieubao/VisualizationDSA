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

        
        
        
        
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            return Ok(_gamification.GetUserProfile());
        }

        
        
        
        
        
        [HttpPost("award-xp")]
        [VisualizationDSA.WebApi.Filters.RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AwardXp([FromBody] AwardXpRequest request)
        {
            // Chỉ Teacher/Admin (hoặc luồng nội bộ) được cấp XP — chống tự cày XP vô hạn.
            if (request.Amount <= 0 || request.Amount > 500)
                return BadRequest(new { error = "INVALID_AMOUNT", message = "XP phải trong khoảng 1-500." });

            var profile = _gamification.AwardXp(request.Amount, request.Reason);

            
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

        
        
        
        
        [HttpGet("badges")]
        public IActionResult GetBadges()
        {
            return Ok(_gamification.GetAllBadges());
        }

        
        
        
        
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
