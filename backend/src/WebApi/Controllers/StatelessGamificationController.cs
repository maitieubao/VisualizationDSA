using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using VisualizationDSA.Domain.Engine;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Strategies;
using VisualizationDSA.Infrastructure.Data;
using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Gamification stateless (concept demo) — GM-011: trạng thái RIÊNG theo từng user (DB-first
    /// khi user tồn tại), không còn 1 profile demo dùng chung. GM-005: award-xp nhận Idempotency-Key
    /// → retry/bấm 2 lần không double-award. GM-019: bảng level dùng chung GamificationLevelTable.
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

        public StatelessGamificationController(
            GamificationStrategy gamification, 
            ApplicationDbContext dbContext,
            IMemoryCache cache)
        {
            _gamification = gamification;
            _dbContext = dbContext;
            _cache = cache;
        }

        // GM-005: chống XP farm — hạn mức XP/ngày/user + Idempotency-Key (copy LM-006).
        private const int AwardXpMinPerRequest = 1;
        private const int AwardXpMaxPerRequest = 500;

        /// <summary>Nạp profile theo user (DB-first khi user tồn tại trong DB — GM-011).</summary>
        private async Task<StatelessUserProfile> LoadProfileAsync(string userId)
        {
            if (Guid.TryParse(userId, out var dbUserId))
            {
                var dbUser = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == dbUserId);
                if (dbUser != null)
                {
                    return _gamification.SyncProfileFromDb(
                        userId, dbUser.Username, dbUser.TotalXP, dbUser.CurrentLevel,
                        dbUser.StreakDays, dbUser.LastActivityDate);
                }
            }

            return _gamification.GetUserProfile(userId);
        }

        // GM-011: profile giờ là của RIÊNG user (token) — cần xác thực để định danh.
        [HttpGet("profile")]
        [RequireJwtRole]
        public async Task<IActionResult> GetProfile()
        {
            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            var profile = await LoadProfileAsync(id);
            return Ok(profile);
        }

        // GM-005 + GM-011 + GM-016: cấp XP cho user của token — idempotent theo Idempotency-Key,
        // cập nhật streak thật (server UTC), DB-first đồng bộ cả DB lẫn in-memory.
        [HttpPost("award-xp")]
        [RequireJwtRole("Teacher,Admin")]
        public async Task<IActionResult> AwardXp([FromBody] AwardXpRequest request)
        {
            // Chỉ Teacher/Admin (hoặc luồng nội bộ) được cấp XP — chống tự cày XP vô hạn.
            if (request.Amount < AwardXpMinPerRequest || request.Amount > AwardXpMaxPerRequest)
                return BadRequest(new { error = "INVALID_AMOUNT", message = "XP phải trong khoảng 1-500." });

            var id = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(id))
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // GM-005: hạn mức XP/ngày/user — award lặp bị chặn dù amount nhỏ.
            if (!XpAwardGuard.TryConsumeDailyQuota($"stateless:{id}", request.Amount))
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new
                {
                    error = "XP_DAILY_LIMIT",
                    message = $"Bạn đã đạt hạn mức XP hôm nay (tối đa {XpAwardGuard.XpAwardDailyCap} XP)."
                });
            }

            // GM-005: Idempotency-Key — teacher bấm 2 lần / retry không cộng XP 2 lần.
            var idempotencyKey = Request.Headers["Idempotency-Key"].FirstOrDefault();
            var ledgerKey = !string.IsNullOrWhiteSpace(idempotencyKey)
                ? $"stateless-award:{id}|{DateTime.UtcNow:yyyy-MM-dd}|{idempotencyKey.Trim()}"
                : null;

            if (ledgerKey != null && XpAwardGuard.TryGetReplay(ledgerKey, out var replayPayload))
            {
                // Replay: trả đúng profile của lần đầu — không cộng thêm XP.
                var replayedProfile = JsonSerializer.Deserialize<StatelessUserProfile>(replayPayload!);
                return Ok(replayedProfile);
            }

            // GM-011: DB-first — user tồn tại thì cập nhật cả DB lẫn in-memory (không mất khi restart).
            User? dbUser = null;
            if (Guid.TryParse(id, out var dbUserId))
            {
                dbUser = await _dbContext.Users.FindAsync(dbUserId);
                if (dbUser == null)
                    return NotFound(new { error = "USER_NOT_FOUND", message = "Người dùng không tồn tại." });

                _gamification.SyncProfileFromDb(
                    id, dbUser.Username, dbUser.TotalXP, dbUser.CurrentLevel,
                    dbUser.StreakDays, dbUser.LastActivityDate);
            }

            // GM-016: AwardXp cập nhật streak theo luật _updateStreak (server UTC) — hết streak đóng băng.
            var profile = _gamification.AwardXp(id, request.Amount, request.Reason);

            if (dbUser != null)
            {
                dbUser.AwardXP(request.Amount);
                dbUser.RecordActivity();  // cập nhật streak + LastActivityDate thật
                await _dbContext.SaveChangesAsync();
            }

            if (ledgerKey != null)
            {
                XpAwardGuard.RecordGrant(ledgerKey, JsonSerializer.Serialize(profile));
            }

            return Ok(profile);
        }

        // GM-009: trả danh sách huy hiệu ĐẦY ĐỦ (mở + khóa) theo user — EarnedAt rỗng nghĩa là chưa mở.
        [HttpGet("badges")]
        public IActionResult GetBadges()
        {
            var id = JwtHelper.ExtractSubFromToken(Request) ?? "anonymous";
            return Ok(_gamification.GetAllBadges(id));
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
                    // Fallback demo khi DB chưa có user nào.
                    return Ok(_gamification.GetLeaderboard(limit));
                }

                // GM-019: tên level từ bảng dùng chung.
                leaderboard = dbUsers.Select((u, index) => new StatelessLeaderboardEntry
                {
                    Rank = index + 1,
                    Username = u.Username,
                    TotalXp = u.TotalXP,
                    Level = u.CurrentLevel,
                    LevelName = GamificationLevelTable.GetLevelName(u.CurrentLevel),
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
