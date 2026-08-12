using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VisualizationDSA.Application.Services;
using VisualizationDSA.Domain.Entities;
using VisualizationDSA.Domain.Interfaces;

using VisualizationDSA.WebApi.Filters;

namespace VisualizationDSA.WebApi.Controllers
{
    [ApiVersion("1.0")]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [RequireJwtRole]
    public class BadgesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGamificationService _gamificationService;

        public BadgesController(IUnitOfWork unitOfWork, IGamificationService gamificationService)
        {
            _unitOfWork = unitOfWork;
            _gamificationService = gamificationService;
        }

        // GM-009: backend là source of truth về id huy hiệu — DB badge được ánh xạ sang id CHUẨN
        // (first-steps...) theo tên template, đồng bộ với GamificationStrategy. Frontend phải map
        // template theo id chuẩn này.
        private static readonly Dictionary<string, string> CanonicalBadgeIdByName = new(StringComparer.OrdinalIgnoreCase)
        {
            ["First Steps"]      = "first-steps",
            ["Sorting Wizard"]   = "sorting-wizard",
            ["OOP Guru"]         = "oop-guru",
            ["SOLID Master"]     = "solid-master",
            ["Pattern Hunter"]   = "pattern-hunter",
            ["Streak Keeper"]    = "streak-keeper",
            ["System Architect"] = "system-architect",
            ["DSA Champion"]     = "dsa-champion",
        };

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<Badge>>> GetAll()
        {
            var badges = await _unitOfWork.Badges.GetAllAsync();
            return Ok(badges);
        }

        // GM-009: trả danh sách ĐẦY ĐỦ (mở + khóa) — frontend dựng tủ huy hiệu 1 nguồn, không
        // còn cảnh "tất cả khóa" do map sai id.
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<BadgeStatusDto>>> GetMyBadges()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            // Load kèm UserBadges + Badge trong 1 query (khử N+1 truy vấn từng badge).
            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId.Value, track: false);

            if (user == null) return NotFound();

            var allBadges = await _unitOfWork.Badges.GetAllAsync();
            var earnedAt  = user.UserBadges.ToDictionary(ub => ub.BadgeId, ub => ub.EarnedAt);

            return Ok(allBadges.Select(b => ToStatusDto(b, earnedAt.ContainsKey(b.Id), earnedAt.TryGetValue(b.Id, out var at) ? at : null)));
        }

        // GM-009: sau khi kiểm tra huy hiệu mới, trả lại danh sách ĐẦY ĐỦ (mở + khóa) —
        // client khỏi cần gọi thêm /my để cập nhật tủ huy hiệu.
        [HttpPost("check")]
        public async Task<ActionResult<IEnumerable<BadgeStatusDto>>> CheckNewBadges()
        {
            var userId = GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { error = "UNAUTHORIZED", message = "Không xác định được người dùng." });

            await _gamificationService.CheckAndAwardBadgesAsync(userId.Value);

            var user = await _unitOfWork.Users.GetByIdWithDetailsAsync(userId.Value, track: false);
            var allBadges = await _unitOfWork.Badges.GetAllAsync();
            var earnedAt  = user?.UserBadges.ToDictionary(ub => ub.BadgeId, ub => ub.EarnedAt) ?? new Dictionary<Guid, DateTime>();

            return Ok(allBadges.Select(b => ToStatusDto(b, earnedAt.ContainsKey(b.Id), earnedAt.TryGetValue(b.Id, out var at) ? at : null)));
        }

        private static BadgeStatusDto ToStatusDto(Badge badge, bool isUnlocked, DateTime? earnedAt)
        {
            var canonicalId = CanonicalBadgeIdByName.TryGetValue(badge.Name, out var key)
                ? key
                : badge.Id.ToString("N");
            return new BadgeStatusDto
            {
                Id = canonicalId,
                Name = badge.Name,
                Description = badge.Description,
                Icon = badge.Icon,
                Color = badge.Color,
                IsUnlocked = isUnlocked,
                EarnedAt = earnedAt
            };
        }

        // GM-036: token thiếu/hỏng sub → 401 thay vì throw 500.
        private Guid? GetCurrentUserId()
        {
            var userIdClaim = JwtHelper.ExtractSubFromToken(Request);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return null;
            return userId;
        }
    }

    /// <summary>Huy hiệu + trạng thái mở/khóa — dùng cho tủ huy hiệu (GM-009).</summary>
    public class BadgeStatusDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public bool IsUnlocked { get; set; }
        public DateTime? EarnedAt { get; set; }
    }
}
