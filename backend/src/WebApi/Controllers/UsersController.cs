using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    /// <summary>
    /// Users Controller — quản lý dữ liệu người dùng và tiến trình học tập.
    /// Route: api/v{version:apiVersion}/users
    /// ✅ FIX 1.5: Chuẩn hóa route v1
    /// ✅ FIX 2.4: Thêm [Authorize], endpoint me/progress, me/xp, me/modules
    /// </summary>
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork           _unitOfWork;
        private readonly IGamificationService  _gamification;

        public UsersController(IUnitOfWork unitOfWork, IGamificationService gamification)
        {
            _unitOfWork   = unitOfWork;
            _gamification = gamification;
        }

        /// <summary>
        /// Lấy tiến trình học tập đầy đủ của user hiện tại.
        /// GET /api/v1/users/me/progress
        /// </summary>
        [HttpGet("me/progress")]
        public async Task<ActionResult<UserProgressDto>> GetMyProgress()
        {
            var userId = GetCurrentUserId();
            
            // Lấy trực tiếp Domain Model tối ưu từ db (Chỉ 1 câu SQL SELECT phẳng, không change tracking)
            var progress = await _unitOfWork.Users.GetUserProgressDomainModelAsync(userId);
            if (progress == null) return NotFound();

            // Tính toán stats XP bằng GamificationService (không gọi DB lại)
            var stats = _gamification.CalculateUserProgressStats(progress);

            // Trả về data đủ để frontend sync với local XPEngine
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

        /// <summary>
        /// Sync XP event từ frontend lên server.
        /// POST /api/v1/users/me/xp
        /// </summary>
        [HttpPost("me/xp")]
        public async Task<IActionResult> SyncXP([FromBody] XPAwardRequest request)
        {
            var userId = GetCurrentUserId();
            await _gamification.AwardXPAsync(userId, request.Amount, request.Reason);
            await _gamification.CheckAndAwardBadgesAsync(userId);

            var stats = await _gamification.GetUserProgressAsync(userId);
            return Ok(new
            {
                message      = $"Đã cộng {request.Amount} XP.",
                totalXP      = stats.TotalXP,
                currentLevel = stats.CurrentLevel,
            });
        }

        /// <summary>
        /// Đánh dấu hoàn thành một module học tập.
        /// POST /api/v1/users/me/modules/{moduleId}
        /// </summary>
        [HttpPost("me/modules/{moduleId}")]
        public async Task<IActionResult> CompleteModule(string moduleId)
        {
            var userId = GetCurrentUserId();
            await _gamification.CompleteModuleAsync(userId, moduleId);
            return NoContent();
        }

        /// <summary>
        /// ✅ B3: Lấy danh sách badges của user hiện tại — endpoint riêng để refresh sau khi award.
        /// GET /api/v1/users/me/badges
        /// </summary>
        [HttpGet("me/badges")]
        public async Task<ActionResult<IEnumerable<BadgeDto>>> GetMyBadges()
        {
            var userId = GetCurrentUserId();
            var user   = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId, track: false);
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

        // ✅ A4 FIX: Backward compat endpoint — DTO hóa, không trả raw entity
        [HttpGet("{id}/progress")]
        public async Task<ActionResult> GetUserProgress(Guid id)
        {
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(id, track: false);
            if (user == null) return NotFound();

            return Ok(new
            {
                totalXP          = user.TotalXP,
                currentLevel     = user.CurrentLevel,
                streakDays       = user.StreakDays,
                badgesEarned     = user.UserBadges.Count,
                modulesCompleted = user.LearningProgresses.Count,
                completedModuleIds = user.LearningProgresses.Select(lp => lp.ModuleId).ToList(),
                isPremium        = user.IsPremium,
            });
        }

        private Guid GetCurrentUserId()
        {
            // AuthService.cs tạo JWT với JwtRegisteredClaimNames.Sub ("sub").
            // ASP.NET Core JWT middleware tự map "sub" → ClaimTypes.NameIdentifier,
            // nhưng để chắc chắn, đọc cả hai theo thứ tự: NameIdentifier → "sub" → "nameid"
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                        ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            {
                // Log để debug — không lộ thông tin nhạy cảm
                throw new UnauthorizedAccessException("User identity claim không hợp lệ hoặc bị thiếu.");
            }
            return userId;
        }
    }
}
