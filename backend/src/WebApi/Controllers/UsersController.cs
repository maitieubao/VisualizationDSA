using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [RequireJwtRole]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork           _unitOfWork;
        private readonly IGamificationService  _gamification;

        // AD-012: danh sách lý do XP được server công nhận — client không tự đặt reason tùy ý.
        // Giữ tương thích với reason động của luồng bài học (tiền tố Hoàn thành Quiz:/CodeLab:).
        private static readonly string[] AllowedXpReasons =
        {
            "lesson-completed",
            "quiz-complete",
            "offline-lesson",
            "offline-quiz",
            "streak-bonus",
            "Hoàn thành nhiệm vụ bài học"
        };

        // AD-012: cap XP mỗi lần sync — chống user tự cộng XP phá level/thứ hạng.
        private const int MaxXpPerSync = 50;

        public UsersController(IUnitOfWork unitOfWork, IGamificationService gamification)
        {
            _unitOfWork   = unitOfWork;
            _gamification = gamification;
        }

        
        
        
        
        [HttpGet("me/progress")]
        public async Task<ActionResult<UserProgressDto>> GetMyProgress()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // GM-008: streak là trách nhiệm server — trả lastActiveDate THẬT (UTC) để frontend
            // không tự tính lại streak theo giờ local (trước đây ép/đoán gây lệch 2 hệ).
            var lastActive = await _unitOfWork.Users.GetByIdAsync(userId.Value);

            var progress = await _unitOfWork.Users.GetUserProgressDomainModelAsync(userId.Value);
            if (progress == null) return NotFound();

            // GM-008: server là source of truth — KHÔNG ép streakDays/lastActiveDate ở đây.
            var stats = _gamification.CalculateUserProgressStats(progress);

            // GM-008: trả lastActiveDate thật từ DB (không ép ngày hôm nay).
            return Ok(new UserProgressDto
            {
                TotalXP              = stats.TotalXP,
                CurrentLevel         = stats.CurrentLevel,
                XpToNextLevel        = stats.XpToNextLevel,
                LevelProgressPercent = stats.LevelProgressPercent,
                BadgesEarned         = stats.BadgesEarned,
                IsPremium            = progress.IsPremium,
                ModulesCompleted     = stats.ModulesCompleted,
                CurrentStreak        = stats.CurrentStreak,
                LastActiveDate       = lastActive?.LastActivityDate,
                CompletedModuleIds   = progress.CompletedModuleIds,
                Badges               = progress.Badges
                                            .Select(ub => new BadgeDto
                                            {
                                                Id          = ub.BadgeId,
                                                Name        = ub.Name,
                                                Description = ub.Description,
                                                Icon        = ub.Icon,
                                                Color       = ub.Color,
                                                EarnedAt    = ub.EarnedAt,
                                            }).ToList()
            });
        }

        // GM-001: chống XP farm — cap 50/request + allowlist reason + HẠN MỨC XP/NGÀY (500)
        // + rate limit "auth" + Idempotency-Key (copy cơ chế LM-006 từ StatelessAuthController).
        [HttpPost("me/xp")]
        [EnableRateLimiting("auth")]
        public async Task<IActionResult> SyncXP([FromBody] XPAwardRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // AD-012: cap amount (≤ 50) — số XP gửi lên bị kẹp, không tự ý cộng lớn.
            var amount = Math.Clamp(request.Amount, 1, MaxXpPerSync);

            // AD-012: reason phải thuộc danh sách server (hoặc tiền tố bài học) — không chấp
            // nhận reason lạ để tránh lạm dụng thống kê/điều hướng.
            var reason = (request.Reason ?? string.Empty).Trim();
            var isReasonAllowed = AllowedXpReasons.Any(r => reason.Equals(r, StringComparison.OrdinalIgnoreCase))
                                  || reason.StartsWith("Hoàn thành Quiz:", StringComparison.Ordinal)
                                  || reason.StartsWith("Hoàn thành CodeLab:", StringComparison.Ordinal);
            if (!isReasonAllowed)
            {
                return BadRequest(new { error = "INVALID_REASON", message = "Lý do cộng XP không được hệ thống công nhận." });
            }

            // GM-001: hạn mức XP/ngày/user — gọi lặp vô hạn bị chặn dù amount nhỏ.
            if (!XpAwardGuard.TryConsumeDailyQuota($"users:{userId}", amount))
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new
                {
                    error = "XP_DAILY_LIMIT",
                    message = $"Bạn đã đạt hạn mức XP hôm nay (tối đa {XpAwardGuard.XpAwardDailyCap} XP)."
                });
            }

            // GM-001/GM-004: Idempotency-Key — retry/double-sync cùng key không cộng XP lần 2.
            var idempotencyKey = Request.Headers["Idempotency-Key"].FirstOrDefault();
            var result = await _gamification.AwardXpAndCheckBadgesAsync(userId.Value, amount, reason, idempotencyKey);

            // GM-004: XP + badge gom 1 transaction — response phản ánh kết quả cuối (không query lại rời rạc).
            return Ok(new
            {
                message = result.Replayed
                    ? "Yêu cầu trùng lặp đã được xử lý trước đó — XP không bị cộng lại."
                    : $"Đã cộng {amount} XP.",
                totalXP      = result.TotalXp,
                currentLevel = result.CurrentLevel,
                newBadges    = result.NewBadges.Select(b => b.Name).ToList(),
            });
        }

        
        
        
        
        [HttpPost("me/modules/{moduleId}")]
        public async Task<IActionResult> CompleteModule(string moduleId)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            await _gamification.CompleteModuleAsync(userId.Value, moduleId);
            return NoContent();
        }

        
        
        
        
        [HttpGet("me/badges")]
        public async Task<ActionResult<IEnumerable<BadgeDto>>> GetMyBadges()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            var user   = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId.Value, track: false);
            if (user == null) return NotFound();

            var badges = user.UserBadges.Select(ub => new BadgeDto
            {
                Id          = ub.BadgeId,
                Name        = ub.Badge?.Name        ?? string.Empty,
                Description = ub.Badge?.Description ?? string.Empty,
                Icon        = ub.Badge?.Icon        ?? string.Empty,
                Color       = ub.Badge?.Color       ?? string.Empty,
                EarnedAt    = ub.EarnedAt,
            });

            return Ok(badges);
        }

        
        [HttpGet("{id}/progress")]
        [VisualizationDSA.WebApi.Filters.RequireJwtRole("Admin")]
        public async Task<ActionResult> GetUserProgress(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(id, track: false);
            if (user == null) return NotFound();

            // GM-008: trả lastActiveDate thật của user (không ép) — streak admin xem đúng server.
            return Ok(new
            {
                totalXP          = user.TotalXP,
                currentLevel     = user.CurrentLevel,
                streakDays       = user.StreakDays,
                lastActiveDate   = user.LastActivityDate,
                badgesEarned     = user.UserBadges.Count,
                modulesCompleted = user.LearningProgresses.Count,
                completedModuleIds = user.LearningProgresses.Select(lp => lp.ModuleId).ToList(),
                isPremium        = user.IsPremium,
            });
        }

        // GM-036: token thiếu/hỏng sub → 401 (Unauthorized) thay vì throw 500.
        private Guid? GetCurrentUserId()
        {
            // [RequireJwtRole] không populate HttpContext.User — phải đọc từ token.
            var claim = JwtHelper.ExtractSubFromToken(Request);

            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            {
                return null;
            }
            return userId;
        }
    }
}
