using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VisualizationDSA.Application.DTOs;
using VisualizationDSA.Application.DTOs.GemsShop;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Application.Common.Interfaces;
using VisualizationDSA.Domain.Interfaces;

namespace VisualizationDSA.WebApi.Controllers
{
    
    
    
    
    
    
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUnitOfWork           _unitOfWork;
        private readonly IGamificationService  _gamification;
        private readonly IGemsShopService      _gemsShopService;

        public UsersController(IUnitOfWork unitOfWork, IGamificationService gamification, IGemsShopService gemsShopService)
        {
            _unitOfWork       = unitOfWork;
            _gamification     = gamification;
            _gemsShopService  = gemsShopService;
        }

        
        
        
        
        [HttpGet("me/progress")]
        public async Task<ActionResult<UserProgressDto>> GetMyProgress()
        {
            var userId = GetCurrentUserId();
            
            
            var progress = await _unitOfWork.Users.GetUserProgressDomainModelAsync(userId);
            if (progress == null) return NotFound();

            
            var stats = _gamification.CalculateUserProgressStats(progress);

            
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

        
        
        
        
        [HttpPost("me/modules/{moduleId}")]
        public async Task<IActionResult> CompleteModule(string moduleId)
        {
            var userId = GetCurrentUserId();
            await _gamification.CompleteModuleAsync(userId, moduleId);
            return NoContent();
        }

        
        
        
        
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

        /// <summary>
        /// Trang bị Avatar Frame.
        /// PATCH /api/v1/users/me/avatar-frame
        /// </summary>
        [HttpPatch("me/avatar-frame")]
        public async Task<IActionResult> EquipAvatarFrame([FromBody] EquipAvatarFrameRequest request)
        {
            var userId = GetCurrentUserId();
            var success = await _gemsShopService.EquipAvatarFrameAsync(userId, request.FrameType);
            
            if (!success)
            {
                return BadRequest(new { success = false, error = "FRAME_NOT_OWNED_OR_USER_NOT_FOUND", message = "Bạn không sở hữu khung này hoặc có lỗi xảy ra." });
            }

            return Ok(new { success = true, avatarFrameType = request.FrameType });
        }

        private Guid GetCurrentUserId()
        {
            
            
            
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                        ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
            {
                
                throw new UnauthorizedAccessException("User identity claim không hợp lệ hoặc bị thiếu.");
            }
            return userId;
        }
    }
}
